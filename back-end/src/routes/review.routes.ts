import { ReviewController } from "@/controllers/review.controller";
import { requireAuth, requireRole } from "@/middleware/authMiddleware";
import { ReviewService } from "@/services/review.service";
import { validateRequest } from "@/middleware/validateRequest";
import {
  validateAdminReviewDecisionSchema,
  validateApplyAutoReplySchema,
  validateCreateReviewSchema,
  validateDiscardAutoReplySchema,
  validateGenerateAutoReplySchema,
  validateGetAdminReviewQueueSchema,
  validateGetMyReviewsSchema,
  validateGetPublicReviewsSchema,
  validateReplyReviewSchema,
  validateReportReviewSchema,
  validateReviewInvitationSchema,
} from "@/validators/review.validator";
import { Router } from "express";

const router = Router();
const reviewController = new ReviewController(new ReviewService());

/**
 * @swagger
 * /reviews/invitations/{token}:
 *   get:
 *     summary: Get review invitation preview by token
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: One-time review invitation token
 *     responses:
 *       200:
 *         description: Review invitation preview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ReviewInvitationPreview'
 *       404:
 *         description: Review invitation not found
 *       410:
 *         description: Review invitation expired or already used
 */
router.get(
  "/invitations/:token",
  validateRequest((lang) => validateReviewInvitationSchema(lang)),
  reviewController.getInvitation,
);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Submit a customer review from invitation token
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewRequest'
 *     responses:
 *       200:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     rating:
 *                       type: number
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     comment:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PENDING, AWAITING_ADMIN, PUBLISHED, REJECTED, REPORTED]
 *       404:
 *         description: Review invitation not found
 *       410:
 *         description: Review invitation expired or already used
 */
router.post(
  "/",
  validateRequest((lang) => validateCreateReviewSchema(lang)),
  reviewController.createReview,
);

/**
 * @swagger
 * /reviews/agents/{agentUserId}/public:
 *   get:
 *     summary: Get published public reviews for an agent
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: agentUserId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Public review list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PublicReviewPagination'
 */
router.get(
  "/agents/:agentUserId/public",
  validateRequest((lang) => validateGetPublicReviewsSchema(lang)),
  reviewController.getPublicReviews,
);

/**
 * @swagger
 * /reviews/me:
 *   get:
 *     summary: Get reviews for the current agent
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, 5star, 1-3star, unanswered]
 *     responses:
 *       200:
 *         description: Agent review list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AgentReviewPagination'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/me",
  requireAuth,
  validateRequest((lang) => validateGetMyReviewsSchema(lang)),
  reviewController.getMyReviews,
);

/**
 * @swagger
 * /reviews/admin/queue:
 *   get:
 *     summary: Get review moderation queue for admin
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review moderation queue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AgentReviewPagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/admin/queue",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest((lang) => validateGetAdminReviewQueueSchema(lang)),
  reviewController.getAdminModerationQueue,
);

/**
 * @swagger
 * /reviews/admin/{reviewId}/approve:
 *   patch:
 *     summary: Approve a moderated review and publish it
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminReviewDecisionRequest'
 *     responses:
 *       200:
 *         description: Review approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.patch(
  "/admin/:reviewId/approve",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest((lang) => validateAdminReviewDecisionSchema(lang)),
  reviewController.adminApproveReview,
);

/**
 * @swagger
 * /reviews/admin/{reviewId}/reject:
 *   patch:
 *     summary: Reject a moderated review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminReviewDecisionRequest'
 *     responses:
 *       200:
 *         description: Review rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.patch(
  "/admin/:reviewId/reject",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest((lang) => validateAdminReviewDecisionSchema(lang)),
  reviewController.adminRejectReview,
);

/**
 * @swagger
 * /reviews/{reviewId}/auto-reply/generate:
 *   post:
 *     summary: Generate an AI reply draft for a PRO agent review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI reply draft generated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden or not a PRO plan
 *       404:
 *         description: Review not found
 */
router.post(
  "/:reviewId/auto-reply/generate",
  requireAuth,
  validateRequest((lang) => validateGenerateAutoReplySchema(lang)),
  reviewController.generateAutoReply,
);

/**
 * @swagger
 * /reviews/{reviewId}/auto-reply/apply:
 *   patch:
 *     summary: Apply an AI reply draft to a review as the current PRO agent
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reply:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI reply applied
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden or not a PRO plan
 *       404:
 *         description: Review not found
 */
router.patch(
  "/:reviewId/auto-reply/apply",
  requireAuth,
  validateRequest((lang) => validateApplyAutoReplySchema(lang)),
  reviewController.applyAutoReply,
);

/**
 * @swagger
 * /reviews/{reviewId}/auto-reply/discard:
 *   patch:
 *     summary: Discard an AI reply draft for the current PRO agent
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI reply draft discarded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden or not a PRO plan
 *       404:
 *         description: Review not found
 */
router.patch(
  "/:reviewId/auto-reply/discard",
  requireAuth,
  validateRequest((lang) => validateDiscardAutoReplySchema(lang)),
  reviewController.discardAutoReply,
);

/**
 * @swagger
 * /reviews/{reviewId}/reply:
 *   patch:
 *     summary: Reply to a customer review as the current agent
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reply
 *             properties:
 *               reply:
 *                 type: string
 *                 example: Cam on anh chi da tin tuong va de lai danh gia.
 *     responses:
 *       200:
 *         description: Reply saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.patch(
  "/:reviewId/reply",
  requireAuth,
  validateRequest((lang) => validateReplyReviewSchema(lang)),
  reviewController.replyToReview,
);

/**
 * @swagger
 * /reviews/{reviewId}/report:
 *   patch:
 *     summary: Report a review to admin
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Review nay co dau hieu choi xau va can admin kiem tra.
 *     responses:
 *       200:
 *         description: Review reported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.patch(
  "/:reviewId/report",
  requireAuth,
  validateRequest((lang) => validateReportReviewSchema(lang)),
  reviewController.reportReview,
);

/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewReply:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *         repliedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         rating:
 *           type: number
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         comment:
 *           type: string
 *         propertyName:
 *           type: string
 *         customerName:
 *           type: string
 *         customerInitial:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [PENDING, AWAITING_ADMIN, PUBLISHED, REJECTED, REPORTED]
 *         agentReply:
 *           allOf:
 *             - $ref: '#/components/schemas/ReviewReply'
 *           nullable: true
 *         reportedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         reportReason:
 *           type: string
 *         adminNote:
 *           type: string
 *     ReviewInvitationPreview:
 *       type: object
 *       properties:
 *         agentName:
 *           type: string
 *         propertyName:
 *           type: string
 *         customerName:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         quickTags:
 *           type: array
 *           items:
 *             type: string
 *     CreateReviewRequest:
 *       type: object
 *       required:
 *         - token
 *         - rating
 *         - tags
 *       properties:
 *         token:
 *           type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         comment:
 *           type: string
 *     AdminReviewDecisionRequest:
 *       type: object
 *       properties:
 *         note:
 *           type: string
 *           example: Reviewed by admin and approved for publishing.
 *     PublicReviewSummary:
 *       type: object
 *       properties:
 *         averageRating:
 *           type: number
 *         totalReviews:
 *           type: integer
 *         breakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               star:
 *                 type: integer
 *               count:
 *                 type: integer
 *     PublicReviewPagination:
 *       type: object
 *       properties:
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         totalResults:
 *           type: integer
 *         summary:
 *           $ref: '#/components/schemas/PublicReviewSummary'
 *     AgentReviewPagination:
 *       type: object
 *       properties:
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         totalResults:
 *           type: integer
 *         summary:
 *           type: object
 *           properties:
 *             averageRating:
 *               type: number
 *             totalReviews:
 *               type: integer
 *             pendingCount:
 *               type: integer
 *             reportedCount:
 *               type: integer
 *             unansweredCount:
 *               type: integer
 */

export default router;
