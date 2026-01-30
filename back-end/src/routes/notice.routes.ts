import { NoticeController } from "@/controllers/notice.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { NoticeService } from "@/services/notice.service";
import { Router } from "express";

const router = Router();
const noticeService = new NoticeService();
const noticeController = new NoticeController(noticeService);

/**
 * @swagger
 * /notices:
 *   post:
 *     summary: Create a new notice
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [SYSTEM, PROPERTY, ACCOUNT]
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notice created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", requireAuth, noticeController.createNotice);

/**
 * @swagger
 * /notices/me:
 *   get:
 *     summary: Get all notices for the current user
 *     tags: [Notices]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SYSTEM, PROPERTY, ACCOUNT]
 *     responses:
 *       200:
 *         description: List of user's notices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notice'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/me", requireAuth, noticeController.getMyNotices);

/**
 * @swagger
 * /notices/{id}:
 *   get:
 *     summary: Get notice details by ID
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notice ID
 *     responses:
 *       200:
 *         description: Notice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notice'
 *       404:
 *         description: Notice not found
 *       403:
 *         description: Forbidden
 */
router.get("/:id", requireAuth, noticeController.getNoticeById);

/**
 * @swagger
 * /notices/{id}/read:
 *   patch:
 *     summary: Mark notice as read
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notice ID
 *     responses:
 *       200:
 *         description: Notice marked as read
 *       404:
 *         description: Notice not found
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/read", requireAuth, noticeController.markAsRead);

/**
 * @swagger
 * /notices/{id}:
 *   delete:
 *     summary: Delete a notice
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notice ID
 *     responses:
 *       200:
 *         description: Notice deleted successfully
 *       404:
 *         description: Notice not found
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", requireAuth, noticeController.deleteNotice);

/**
 * @swagger
 * components:
 *   schemas:
 *     Notice:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         isRead:
 *           type: boolean
 *         type:
 *           type: string
 *           enum: [SYSTEM, PROPERTY, ACCOUNT]
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router;
