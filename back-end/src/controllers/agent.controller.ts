import { AgentService } from "@/services/agent.service";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { UserService } from "@/services/user.service";
import { EmailService } from "@/services/email.service";
import { AgentStatusEnum, IAgent } from "@/models/agent.model";
import { AppError } from "@/utils/appError";
import { ApiRequest } from "@/utils/apiRequest";
import { ErrorCode } from "@/utils/errorCodes";

export class AgentController extends BaseController {
  constructor(
    private agentService: AgentService,
    private userService: UserService,
    private emailService: EmailService,
  ) {
    super();
  }

  application = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const {
        fullName,
        email,
        phoneNumber,
        agentName,
        area,
        IDNumber,
        dateOfBirth,
        gender,
        address,
        nationality,
      } = req.body as {
        fullName: string;
        email: string;
        phoneNumber: string;
        agentName: string;
        area: string[];
        IDNumber: string;
        dateOfBirth: string;
        gender: string;
        address: string;
        nationality: string;
      };
      const agent = await this.agentService.getAgentByIdNumber(IDNumber);
      if (agent) {
        throw new AppError(
          lang === "vi" ? "Số CMND đã tồn tại" : "IDNumber already exists",
          401,
          ErrorCode.INVALID_INPUT,
        );
      }
      const user = await this.userService.getUserByEmail(email);
      if (user) {
        throw new AppError(
          lang === "vi" ? "Email đã tồn tại" : "Email already exists",
          401,
          ErrorCode.EMAIL_EXISTS,
        );
      }
      const agentData: IAgent = {
        identityInfo: {
          agentName,
          IDNumber,
          dateOfBirth,
          gender,
          address,
          nationality,
        },
        businessInfo: {
          phoneNumber,
          area,
        },
        registrationLink: "",
        status: AgentStatusEnum.PENDING,
      };
      const createdAgent =
        await this.agentService.createAgentRegistration(agentData);
      return createdAgent;
    });
  };
}
