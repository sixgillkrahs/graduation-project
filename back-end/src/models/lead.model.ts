import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";

export enum LeadStatusEnum {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  QUALIFIED = "QUALIFIED",
  SCHEDULED = "SCHEDULED",
  WON = "WON",
  LOST = "LOST",
  SPAM_REJECTED = "SPAM_REJECTED",
}

export enum LeadIntentEnum {
  BUY_TO_LIVE = "BUY_TO_LIVE",
  INVEST = "INVEST",
  RENT = "RENT",
  CONSULTATION = "CONSULTATION",
}

export enum LeadContactChannelEnum {
  PHONE = "PHONE",
  CHAT = "CHAT",
  ZALO = "ZALO",
  EMAIL = "EMAIL",
}

export enum LeadSourceEnum {
  PROPERTY_CALL = "PROPERTY_CALL",
  PROPERTY_CHAT = "PROPERTY_CHAT",
  PROPERTY_REQUEST = "PROPERTY_REQUEST",
}

export enum LeadContactTimeEnum {
  ASAP = "ASAP",
  TODAY = "TODAY",
  NEXT_24_HOURS = "NEXT_24_HOURS",
  THIS_WEEKEND = "THIS_WEEKEND",
}

export interface ILead {
  agentId: mongoose.Schema.Types.ObjectId;
  userId?: mongoose.Schema.Types.ObjectId;
  listingId: mongoose.Schema.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  intent: LeadIntentEnum;
  interestTopics: string[];
  budgetRange: string;
  preferredContactTime: LeadContactTimeEnum;
  preferredContactChannel: LeadContactChannelEnum;
  message?: string;
  source: LeadSourceEnum | string;
  status: LeadStatusEnum;
  lastSubmittedAt: Date;
  submissionCount: number;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeadModel extends mongoose.Model<ILead> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<any>;
}

const leadSchema = new mongoose.Schema<ILead, LeadModel>(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.properties,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    intent: {
      type: String,
      enum: LeadIntentEnum,
      required: true,
    },
    interestTopics: {
      type: [String],
      default: [],
    },
    budgetRange: {
      type: String,
      required: true,
      trim: true,
    },
    preferredContactTime: {
      type: String,
      enum: LeadContactTimeEnum,
      required: true,
    },
    preferredContactChannel: {
      type: String,
      enum: LeadContactChannelEnum,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      default: LeadSourceEnum.PROPERTY_REQUEST,
      trim: true,
    },
    status: {
      type: String,
      enum: LeadStatusEnum,
      default: LeadStatusEnum.NEW,
      index: true,
    },
    lastSubmittedAt: {
      type: Date,
      required: true,
    },
    submissionCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  },
);

leadSchema.index({ agentId: 1, status: 1, updatedAt: -1 });
leadSchema.index({ listingId: 1, customerPhone: 1, createdAt: -1 });
leadSchema.index({ listingId: 1, customerEmail: 1, createdAt: -1 });

leadSchema.plugin(toJSON as any);
leadSchema.plugin(paginate as any);

const LeadModel = mongoose.model<ILead, LeadModel>(collections.leads, leadSchema);

export default LeadModel;
