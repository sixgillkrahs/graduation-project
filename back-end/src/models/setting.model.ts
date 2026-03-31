import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";
import mongoose from "mongoose";

export type SupportedLanguage = "en" | "vi";

export interface IGeneralSettings {
  key: "general";
  systemName: string;
  adminPortalTitle: string;
  adminPortalTagline: string;
  adminPortalUrl: string;
  adminBrandColor: string;
  systemTagline: string;
  websiteUrl: string;
  brandColor: string;
  defaultLanguage: SupportedLanguage;
  timezone: string;
  currency: string;
  dateFormat: string;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  allowPublicRegistration: boolean;
  enableListingReviews: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IGeneralSettingsInput = Omit<
  IGeneralSettings,
  "key" | "createdAt" | "updatedAt"
>;

interface SettingModel extends mongoose.Model<IGeneralSettings> {
  getGeneralSettings(): Promise<mongoose.HydratedDocument<IGeneralSettings> | null>;
  upsertGeneralSettings(
    payload: Partial<IGeneralSettings>,
  ): Promise<mongoose.HydratedDocument<IGeneralSettings> | null>;
}

const settingSchema = new mongoose.Schema<IGeneralSettings, SettingModel>(
  {
    key: {
      type: String,
      enum: ["general"],
      unique: true,
      default: "general",
    },
    systemName: {
      type: String,
      required: true,
      trim: true,
    },
    adminPortalTitle: {
      type: String,
      required: true,
      trim: true,
    },
    adminPortalTagline: {
      type: String,
      required: true,
      trim: true,
      default: "Operations center for listings, agents, reviews, and platform health.",
    },
    adminPortalUrl: {
      type: String,
      required: true,
      trim: true,
      default: "http://localhost:5173",
    },
    adminBrandColor: {
      type: String,
      required: true,
      trim: true,
      default: "#14532d",
    },
    systemTagline: {
      type: String,
      required: true,
      trim: true,
    },
    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },
    brandColor: {
      type: String,
      required: true,
      trim: true,
    },
    defaultLanguage: {
      type: String,
      enum: ["en", "vi"],
      required: true,
      default: "vi",
    },
    timezone: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
    },
    dateFormat: {
      type: String,
      required: true,
      trim: true,
    },
    supportEmail: {
      type: String,
      required: true,
      trim: true,
    },
    supportPhone: {
      type: String,
      required: true,
      trim: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowPublicRegistration: {
      type: Boolean,
      default: true,
    },
    enableListingReviews: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

settingSchema.plugin(toJSON as any);
settingSchema.plugin(paginate as any);

class SettingClass {
  static async getGeneralSettings(this: SettingModel) {
    return this.findOne({ key: "general" }).exec();
  }

  static async upsertGeneralSettings(
    this: SettingModel,
    payload: Partial<IGeneralSettings>,
  ) {
    return this.findOneAndUpdate(
      { key: "general" },
      {
        $set: payload,
        $setOnInsert: { key: "general" },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).exec();
  }
}

settingSchema.loadClass(SettingClass);

const SettingModel = mongoose.model<IGeneralSettings, SettingModel>(
  collections.settings,
  settingSchema,
);

export default SettingModel;
