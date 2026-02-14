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
}
