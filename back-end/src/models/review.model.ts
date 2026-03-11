import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";

export enum ReviewStatusEnum {
  PENDING = "PENDING",
  AWAITING_ADMIN = "AWAITING_ADMIN",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
  REPORTED = "REPORTED",
}

export enum ReviewAutoReplyStatusEnum {
  IDLE = "IDLE",
  GENERATING = "GENERATING",
  READY = "READY",
  APPLIED = "APPLIED",
  FAILED = "FAILED",
  DISCARDED = "DISCARDED",
}

export interface IReview {
  invitationId: mongoose.Schema.Types.ObjectId;
  scheduleId: mongoose.Schema.Types.ObjectId;
  listingId?: mongoose.Schema.Types.ObjectId;
  agentUserId: mongoose.Schema.Types.ObjectId;
  customerUserId?: mongoose.Schema.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  propertyName: string;
  rating: number;
  tags: string[];
  comment?: string;
  status: ReviewStatusEnum;
  agentReply?: string;
  agentReplyAt?: Date;
  reportedAt?: Date;
  reportReason?: string;
  adminReviewedAt?: Date;
  adminReviewedBy?: mongoose.Schema.Types.ObjectId;
  adminNote?: string;
  autoReplyDraft?: string;
  autoReplyStatus?: ReviewAutoReplyStatusEnum;
  autoReplyGeneratedAt?: Date;
  autoReplyAppliedAt?: Date;
  autoReplyError?: string;
  autoReplyMeta?: {
    model?: string;
    generatedAt?: Date;
  };
  moderation?: {
    backend?: string;
    labels?: string[];
    topLabel?: string;
    topScore?: number;
    requiresReview?: boolean;
    isInappropriate?: boolean;
    moderatedAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.reviewInvitations,
      required: true,
      unique: true,
      index: true,
    },
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
    propertyName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    tags: {
      type: [String],
      default: [],
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(ReviewStatusEnum),
      default: ReviewStatusEnum.PENDING,
      index: true,
    },
    agentReply: {
      type: String,
      trim: true,
      default: "",
    },
    agentReplyAt: {
      type: Date,
    },
    reportedAt: {
      type: Date,
    },
    reportReason: {
      type: String,
      trim: true,
      default: "",
    },
    adminReviewedAt: {
      type: Date,
    },
    adminReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
    },
    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
    autoReplyDraft: {
      type: String,
      trim: true,
      default: "",
    },
    autoReplyStatus: {
      type: String,
      enum: Object.values(ReviewAutoReplyStatusEnum),
      default: ReviewAutoReplyStatusEnum.IDLE,
      index: true,
    },
    autoReplyGeneratedAt: {
      type: Date,
    },
    autoReplyAppliedAt: {
      type: Date,
    },
    autoReplyError: {
      type: String,
      trim: true,
      default: "",
    },
    autoReplyMeta: {
      model: {
        type: String,
        trim: true,
      },
      generatedAt: {
        type: Date,
      },
    },
    moderation: {
      backend: {
        type: String,
        trim: true,
      },
      labels: {
        type: [String],
        default: [],
      },
      topLabel: {
        type: String,
        trim: true,
      },
      topScore: {
        type: Number,
      },
      requiresReview: {
        type: Boolean,
        default: false,
      },
      isInappropriate: {
        type: Boolean,
        default: false,
      },
      moderatedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.plugin(toJSON as any);
reviewSchema.plugin(paginate as any);

const ReviewModel = mongoose.model<IReview>(collections.reviews, reviewSchema);

export default ReviewModel;
