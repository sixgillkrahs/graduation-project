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
 * /agents-registrations/application:
 *   post:
 *     summary: Agent application registration
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nameRegister
 *               - email
 *               - phoneNumber
 *               - identityFront
 *               - identityBack
 *               - identityInfo
 *               - certificateNumber
 *               - certificateImage
 *               - specialization
 *               - workingArea
 *               - taxCode
 *               - yearsOfExperience
 *               - agreeToTerms
 *             properties:
 *               nameRegister:
 *                 type: string
 *                 example: "Quân Đỗ"
 *
 *               email:
 *                 type: string
 *                 example: "dovanquan28041999@gmail.com"
 *
 *               phoneNumber:
 *                 type: string
 *                 example: "8496670287"
 *
 *               identityFront:
 *                 type: string
 *                 description: Uploaded filename of identity front image
 *                 example: "front.jpg-v-uuid.jpg"
 *
 *               identityBack:
 *                 type: string
 *                 description: Uploaded filename of identity back image
 *                 example: "back.jpg-v-uuid.jpg"
 *
 *               identityInfo:
 *                 type: object
 *                 required:
 *                   - IDNumber
 *                   - fullName
 *                   - dateOfBirth
 *                   - gender
 *                   - nationality
 *                 properties:
 *                   IDNumber:
 *                     type: string
 *                     example: "001203038427"
 *                   fullName:
 *                     type: string
 *                     example: "ĐỖ VĂN QUÂN"
 *                   dateOfBirth:
 *                     type: string
 *                     example: "28/04/2003"
 *                   gender:
 *                     type: string
 *                     example: "Nam"
 *                   nationality:
 *                     type: string
 *                     example: "Việt Nam"
 *
 *               certificateNumber:
 *                 type: string
 *                 example: "CCC-GAD"
 *
 *               certificateImage:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "certificate.jpg-v-uuid.jpg"
 *
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "APARTMENT"
 *                   - "LAND"
 *
 *               workingArea:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "Ha Noi"
 *                   - "Ho Chi Minh"
 *
 *               taxCode:
 *                 type: string
 *                 example: "6323"
 *
 *               yearsOfExperience:
 *                 type: string
 *                 example: "2"
 *
 *               agreeToTerms:
 *                 type: boolean
 *                 example: true
 *
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Application submitted successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
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
router.get("/", agentController.agentRegistrations);

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *
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
  validateRequest((lang) => validateIdHeaderSchema(lang)),
  agentController.agentRegistrationDetail,
);

/**
 * @swagger
 * /agents-registrations/{id}/reject:
 *   patch:
 *     summary: Reject agent registration by ID
 *     tags: [Agent]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the agent registration
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Invalid certificate information"
 *
 *     responses:
 *       200:
 *         description: Agent registration rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Agent registration rejected"
 *       404:
 *         description: Agent registration not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:id/reject",
  validateRequest((lang) => validateIdHeaderSchema(lang)),
  agentController.rejectAgentRegistration,
);

/**
 * @swagger
 * /agents-registrations/{id}/approve:
 *   patch:
 *     summary: Approve agent registration by ID
 *     tags: [Agent]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the agent registration
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: "Note"
 *
 *     responses:
 *       200:
 *         description: Agent registration approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Agent registration approved"
 *       404:
 *         description: Agent registration not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:id/approve",
  validateRequest((lang) => validateIdHeaderSchema(lang)),
  agentController.approveAgentRegistration,
);

export default router;
