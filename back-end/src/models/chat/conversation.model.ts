import mongoose from "mongoose";
import collections from "../config/collections";
import paginate from "../plugins/paginate.plugin";
import toJSON from "../plugins/toJSON.plugin";

export interface IConversation {
  participants: mongoose.Schema.Types.ObjectId[]; // List of User/Agent IDs
  lastMessageId?: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConversationMethods {}

interface ConversationModel
  extends mongoose.Model<IConversation, {}, IConversationMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<
    mongoose.HydratedDocument<IConversation, IConversationMethods>[]
  >;
}

const conversationSchema = new mongoose.Schema<
  IConversation,
  ConversationModel,
  IConversationMethods
>(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: collections.users,
        required: true,
      },
    ],
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.messages,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.plugin(toJSON as any);
conversationSchema.plugin(paginate as any);

const ConversationModel = mongoose.model(
  collections.conversations,
  conversationSchema,
) as ConversationModel;

export default ConversationModel;
