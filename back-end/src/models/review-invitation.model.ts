import mongoose from "mongoose";
import collections from "./config/collections";
import toJSON from "./plugins/toJSON.plugin";

export interface IReviewInvitation {
  scheduleId: mongoose.Schema.Types.ObjectId;
  listingId?: mongoose.Schema.Types.ObjectId;
  agentUserId: mongoose.Schema.Types.ObjectId;
  customerUserId?: mongoose.Schema.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  agentName: string;
  propertyName: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewInvitationSchema = new mongoose.Schema<IReviewInvitation>(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.schedules,
      required: true,
      unique: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.properties,
    },
    agentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
      index: true,
    },
    customerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    agentName: {
      type: String,
      required: true,
      trim: true,
    },
    propertyName: {
      type: String,
      required: true,
      trim: true,
    },
    tokenHash: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

reviewInvitationSchema.plugin(toJSON as any);

const ReviewInvitationModel = mongoose.model<IReviewInvitation>(
  collections.reviewInvitations,
  reviewInvitationSchema,
);

export default ReviewInvitationModel;
