import { IScheduleDTO } from "./../dto/schedule.dto";
import { ScheduleService } from "@/services/schedule.service";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { UserService } from "@/services/user.service";
import { AppError } from "@/utils/appError";
import { PropertyService } from "@/services/property.service";
import { EmailQueue } from "@/queues/email.queue";
import { NotificationQueue } from "@/queues/notification.queue";

export class ScheduleController extends BaseController {
  private scheduleService: ScheduleService;
  private userService: UserService;
  private propertyService: PropertyService;
  private emailQueue: EmailQueue;
  private notificationQueue: NotificationQueue;

  constructor(
    scheduleService: ScheduleService,
    userService: UserService,
    propertyService: PropertyService,
    emailQueue: EmailQueue,
    notificationQueue: NotificationQueue,
  ) {
    super();
    this.scheduleService = scheduleService;
    this.userService = userService;
    this.propertyService = propertyService;
    this.emailQueue = emailQueue;
    this.notificationQueue = notificationQueue;
  }

  createSchedule = (
    req: Request<{}, {}, IScheduleDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const {
        userId,
        listingId,
        customerName,
        customerPhone,
        customerEmail,
        date,
        startTime,
        endTime,
        location,
        type,
        status,
        customerNote,
        agentNote,
        title,
        color,
      } = req.body;
      let user = null;
      let property = null;
      if (userId) {
        user = await this.userService.getUserById(userId);
        if (!user) {
          throw new AppError("User not found", 404);
        }
      }

      if (listingId) {
        property = await this.propertyService.getPropertyById(listingId);
        if (!property) {
          throw new AppError("Property not found", 404);
        }
      }

      await this.scheduleService.createSchedule({
        agentId: currentUser?.userId._id as any,
        userId: user?._id as any,
        listingId: (property as any)?._id,
        customerName,
        customerPhone,
        customerEmail,
        title,
        date,
        startTime,
        endTime,
        location,
        type,
        status,
        customerNote,
        agentNote,
        color,
      });

      return "Schedule created successfully";
    });
  };

  requestSchedule = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const {
        listingId,
        customerName,
        customerPhone,
        customerEmail,
        date,
        startTime,
        customerNote,
      } = req.body;

      const property = await this.propertyService.getPropertyById(listingId);
      if (!property) {
        throw new AppError("Property not found", 404);
      }

      await this.scheduleService.createSchedule({
        agentId: (property as any).userId?._id || (property as any).userId,
        userId: currentUser?.userId?._id as any,
        listingId: (property as any)?._id,
        customerName,
        customerPhone,
        customerEmail,
        title: "Yêu cầu đặt lịch xem nhà",
        date,
        startTime,
        endTime: startTime, // Default to same as start
        location:
          (property as any).location?.address ||
          "Liên hệ để biết thêm chi tiết",
        type: "VIEWING" as any,
        status: "PENDING" as any,
        customerNote,
        agentNote: "",
        color: "#10b981",
      });

      // Notify the agent about the new booking request
      const agentId = String(
        (property as any).userId?._id || (property as any).userId,
      );
      this.notificationQueue.enqueueNotification({
        userId: agentId,
        title: "Yêu cầu đặt lịch mới",
        content: `${customerName} muốn đặt lịch xem nhà tại ${(property as any).title || (property as any).location?.address || "bất động sản"}`,
        type: "SCHEDULE",
        socketEvent: "schedule:new_request",
        metadata: {
          customerName,
          customerPhone,
          customerEmail,
          date,
          startTime,
          customerNote,
          listingId,
          propertyTitle: (property as any).title,
        },
      });

      return "Booking requested successfully";
    });
  };

  getSchedulesMe = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const { start, end } = req.query;

      if (!start || !end) {
        throw new AppError("Please provide start and end date", 400);
      }

      const schedules = await this.scheduleService.getSchedules({
        agentId: currentUser?.userId._id as any,
        start: new Date(start as string),
        end: new Date(end as string),
      });

      return schedules;
    });
  };

  deleteSchedule = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      await this.scheduleService.deleteSchedule(id);
      return "Schedule deleted successfully";
    });
  };

  updateSchedule = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const {
        title,
        date,
        startTime,
        endTime,
        location,
        type,
        status,
        customerNote,
        agentNote,
        color,
      } = req.body;

      const schedule = await this.scheduleService.getScheduleById(id);
      if (!schedule) {
        throw new AppError("Schedule not found", 404);
      }

      await this.scheduleService.updateSchedule(id, {
        title,
        date,
        startTime,
        endTime,
        location,
        type,
        status,
        customerNote,
        agentNote,
        color,
      });

      // Enqueue email job if status changes to CONFIRMED
      if (status === "CONFIRMED" && schedule.status !== "CONFIRMED") {
        const appointmentDate =
          date instanceof Date
            ? date.toLocaleDateString("vi-VN")
            : new Date(date).toLocaleDateString("vi-VN");
        const appointmentTime = `${startTime} - ${endTime}`;

        this.emailQueue.enqueueAppointmentConfirmedEmail({
          to: schedule.customerEmail,
          customerName: schedule.customerName,
          appointmentDate,
          appointmentTime,
          location: location || schedule.location,
        });
      }

      // Notify the customer about status change
      if (
        schedule.userId &&
        (status === "CONFIRMED" || status === "CANCELLED") &&
        schedule.status !== status
      ) {
        const statusLabel = status === "CONFIRMED" ? "chấp nhận" : "từ chối";
        this.notificationQueue.enqueueNotification({
          userId: String(schedule.userId),
          title: `Lịch hẹn đã được ${statusLabel}`,
          content:
            status === "CONFIRMED"
              ? `Yêu cầu xem nhà tại ${location || schedule.location} đã được môi giới chấp nhận. Kiểm tra email để biết chi tiết.`
              : `Yêu cầu xem nhà tại ${location || schedule.location} đã bị từ chối.`,
          type: "SCHEDULE",
          socketEvent: "schedule:status_update",
          metadata: {
            scheduleId: id,
            status,
            date,
            startTime,
            endTime,
            location: location || schedule.location,
          },
        });
      }

      return "Schedule updated successfully";
    });
  };

  getScheduleById = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const schedule = await this.scheduleService.getScheduleById(id);
      return schedule;
    });
  };
}
