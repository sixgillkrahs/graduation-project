import { ScheduleController } from "@/controllers/schedule.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { ScheduleService } from "@/services/schedule.service";
import { UserService } from "@/services/user.service";
import { validateBodyScheduleSchema } from "@/validators/schedule.validator";
import { PropertyService } from "@/services/property.service";
import { Router } from "express";
import { validateIdHeaderSchema } from "@/validators/base.validator";

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
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         agentId:
 *           type: string
 *         userId:
 *           type: string
 *         listingId:
 *           type: string
 *         customerName:
 *           type: string
 *         customerPhone:
 *           type: string
 *         customerEmail:
 *           type: string
 *         title:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         type:
 *           type: string
 *         status:
 *           type: string
 *     SchedulePagination:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Schedule"
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *             limit:
 *               type: number
 *             total:
 *               type: number
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
 *               title:
 *                 type: string
 *                 example: "Xem nhà"
 *               date:
 *                 type: string
 *                 example: "2026-02-05"
 *               customerEmail:
 *                 type: string
 *                 example: "a@gmail.com"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "10:00"
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

/**
 * @swagger
 * /schedules/me:
 *   get:
 *     summary: Get schedules for the current user
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Schedules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/SchedulePagination"
 *       401:
 *         description: Unauthorized
 */
router.get("/me", scheduleController.getSchedulesMe);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
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
 *                   example: Delete schedule successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", scheduleController.deleteSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: Update a schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Schedule"
 *     responses:
 *       200:
 *         description: Schedule updated successfully
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
 *                   example: Update schedule successfully
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/:id",
  validateRequest((lang) => validateIdHeaderSchema(lang)),
  validateRequest((lang) => validateBodyScheduleSchema(lang)),
  scheduleController.updateSchedule,
);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Get a schedule by id
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Schedule"
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  validateRequest((lang) => validateIdHeaderSchema(lang)),
  scheduleController.getScheduleById,
);

export default router;
