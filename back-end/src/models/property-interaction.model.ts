import mongoose, { Schema, Document } from "mongoose";

export enum InteractionType {
  VIEW_PHONE = "VIEW_PHONE",
  CONTACT_FORM = "CONTACT_FORM",
  SCHEDULE_REQUEST = "SCHEDULE_REQUEST",
  FAVORITE = "FAVORITE",
}

export interface IPropertyInteraction extends Document {
  propertyId: mongoose.Types.ObjectId;
  type: InteractionType;
  userId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
}

const PropertyInteractionSchema: Schema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(InteractionType),
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    metadata: { type: Object, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PropertyInteractionSchema.index({ propertyId: 1, createdAt: -1 });
PropertyInteractionSchema.index({ createdAt: -1 });

export const PropertyInteractionModel = mongoose.model<IPropertyInteraction>(
  "PropertyInteraction",
  PropertyInteractionSchema,
);
