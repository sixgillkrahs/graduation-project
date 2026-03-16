import mongoose from "mongoose";
import collections from "./config/collections";
import toJSON from "./plugins/toJSON.plugin";

export enum ReportTargetTypeEnum {
  LISTING = "LISTING",
  AGENT = "AGENT",
}

export enum ReportReasonEnum {
  WRONG_DATA = "WRONG_DATA",
  SPAM = "SPAM",
  FAKE_PRICE = "FAKE_PRICE",
  OTHER = "OTHER",
}

export enum ReportStatusEnum {
  OPEN = "OPEN",
}

export interface IReport {
  reporterUserId: mongoose.Schema.Types.ObjectId;
  targetType: ReportTargetTypeEnum;
  targetId: mongoose.Schema.Types.ObjectId;
  reason: ReportReasonEnum;
  details?: string;
  status: ReportStatusEnum;
  reportedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const reportSchema = new mongoose.Schema<IReport>(
  {
    reporterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ReportTargetTypeEnum,
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ReportReasonEnum,
      required: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    status: {
      type: String,
      enum: ReportStatusEnum,
      default: ReportStatusEnum.OPEN,
    },
    reportedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index(
  {
    reporterUserId: 1,
    targetType: 1,
    targetId: 1,
  },
  {
    unique: true,
    name: "uniq_reporter_target",
  },
);

reportSchema.plugin(toJSON as any);

const ReportModel = mongoose.model<IReport>(collections.reports, reportSchema);

export default ReportModel;
