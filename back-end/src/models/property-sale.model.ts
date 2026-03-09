import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";
import { CurrencyEnum, PriceUnitEnum, PropertyTypeEnum } from "./property.model";

export enum PropertySaleRecordStatusEnum {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
}

export interface IPropertySale {
  propertyId: mongoose.Schema.Types.ObjectId;
  agentUserId: mongoose.Schema.Types.ObjectId;
  salePrice: number;
  normalizedSalePrice: number;
  currency: CurrencyEnum;
  priceUnit: PriceUnitEnum;
  soldAt: Date;
  soldTo?: string;
  soldToEmail?: string;
  recordStatus: PropertySaleRecordStatusEnum;
  revokedAt?: Date;
  propertySnapshot: {
    title: string;
    propertyType: PropertyTypeEnum;
    province: string;
    ward: string;
    address: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertySaleModel extends mongoose.Model<IPropertySale> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<IPropertySale>[]>;
}

const propertySnapshotSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    propertyType: { type: String, enum: PropertyTypeEnum, required: true },
    province: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const propertySaleSchema = new mongoose.Schema<IPropertySale, PropertySaleModel>(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.properties,
      required: true,
      unique: true,
      index: true,
    },
    agentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
      index: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    normalizedSalePrice: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: CurrencyEnum,
      required: true,
      default: CurrencyEnum.VND,
      index: true,
    },
    priceUnit: {
      type: String,
      enum: PriceUnitEnum,
      required: true,
    },
    soldAt: {
      type: Date,
      required: true,
      index: true,
    },
    soldTo: {
      type: String,
      trim: true,
    },
    soldToEmail: {
      type: String,
      trim: true,
    },
    recordStatus: {
      type: String,
      enum: PropertySaleRecordStatusEnum,
      required: true,
      default: PropertySaleRecordStatusEnum.ACTIVE,
      index: true,
    },
    revokedAt: {
      type: Date,
    },
    propertySnapshot: {
      type: propertySnapshotSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

propertySaleSchema.plugin(toJSON as any);
propertySaleSchema.plugin(paginate as any);

const PropertySaleModel = mongoose.model<IPropertySale, PropertySaleModel>(
  collections.propertySales,
  propertySaleSchema,
);

export default PropertySaleModel;
