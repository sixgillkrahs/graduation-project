import mongoose from "mongoose";
import collections from "../config/collections";
import paginate from "../plugins/paginate.plugin";
import toJSON from "../plugins/toJSON.plugin";

export interface IMessage {
  conversationId: mongoose.Schema.Types.ObjectId;
  senderId: mongoose.Schema.Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessageMethods {}

interface MessageModel extends mongoose.Model<IMessage, {}, IMessageMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<IMessage, IMessageMethods>[]>;
}

const messageSchema = new mongoose.Schema<
  IMessage,
  MessageModel,
  IMessageMethods
>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.conversations,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.plugin(toJSON as any);
messageSchema.plugin(paginate as any);

const MessageModel = mongoose.model(
  collections.messages,
  messageSchema,
) as MessageModel;

export default MessageModel;
