import { ScheduleController } from "@/controllers/schedule.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { ScheduleService } from "@/services/schedule.service";
import { UserService } from "@/services/user.service";
import { validateBodyScheduleSchema } from "@/validators/schedule.validator";
import { PropertyService } from "@/services/property.service";
import { Router } from "express";

const router = Router();
const scheduleService = new ScheduleService();
const userService = new UserService();
const propertyService = new PropertyService();
const scheduleController = new ScheduleController(
  scheduleService,
  userService,
  propertyService,
);

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: System monitoring and health check endpoints
 */

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - listingId
 *               - customerName
 *               - customerPhone
 *               - customerEmail
 *               - startTime
 *               - endTime
 *               - location
 *               - type
 *               - status
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "65f1a2c8b8a1e0a123456788"
 *               listingId:
 *                 type: string
 *                 example: "65f1a2c8b8a1e0a123456777"
 *               customerName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               customerPhone:
 *                 type: string
 *                 example: "0987654321"
 *               customerEmail:
 *                 type: string
 *                 example: "a@gmail.com"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-05T09:00:00.000Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-05T10:00:00.000Z"
 *               location:
 *                 type: string
 *                 example: "Tòa nhà A - Quận 1"
 *               type:
 *                 type: string
 *                 enum: [VIEWING, MEETING, CALL]
 *                 example: VIEWING
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *                 example: PENDING
 *               customerNote:
 *                 type: string
 *                 example: "Khách muốn xem buổi sáng"
 *               agentNote:
 *                 type: string
 *                 example: "Chuẩn bị hợp đồng"
 *     responses:
 *       200:
 *         description: Schedule created successfully
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
 *                   example: Create schedule successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     agentId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     listingId:
 *                       type: string
 *                     customerName:
 *                       type: string
 *                     customerPhone:
 *                       type: string
 *                     customerEmail:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                     location:
 *                       type: string
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  validateRequest((lang) => validateBodyScheduleSchema(lang)),
  scheduleController.createSchedule,
);

export default router;
