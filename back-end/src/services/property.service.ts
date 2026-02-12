import { singleton } from "@/decorators/singleton";
import PropertyModel, { IProperty } from "@/models/property.model";
import { PropertyViewModel } from "@/models/property-view.model";
import mongoose, { PopulateOptions } from "mongoose";

@singleton
export class PropertyService {
  constructor() {}

  createProperty = async (propertyData: IProperty) => {
    return await PropertyModel.create(propertyData);
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

  getViewsAnalytics = async (
    userId: string,
    groupBy: "day" | "month" | "year" = "day",
  ) => {
    const userProperties = await PropertyModel.find({ userId: userId }).select(
      "_id",
    );
    const propertyIds = userProperties.map((p) => p._id);

    let dateFormat = "%Y-%m-%d";
    if (groupBy === "month") dateFormat = "%Y-%m-%d"; // Daily in month
    if (groupBy === "year") dateFormat = "%Y-%m"; // Monthly in year

    // Filter date range based on groupBy
    const matchFilter: any = { propertyId: { $in: propertyIds } };
    const now = new Date();

    if (groupBy === "month") {
      // Last 30 days
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchFilter.createdAt = { $gte: last30Days };
    } else if (groupBy === "year") {
      // This year (Jan-Dec) or Last 12 months? Usually "This Year".
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      matchFilter.createdAt = { $gte: startOfYear };
    }

    return await PropertyViewModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  };
}
