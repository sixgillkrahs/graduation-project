import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";

export enum JobTypeEnum {
  PROPERTY_EMBEDDING = "PROPERTY_EMBEDDING",
}

export enum JobStatusEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface IJob {
  type: JobTypeEnum;
  payload: any; // Store data, e.g., { propertyId: string }
  status: JobStatusEnum;
  attempts: number;
  maxAttempts: number;
  error?: string;
  nextRunAt?: Date;
  lastRunAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJobMethods {}

interface JobModel extends mongoose.Model<IJob, {}, IJobMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<IJob, IJobMethods>[]>;
}

const jobSchema = new mongoose.Schema<IJob, JobModel, IJobMethods>(
  {
    type: {
      type: String,
      enum: JobTypeEnum,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: JobStatusEnum,
      default: JobStatusEnum.PENDING,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    error: {
      type: String,
    },
    nextRunAt: {
      type: Date,
      default: Date.now,
    },
    lastRunAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

jobSchema.plugin(toJSON as any);
jobSchema.plugin(paginate as any);

const Job = mongoose.model(collections.jobs, jobSchema);

export default Job;
