import mongoose from "mongoose";
import collections from "./config/collections";
import toJSON from "./plugins/toJSON.plugin";
import { CurrencyEnum } from "./property.model";

export interface IAgentLeaderboardSnapshot {
  userId: mongoose.Schema.Types.ObjectId;
  currency: CurrencyEnum;
  month: number;
  year: number;
  rank: number;
  revenue: number;
  deals: number;
  latestSoldAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const agentLeaderboardSnapshotSchema =
  new mongoose.Schema<IAgentLeaderboardSnapshot>(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: collections.users,
        required: true,
        index: true,
      },
      currency: {
        type: String,
        enum: CurrencyEnum,
        required: true,
        index: true,
      },
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
        index: true,
      },
      year: {
        type: Number,
        required: true,
        min: 2000,
        index: true,
      },
      rank: {
        type: Number,
        required: true,
        min: 1,
      },
      revenue: {
        type: Number,
        required: true,
        default: 0,
      },
      deals: {
        type: Number,
        required: true,
        default: 0,
      },
      latestSoldAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    },
  );

agentLeaderboardSnapshotSchema.index(
  { userId: 1, currency: 1, month: 1, year: 1 },
  { unique: true },
);
agentLeaderboardSnapshotSchema.index({ currency: 1, year: 1, month: 1, rank: 1 });

agentLeaderboardSnapshotSchema.plugin(toJSON as any);

const AgentLeaderboardSnapshotModel = mongoose.model<IAgentLeaderboardSnapshot>(
  collections.agentLeaderboardSnapshots,
  agentLeaderboardSnapshotSchema,
);

export default AgentLeaderboardSnapshotModel;
