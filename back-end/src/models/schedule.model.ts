import mongoose, { SortOrder } from "mongoose";
import toJSON from "./plugins/toJSON.plugin";
import paginate from "./plugins/paginate.plugin";
import collections from "./config/collections";

export enum SCHEDULE_TYPE {
  VIEWING = "VIEWING",
  MEETING = "MEETING",
  CALL = "CALL",
}

export enum SCHEDULE_STATUS {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface ISchedule {
  agentId: mongoose.Schema.Types.ObjectId;
  userId?: mongoose.Schema.Types.ObjectId;
  listingId?: mongoose.Schema.Types.ObjectId;
  title: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  type: SCHEDULE_TYPE;
  status: SCHEDULE_STATUS;
  customerNote: string;
  agentNote: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IScheduleMethods {}

interface ScheduleModel
  extends mongoose.Model<ISchedule, {}, IScheduleMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<ISchedule, IScheduleMethods>[]>;
  createSchedule(
    schedule: ISchedule,
  ): Promise<mongoose.HydratedDocument<ISchedule, IScheduleMethods>>;
  getScheduleById(
    id: string,
  ): Promise<mongoose.HydratedDocument<ISchedule, IScheduleMethods> | null>;
  updateSchedule(
    id: string,
    schedule: Partial<ISchedule>,
  ): Promise<mongoose.HydratedDocument<ISchedule, IScheduleMethods> | null>;
  deleteSchedule(
    id: string,
  ): Promise<mongoose.HydratedDocument<ISchedule, IScheduleMethods> | null>;
  searchSchedules(
    page: number,
    limit: number,
    searchTerm: string,
  ): Promise<mongoose.HydratedDocument<ISchedule, IScheduleMethods>[]>;
}

const scheduleSchema = new mongoose.Schema<
  ISchedule,
  ScheduleModel,
  IScheduleMethods
>(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.properties,
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
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: SCHEDULE_TYPE,
      required: true,
    },
    status: {
      type: String,
      enum: SCHEDULE_STATUS,
      required: true,
    },
    customerNote: {
      type: String,
      required: false,
      trim: true,
    },
    agentNote: {
      type: String,
      required: false,
      trim: true,
    },
    color: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

scheduleSchema.plugin(toJSON as any);
scheduleSchema.plugin(paginate as any);

class ScheduleClass {
  static async createSchedule(this: ScheduleModel, scheduleData: ISchedule) {
    return await this.create(scheduleData);
  }

  static async getScheduleById(this: ScheduleModel, id: string) {
    return await this.findById(id).exec();
  }

  static async updateSchedule(
    this: ScheduleModel,
    id: string,
    updateData: Partial<ISchedule>,
  ) {
    return await this.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  static async deleteSchedule(this: ScheduleModel, id: string) {
    return await this.findByIdAndDelete(id).exec();
  }

  static async searchSchedules(
    this: ScheduleModel,
    page: number = 1,
    limit: number = 10,
    searchTerm: string,
  ) {
    const searchRegex = new RegExp(searchTerm, "i");

    return await this.paginate?.(
      {
        page,
        limit,
        sortBy: "createdAt:desc",
        populate: "resource",
      },
      {
        $or: [{ name: searchRegex }, { description: searchRegex }],
      },
    );
  }
}

scheduleSchema.loadClass(ScheduleClass);

const ScheduleModel = mongoose.model<ISchedule>(
  collections.schedules,
  scheduleSchema,
);

export default ScheduleModel;
