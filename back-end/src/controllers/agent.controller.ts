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
          email,
        },
        registrationLink: "",
        status: AgentStatusEnum.PENDING,
      };
      const createdAgent =
        await this.agentService.createAgentRegistration(agentData);
      return createdAgent;
    });
  };

  agentRegistrations = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { limit, page, sortField, sortOrder } = req.query as {
        limit?: string;
        page?: string;
        sortField?: string;
        sortOrder?: string;
      };
      let filter: Record<string, any> = {
        status: AgentStatusEnum.PENDING,
      };
      const agentRegistrations = await this.agentService.getAgentRegistrations(
        {
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 10,
          sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
        },
        filter,
      );
      return agentRegistrations;
    });
  };

  agentRegistrationDetail = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { id } = req.params as { id: string };
      const agentRegistration =
        await this.agentService.getAgentRegistrationById(id);
      if (!agentRegistration) {
        throw new AppError(
          lang === "vi"
            ? "Yêu cầu không tồn tại"
            : "Agent registration not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }
      return agentRegistration;
    });
  };
}
