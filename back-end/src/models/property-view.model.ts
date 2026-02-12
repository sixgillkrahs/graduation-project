import mongoose, { Schema, Document } from "mongoose";

export interface IPropertyView extends Document {
  propertyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const PropertyViewSchema: Schema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Optimize for daily/monthly aggregation queries
PropertyViewSchema.index({ propertyId: 1, createdAt: -1 });
PropertyViewSchema.index({ createdAt: -1 });

export const PropertyViewModel = mongoose.model<IPropertyView>(
  "PropertyView",
  PropertyViewSchema,
);
