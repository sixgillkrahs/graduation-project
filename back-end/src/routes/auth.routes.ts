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
 *     description: Authenticates a user with username and password, then returns the session token and current user payload.
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
 *     description: Creates a new end-user account with the provided registration information.
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
 *     description: Returns the authenticated user's current account and profile information.
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
 *     description: Exchanges a valid refresh token or refresh context for a new access token.
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
 *     description: Signs the current user out and invalidates the active authentication session.
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
 *     description: Updates the password for the currently authenticated user after validating the old password.
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
 *     description: Starts the password-reset flow by sending a verification code or reset instructions to the user's email.
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
 *     description: Verifies the one-time password generated during the password-reset flow.
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
 *     description: Sets a new password after the reset token or verification flow has been validated.
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
 *     description: Starts the WebAuthn passkey registration flow for the authenticated user.
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
 *     description: Verifies the WebAuthn registration response and saves the passkey for future logins.
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
 *     description: Starts a passwordless login flow by generating WebAuthn assertion options.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login passkey successful
 *       400:
 *         description: Invalid input
 */
router.post("/login-passkey", authController.loginPasskey);

/**
 * @swagger
 * /auth/verify-login-passkey:
 *   post:
 *     summary: Verify login passkey
 *     description: Verifies the WebAuthn login assertion and returns an authenticated session payload.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Verify login passkey successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid input
 */
router.post("/verify-login-passkey", authController.verifyLoginPasskey);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Redirect to Google OAuth login
 *     description: Starts the Google OAuth authentication flow by redirecting the user to Google's consent screen.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent page
 */
router.get("/google", authController.googleAuth);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     description: Completes the Google OAuth login flow after the user returns from Google's consent screen.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: false
 *         description: Authorization code returned by Google
 *     responses:
 *       200:
 *         description: Google login handled successfully
 *       302:
 *         description: Redirects to the configured frontend callback destination
 *       400:
 *         description: Invalid Google OAuth callback payload
 */
router.get("/google/callback", authController.googleAuthCallback);

export default router;
