import { AgentController } from "@/controllers/agent.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { EmailQueue } from "@/queues/email.queue";
import { AgentService } from "@/services/agent.service";
import { AuthService } from "@/services/auth.service";
import { EmailService } from "@/services/email.service";
import { PropertySaleService } from "@/services/property-sale.service";
import { PropertyService } from "@/services/property.service";
import { RoleService } from "@/services/role.service";
import { UserService } from "@/services/user.service";
import { AgentLeaderboardService } from "@/services/agent-leaderboard.service";
import { Router } from "express";

const router = Router();

const propertyService = new PropertyService();
const agentService = new AgentService();
const userService = new UserService();
const emailService = new EmailService();
const authService = new AuthService();
const roleService = new RoleService();
const emailQueue = new EmailQueue();
const propertySaleService = new PropertySaleService();
const agentLeaderboardService = new AgentLeaderboardService();

const agentController = new AgentController(
  agentService,
  userService,
  emailService,
  authService,
  roleService,
  emailQueue,
  propertyService,
  propertySaleService,
  agentLeaderboardService,
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
 * /agents/{agentId}/public-profile:
 *   get:
 *     summary: Get public profile of an approved agent
 *     tags: [Agent]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent user ID
 *     responses:
 *       200:
 *         description: Public profile of the agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 role:
 *                   type: string
 *                 location:
 *                   type: string
 *                 rating:
 *                   type: number
 *                 description:
 *                   type: string
 *                 yearsOfExperience:
 *                   type: string
 *                 specialties:
 *                   type: array
 *                   items:
 *                     type: string
 *                 workingAreas:
 *                   type: array
 *                   items:
 *                     type: string
 *                 verified:
 *                   type: boolean
 *                 plan:
 *                   type: string
 *                   enum: [BASIC, PRO]
 *                 isPro:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     activeSaleListingsCount:
 *                       type: integer
 *                     totalPublishedListingsCount:
 *                       type: integer
 *                     soldPropertiesCount:
 *                       type: integer
 *                     totalViews:
 *                       type: integer
 *       404:
 *         description: Agent not found
 */
router.get("/:agentId/public-profile", agentController.getPublicProfile);

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

router.get(
  "/me/revenue-summary",
  requireAuth,
  agentController.getRevenueSummary,
);

router.get("/me/sales-log", requireAuth, agentController.getMySalesLog);

router.get(
  "/revenue-leaderboard",
  requireAuth,
  agentController.getRevenueLeaderboard,
);

export default router;
