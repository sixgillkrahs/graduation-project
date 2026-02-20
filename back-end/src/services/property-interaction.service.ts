import { singleton } from "@/decorators/singleton";
import {
  InteractionType,
  PropertyInteractionModel,
} from "@/models/property-interaction.model";
import mongoose from "mongoose";

@singleton
export class PropertyInteractionService {
  constructor() {}

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

  getInteractions = async (
    propertyId: string,
    type?: InteractionType,
    userId?: string,
  ) => {
    return await PropertyInteractionModel.find({
      propertyId,
      type,
      userId,
    }).sort({ createdAt: -1 });
  };

  getLatestInteractionsForUser = async (
    userId: string,
    propertyIds: string[],
    type: InteractionType,
  ) => {
    return await PropertyInteractionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type,
          propertyId: {
            $in: propertyIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$propertyId",
          latestInteraction: { $first: "$$ROOT" },
        },
      },
    ]);
  };

  /**
   * Get all property IDs that user has currently favorited.
   * Returns only properties where the latest FAVORITE interaction is NOT "UNSAVE".
   */
  getFavoritePropertyIdsForUser = async (userId: string): Promise<string[]> => {
    const results = await PropertyInteractionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: InteractionType.FAVORITE,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$propertyId",
          latestInteraction: { $first: "$$ROOT" },
        },
      },
      {
        $match: {
          "latestInteraction.metadata.action": { $ne: "UNSAVE" },
        },
      },
    ]);

    return results.map((r: any) => r._id.toString());
  };
}
