import { UserService } from "@/services/user.service";
import { BaseController } from "./base.controller";
import { NextFunction, Request, Response } from "express";
import { AgentService } from "@/services/agent.service";
import { AppError } from "@/utils/appError";
import { validationMessages } from "@/i18n/validationMessages";
import { ErrorCode } from "@/utils/errorCodes";
import { ApiRequest } from "@/utils/apiRequest";

export class UserController extends BaseController {
  constructor(
    private userService: UserService,
    private agentService: AgentService,
  ) {
    super();
  }

  createUser = (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {
      throw error;
    }
  };

  profile = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { userId, roleId } = req.user;
      if (roleId.code === "AGENT") {
        const profile = await this.agentService.getAgentByUserId(userId._id);
        if (!profile) {
          throw new AppError(
            validationMessages[lang].userNotFound || "User not found",
            401,
            ErrorCode.USER_NOT_FOUND,
          );
        }
        const {
          reasonReject,
          registrationLink,
          expirationDate,
          __v,
          note,
          ...rest
        } = profile;
        return rest;
      }
      return true;
    });
  };
}
