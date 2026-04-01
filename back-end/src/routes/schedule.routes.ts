import { ScheduleController } from "@/controllers/schedule.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { ScheduleService } from "@/services/schedule.service";
import { UserService } from "@/services/user.service";
import {
  validateAvailabilityQuerySchema,
  validateBodyScheduleSchema,
  validateRequestScheduleSchema,
} from "@/validators/schedule.validator";
import { PropertyService } from "@/services/property.service";
import { EmailQueue } from "@/queues/email.queue";
import { NotificationQueue } from "@/queues/notification.queue";
import { Router } from "express";
import { validateIdHeaderSchema } from "@/validators/base.validator";
import { ReviewService } from "@/services/review.service";

const router = Router();
const scheduleService = new ScheduleService();
const userService = new UserService();
const propertyService = new PropertyService();
const scheduleController = new ScheduleController(
  scheduleService,
  userService,
  propertyService,
  new EmailQueue(),
  new NotificationQueue(),
  new ReviewService(),
);

/**
 * @swagger
 * /schedules/availability:
 *   get:
 *     summary: Get public viewing slot availability for a listing on a specific date
 *     description: Returns the booked and available viewing slots for a property on the requested date.
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Availability retrieved successfully
 *       404:
 *         description: Property not found
 */
router.get(
  "/availability",
  validateRequest((lang) => validateAvailabilityQuerySchema(lang)),
  scheduleController.getPublicAvailability,
);

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Schedule booking, availability, and CRM timeline endpoints
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
 *     description: Creates a schedule entry for the authenticated agent with optional customer and property linkage.
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
 *                 enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED, EXPIRED]
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
 * /schedules/request:
 *   post:
 *     summary: Request a public property viewing schedule
 *     description: Creates a customer viewing request for a property after checking the selected time slot for conflicts.
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
 *               - listingId
 *               - customerName
 *               - customerPhone
 *               - customerEmail
 *               - date
 *               - startTime
 *             properties:
 *               listingId:
 *                 type: string
 *               customerName:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               customerEmail:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               customerNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Schedule request created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 *       409:
 *         description: Requested time slot conflicts with an existing booking
 */
router.post(
  "/request",
  validateRequest((lang) => validateRequestScheduleSchema(lang)),
  scheduleController.requestSchedule,
);

/**
 * @swagger
 * /schedules/me:
 *   get:
 *     summary: Get schedules for the current user
 *     description: Returns schedules that belong to or are assigned to the currently authenticated user within the requested time range.
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
 * /schedules/leads:
 *   get:
 *     summary: Get CRM schedule contacts for the current user
 *     description: Returns contact-oriented schedule data used by the agent CRM view for the current user.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CRM schedule contacts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Schedule"
 *       401:
 *         description: Unauthorized
 */
router.get("/leads", scheduleController.getLeads);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     description: Deletes a schedule entry if the authenticated user has access to it.
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
 *     description: Updates the details of a schedule entry if the authenticated user has access to it.
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
 *     description: Returns a single schedule entry by identifier if the authenticated user has access to it.
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
