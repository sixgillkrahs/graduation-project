import { ReportController } from "@/controllers/report.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { NoticeService } from "@/services/notice.service";
import { ReportService } from "@/services/report.service";
import {
  validateCreateReportSchema,
  validateResolveReportSchema,
} from "@/validators/report.validator";
import { Router } from "express";

const router = Router();
const reportController = new ReportController(
  new ReportService(),
  new NoticeService(),
);

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Report a listing or agent for moderation review
 *     description: Creates or updates a moderation report for a listing or agent and notifies admin users about the report.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - targetId
 *               - reason
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [LISTING, AGENT]
 *               targetId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 enum: [WRONG_DATA, SPAM, FAKE_PRICE, OTHER]
 *               details:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report submitted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Target not found
 */
router.post(
  "/",
  requireAuth,
  validateRequest((lang) => validateCreateReportSchema(lang)),
  reportController.createReport,
);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get report details by ID
 *     description: Returns the details of a specific moderation report for an authenticated user.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report identifier
 *     responses:
 *       200:
 *         description: Report details returned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 */
router.get("/:id", requireAuth, reportController.getReportById);

/**
 * @swagger
 * /reports/{id}/resolve:
 *   patch:
 *     summary: Resolve a moderation report
 *     description: Resolves a moderation report by confirming or dismissing it and optionally storing an admin note.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, DISMISSED]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report resolved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 */
router.patch(
  "/:id/resolve",
  requireAuth,
  validateRequest((lang) => validateResolveReportSchema(lang)),
  reportController.resolveReport,
);

export default router;
