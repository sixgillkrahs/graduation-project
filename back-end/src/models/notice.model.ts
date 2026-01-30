import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";

export enum NoticeTypeEnum {
  SYSTEM = "SYSTEM",
  PROPERTY = "PROPERTY",
  ACCOUNT = "ACCOUNT",
}

export interface INotice {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  content: string;
  isRead: boolean;
  type: NoticeTypeEnum;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INoticeMethods {}

interface NoticeModel extends mongoose.Model<INotice, {}, INoticeMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<INotice, INoticeMethods>[]>;
}

const noticeSchema = new mongoose.Schema<INotice, NoticeModel, INoticeMethods>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: NoticeTypeEnum,
      default: NoticeTypeEnum.SYSTEM,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

noticeSchema.plugin(toJSON as any);
noticeSchema.plugin(paginate as any);

const NoticeModel = mongoose.model<INotice, NoticeModel>(
  collections.notices,
  noticeSchema,
);

export default NoticeModel;
