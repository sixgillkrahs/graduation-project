import { singleton } from "@/decorators/singleton";
import AgentLeaderboardSnapshotModel from "@/models/agent-leaderboard-snapshot.model";
import { AgentStatusEnum } from "@/models/agent.model";
import PropertySaleModel, {
  PropertySaleRecordStatusEnum,
} from "@/models/property-sale.model";
import { CurrencyEnum } from "@/models/property.model";
import mongoose from "mongoose";

@singleton
export class AgentLeaderboardService {
  private getDateRange(month?: number, year?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const start = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
    const end = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    return { start, end, month: targetMonth, year: targetYear };
  }

  refreshMonthlyLeaderboard = async (options: {
    month?: number;
    year?: number;
    currency?: CurrencyEnum;
  }) => {
    const { start, end, month, year } = this.getDateRange(
      options.month,
      options.year,
    );
    const currency = options.currency || CurrencyEnum.VND;

    const rankedAgents = await PropertySaleModel.aggregate([
      {
        $match: {
          recordStatus: PropertySaleRecordStatusEnum.ACTIVE,
          soldAt: { $gte: start, $lte: end },
          currency,
        },
      },
      {
        $group: {
          _id: "$agentUserId",
          revenue: { $sum: "$normalizedSalePrice" },
          deals: { $sum: 1 },
          latestSoldAt: { $max: "$soldAt" },
        },
      },
      { $sort: { revenue: -1, deals: -1, latestSoldAt: 1 } },
    ]);

    await AgentLeaderboardSnapshotModel.deleteMany({
      month,
      year,
      currency,
    }).exec();

    if (rankedAgents.length === 0) {
      return { month, year, currency, totalRanked: 0 };
    }

    await AgentLeaderboardSnapshotModel.insertMany(
      rankedAgents.map((item, index) => ({
        userId: item._id,
        currency,
        month,
        year,
        rank: index + 1,
        revenue: item.revenue || 0,
        deals: item.deals || 0,
        latestSoldAt: item.latestSoldAt || undefined,
      })),
      { ordered: false },
    );

    return {
      month,
      year,
      currency,
      totalRanked: rankedAgents.length,
    };
  };

  refreshAllMonthlyLeaderboards = async () => {
    const periods = await PropertySaleModel.aggregate([
      {
        $match: {
          recordStatus: PropertySaleRecordStatusEnum.ACTIVE,
        },
      },
      {
        $project: {
          currency: 1,
          month: { $month: "$soldAt" },
          year: { $year: "$soldAt" },
        },
      },
      {
        $group: {
          _id: {
            currency: "$currency",
            month: "$month",
            year: "$year",
          },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
        },
      },
    ]);

    const results = [];
    for (const period of periods) {
      results.push(
        await this.refreshMonthlyLeaderboard({
          month: period._id.month,
          year: period._id.year,
          currency: period._id.currency,
        }),
      );
    }

    return results;
  };

  getRevenueLeaderboard = async (options?: {
    month?: number;
    year?: number;
    currency?: CurrencyEnum;
    limit?: number;
  }) => {
    const { month, year } = this.getDateRange(options?.month, options?.year);
    const limit = options?.limit || 10;
    const currency = options?.currency || CurrencyEnum.VND;

    const results = await AgentLeaderboardSnapshotModel.aggregate([
      {
        $match: {
          month,
          year,
          currency,
        },
      },
      { $sort: { rank: 1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "agents",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", "$$userId"] },
                    { $eq: ["$status", AgentStatusEnum.APPROVED] },
                  ],
                },
              },
            },
            { $project: { _id: 0, status: 1 } },
          ],
          as: "agent",
        },
      },
      {
        $match: {
          "user.isDeleted": { $ne: true },
          "user.isActive": true,
          "agent.0": { $exists: true },
        },
      },
      {
        $project: {
          _id: 0,
          agentUserId: "$userId",
          fullName: "$user.fullName",
          avatarUrl: "$user.avatarUrl",
          revenue: 1,
          deals: 1,
          latestSoldAt: 1,
          rank: 1,
        },
      },
    ]);

    return {
      month,
      year,
      currency,
      results,
    };
  };

  getAgentMonthlyRank = async (
    userId: string,
    options?: { month?: number; year?: number; currency?: CurrencyEnum },
  ) => {
    const { month, year } = this.getDateRange(options?.month, options?.year);
    const currency = options?.currency || CurrencyEnum.VND;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    return await AgentLeaderboardSnapshotModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      month,
      year,
      currency,
    })
      .lean()
      .exec();
  };
}
