import { AuthController } from "@/controllers/auth.controller";
import { AuthService } from "@/services/auth.service";
import { Router } from "express";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import {
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/validators/auth.validator";
import { UserService } from "@/services/user.service";
import { RoleService } from "@/services/role.service";
import { EmailQueue } from "@/queues/email.queue";

const router = Router();

const authService = new AuthService();
const userService = new UserService();
const roleService = new RoleService();
const emailQueue = new EmailQueue();
const authController = new AuthController(
  authService,
  userService,
  roleService,
  emailQueue,
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

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Invalid input
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       description: Change password request body
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Change password successful
 *       400:
 *         description: Invalid input
 */
router.put("/change-password", requireAuth, authController.changePassword);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       description: Forgot password request body
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Forgot password successful
 *       400:
 *         description: Invalid input
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       description: Verify OTP request body
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verify OTP successful
 *       400:
 *         description: Invalid input
 */
router.post("/verify-otp", authController.verifyOTP);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       description: Reset password request body
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset password successful
 *       400:
 *         description: Invalid input
 */
router.post(
  "/reset-password",
  validateRequest((lang) => resetPasswordSchema(lang)),
  authController.resetPassword,
);

/**
 * @swagger
 * /auth/register-passkey:
 *   post:
 *     summary: Register passkey
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Register passkey successful
 *       400:
 *         description: Invalid input
 */
router.post("/register-passkey", requireAuth, authController.registerPasskey);

/**
 * @swagger
 * /auth/verify-passkey:
 *   post:
 *     summary: Verify passkey
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Verify passkey successful
 *       400:
 *         description: Invalid input
 */
router.post("/verify-passkey", requireAuth, authController.verifyPasskey);

/**
 * @swagger
 * /auth/login-passkey:
 *   post:
 *     summary: Login passkey
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login passkey successful
 *       400:
 *         description: Invalid input
 */
router.post("/login-passkey", authController.loginPasskey);

export default router;
