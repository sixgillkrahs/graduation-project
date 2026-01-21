import { Router } from "express";
import { ChatController } from "@/controllers/chat.controller";
import { ChatService } from "@/services/chat.service";
import { requireAuth } from "@/middleware/authMiddleware";

const router = Router();
const chatService = new ChatService();
const chatController = new ChatController(chatService);

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat management
 */

/**
 * @swagger
 * /chat/conversations:
 *   get:
 *     summary: Get all conversations for current user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   participants:
 *                     type: array
 *                   lastMessageId:
 *                     type: object
 */
router.get("/conversations", chatController.getConversations);

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get messages for a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get(
  "/conversations/:conversationId/messages",
  chatController.getMessages,
);

/**
 * @swagger
 * /chat/conversations:
 *   post:
 *     summary: Create or retrieve a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantIds
 *             properties:
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: The conversation object
 */
router.post("/conversations", chatController.createConversation);

export default router;
