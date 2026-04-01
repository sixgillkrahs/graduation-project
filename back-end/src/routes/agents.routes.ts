import { AgentController } from "@/controllers/agent.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { EmailQueue } from "@/queues/email.queue";
import { AgentService } from "@/services/agent.service";
import { AuthService } from "@/services/auth.service";
import { EmailService } from "@/services/email.service";
import { PropertySaleService } from "@/services/property-sale.service";
import { PropertyService } from "@/services/property.service";
import { RoleService } from "@/services/role.service";
import { UserService } from "@/services/user.service";
import { AgentLeaderboardService } from "@/services/agent-leaderboard.service";
import {
  accountLockAppealTokenSchema,
  submitAccountLockAppealSchema,
} from "@/validators/agent.validator";
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
 *     description: Returns a paginated list of agent records for listing or administrative management views.
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
 * /agents/account-lock/appeal/{token}:
 *   get:
 *     summary: Get account lock appeal context
 *     description: Validates an account-lock appeal token and returns the locked-account context needed to render the appeal form.
 *     tags: [Agent]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Appeal token received in the account lock email
 *     responses:
 *       200:
 *         description: Account lock appeal context
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 lockType:
 *                   type: string
 *                   enum: [TEMPORARY, PERMANENT]
 *                 lockReason:
 *                   type: string
 *                   nullable: true
 *                 lockedAt:
 *                   type: string
 *                   format: date-time
 *                 lockedUntil:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 hasPendingRequest:
 *                   type: boolean
 *       400:
 *         description: Invalid or expired appeal token
 *       409:
 *         description: Account is no longer locked
 */
router.get(
  "/account-lock/appeal/:token",
  validateRequest((lang) => accountLockAppealTokenSchema(lang)),
  agentController.getAccountLockAppealContext,
);

/**
 * @swagger
 * /agents/account-lock/appeal:
 *   post:
 *     summary: Submit account lock appeal
 *     description: Submits an unlock appeal for a locked agent account using a valid email-issued appeal token.
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - reason
 *             properties:
 *               token:
 *                 type: string
 *                 description: Appeal token received in the account lock email
 *               reason:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Agent explanation for requesting account unlock
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 description: Optional contact email for follow-up
 *     responses:
 *       200:
 *         description: Appeal submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid payload or expired appeal token
 *       409:
 *         description: Account is no longer locked
 */
router.post(
  "/account-lock/appeal",
  validateRequest((lang) => submitAccountLockAppealSchema(lang)),
  agentController.submitAccountLockAppeal,
);

/**
 * @swagger
 * /agents/{agentId}/public-profile:
 *   get:
 *     summary: Get public profile of an approved agent
 *     description: Returns the public-facing profile, review, and listing statistics for an approved agent.
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
 *     description: Returns the number of published properties owned by the authenticated agent.
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
 *     description: Returns the total listing-view count accumulated by the authenticated agent.
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
 *     description: Returns the number of sold properties attributed to the authenticated agent.
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
 *     description: Returns view and lead analytics grouped by month or year for the authenticated agent dashboard.
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

// Public leaderboard (no auth required)
/**
 * @swagger
 * /agents/public/leaderboard:
 *   get:
 *     summary: Get public revenue leaderboard for agents
 *     description: Returns the public-facing agent revenue leaderboard with optional period and currency filters.
 *     tags: [Agent]
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Revenue leaderboard returned successfully
 */
router.get("/public/leaderboard", agentController.getRevenueLeaderboard);

/**
 * @swagger
 * /agents/me/revenue-summary:
 *   get:
 *     summary: Get revenue summary for current agent
 *     description: Returns revenue and deal totals for the authenticated agent, optionally filtered by month, year, and currency.
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Revenue summary returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/me/revenue-summary",
  requireAuth,
  agentController.getRevenueSummary,
);

/**
 * @swagger
 * /agents/me/sales-log:
 *   get:
 *     summary: Get sales log for current agent
 *     description: Returns a paginated sales log for the authenticated agent with optional month, year, and currency filters.
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sales log returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me/sales-log", requireAuth, agentController.getMySalesLog);

/**
 * @swagger
 * /agents/revenue-leaderboard:
 *   get:
 *     summary: Get revenue leaderboard for authorized users
 *     description: Returns the revenue leaderboard for agents to authenticated users in back-office or internal views.
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Revenue leaderboard returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/revenue-leaderboard",
  requireAuth,
  agentController.getRevenueLeaderboard,
);

export default router;
