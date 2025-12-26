import { AgentController } from "@/controllers/agent.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { AgentService } from "@/services/agent.service";
import { EmailService } from "@/services/email.service";
import { UserService } from "@/services/user.service";
import { applicationSchema } from "@/validators/agent.validator";
import { validateIdHeaderSchema } from "@/validators/base.validator";
import { Router } from "express";

const router = Router();

const agentService = new AgentService();
const userService = new UserService();
const emailService = new EmailService();

const agentController = new AgentController(
  agentService,
  userService,
  emailService,
);

/**
 * @swagger
 * /agents-registrations/application:
 *   post:
 *     summary: Application
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               agentName:
 *                 type: string
 *               area:
 *                 type: array
 *                 items:
 *                   type: string
 *               businessName:
 *                 type: string
 *               IDNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               address:
 *                 type: string
 *               nationality:
 *                 type: string
 *               agreeToTerms:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/application",
  validateRequest((lang) => applicationSchema(lang)),
  agentController.application,
);

router.use(requireAuth);

/**
 * @swagger
 * /agents-registrations:
 *   get:
 *     summary: Get agent registrations
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
router.get("/", requireAuth, agentController.agentRegistrations);

/**
 * @swagger
 * /agents-registrations/{id}:
 *   get:
 *     summary: Get agent registration by ID
 *     tags: [Agent]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the agent registration
 *     responses:
 *       200:
 *         description: Agent registration details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 agentName:
 *                   type: string
 *                 area:
 *                   type: array
 *                   items:
 *                     type: string
 *                 businessName:
 *                   type: string
 *                 IDNumber:
 *                   type: string
 *                 dateOfBirth:
 *                   type: string
 *                 gender:
 *                   type: string
 *                 address:
 *                   type: string
 *                 nationality:
 *                   type: string
 *                 agreeToTerms:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *       404:
 *         description: Agent registration not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  requireAuth,
  validateRequest((lang) => validateIdHeaderSchema(lang)),
  agentController.agentRegistrationDetail,
);

export default router;
