import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { ReviewService } from "@/services/review.service";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

export class ReviewController extends BaseController {
  constructor(private reviewService: ReviewService) {
    super();
  }

  getInvitation = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { token } = req.params;
      const invitation = await this.reviewService.getInvitationPreview(token);

      if (!invitation) {
        throw new AppError(
          "Review invitation not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      if (invitation.isInvalid) {
        throw new AppError(
          "Review invitation is no longer valid",
          410,
          ErrorCode.TOKEN_EXPIRED,
        );
      }

      return {
        agentName: invitation.agentName,
        propertyName: invitation.propertyName,
        customerName: invitation.customerName,
        expiresAt: invitation.expiresAt,
        quickTags: [
          "Nhiệt tình",
          "Đúng giờ",
          "Am hiểu thị trường",
          "Hỗ trợ pháp lý tốt",
        ],
      };
    });
  };

  createReview = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { token, rating, tags, comment } = req.body;
      const result = await this.reviewService.submitReview({
        token,
        rating,
        tags,
        comment,
      });

      if (!result) {
        throw new AppError(
          "Review invitation not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      if (result.invalid) {
        throw new AppError(
          "Review invitation is no longer valid",
          410,
          ErrorCode.TOKEN_EXPIRED,
        );
      }

      return {
        id: (result.review as any).id || String((result.review as any)._id || ""),
        rating: result.review?.rating,
        tags: result.review?.tags,
        comment: result.review?.comment,
        status: result.review?.status,
      };
    });
  };

  getAgentReviewEligibility = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const userId = req.user?.userId?._id?.toString();
      const { agentUserId } = req.params;

      if (!userId) {
        throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
      }

      return this.reviewService.getAgentReviewEligibility(agentUserId, userId);
    });
  };

  createAgentReview = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const customerUserId = req.user?.userId?._id?.toString();
      const { agentUserId } = req.params;
      const { rating, tags, comment } = req.body;

      if (!customerUserId) {
        throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
      }

      const review = await this.reviewService.submitReviewForAgent({
        agentUserId,
        customerUserId,
        rating,
        tags,
        comment,
      });

      if (!review) {
        throw new AppError(
          "Review eligibility not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      return {
        id: (review as any).id || String((review as any)._id || ""),
        rating: review.rating,
        tags: review.tags,
        comment: review.comment,
        status: review.status,
      };
    });
  };

  getPublicReviews = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { agentUserId } = req.params;
      const { page = "1", limit = "5" } = req.query as {
        page?: string;
        limit?: string;
      };

      return this.reviewService.getPublicReviews(agentUserId, {
        page: Number(page) || 1,
        limit: Number(limit) || 5,
      });
    });
  };

  getMyReviews = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const userId = req.user?.userId?._id?.toString();
      const { page = "1", limit = "10", search, filter = "all" } = req.query as {
        page?: string;
        limit?: string;
        search?: string;
        filter?: "all" | "5star" | "1-3star" | "unanswered";
      };

      return this.reviewService.getAgentReviews(userId, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search,
        filter,
      });
    });
  };

  getAdminModerationQueue = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { page = "1", limit = "10", search } = req.query as {
        page?: string;
        limit?: string;
        search?: string;
      };

      return this.reviewService.getAdminModerationQueue({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search,
      });
    });
  };

  replyToReview = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const userId = req.user?.userId?._id?.toString();
      const { reviewId } = req.params;
      const { reply } = req.body;

      const review = await this.reviewService.replyToReview(
        reviewId,
        userId,
        reply,
      );

      if (!review) {
        throw new AppError("Review not found", 404, ErrorCode.NOT_FOUND);
      }

      return review;
    });
  };

  reportReview = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const userId = req.user?.userId?._id?.toString();
      const { reviewId } = req.params;
      const { reason } = req.body;

      const review = await this.reviewService.reportReview(
        reviewId,
        userId,
        reason,
      );

      if (!review) {
        throw new AppError("Review not found", 404, ErrorCode.NOT_FOUND);
      }

      return review;
    });
  };

  generateAutoReply = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const userId = req.user?.userId?._id?.toString();
      const { reviewId } = req.params;

      const review = await this.reviewService.generateAgentAutoReply(
        reviewId,
        userId,
      );

      if (!review) {
        throw new AppError("Review not found", 404, ErrorCode.NOT_FOUND);
      }

      return review;
    });
  };

  applyAutoReply = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const userId = req.user?.userId?._id?.toString();
      const { reviewId } = req.params;
      const { reply } = req.body;

      const review = await this.reviewService.applyAgentAutoReply(
        reviewId,
        userId,
        reply,
      );

      if (!review) {
        throw new AppError("Review not found", 404, ErrorCode.NOT_FOUND);
      }

      return review;
    });
  };

  discardAutoReply = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const userId = req.user?.userId?._id?.toString();
      const { reviewId } = req.params;

      const review = await this.reviewService.discardAgentAutoReply(
        reviewId,
        userId,
      );

      if (!review) {
        throw new AppError("Review not found", 404, ErrorCode.NOT_FOUND);
      }

      return review;
    });
  };

  adminApproveReview = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const adminUserId = req.user?.userId?._id?.toString();
      const { reviewId } = req.params;
      const { note } = req.body;

      const review = await this.reviewService.adminApproveReview(
        reviewId,
        adminUserId,
        note,
      );

      if (!review) {
        throw new AppError("Review not found", 404, ErrorCode.NOT_FOUND);
      }

      return review;
    });
  };

  adminRejectReview = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const adminUserId = req.user?.userId?._id?.toString();
      const { reviewId } = req.params;
      const { note } = req.body;

      const review = await this.reviewService.adminRejectReview(
        reviewId,
        adminUserId,
        note,
      );

      if (!review) {
        throw new AppError("Review not found", 404, ErrorCode.NOT_FOUND);
      }

      return review;
    });
  };
}
