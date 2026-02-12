import { AgentController } from "@/controllers/agent.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { EmailQueue } from "@/queues/email.queue";
import { AgentService } from "@/services/agent.service";
import { AuthService } from "@/services/auth.service";
import { EmailService } from "@/services/email.service";
import { PropertyService } from "@/services/property.service";
import { RoleService } from "@/services/role.service";
import { UserService } from "@/services/user.service";
import { Router } from "express";

const router = Router();

const propertyService = new PropertyService();
const agentService = new AgentService();
const userService = new UserService();
const emailService = new EmailService();
const authService = new AuthService();
const roleService = new RoleService();
const emailQueue = new EmailQueue();

const agentController = new AgentController(
  agentService,
  userService,
  emailService,
  authService,
  roleService,
  emailQueue,
  propertyService,
);

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: Get agent
 *     tags: [Agent]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Number of items to skip
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: A list of agent registrations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   fullName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   agentName:
 *                     type: string
 *                   area:
 *                     type: array
 *                     items:
 *                       type: string
 *                   businessName:
 *                     type: string
 *                   IDNumber:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                   gender:
 *                     type: string
 *                   address:
 *                     type: string
 *                   nationality:
 *                     type: string
 *                   agreeToTerms:
 *                     type: boolean
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 */
router.get("/", agentController.getAgents);

/**
 * @swagger
 * /agents/me/properties/count:
 *   get:
 *     summary: Get total count of published properties by agent
 *     tags: [Agent]
 *     responses:
 *       200:
 *         description: Total count of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 15
 */
router.get(
  "/me/properties/count",
  requireAuth,
  agentController.countPropertiesByAgent,
);

/**
 * @swagger
 * /agents/me/properties/count-view:
 *   get:
 *     summary: Get total count of views by agent
 *     tags: [Agent]
 *     responses:
 *       200:
 *         description: Total count of views
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalViews:
 *                   type: integer
 *                   example: 15
 */
router.get(
  "/me/properties/count-view",
  requireAuth,
  agentController.countTotalView,
);

/**
 * @swagger
 * /agents/me/properties/count-sold:
 *   get:
 *     summary: Get total count of sold properties by agent
 *     tags: [Agent]
 *     responses:
 *       200:
 *         description: Total count of sold properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 15
 */
router.get(
  "/me/properties/count-sold",
  requireAuth,
  agentController.countSoldPropertiesByAgent,
);

/**
 * @swagger
 * /agents/me/analytics:
 *   get:
 *     summary: Get analytics for dashboard chart
 *     tags: [Agent]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, year]
 *     responses:
 *       200:
 *         description: Chart data
 */
router.get("/me/analytics", requireAuth, agentController.getAnalytics);

export default router;
