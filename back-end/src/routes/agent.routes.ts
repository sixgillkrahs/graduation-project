import { AgentController } from "@/controllers/agent.controller";
import { validateRequest } from "@/middleware/validateRequest";
import { AgentService } from "@/services/agent.service";
import { EmailService } from "@/services/email.service";
import { UserService } from "@/services/user.service";
import { applicationSchema } from "@/validators/agent.validator";
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
 * /agents/application:
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


/**
 * @swagger
 * /agents/application:
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
router.get(
  "/agent-registrations",
  agentController.agentRegistrations,
);

export default router;
