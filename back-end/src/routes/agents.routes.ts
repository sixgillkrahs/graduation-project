import { AgentController } from "@/controllers/agent.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { EmailQueue } from "@/queues/email.queue";
import { AgentService } from "@/services/agent.service";
import { AuthService } from "@/services/auth.service";
import { EmailService } from "@/services/email.service";
import { RoleService } from "@/services/role.service";
import { UserService } from "@/services/user.service";
import { applicationSchema } from "@/validators/agent.validator";
import { validateIdHeaderSchema } from "@/validators/base.validator";
import { Router } from "express";

const router = Router();

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

export default router;
