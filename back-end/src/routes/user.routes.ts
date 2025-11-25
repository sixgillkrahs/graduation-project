import { Router } from "express";
import { UserController } from "@/controllers/user.controller";
import { UserService } from "@/services/user.service";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { createUserSchema } from "@/validators/user.validator";

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

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
export default router;