import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";

export enum PropertyDemandTypeEnum {
  SALE = "SALE", // Cần bán
  RENT = "RENT", // Cho thuê
}

export enum PropertyTypeEnum {
  APARTMENT = "APARTMENT", // Căn hộ chung cư
  HOUSE = "HOUSE", // Nhà riêng
  STREET_HOUSE = "STREET_HOUSE", // Nhà mặt phố
  VILLA = "VILLA", // Biệt thự
  LAND = "LAND", // Đất nền
  OTHER = "OTHER",
}

export enum PropertyDirectionEnum {
  EAST = "EAST",
  WEST = "WEST",
  SOUTH = "SOUTH",
  NORTH = "NORTH",
  SOUTH_EAST = "SOUTH_EAST",
  SOUTH_WEST = "SOUTH_WEST",
  NORTH_EAST = "NORTH_EAST",
  NORTH_WEST = "NORTH_WEST",
}

export enum PropertyFurnitureEnum {
  BASIC = "BASIC",
  FULL = "FULL",
  EMPTY = "EMPTY",
}

export enum PropertyLegalStatusEnum {
  RED_BOOK = "RED_BOOK", // Sổ đỏ
  PINK_BOOK = "PINK_BOOK", // Sổ hồng
  SALE_CONTRACT = "SALE_CONTRACT", // Hợp đồng mua bán
  WAITING = "WAITING", // Đang chờ sổ
}

export enum PriceUnitEnum {
  VND = "VND",
  MILLION = "MILLION",
  BILLION = "BILLION",
  MILLION_PER_M2 = "MILLION_PER_M2",
}

export enum PropertyStatusEnum {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
  SOLD = "SOLD", // Đã bán/cho thuê
}

export interface IProperty {
  userId: mongoose.Schema.Types.ObjectId; // Owner of the listing

  // Basic Info
  demandType: PropertyDemandTypeEnum;
  propertyType: PropertyTypeEnum;
  projectName?: string;

  // Location
  location: {
    province: string;
    district: string;
    ward: string;
    address: string;
    hideAddress: boolean;
    coordinates?: {
      lat: number;
      long: number;
    };
  };

  // Features
  features: {
    area: number; // m2
    price: number;
    priceUnit: PriceUnitEnum;
    totalPrice?: number; // Calculated normalized price for sorting/filtering
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
    direction?: PropertyDirectionEnum; // Or specific direction
    frontage?: number; // m
    entranceWidth?: number; // m
    furniture?: PropertyFurnitureEnum;
    legalStatus?: PropertyLegalStatusEnum;
  };

  // Amenities
  amenities: string[]; // List of amenity codes/names

  // Media
  media: {
    images: string[];
    thumbnail?: string;
    videoLink?: string;
  };

  description: string;

  status: PropertyStatusEnum;

  viewCount: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPropertyMethods {}

interface PropertyModel
  extends mongoose.Model<IProperty, {}, IPropertyMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<IProperty, IPropertyMethods>[]>;
}

const locationSchema = new mongoose.Schema(
  {
    province: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    ward: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    hideAddress: { type: Boolean, default: false },
    coordinates: {
      lat: { type: Number },
      long: { type: Number },
    },
  },
  { _id: false },
);

const featuresSchema = new mongoose.Schema(
  {
    area: { type: Number, required: true },
    price: { type: Number, required: true },
    priceUnit: { type: String, enum: PriceUnitEnum, required: true },
    totalPrice: { type: Number },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    floors: { type: Number },
    direction: { type: String, enum: PropertyDirectionEnum },
    frontage: { type: Number },
    entranceWidth: { type: Number },
    furniture: { type: String, enum: PropertyFurnitureEnum },
    legalStatus: { type: String, enum: PropertyLegalStatusEnum },
  },
  { _id: false },
);

const mediaSchema = new mongoose.Schema(
  {
    images: { type: [String], default: [] },
    thumbnail: { type: String },
    videoLink: { type: String },
  },
  { _id: false },
);

const propertySchema = new mongoose.Schema<
  IProperty,
  PropertyModel,
  IPropertyMethods
>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
    },
    demandType: {
      type: String,
      enum: PropertyDemandTypeEnum,
      required: true,
    },
    propertyType: {
      type: String,
      enum: PropertyTypeEnum,
      required: true,
    },
    projectName: {
      type: String,
      trim: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    features: {
      type: featuresSchema,
      required: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    media: {
      type: mediaSchema,
      default: {},
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: PropertyStatusEnum,
      default: PropertyStatusEnum.PENDING,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

propertySchema.plugin(toJSON as any);
propertySchema.plugin(paginate as any);

const PropertyModel = mongoose.model<IProperty, PropertyModel>(
  collections.properties,
  propertySchema,
);

export default PropertyModel;
