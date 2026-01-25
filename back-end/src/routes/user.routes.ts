import { Router } from "express";
import { UserController } from "@/controllers/user.controller";
import { UserService } from "@/services/user.service";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { createUserSchema } from "@/validators/user.validator";
import { AgentService } from "@/services/agent.service";
import { AuthService } from "@/services/auth.service";

const router = Router();
const userService = new UserService();
const agentService = new AgentService();
const authService = new AuthService();
const userController = new UserController(userService, agentService, authService);

router.use(requireAuth);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - phone
 *             properties:
 *               firstname:
 *                 type: string
 *                 minLength: 2
 *               lastname:
 *                 type: string
 *                 minLength: 2
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - Admin only
 */
router.post("/", validateRequest(createUserSchema), userController.createUser);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       403:
 *         description: Forbidden - User role required
 */
router.get("/profile", userController.profile);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       403:
 *         description: Forbidden - User role required
 */
router.patch("/profile", userController.updateProfile);


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field (e.g. "createdAt:desc")
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       403:
 *         description: Forbidden - User role required
 */
router.get("/", userController.getUsers);



/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (Auth ID)
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 userId:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                 roleId:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden
 */
router.get("/:id", userController.getUser);

export default router;
