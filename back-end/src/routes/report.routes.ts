import { ReportController } from "@/controllers/report.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { NoticeService } from "@/services/notice.service";
import { ReportService } from "@/services/report.service";
import { validateCreateReportSchema } from "@/validators/report.validator";
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

export default router;
