import { SettingController } from "@/controllers/setting.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { SettingService } from "@/services/setting.service";
import { validateUpdateGeneralSettingsSchema } from "@/validators/setting.validator";
import { Router } from "express";

const settingService = new SettingService();
const settingController = new SettingController(settingService);
const router = Router();

router.get("/public/general", settingController.getPublicGeneralSettings);

router.use(requireAuth);

/**
 * @swagger
 * /settings/general:
 *   get:
 *     summary: Get general platform settings for landing page and UAA portal
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: General settings fetched successfully
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
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 67e3b1f25f5c5b77c1234567
 *                     key:
 *                       type: string
 *                       enum: [general]
 *                       example: general
 *                     systemName:
 *                       type: string
 *                       example: Gra Estate
 *                     adminPortalTitle:
 *                       type: string
 *                       example: Gra Estate Admin
 *                     systemTagline:
 *                       type: string
 *                       example: Operations center for listings, agents, reviews, and platform health.
 *                     websiteUrl:
 *                       type: string
 *                       format: uri
 *                       example: http://localhost:3000
 *                     brandColor:
 *                       type: string
 *                       example: "#14532d"
 *                     defaultLanguage:
 *                       type: string
 *                       enum: [en, vi]
 *                       example: vi
 *                     timezone:
 *                       type: string
 *                       example: Asia/Ho_Chi_Minh
 *                     currency:
 *                       type: string
 *                       example: VND
 *                     dateFormat:
 *                       type: string
 *                       example: DD/MM/YYYY
 *                     supportEmail:
 *                       type: string
 *                       format: email
 *                       example: support@gra-estate.local
 *                     supportPhone:
 *                       type: string
 *                       example: +84 28 9999 8888
 *                     maintenanceMode:
 *                       type: boolean
 *                       description: Controls maintenance mode for the public landing page only. Does not block the UAA portal.
 *                       example: false
 *                     allowPublicRegistration:
 *                       type: boolean
 *                       description: Controls whether public users can register from the landing page.
 *                       example: true
 *                     enableListingReviews:
 *                       type: boolean
 *                       description: Controls whether listing and agent review features are visible on the landing page.
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-03-26T09:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-03-26T09:45:00.000Z
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/general", settingController.getGeneralSettings);

/**
 * @swagger
 * /settings/general:
 *   put:
 *     summary: Update general platform settings for landing page and UAA portal
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - systemName
 *               - adminPortalTitle
 *               - systemTagline
 *               - websiteUrl
 *               - brandColor
 *               - defaultLanguage
 *               - timezone
 *               - currency
 *               - dateFormat
 *               - supportEmail
 *               - supportPhone
 *               - maintenanceMode
 *               - allowPublicRegistration
 *               - enableListingReviews
 *             properties:
 *               systemName:
 *                 type: string
 *                 example: Gra Estate
 *               adminPortalTitle:
 *                 type: string
 *                 example: Gra Estate Admin
 *               systemTagline:
 *                 type: string
 *                 example: Operations center for listings, agents, reviews, and platform health.
 *               websiteUrl:
 *                 type: string
 *                 format: uri
 *                 example: http://localhost:3000
 *               brandColor:
 *                 type: string
 *                 pattern: ^#([0-9a-fA-F]{6})$
 *                 example: "#14532d"
 *               defaultLanguage:
 *                 type: string
 *                 enum: [en, vi]
 *                 example: vi
 *               timezone:
 *                 type: string
 *                 example: Asia/Ho_Chi_Minh
 *               currency:
 *                 type: string
 *                 example: VND
 *               dateFormat:
 *                 type: string
 *                 example: DD/MM/YYYY
 *               supportEmail:
 *                 type: string
 *                 format: email
 *                 example: support@gra-estate.local
 *               supportPhone:
 *                 type: string
 *                 example: +84 28 9999 8888
 *               maintenanceMode:
 *                 type: boolean
 *                 description: Enables maintenance mode for the public landing page only. The UAA portal remains accessible.
 *                 example: false
 *               allowPublicRegistration:
 *                 type: boolean
 *                 description: Enables or disables public registration on the landing page.
 *                 example: true
 *               enableListingReviews:
 *                 type: boolean
 *                 description: Enables or disables review surfaces on the landing page.
 *                 example: true
 *     responses:
 *       200:
 *         description: General settings updated successfully
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
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 67e3b1f25f5c5b77c1234567
 *                     key:
 *                       type: string
 *                       enum: [general]
 *                       example: general
 *                     systemName:
 *                       type: string
 *                       example: Gra Estate
 *                     adminPortalTitle:
 *                       type: string
 *                       example: Gra Estate Admin
 *                     systemTagline:
 *                       type: string
 *                       example: Operations center for listings, agents, reviews, and platform health.
 *                     websiteUrl:
 *                       type: string
 *                       format: uri
 *                       example: http://localhost:3000
 *                     brandColor:
 *                       type: string
 *                       example: "#14532d"
 *                     defaultLanguage:
 *                       type: string
 *                       enum: [en, vi]
 *                       example: vi
 *                     timezone:
 *                       type: string
 *                       example: Asia/Ho_Chi_Minh
 *                     currency:
 *                       type: string
 *                       example: VND
 *                     dateFormat:
 *                       type: string
 *                       example: DD/MM/YYYY
 *                     supportEmail:
 *                       type: string
 *                       format: email
 *                       example: support@gra-estate.local
 *                     supportPhone:
 *                       type: string
 *                       example: +84 28 9999 8888
 *                     maintenanceMode:
 *                       type: boolean
 *                       description: Controls maintenance mode for the public landing page only. Does not block the UAA portal.
 *                       example: false
 *                     allowPublicRegistration:
 *                       type: boolean
 *                       description: Controls whether public users can register from the landing page.
 *                       example: true
 *                     enableListingReviews:
 *                       type: boolean
 *                       description: Controls whether listing and agent review features are visible on the landing page.
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-03-26T09:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-03-26T09:45:00.000Z
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 code:
 *                   type: string
 *                   example: VALIDATION_ERROR
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.put(
  "/general",
  validateRequest((lang) => validateUpdateGeneralSettingsSchema(lang)),
  settingController.updateGeneralSettings,
);

export default router;
