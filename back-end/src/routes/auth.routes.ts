import { AuthController } from "@/controllers/auth.controller";
import { AuthService } from "@/services/auth.service";
import { Router } from "express";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { loginSchema, signupSchema } from "@/validators/auth.validator";
import { UserService } from "@/services/user.service";
import { RoleService } from "@/services/role.service";

const router = Router();

const authService = new AuthService();
const userService = new UserService();
const roleService = new RoleService();
const authController = new AuthController(
  authService,
  userService,
  roleService,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               rememberMe:
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
  "/login",
  validateRequest((lang) => loginSchema(lang)),
  authController.login,
);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signup successful
 *       400:
 *         description: Invalid input
 */
router.post(
  "/signup",
  validateRequest((lang) => signupSchema(lang)),
  authController.signup,
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Signup successful
 *       400:
 *         description: Invalid input
 */
router.get("/me", requireAuth, authController.me);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Refresh token successful
 *       400:
 *         description: Invalid input
 */
router.post("/refresh-token", authController.refreshToken);

export default router;
