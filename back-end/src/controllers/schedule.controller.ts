import { IScheduleDTO } from "./../dto/schedule.dto";
import { ENV } from "@/config/env";
import { EmailQueue } from "@/queues/email.queue";
import { NotificationQueue } from "@/queues/notification.queue";
import { SCHEDULE_STATUS } from "@/models/schedule.model";
import { PropertyService } from "@/services/property.service";
import { ReviewService } from "@/services/review.service";
import { ScheduleService } from "@/services/schedule.service";
import { UserService } from "@/services/user.service";
import { AppError } from "@/utils/appError";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";

export class ScheduleController extends BaseController {
  private static readonly DEFAULT_VIEWING_DURATION_MINUTES = 60;
  private scheduleService: ScheduleService;
  private userService: UserService;
  private propertyService: PropertyService;
  private emailQueue: EmailQueue;
  private notificationQueue: NotificationQueue;
  private reviewService: ReviewService;

  constructor(
    scheduleService: ScheduleService,
    userService: UserService,
    propertyService: PropertyService,
    emailQueue: EmailQueue,
    notificationQueue: NotificationQueue,
    reviewService: ReviewService,
  ) {
    super();
    this.scheduleService = scheduleService;
    this.userService = userService;
    this.propertyService = propertyService;
    this.emailQueue = emailQueue;
    this.notificationQueue = notificationQueue;
    this.reviewService = reviewService;
  }

  private isAgent(currentUser?: Request["user"]) {
    return currentUser?.roleId?.code === "AGENT";
  }

  private hasScheduleAccess(schedule: any, currentUser?: Request["user"]) {
    if (!schedule || !currentUser?.userId?._id) {
      return false;
    }

    const currentUserId = String(currentUser.userId._id);
    const agentId = String(schedule.agentId?._id || schedule.agentId || "");
    const customerId = String(schedule.userId?._id || schedule.userId || "");

    return currentUserId === agentId || currentUserId === customerId;
  }

  private assertScheduleAccess(schedule: any, currentUser?: Request["user"]) {
    if (!this.hasScheduleAccess(schedule, currentUser)) {
      throw new AppError("Forbidden - You do not have access to this schedule", 403);
    }
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

      const computedEndTime = this.scheduleService.addMinutesToTime(
        startTime,
        ScheduleController.DEFAULT_VIEWING_DURATION_MINUTES,
      );

      await this.scheduleService.createSchedule({
        agentId: (property as any).userId?._id || (property as any).userId,
        userId: currentUser?.userId?._id as any,
        listingId: (property as any)?._id,
        customerName,
        customerPhone,
        customerEmail,
        title: "Yeu cau dat lich xem nha",
        date,
        startTime,
        endTime: computedEndTime,
        location:
          (property as any).location?.address || "Lien he de biet them chi tiet",
        type: "VIEWING" as any,
        status: "PENDING" as any,
        customerNote,
        agentNote: "",
        color: "#10b981",
      });

      const agentId = String(
        (property as any).userId?._id || (property as any).userId,
      );
      this.notificationQueue.enqueueNotification({
        userId: agentId,
        title: "Yeu cau dat lich moi",
        content: `${customerName} muon dat lich xem nha tai ${(property as any).title || (property as any).location?.address || "bat dong san"}`,
        type: "SCHEDULE",
        socketEvent: "schedule:new_request",
        metadata: {
          customerName,
          customerPhone,
          customerEmail,
          date,
          startTime,
          endTime: computedEndTime,
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
        agentId: this.isAgent(currentUser)
          ? (currentUser?.userId._id as any)
          : undefined,
        userId: this.isAgent(currentUser)
          ? undefined
          : (currentUser?.userId._id as any),
        start: new Date(start as string),
        end: new Date(end as string),
      });

      return schedules;
    });
  };

  getLeads = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const leads = await this.scheduleService.getLeads(
        currentUser?.userId._id as any,
      );
      return leads;
    });
  };

  deleteSchedule = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const { id } = req.params;
      const schedule = await this.scheduleService.getScheduleById(id);

      if (!schedule) {
        throw new AppError("Schedule not found", 404);
      }

      this.assertScheduleAccess(schedule, currentUser);

      await this.scheduleService.deleteSchedule(id);
      return "Schedule deleted successfully";
    });
  };

  updateSchedule = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
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

      this.assertScheduleAccess(schedule, currentUser);

      const isAgentActor = this.isAgent(currentUser);
      const isCustomerActor =
        !isAgentActor &&
        String((schedule.userId as any)?._id || schedule.userId || "") ===
          String(currentUser?.userId._id || "");

      if (
        isCustomerActor &&
        [SCHEDULE_STATUS.COMPLETED, SCHEDULE_STATUS.EXPIRED].includes(
          schedule.status as SCHEDULE_STATUS,
        )
      ) {
        throw new AppError("This schedule can no longer be updated", 400);
      }

      const currentDateValue = new Date(schedule.date);
      const nextDateValue = date ? new Date(date) : currentDateValue;
      const nextStartTime = startTime || schedule.startTime;
      const nextEndTime = endTime || schedule.endTime;
      const nextCustomerNote = customerNote ?? schedule.customerNote ?? "";
      const hasCustomerChange =
        nextDateValue.getTime() !== currentDateValue.getTime() ||
        nextStartTime !== schedule.startTime ||
        nextEndTime !== schedule.endTime ||
        nextCustomerNote !== (schedule.customerNote || "");

      let nextStatus = (status || schedule.status) as SCHEDULE_STATUS;

      if (isCustomerActor) {
        const isAllowedCustomerStatus =
          nextStatus === SCHEDULE_STATUS.PENDING ||
          nextStatus === SCHEDULE_STATUS.CANCELLED ||
          nextStatus === schedule.status;

        if (!isAllowedCustomerStatus) {
          throw new AppError(
            "Customers can only request a new time or cancel their appointment",
            403,
          );
        }

        if (nextStatus !== SCHEDULE_STATUS.CANCELLED) {
          nextStatus = hasCustomerChange
            ? SCHEDULE_STATUS.PENDING
            : (schedule.status as SCHEDULE_STATUS);
        }
      }

      const payload = {
        title: title || schedule.title,
        date: nextDateValue,
        startTime: nextStartTime,
        endTime: nextEndTime,
        location: location || schedule.location,
        type: type || schedule.type,
        status: nextStatus,
        customerNote: nextCustomerNote,
        agentNote: isCustomerActor
          ? schedule.agentNote || ""
          : (agentNote ?? schedule.agentNote ?? ""),
        color: color || schedule.color,
      };

      await this.scheduleService.updateSchedule(id, payload);

      if (isCustomerActor) {
        const agentId = String((schedule.agentId as any)?._id || schedule.agentId);

        if (
          nextStatus === SCHEDULE_STATUS.CANCELLED &&
          schedule.status !== SCHEDULE_STATUS.CANCELLED
        ) {
          this.notificationQueue.enqueueNotification({
            userId: agentId,
            title: "Khach hang da huy lich hen",
            content: `${schedule.customerName} da huy lich hen tai ${schedule.location}.`,
            type: "SCHEDULE",
            socketEvent: "schedule:status_update",
            metadata: {
              scheduleId: id,
              status: SCHEDULE_STATUS.CANCELLED,
            },
          });
        }

        if (hasCustomerChange) {
          this.notificationQueue.enqueueNotification({
            userId: agentId,
            title: "Khach hang yeu cau doi lich hen",
            content: `${schedule.customerName} muon doi lich hen sang ${nextStartTime} ngay ${nextDateValue.toLocaleDateString("vi-VN")}.`,
            type: "SCHEDULE",
            socketEvent: "schedule:new_request",
            metadata: {
              scheduleId: id,
              status: nextStatus,
              date: nextDateValue,
              startTime: nextStartTime,
              endTime: nextEndTime,
              customerNote: nextCustomerNote,
            },
          });
        }
      }

      if (
        nextStatus === SCHEDULE_STATUS.CONFIRMED &&
        schedule.status !== SCHEDULE_STATUS.CONFIRMED
      ) {
        const appointmentDate = nextDateValue.toLocaleDateString("vi-VN");
        const appointmentTime = `${nextStartTime} - ${nextEndTime}`;

        this.emailQueue.enqueueAppointmentConfirmedEmail({
          to: schedule.customerEmail,
          customerName: schedule.customerName,
          appointmentDate,
          appointmentTime,
          location: payload.location || schedule.location,
        });
      }

      if (
        schedule.userId &&
        !isCustomerActor &&
        (nextStatus === SCHEDULE_STATUS.CONFIRMED ||
          nextStatus === SCHEDULE_STATUS.CANCELLED) &&
        schedule.status !== nextStatus
      ) {
        const statusLabel =
          nextStatus === SCHEDULE_STATUS.CONFIRMED ? "chap nhan" : "tu choi";

        this.notificationQueue.enqueueNotification({
          userId: String(schedule.userId),
          title: `Lich hen da duoc ${statusLabel}`,
          content:
            nextStatus === SCHEDULE_STATUS.CONFIRMED
              ? `Yeu cau xem nha tai ${payload.location || schedule.location} da duoc moi gioi chap nhan. Kiem tra email de biet chi tiet.`
              : `Yeu cau xem nha tai ${payload.location || schedule.location} da bi tu choi.`,
          type: "SCHEDULE",
          socketEvent: "schedule:status_update",
          metadata: {
            scheduleId: id,
            status: nextStatus,
            date: nextDateValue,
            startTime: nextStartTime,
            endTime: nextEndTime,
            location: payload.location || schedule.location,
          },
        });
      }

      if (
        nextStatus === SCHEDULE_STATUS.COMPLETED &&
        schedule.status !== SCHEDULE_STATUS.COMPLETED
      ) {
        const agent = await this.userService.getUserById(String(schedule.agentId));
        const propertyName =
          ((schedule.listingId as any)?.title as string) ||
          payload.title ||
          schedule.location ||
          "bat dong san";
        const invitation = await this.reviewService.createOrRefreshInvitation({
          scheduleId: id,
          listingId:
            ((schedule.listingId as any)?._id as string | undefined) ||
            (typeof schedule.listingId === "string"
              ? schedule.listingId
              : undefined),
          agentUserId: String(schedule.agentId),
          customerUserId: schedule.userId ? String(schedule.userId) : undefined,
          customerName: schedule.customerName,
          customerEmail: schedule.customerEmail,
          agentName: agent?.fullName || "Nguyen Van A",
          propertyName,
        });

        if (invitation) {
          const actionUrl = `${ENV.FRONTEND_URLLANDINGPAGE}/review-invitation/${invitation.token}`;
          const notificationTitle = "Moi ban danh gia trai nghiem xem nha";
          const notificationContent = `Havenly hy vong ban da co trai nghiem xem nha tuyet voi! Hay danh 1 phut danh gia su ho tro cua moi gioi ${agent?.fullName || "Nguyen Van A"} nhe.`;

          this.emailQueue.enqueueReviewInvitationEmail({
            to: schedule.customerEmail,
            customerName: schedule.customerName,
            agentName: agent?.fullName || "Nguyen Van A",
            propertyName,
            reviewUrl: actionUrl,
          });

          if (schedule.userId) {
            this.notificationQueue.enqueueNotification({
              userId: String(schedule.userId),
              title: notificationTitle,
              content: notificationContent,
              type: "SCHEDULE",
              metadata: {
                scheduleId: id,
                status: "COMPLETED",
                actionUrl,
                propertyName,
                agentName: agent?.fullName || "Nguyen Van A",
              },
            });
          }
        }
      }

      return "Schedule updated successfully";
    });
  };

  getScheduleById = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const { id } = req.params;
      const schedule = await this.scheduleService.getScheduleById(id);

      if (!schedule) {
        throw new AppError("Schedule not found", 404);
      }

      this.assertScheduleAccess(schedule, currentUser);

      return schedule;
    });
  };
}
