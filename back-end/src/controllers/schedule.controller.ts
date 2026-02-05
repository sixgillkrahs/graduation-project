import { IScheduleDTO } from "./../dto/schedule.dto";
import { ScheduleService } from "@/services/schedule.service";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { UserService } from "@/services/user.service";
import { AppError } from "@/utils/appError";
import { PropertyService } from "@/services/property.service";

export class ScheduleController extends BaseController {
  private scheduleService: ScheduleService;
  private userService: UserService;
  private propertyService: PropertyService;

  constructor(
    scheduleService: ScheduleService,
    userService: UserService,
    propertyService: PropertyService,
  ) {
    super();
    this.scheduleService = scheduleService;
    this.userService = userService;
    this.propertyService = propertyService;
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
        startTime,
        endTime,
        location,
        type,
        status,
        customerNote,
        agentNote,
        title,
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
        startTime,
        endTime,
        location,
        type,
        status,
        customerNote,
        agentNote,
      });

      return "Schedule created successfully";
    });
  };
}
