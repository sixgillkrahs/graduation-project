import { singleton } from "@/decorators/singleton";
import PropertyModel, { IProperty } from "@/models/property.model";
import { PropertyViewModel } from "@/models/property-view.model";
import mongoose, { PopulateOptions } from "mongoose";
import {
  InteractionType,
  PropertyInteractionModel,
} from "@/models/property-interaction.model";

import { QdrantService } from "./qdrant.service";
import { QdrantQueue } from "@/queues/qdrant.queue";

@singleton
export class PropertyService {
  private qdrantService: QdrantService;
  private qdrantQueue: QdrantQueue;

  constructor() {
    this.qdrantService = new QdrantService();
    this.qdrantQueue = new QdrantQueue();
  }

  createProperty = async (propertyData: IProperty) => {
    const property = await PropertyModel.create(propertyData);

    // Async embed and upsert into Qdrant for recommendations
    try {
      if (property && property._id) {
        // Compile a descriptive text string from the property features
        const textData = `${property.title}. ${property.description}. Located in ${property.location?.ward}, ${property.location?.district}, ${property.location?.province}. Features: ${property.features?.bedrooms} bedrooms, ${property.features?.bathrooms} bathrooms. Type: ${property.propertyType}. Setup: ${property.features?.furniture}. Direction: ${property.features?.direction}.`;

        // Push job to queue (avoids blocking Event Loop heavily)
        this.qdrantQueue
          .enqueueUpsertPropertyEmbedding({
            propertyId: property._id.toString(),
            textData,
            payload: {
              price: property.features?.price,
              type: property.propertyType,
              district: property.location?.district,
              province: property.location?.province,
            },
          })
          .catch((err) => console.error(err));
      }
    } catch (error) {
      console.error("Failed to generate embedding for new property:", error);
    }

    return property;
  };

  getPropertyById = async (
    id: string,
    populate?: string | PopulateOptions | (string | PopulateOptions)[],
    select?: string,
  ) => {
    const query = PropertyModel.findById(id);

    if (populate) {
      query.populate(Array.isArray(populate) ? populate : [populate]);
    }

    if (select) {
      query.select(select);
    }
    return query.lean().exec() as Promise<IProperty | null>;
  };

  updateProperty = async (id: string, updateData: Partial<IProperty>) => {
    return await PropertyModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  };

  deleteProperty = async (id: string) => {
    return await PropertyModel.findByIdAndDelete(id).lean().exec();
  };

  increaseViewCount = async (id: string, amount: number = 1) => {
    return await PropertyModel.findByIdAndUpdate(
      id,
      { $inc: { viewCount: amount } },
      { new: true },
    )
      .select("viewCount")
      .lean();
  };

  getProperties = async (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any> = {},
    select?: string,
  ) => {
    return await PropertyModel.paginate?.(options, filter, select);
  };

  count = async (filter: Record<string, any> = {}) => {
    return await PropertyModel.countDocuments(filter).exec();
  };

  getTotalViews = async (userId: string) => {
    const matchStage: any = {
      userId: new mongoose.Types.ObjectId(userId),
      status: "PUBLISHED",
    };

    const result = await PropertyModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: null,
          totalViews: {
            $sum: "$viewCount",
          },
        },
      },
    ]);
    return result[0]?.totalViews || 0;
  };

  recordView = async (
    propertyId: string,
    userId?: string,
    metadata: { ip?: string; userAgent?: string } = {},
  ) => {
    // 1. Create View Log
    await PropertyViewModel.create({
      propertyId,
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      ipAddress: metadata.ip,
      userAgent: metadata.userAgent,
    });

    // 2. Increase total view count
    await this.increaseViewCount(propertyId, 1);
  };

  recordInteraction = async (
    propertyId: string,
    type: InteractionType,
    userId?: string,
    metadata: any = {},
  ) => {
    return await PropertyInteractionModel.create({
      propertyId,
      type,
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      metadata,
    });
  };

  getViewsAnalytics = async (
    userId: string,
    groupBy: "day" | "month" | "year" = "day",
  ) => {
    // 1. Get user's properties
    const userProperties = await PropertyModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).select("_id");

    const propertyIds = userProperties.map((p) => p._id);

    // If no properties, return empty result
    if (propertyIds.length === 0) {
      return [];
    }

    let dateFormat = "%Y-%m-%d";
    if (groupBy === "month") dateFormat = "%Y-%m-%d"; // Daily in month
    if (groupBy === "year") dateFormat = "%Y-%m"; // Monthly in year

    const matchFilter: any = {
      propertyId: { $in: propertyIds },
    };

    const now = new Date();
    if (groupBy === "month") {
      // Last 30 days
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchFilter.createdAt = { $gte: last30Days };
    } else if (groupBy === "year") {
      // This year (Jan-Dec)
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      matchFilter.createdAt = { $gte: startOfYear };
    }

    const viewsData = await PropertyViewModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const leadsData = await PropertyInteractionModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          leads: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Merge data
    const mergedData = new Map();

    // Populate Views
    viewsData.forEach((item: any) => {
      mergedData.set(item._id, {
        label: item._id,
        views: item.views,
        leads: 0,
      });
    });

    // Populate/Merge Leads
    leadsData.forEach((item: any) => {
      if (mergedData.has(item._id)) {
        mergedData.get(item._id).leads = item.leads;
      } else {
        mergedData.set(item._id, {
          label: item._id,
          views: 0,
          leads: item.leads,
        });
      }
    });

    // Convert Map to sorted Array
    return Array.from(mergedData.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  };

  getRecommendedProperties = async (propertyId: string, limit: number = 4) => {
    try {
      // Find similar IDs from Qdrant
      const similarResults = await this.qdrantService.searchSimilarProperties(
        propertyId,
        limit,
      );

      const ids = similarResults.map((res) => res.id);

      if (ids.length === 0) {
        return [];
      }

      // Fetch actual property data from MongoDB
      const properties = await PropertyModel.find({ _id: { $in: ids } })
        .lean()
        .exec();

      // Keep the sorted order returned by Qdrant
      properties.sort(
        (a: any, b: any) =>
          ids.indexOf(a._id.toString()) - ids.indexOf(b._id.toString()),
      );

      return properties;
    } catch (error) {
      console.error(
        `Error fetching recommended properties for ${propertyId}:`,
        error,
      );
      return [];
    }
  };
}
