import { singleton } from "@/decorators/singleton";
import AgentModel, { AgentStatusEnum } from "@/models/agent.model";
import collections from "@/models/config/collections";
import TransactionModel, {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "@/models/transaction.model";
import mongoose from "mongoose";

type UpgradeTransactionFilters = {
  status?: TransactionStatus;
  planDurationMonths?: number;
  query?: string;
};

@singleton
export class TransactionService {
  private buildSortObject(sortBy = "createdAt:desc") {
    return sortBy.split(",").reduce<Record<string, 1 | -1>>((acc, sortOption) => {
      const [key, order] = sortOption.split(":");
      if (key) {
        acc[key] = order === "asc" ? 1 : -1;
      }
      return acc;
    }, {});
  }

  createTransaction = async (data: Partial<ITransaction>) => {
    return await TransactionModel.create(data);
  };

  getTransactionByRef = async (transactionRef: string) => {
    return await TransactionModel.findOne({ transactionRef }).lean().exec();
  };

  getTransactionsByAgent = async (
    agentId: string,
    options: { page: number; limit: number; sortBy?: string },
  ) => {
    return await (TransactionModel as any).paginate?.(
      { ...options, sortBy: options.sortBy || "createdAt:desc" },
      { agentId: new mongoose.Types.ObjectId(agentId) },
    );
  };

  updateTransactionStatus = async (
    transactionRef: string,
    status: TransactionStatus,
    additionalData?: Partial<ITransaction>,
  ) => {
    return await TransactionModel.findOneAndUpdate(
      { transactionRef },
      { status, ...additionalData },
      { new: true },
    ).exec();
  };

  getUpgradeTransactions = async (
    options: { page: number; limit: number; sortBy?: string },
    filters: UpgradeTransactionFilters = {},
  ) => {
    const page = options.page > 0 ? options.page : 1;
    const limit = options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;
    const query = filters.query?.trim();

    const match: Record<string, any> = {
      type: TransactionType.UPGRADE_PRO,
    };

    if (filters.status) {
      match.status = filters.status;
    }

    if (filters.planDurationMonths) {
      match.planDurationMonths = filters.planDurationMonths;
    }

    const pipeline: mongoose.PipelineStage[] = [
      { $match: match },
      {
        $lookup: {
          from: collections.users,
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: collections.agents,
          localField: "agentId",
          foreignField: "_id",
          as: "agent",
        },
      },
      {
        $unwind: {
          path: "$agent",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (query) {
      pipeline.push({
        $match: {
          $or: [
            { transactionRef: { $regex: query, $options: "i" } },
            { orderInfo: { $regex: query, $options: "i" } },
            { "user.fullName": { $regex: query, $options: "i" } },
            { "user.email": { $regex: query, $options: "i" } },
            { "user.phone": { $regex: query, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          _id: 1,
          id: { $toString: "$_id" },
          transactionRef: 1,
          amount: 1,
          orderInfo: 1,
          status: 1,
          type: 1,
          planDurationMonths: 1,
          planStartDate: 1,
          planEndDate: 1,
          payDate: 1,
          responseCode: 1,
          bankCode: 1,
          bankTransNo: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            id: {
              $cond: [
                { $ifNull: ["$user._id", false] },
                { $toString: "$user._id" },
                null,
              ],
            },
            fullName: "$user.fullName",
            email: "$user.email",
            phone: "$user.phone",
          },
          agent: {
            id: {
              $cond: [
                { $ifNull: ["$agent._id", false] },
                { $toString: "$agent._id" },
                null,
              ],
            },
            status: "$agent.status",
            currentPlan: "$agent.planInfo.plan",
            currentPlanStartDate: "$agent.planInfo.startDate",
            currentPlanEndDate: "$agent.planInfo.endDate",
          },
        },
      },
      {
        $facet: {
          metadata: [{ $count: "totalResults" }],
          results: [
            { $sort: this.buildSortObject(options.sortBy || "createdAt:desc") },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    );

    const [result] = await TransactionModel.aggregate(pipeline).exec();
    const totalResults = result?.metadata?.[0]?.totalResults || 0;

    return {
      results: result?.results || [],
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit) || 0,
      totalResults,
    };
  };

  getUpgradeTransactionSummary = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [summary] = await TransactionModel.aggregate<{
      totalRevenue: number;
      totalPurchases: number;
      totalBuyers: number;
      monthlyRevenue: number;
      monthlyPurchases: number;
    }>([
      {
        $match: {
          type: TransactionType.UPGRADE_PRO,
          status: TransactionStatus.SUCCESS,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalPurchases: { $sum: 1 },
          buyerIds: { $addToSet: "$userId" },
          monthlyRevenue: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$amount", 0],
            },
          },
          monthlyPurchases: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalPurchases: 1,
          totalBuyers: { $size: "$buyerIds" },
          monthlyRevenue: 1,
          monthlyPurchases: 1,
        },
      },
    ]).exec();

    const activeProAgents = await AgentModel.countDocuments({
      status: AgentStatusEnum.APPROVED,
      "planInfo.plan": "PRO",
      $or: [{ "planInfo.endDate": null }, { "planInfo.endDate": { $gt: now } }],
    }).exec();

    return {
      totalRevenue: summary?.totalRevenue || 0,
      totalPurchases: summary?.totalPurchases || 0,
      totalBuyers: summary?.totalBuyers || 0,
      monthlyRevenue: summary?.monthlyRevenue || 0,
      monthlyPurchases: summary?.monthlyPurchases || 0,
      activeProAgents,
    };
  };
}
