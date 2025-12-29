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
        nameRegister,
        email,
        phoneNumber,

        identityFront,
        identityBack,
        identityInfo,

        certificateNumber,
        certificateImage,
        specialization,
        workingArea,
        taxCode,
        yearsOfExperience,
      } = req.body as {
        nameRegister: string;
        email: string;
        phoneNumber: string;

        identityFront: string;
        identityBack: string;
        identityInfo: {
          IDNumber: string;
          fullName: string;
          dateOfBirth: string;
          gender: string;
          nationality: string;
          placeOfBirth: string;
        };

        certificateNumber: string;
        certificateImage: string[];

        specialization: string[];
        workingArea: string[];

        taxCode: string;
        yearsOfExperience: string;

        agreeToTerms: boolean;
      };
      const agent = await this.agentService.getAgentByIdNumber(
        identityInfo.IDNumber,
      );
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
        basicInfo: {
          email,
          identityInfo,
          nameRegister,
          phoneNumber,
        },
        businessInfo: {
          certificateNumber,
          specialization,
          taxCode,
          workingArea,
          yearsOfExperience,
        },
        imageInfo: {
          certificateImage,
          identityBack,
          identityFront,
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
        status: {
          $in: [AgentStatusEnum.PENDING, AgentStatusEnum.REJECTED],
        },
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
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { id } = req.params;
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

  rejectAgentRegistration = (
    req: Request<{ id: string }, null, { reason: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { id } = req.params;
      const { reason } = req.body;
      const agentRegistration =
        await this.agentService.getAgentRegistrationById(id);
      if (
        !agentRegistration ||
        agentRegistration?.status != AgentStatusEnum.PENDING
      ) {
        throw new AppError(
          lang === "vi" ? "Error occur" : "Error occur",
          405,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      const agentRegistrationUpdated: Partial<IAgent> = {
        ...agentRegistration,
        status: AgentStatusEnum.REJECTED,
        reasonReject: reason,
      };
      console.log(agentRegistrationUpdated);

      const resp = await this.agentService.updateAgentRegistration(
        id,
        agentRegistrationUpdated,
      );
      this.emailService.sendRejectEmail(
        agentRegistrationUpdated.basicInfo?.email!,
        agentRegistrationUpdated.basicInfo?.nameRegister!,
        reason,
      );
      return resp;
    });
  };

  acceptAgentRegistration = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { id } = req.params as { id: string };
      return "";
    });
  };
}
