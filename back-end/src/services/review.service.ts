import crypto from "crypto";
import mongoose from "mongoose";
import { ENV } from "@/config/env";
import { logger } from "@/config/logger";
import { singleton } from "@/decorators/singleton";
import AgentModel from "@/models/agent.model";
import ReviewInvitationModel, {
  IReviewInvitation,
} from "@/models/review-invitation.model";
import ReviewModel, {
  IReview,
  ReviewAutoReplyStatusEnum,
  ReviewStatusEnum,
} from "@/models/review.model";
import { NoticeTypeEnum } from "@/models/notice.model";
import { NotificationQueue } from "@/queues/notification.queue";
import { ReviewReplyAiService } from "@/services/review-reply-ai.service";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

type CreateInvitationInput = {
  scheduleId: string;
  listingId?: string;
  agentUserId: string;
  customerUserId?: string;
  customerName: string;
  customerEmail: string;
  agentName: string;
  propertyName: string;
};

type ReviewListFilter = "all" | "5star" | "1-3star" | "unanswered";

type ModerationResponse = {
  backend?: string;
  labels?: string[];
  top_label?: string;
  top_score?: number;
  requires_review?: boolean;
  is_inappropriate?: boolean;
};

type ModerationBatchResponse = {
  results?: ModerationResponse[];
};

@singleton
export class ReviewService {
  private static readonly INVITATION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
  private readonly notificationQueue = new NotificationQueue();
  private readonly reviewReplyAiService = new ReviewReplyAiService();

  private hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private isInvitationExpired(
    invitation: Pick<IReviewInvitation, "expiresAt">,
  ) {
    return new Date(invitation.expiresAt).getTime() < Date.now();
  }

  private maskCustomerName(name: string) {
    const firstToken = name.trim().split(/\s+/)[0] || "";
    const initial = firstToken.charAt(0).toUpperCase();
    return initial ? `${initial}***` : "Khách hàng";
  }

  private getCustomerInitial(name: string) {
    return this.maskCustomerName(name).charAt(0) || "K";
  }

  private buildSummaryBreakdown(
    rawBreakdown: Array<{ _id: number; count: number }> = [],
  ) {
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: rawBreakdown.find((item) => item._id === star)?.count || 0,
    }));
  }

  private buildAgentReviewFilter(filter: ReviewListFilter = "all") {
    switch (filter) {
      case "5star":
        return { rating: 5 };
      case "1-3star":
        return { rating: { $lte: 3 } };
      case "unanswered":
        return {
          $or: [{ agentReply: { $exists: false } }, { agentReply: "" }],
        };
      default:
        return {};
    }
  }

  private mapReview(
    review: IReview & { _id?: mongoose.Types.ObjectId },
    options?: {
      includeAutoReply?: boolean;
    },
  ) {
    const reply = review.agentReply?.trim();
    const autoReplyDraft = review.autoReplyDraft?.trim();
    const includeAutoReply = Boolean(options?.includeAutoReply);

    return {
      id: String((review as any)._id || ""),
      rating: review.rating,
      tags: review.tags || [],
      comment: review.comment || "",
      propertyName: review.propertyName,
      customerName: this.maskCustomerName(review.customerName),
      customerInitial: this.getCustomerInitial(review.customerName),
      createdAt: review.createdAt,
      status: review.status,
      agentReply: reply
        ? {
            content: reply,
            repliedAt: review.agentReplyAt,
          }
        : null,
      reportedAt: review.reportedAt,
      reportReason: review.reportReason || "",
      adminNote: review.adminNote || "",
      autoReply: includeAutoReply
        ? {
            draft: autoReplyDraft || "",
            status: review.autoReplyStatus || ReviewAutoReplyStatusEnum.IDLE,
            generatedAt:
              review.autoReplyGeneratedAt || review.autoReplyMeta?.generatedAt,
            appliedAt: review.autoReplyAppliedAt,
            error: review.autoReplyError || "",
          }
        : null,
    };
  }

  private buildModerationMeta(
    result: ModerationResponse,
    backendFallback = "unknown",
  ) {
    return {
      backend: result.backend || backendFallback,
      labels: result.labels || [],
      topLabel: result.top_label || "clean",
      topScore: Number(result.top_score || 0),
      requiresReview: Boolean(result.requires_review),
      isInappropriate: Boolean(result.is_inappropriate),
      moderatedAt: new Date(),
    };
  }

  private async notifyAgentAboutPublishedReview(
    review: IReview & { _id?: any },
  ) {
    await this.notificationQueue.enqueueNotification({
      userId: String(review.agentUserId),
      title: "Đánh giá mới từ khách hàng",
      content: `Bạn vừa nhận được 1 đánh giá ${review.rating} sao từ khách hàng ${this.maskCustomerName(review.customerName)}.`,
      type: NoticeTypeEnum.SYSTEM,
      metadata: {
        reviewId: String(review._id || ""),
        rating: review.rating,
        actionUrl: `${ENV.FRONTEND_URLLANDINGPAGE}/agent/reviews`,
      },
      socketEvent: "new_notice",
    });
  }

  private isAgentProPlanActive(agent: any) {
    const planInfo = (agent as any)?.planInfo;

    if (planInfo?.plan !== "PRO") {
      return false;
    }

    const now = Date.now();
    const startTime = planInfo.startDate
      ? new Date(planInfo.startDate).getTime()
      : null;
    const endTime = planInfo.endDate
      ? new Date(planInfo.endDate).getTime()
      : null;

    if (startTime && startTime > now) {
      return false;
    }

    if (endTime && endTime < now) {
      return false;
    }

    return true;
  }

  private async ensureAgentHasProPlan(agentUserId: string) {
    const agent = await AgentModel.findOne({ userId: agentUserId })
      .select("planInfo")
      .lean()
      .exec();

    if (!this.isAgentProPlanActive(agent)) {
      throw new AppError(
        "AI review reply is only available for PRO agents",
        403,
        ErrorCode.FORBIDDEN,
      );
    }

    return agent;
  }

  private async createAutoReplyDraft(reviewId: string) {
    const review = await ReviewModel.findById(reviewId).lean().exec();

    if (
      !review ||
      review.status !== ReviewStatusEnum.PUBLISHED ||
      review.agentReply?.trim()
    ) {
      return null;
    }

    const agent = await AgentModel.findOne({ userId: review.agentUserId })
      .select("planInfo")
      .lean()
      .exec();

    if (!this.isAgentProPlanActive(agent)) {
      return null;
    }

    await ReviewModel.updateOne(
      { _id: review._id, status: ReviewStatusEnum.PUBLISHED },
      {
        $set: {
          autoReplyStatus: ReviewAutoReplyStatusEnum.GENERATING,
          autoReplyError: "",
        },
      },
    ).exec();

    try {
      const generated = await this.reviewReplyAiService.generateDraft({
        rating: review.rating,
        tags: review.tags || [],
        comment: review.comment || "",
        propertyName: review.propertyName,
      });

      const updatedReview = await ReviewModel.findOneAndUpdate(
        {
          _id: review._id,
          status: ReviewStatusEnum.PUBLISHED,
          $or: [{ agentReply: { $exists: false } }, { agentReply: "" }],
        },
        {
          $set: {
            autoReplyDraft: generated.draft,
            autoReplyStatus: ReviewAutoReplyStatusEnum.READY,
            autoReplyGeneratedAt: new Date(),
            autoReplyError: "",
            autoReplyMeta: {
              model: generated.model,
              generatedAt: new Date(),
            },
          },
        },
        {
          new: true,
          runValidators: true,
        },
      )
        .lean()
        .exec();

      return updatedReview;
    } catch (error) {
      await ReviewModel.updateOne(
        { _id: review._id },
        {
          $set: {
            autoReplyStatus: ReviewAutoReplyStatusEnum.FAILED,
            autoReplyError:
              error instanceof Error
                ? error.message
                : "Failed to generate AI reply draft",
          },
        },
      ).exec();

      return null;
    }
  }

  private triggerAutoReplyDraft(reviewId: string) {
    void this.createAutoReplyDraft(reviewId).catch((error) => {
      logger.error("[ReviewService] auto reply draft generation failed", {
        context: "ReviewService.triggerAutoReplyDraft",
        reviewId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    });
  }

  private async paginateReviews(
    filter: Record<string, any>,
    options: {
      page: number;
      limit: number;
      sortBy?: string;
    },
  ) {
    const paginateModel = ReviewModel as any;

    if (typeof paginateModel.paginate === "function") {
      return paginateModel.paginate(options, filter);
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const [results, totalResults] = await Promise.all([
      ReviewModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ReviewModel.countDocuments(filter).exec(),
    ]);

    return {
      results,
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults,
    };
  }

  async createOrRefreshInvitation(input: CreateInvitationInput) {
    const existingReview = await ReviewModel.findOne({
      scheduleId: input.scheduleId,
    })
      .select("_id")
      .lean()
      .exec();

    if (existingReview) {
      return null;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + ReviewService.INVITATION_TTL_MS);

    await ReviewInvitationModel.findOneAndUpdate(
      { scheduleId: input.scheduleId },
      {
        $set: {
          listingId: input.listingId,
          agentUserId: input.agentUserId,
          customerUserId: input.customerUserId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          agentName: input.agentName,
          propertyName: input.propertyName,
          tokenHash,
          expiresAt,
          usedAt: null,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    ).exec();

    return {
      token: rawToken,
      expiresAt,
    };
  }

  async getInvitationByToken(token: string) {
    const tokenHash = this.hashToken(token);

    return ReviewInvitationModel.findOne({ tokenHash })
      .lean()
      .exec() as Promise<IReviewInvitation | null>;
  }

  async getInvitationPreview(token: string) {
    const invitation = await this.getInvitationByToken(token);

    if (!invitation) {
      return null;
    }

    if (invitation.usedAt || this.isInvitationExpired(invitation)) {
      return {
        ...invitation,
        isInvalid: true,
      };
    }

    return {
      ...invitation,
      isInvalid: false,
    };
  }

  async submitReview(input: {
    token: string;
    rating: number;
    tags: string[];
    comment?: string;
  }) {
    const invitation = await this.getInvitationByToken(input.token);

    if (!invitation) {
      return null;
    }

    if (invitation.usedAt || this.isInvitationExpired(invitation)) {
      return {
        invitation,
        review: null,
        invalid: true,
      };
    }

    const review = await ReviewModel.create({
      invitationId: (invitation as any)._id,
      scheduleId: invitation.scheduleId,
      listingId: invitation.listingId,
      agentUserId: invitation.agentUserId,
      customerUserId: invitation.customerUserId,
      customerName: invitation.customerName,
      customerEmail: invitation.customerEmail,
      propertyName: invitation.propertyName,
      rating: input.rating,
      tags: input.tags,
      comment: input.comment?.trim() || "",
      status: ReviewStatusEnum.PENDING,
    });

    await ReviewInvitationModel.updateOne(
      { _id: (invitation as any)._id },
      { $set: { usedAt: new Date() } },
    ).exec();

    return {
      invitation,
      review: review.toObject(),
      invalid: false,
    };
  }

  async processPendingReviewBatch(
    batchSize = ENV.REVIEW_MODERATION_BATCH_SIZE,
  ) {
    const pendingReviews = await ReviewModel.find({
      status: ReviewStatusEnum.PENDING,
    })
      .sort({ createdAt: 1 })
      .limit(batchSize)
      .lean()
      .exec();

    if (pendingReviews.length === 0) {
      return {
        processed: 0,
        movedToAdmin: 0,
        rejected: 0,
      };
    }

    const reviewedAt = new Date();
    const emptyCommentReviews = pendingReviews.filter(
      (review) => !review.comment?.trim(),
    );
    const commentReviews = pendingReviews.filter((review) =>
      review.comment?.trim(),
    );
    const bulkOperations: mongoose.AnyBulkWriteOperation<IReview>[] = [];
    let movedToAdmin = 0;
    let rejected = 0;

    for (const review of emptyCommentReviews) {
      bulkOperations.push({
        updateOne: {
          filter: { _id: review._id, status: ReviewStatusEnum.PENDING },
          update: {
            $set: {
              status: ReviewStatusEnum.AWAITING_ADMIN,
              moderation: {
                backend: "system",
                labels: ["clean"],
                topLabel: "clean",
                topScore: 0,
                requiresReview: false,
                isInappropriate: false,
                moderatedAt: reviewedAt,
              },
            },
          },
        },
      });
      movedToAdmin += 1;
    }
    if (commentReviews.length > 0) {
      try {
        const response = await fetch(
          `${ENV.AI_SERVICE_URL}/moderation/predict-batch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              texts: commentReviews.map(
                (review) => review.comment?.trim() || "",
              ),
            }),
            signal: AbortSignal.timeout(10000),
          },
        );

        if (!response.ok) {
          throw new Error(`Moderation API responded ${response.status}`);
        }

        const data = (await response.json()) as ModerationBatchResponse;
        const results = data.results || [];

        if (results.length !== commentReviews.length) {
          throw new Error("Moderation batch response length mismatch");
        }

        commentReviews.forEach((review, index) => {
          const moderation = results[index];
          const nextStatus = moderation.is_inappropriate
            ? ReviewStatusEnum.REJECTED
            : ReviewStatusEnum.AWAITING_ADMIN;

          bulkOperations.push({
            updateOne: {
              filter: { _id: review._id, status: ReviewStatusEnum.PENDING },
              update: {
                $set: {
                  status: nextStatus,
                  moderation: this.buildModerationMeta(moderation),
                },
              },
            },
          });

          if (nextStatus === ReviewStatusEnum.REJECTED) {
            rejected += 1;
          } else {
            movedToAdmin += 1;
          }
        });
      } catch (error) {
        logger.error("[ReviewService] batch moderation failed", {
          context: "ReviewService.processPendingReviewBatch",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (bulkOperations.length > 0) {
      await ReviewModel.bulkWrite(bulkOperations);
    }

    return {
      processed: bulkOperations.length,
      movedToAdmin,
      rejected,
    };
  }

  async getAdminModerationQueue(options: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const filter: Record<string, any> = {
      status: {
        $in: [ReviewStatusEnum.AWAITING_ADMIN, ReviewStatusEnum.REPORTED],
      },
    };

    if (options.search?.trim()) {
      const searchRegex = new RegExp(options.search.trim(), "i");
      filter.$or = [
        { customerName: searchRegex },
        { propertyName: searchRegex },
        { comment: searchRegex },
      ];
    }

    const reviews = await this.paginateReviews(filter, {
      page: options.page,
      limit: options.limit,
      sortBy: "createdAt:desc",
    });

    return {
      ...reviews,
      results: reviews.results.map((review: IReview) => this.mapReview(review)),
    };
  }

  async adminApproveReview(
    reviewId: string,
    adminUserId: string,
    note?: string,
  ) {
    const review = await ReviewModel.findOneAndUpdate(
      {
        _id: reviewId,
        status: {
          $in: [ReviewStatusEnum.AWAITING_ADMIN, ReviewStatusEnum.REPORTED],
        },
      },
      {
        $set: {
          status: ReviewStatusEnum.PUBLISHED,
          adminReviewedAt: new Date(),
          adminReviewedBy: adminUserId,
          adminNote: note?.trim() || "",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec();

    if (!review) {
      return null;
    }

    await this.refreshAgentRating(String(review.agentUserId));
    await this.notifyAgentAboutPublishedReview(review);
    this.triggerAutoReplyDraft(String(review._id));

    return review;
  }

  async adminRejectReview(
    reviewId: string,
    adminUserId: string,
    note?: string,
  ) {
    const existingReview = await ReviewModel.findById(reviewId).lean().exec();

    if (
      !existingReview ||
      ![
        ReviewStatusEnum.AWAITING_ADMIN,
        ReviewStatusEnum.REPORTED,
        ReviewStatusEnum.PUBLISHED,
      ].includes(existingReview.status)
    ) {
      return null;
    }

    const review = await ReviewModel.findByIdAndUpdate(
      reviewId,
      {
        $set: {
          status: ReviewStatusEnum.REJECTED,
          adminReviewedAt: new Date(),
          adminReviewedBy: adminUserId,
          adminNote: note?.trim() || "",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec();

    if (existingReview.status === ReviewStatusEnum.PUBLISHED) {
      await this.refreshAgentRating(String(existingReview.agentUserId));
    }

    return review;
  }

  async refreshAgentRating(agentUserId: string) {
    const [stats] = await ReviewModel.aggregate<{
      avgRating: number;
    }>([
      {
        $match: {
          agentUserId: new mongoose.Types.ObjectId(agentUserId),
          status: ReviewStatusEnum.PUBLISHED,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const avgRating = Number((stats?.avgRating || 0).toFixed(1));

    await AgentModel.updateOne(
      { userId: agentUserId },
      { $set: { rating: avgRating } },
    ).exec();

    return avgRating;
  }

  async getPublicReviews(
    agentUserId: string,
    options: { page: number; limit: number },
  ) {
    if (!mongoose.Types.ObjectId.isValid(agentUserId)) {
      return {
        results: [],
        page: options.page,
        limit: options.limit,
        totalPages: 0,
        totalResults: 0,
        summary: {
          averageRating: 0,
          totalReviews: 0,
          breakdown: this.buildSummaryBreakdown(),
        },
      };
    }

    const objectId = new mongoose.Types.ObjectId(agentUserId);
    const filter = {
      agentUserId: objectId,
      status: ReviewStatusEnum.PUBLISHED,
    };

    const [reviews, summaryStats, breakdownStats] = await Promise.all([
      this.paginateReviews(filter, {
        page: options.page,
        limit: options.limit,
        sortBy: "createdAt:desc",
      }),
      ReviewModel.aggregate<{
        totalReviews: number;
        averageRating: number;
      }>([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
      ReviewModel.aggregate<{ _id: number; count: number }>([
        { $match: filter },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      ...reviews,
      results: reviews.results.map((review: IReview) =>
        this.mapReview(review, {
          includeAutoReply: true,
        }),
      ),
      summary: {
        averageRating: Number((summaryStats[0]?.averageRating || 0).toFixed(1)),
        totalReviews: summaryStats[0]?.totalReviews || 0,
        breakdown: this.buildSummaryBreakdown(breakdownStats),
      },
    };
  }

  async getAgentReviews(
    agentUserId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      filter?: ReviewListFilter;
    },
  ) {
    if (!mongoose.Types.ObjectId.isValid(agentUserId)) {
      return {
        results: [],
        page: options.page,
        limit: options.limit,
        totalPages: 0,
        totalResults: 0,
        summary: {
          averageRating: 0,
          totalReviews: 0,
          pendingCount: 0,
          reportedCount: 0,
          unansweredCount: 0,
        },
      };
    }

    const objectId = new mongoose.Types.ObjectId(agentUserId);
    const visibleStatuses = [
      ReviewStatusEnum.PENDING,
      ReviewStatusEnum.AWAITING_ADMIN,
      ReviewStatusEnum.PUBLISHED,
      ReviewStatusEnum.REPORTED,
    ];
    const filter: Record<string, any> = {
      agentUserId: objectId,
      status: {
        $in: visibleStatuses,
      },
      ...this.buildAgentReviewFilter(options.filter),
    };

    if (options.search?.trim()) {
      const searchRegex = new RegExp(options.search.trim(), "i");
      filter.$or = [
        { customerName: searchRegex },
        { propertyName: searchRegex },
        { comment: searchRegex },
      ];
    }

    const [reviews, summaryStats] = await Promise.all([
      this.paginateReviews(filter, {
        page: options.page,
        limit: options.limit,
        sortBy: "createdAt:desc",
      }),
      ReviewModel.aggregate<{
        totalReviews: number;
        averageRating: number;
        pendingCount: number;
        reportedCount: number;
        unansweredCount: number;
      }>([
        {
          $match: {
            agentUserId: objectId,
            status: {
              $in: visibleStatuses,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: {
              $avg: {
                $cond: [
                  { $eq: ["$status", ReviewStatusEnum.PUBLISHED] },
                  "$rating",
                  null,
                ],
              },
            },
            pendingCount: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$status",
                      [
                        ReviewStatusEnum.PENDING,
                        ReviewStatusEnum.AWAITING_ADMIN,
                      ],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            reportedCount: {
              $sum: {
                $cond: [{ $eq: ["$status", ReviewStatusEnum.REPORTED] }, 1, 0],
              },
            },
            unansweredCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", ReviewStatusEnum.PUBLISHED] },
                      {
                        $or: [
                          { $eq: ["$agentReply", null] },
                          { $eq: ["$agentReply", ""] },
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    return {
      ...reviews,
      results: reviews.results.map((review: IReview) => this.mapReview(review)),
      summary: {
        averageRating: Number((summaryStats[0]?.averageRating || 0).toFixed(1)),
        totalReviews: summaryStats[0]?.totalReviews || 0,
        pendingCount: summaryStats[0]?.pendingCount || 0,
        reportedCount: summaryStats[0]?.reportedCount || 0,
        unansweredCount: summaryStats[0]?.unansweredCount || 0,
      },
    };
  }

  async replyToReview(reviewId: string, agentUserId: string, reply: string) {
    const normalizedReply = reply.trim();

    if (!normalizedReply) {
      return null;
    }

    return ReviewModel.findOneAndUpdate(
      {
        _id: reviewId,
        agentUserId,
        status: {
          $in: [ReviewStatusEnum.PUBLISHED, ReviewStatusEnum.REPORTED],
        },
      },
      {
        $set: {
          agentReply: normalizedReply,
          agentReplyAt: new Date(),
          autoReplyStatus: ReviewAutoReplyStatusEnum.APPLIED,
          autoReplyAppliedAt: new Date(),
          autoReplyError: "",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec();
  }

  async reportReview(reviewId: string, agentUserId: string, reason?: string) {
    const existingReview = await ReviewModel.findOne({
      _id: reviewId,
      agentUserId,
      status: {
        $in: [ReviewStatusEnum.PUBLISHED, ReviewStatusEnum.REPORTED],
      },
    })
      .lean()
      .exec();

    if (!existingReview) {
      return null;
    }

    const updatedReview = await ReviewModel.findByIdAndUpdate(
      reviewId,
      {
        $set: {
          status: ReviewStatusEnum.REPORTED,
          reportedAt: new Date(),
          reportReason: reason?.trim() || "Agent requested admin review",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec();

    if (existingReview.status === ReviewStatusEnum.PUBLISHED) {
      await this.refreshAgentRating(agentUserId);
    }

    return updatedReview;
  }

  async generateAgentAutoReply(reviewId: string, agentUserId: string) {
    await this.ensureAgentHasProPlan(agentUserId);

    const review = await ReviewModel.findOne({
      _id: reviewId,
      agentUserId,
      status: {
        $in: [ReviewStatusEnum.PUBLISHED, ReviewStatusEnum.REPORTED],
      },
    })
      .lean()
      .exec();

    if (!review) {
      return null;
    }

    const updatedReview = await this.createAutoReplyDraft(reviewId);

    if (updatedReview) {
      return updatedReview;
    }

    return ReviewModel.findById(reviewId).lean().exec();
  }

  async applyAgentAutoReply(
    reviewId: string,
    agentUserId: string,
    reply?: string,
  ) {
    await this.ensureAgentHasProPlan(agentUserId);

    const review = await ReviewModel.findOne({
      _id: reviewId,
      agentUserId,
      status: {
        $in: [ReviewStatusEnum.PUBLISHED, ReviewStatusEnum.REPORTED],
      },
    })
      .lean()
      .exec();

    if (!review || review.agentReply?.trim()) {
      return null;
    }

    const normalizedReply = reply?.trim() || review.autoReplyDraft?.trim() || "";

    if (!normalizedReply) {
      throw new AppError(
        "AI reply draft is not available",
        400,
        ErrorCode.INVALID_REQUEST,
      );
    }

    return ReviewModel.findOneAndUpdate(
      {
        _id: reviewId,
        agentUserId,
        status: {
          $in: [ReviewStatusEnum.PUBLISHED, ReviewStatusEnum.REPORTED],
        },
      },
      {
        $set: {
          agentReply: normalizedReply,
          agentReplyAt: new Date(),
          autoReplyDraft: normalizedReply,
          autoReplyStatus: ReviewAutoReplyStatusEnum.APPLIED,
          autoReplyAppliedAt: new Date(),
          autoReplyError: "",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec();
  }

  async discardAgentAutoReply(reviewId: string, agentUserId: string) {
    await this.ensureAgentHasProPlan(agentUserId);

    return ReviewModel.findOneAndUpdate(
      {
        _id: reviewId,
        agentUserId,
        status: {
          $in: [ReviewStatusEnum.PUBLISHED, ReviewStatusEnum.REPORTED],
        },
        agentReply: {
          $in: [null, ""],
        },
      },
      {
        $set: {
          autoReplyDraft: "",
          autoReplyStatus: ReviewAutoReplyStatusEnum.DISCARDED,
          autoReplyError: "",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec();
  }
}
