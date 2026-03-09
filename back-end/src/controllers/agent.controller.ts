import { AgentService } from "@/services/agent.service";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { UserService } from "@/services/user.service";
import { EmailService } from "@/services/email.service";
import { AgentStatusEnum, IAgent } from "@/models/agent.model";
import { AppError } from "@/utils/appError";
import { ApiRequest } from "@/utils/apiRequest";
import { ErrorCode } from "@/utils/errorCodes";
import { AuthService } from "@/services/auth.service";
import { RoleService } from "@/services/role.service";
import { ENV } from "@/config/env";
import bcrypt from "bcrypt";
import { EmailQueue } from "@/queues/email.queue";
import { IAuth } from "@/models/auth.model";
import { PropertyService } from "@/services/property.service";
import {
  CurrencyEnum,
  PropertyStatusEnum,
} from "@/models/property.model";
import { PropertySaleService } from "@/services/property-sale.service";
import { AgentLeaderboardService } from "@/services/agent-leaderboard.service";

export class AgentController extends BaseController {
  constructor(
    private agentService: AgentService,
    private userService: UserService,
    private emailService: EmailService,
    private authService: AuthService,
    private roleService: RoleService,
    private emailQueue: EmailQueue,
    private propertyService: PropertyService,
    private propertySaleService: PropertySaleService,
    private agentLeaderboardService: AgentLeaderboardService,
  ) {
    super();
  }

  application = (
    req: Request<
      {},
      {},
      {
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
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = req.lang;
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
      } = req.body;
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

  getAgentRegistrations = (
    req: Request<
      {},
      {},
      {},
      {
        limit?: string;
        page?: string;
        sortField?: string;
        sortOrder?: string;
        status?: AgentStatusEnum;
        nameRegister?: string;
        email?: string;
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = req.lang;
      const { limit, page, sortField, sortOrder, status, nameRegister, email } =
        req.query;
      let filter: Record<string, any> = {
        // status: status
      };
      if (status) {
        filter.status = status;
      }
      if (nameRegister) {
        filter["basicInfo.nameRegister"] = {
          $regex: nameRegister,
          $options: "i",
        };
      }
      if (email) {
        filter["basicInfo.email"] = {
          $regex: email,
          $options: "i",
        };
      }
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
      const lang = req.lang;
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
      const lang = req.lang;
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

  approveAgentRegistration = (
    req: Request<{ id: string }, {}, { note?: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = req.lang;
      const { id } = req.params;
      const { note } = req.body;
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
      let role = await this.roleService.getRoleByCode("AGENT");
      if (role == null) {
        throw new AppError(
          lang === "vi" ? "Error occur" : "Error occur",
          401,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      const user = await this.userService.createUser({
        email: agentRegistration.basicInfo?.email!,
        fullName: agentRegistration.basicInfo?.nameRegister!,
        phone: agentRegistration.basicInfo?.phoneNumber,
        prefixPhone: "+84",
        isActive: false,
        isDeleted: false,
        avatarUrl:
          "https://res.cloudinary.com/dr1akv5p4/image/upload/v1769763068/default-avatar_rolye6.jpg",
      });
      await this.authService.createAuth({
        userId: user.id,
        password: ENV.PASS_INIT || "no-password",
        username: agentRegistration.basicInfo?.email!,
        roleId: role.id,
      });
      const verifyToken = this.authService.generateAccessToken(
        {
          userId: user.id,
          email: agentRegistration.basicInfo?.email!,
          fullName: agentRegistration.basicInfo?.nameRegister!,
        },
        1000 * 60 * 15,
        ENV.JWT_SECRET_LANDING_PAGE,
      );
      const updated = await this.agentService.updateAgentRegistration(id, {
        userId: user.id,
        status: AgentStatusEnum.APPROVED,
        note: note,
        registrationLink: `${ENV.FRONTEND_URLLANDINGPAGE}/verify-email/${verifyToken}`,
        expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      });
      if (!updated) {
        throw new AppError(
          "Already processed",
          409,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      await this.emailQueue.enqueueVerifyEmail({
        email: agentRegistration.basicInfo?.email!,
        name: agentRegistration.basicInfo?.nameRegister,
        token: verifyToken,
      });
      return true;
    });
  };

  verifyTokenRegistration = (
    req: Request<{ token: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = req.lang;
      const { token } = req.params;
      if (!token) {
        throw new AppError(
          lang === "vi" ? "Token is required" : "Token is required",
          400,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      const decoded = this.authService.validateToken(
        token,
        ENV.JWT_SECRET_LANDING_PAGE,
      ) as {
        userId: string;
        email: string;
        fullName: string;
      };
      if (!decoded) {
        throw new AppError(
          lang === "vi" ? "Invalid token" : "Invalid token",
          400,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      const agentRegistration = await this.agentService.getAgentByUserId(
        decoded.userId,
      );
      if (
        !agentRegistration ||
        agentRegistration?.status != AgentStatusEnum.APPROVED
      ) {
        throw new AppError(
          lang === "vi" ? "Error occur" : "Error occur",
          405,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      if (
        agentRegistration.expirationDate &&
        agentRegistration.expirationDate < new Date()
      ) {
        throw new AppError(
          lang === "vi" ? "Error occur" : "Error occur",
          405,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      const { email, fullName, userId } = decoded;
      return { email, fullName, userId };
    });
  };

  getAgents = (
    req: Request<
      {},
      {},
      {},
      {
        limit?: string;
        page?: string;
        sortField?: string;
        sortOrder?: string;
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = req.lang;
      const { limit, page, sortField, sortOrder } = req.query;
      let filter: Record<string, any> = {
        status: {
          $in: [AgentStatusEnum.APPROVED],
        },
      };
      const agentRegistrations = await this.agentService.getAgentRegistrations(
        {
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 10,
          sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
        },
        filter,
        "id basicInfo businessInfo",
      );
      return agentRegistrations;
    });
  };

  getPublicProfile = (
    req: Request<{ agentId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { agentId } = req.params;
      const lang = req.lang;

      const [agentProfile, userProfile] = await Promise.all([
        this.agentService.getAgentByUserId(agentId),
        this.userService.getUserById(agentId),
      ]);

      if (
        !agentProfile ||
        agentProfile.status !== AgentStatusEnum.APPROVED ||
        !userProfile ||
        userProfile.isDeleted ||
        !userProfile.isActive
      ) {
        throw new AppError(
          lang === "vi" ? "Môi giới không tồn tại" : "Agent not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      const [
        activeSaleListingsCount,
        totalPublishedListingsCount,
        soldPropertiesCount,
        totalViews,
        vndLeaderboardSnapshot,
        usdLeaderboardSnapshot,
      ] = await Promise.all([
        this.propertyService.count({
          userId: agentId,
          demandType: "SALE",
          status: PropertyStatusEnum.PUBLISHED,
        }),
        this.propertyService.count({
          userId: agentId,
          status: PropertyStatusEnum.PUBLISHED,
        }),
        this.propertyService.count({
          userId: agentId,
          status: PropertyStatusEnum.SOLD,
        }),
        this.propertyService.getTotalViews(agentId),
        this.agentLeaderboardService.getAgentMonthlyRank(agentId, {
          currency: CurrencyEnum.VND,
        }),
        this.agentLeaderboardService.getAgentMonthlyRank(agentId, {
          currency: CurrencyEnum.USD,
        }),
      ]);
      const leaderboardSnapshot = [vndLeaderboardSnapshot, usdLeaderboardSnapshot]
        .filter(Boolean)
        .sort((left, right) => {
          if ((left?.rank || Infinity) !== (right?.rank || Infinity)) {
            return (left?.rank || Infinity) - (right?.rank || Infinity);
          }

          return (right?.revenue || 0) - (left?.revenue || 0);
        })[0];

      const now = new Date();
      const isPro =
        agentProfile.planInfo?.plan === "PRO" &&
        (!agentProfile.planInfo.endDate ||
          new Date(agentProfile.planInfo.endDate) > now);
      const rawPhone =
        userProfile.phone || agentProfile.basicInfo.phoneNumber || "";
      const phone =
        userProfile.prefixPhone &&
        rawPhone &&
        !rawPhone.startsWith(userProfile.prefixPhone)
          ? `${userProfile.prefixPhone} ${rawPhone}`
          : rawPhone;

      return {
        userId: userProfile._id,
        fullName: userProfile.fullName || agentProfile.basicInfo.nameRegister,
        avatarUrl: userProfile.avatarUrl || "",
        email: userProfile.email,
        phone,
        role: "Professional Real Estate Agent",
        location:
          userProfile.address || agentProfile.businessInfo.workingArea?.[0] || "",
        rating: agentProfile.rating ?? 0,
        description: agentProfile.description || "",
        yearsOfExperience: agentProfile.businessInfo.yearsOfExperience,
        specialties: agentProfile.businessInfo.specialization || [],
        workingAreas: agentProfile.businessInfo.workingArea || [],
        verified: true,
        plan: agentProfile.planInfo?.plan || "BASIC",
        isPro,
        stats: {
          activeSaleListingsCount,
          totalPublishedListingsCount,
          soldPropertiesCount,
          totalViews,
        },
        leaderboard: leaderboardSnapshot
          ? {
              month: leaderboardSnapshot.month,
              year: leaderboardSnapshot.year,
              currency: leaderboardSnapshot.currency,
              rank: leaderboardSnapshot.rank,
              revenue: leaderboardSnapshot.revenue,
              deals: leaderboardSnapshot.deals,
              latestSoldAt: leaderboardSnapshot.latestSoldAt,
            }
          : null,
      };
    });
  };

  createPasswordAgent = (
    req: Request<
      { token: string },
      {},
      {
        password: string;
        confirmPassword: string;
        email: string;
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = req.lang;
      const { token } = req.params;
      const { password, email } = req.body;

      const agentRegistration = await this.agentService.getAgentByEmail(email);
      if (
        !agentRegistration ||
        agentRegistration?.status != AgentStatusEnum.APPROVED
      ) {
        throw new AppError(
          lang === "vi" ? "Error occur" : "Error occur",
          400,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      if (
        agentRegistration.expirationDate &&
        agentRegistration.expirationDate < new Date()
      ) {
        throw new AppError(
          lang === "vi" ? "Hết hạn đăng ký" : "Agent registration expired",
          400,
          ErrorCode.TOKEN_EXPIRED,
        );
      }
      const auth = await this.authService.getAuthByUserId<
        IAuth & { _id: string }
      >(agentRegistration.userId!.toString());
      if (!auth) {
        throw new AppError(
          lang === "vi" ? "Error occur" : "Error occur",
          400,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      if (auth.password != ENV.PASS_INIT || auth.password != "no-password") {
        throw new AppError(
          lang === "vi" ? "Password already set" : "Password already set",
          400,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      await this.userService.updateUser(agentRegistration.userId!.toString(), {
        isActive: true,
      });
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.authService.updateAuth(auth._id!.toString(), {
        password: hashedPassword,
        passwordHistories: [
          {
            password: hashedPassword,
            createdAt: new Date(),
          },
        ],
      });
      return true;
    });
  };

  countPropertiesByAgent = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const filter: any = {
        userId: currentUser?.userId._id.toString(),
        status: PropertyStatusEnum.PUBLISHED,
      };

      const count = await this.propertyService.count(filter);
      return { count };
    });
  };

  getAgentTotalViews = (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const totalViews = await this.propertyService.getTotalViews(id);
      return { totalViews };
    });
  };

  countTotalView = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const totalViews = await this.propertyService.getTotalViews(
        currentUser.userId._id,
      );
      return { totalViews };
    });
  };

  countSoldPropertiesByAgent = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;

      const filter: any = {
        userId: currentUser?.userId._id.toString(),
        status: PropertyStatusEnum.SOLD,
      };

      const count = await this.propertyService.count(filter);
      return { count };
    });
  };

  getAnalytics = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { period } = req.query as { period?: string };
      const groupBy = period === "year" ? "year" : "month";

      const userId = req.user?.userId?._id;

      if (!userId) {
        return [];
      }

      const analyticsData = await this.propertyService.getViewsAnalytics(
        userId,
        groupBy,
      );

      // Service now returns full merged array { label, views, leads }
      return analyticsData;
    });
  };

  getRevenueSummary = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const userId = req.user?.userId?._id?.toString();
      if (!userId) {
        return {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          currency: CurrencyEnum.VND,
          revenue: 0,
          deals: 0,
        };
      }

      const { month, year, currency } = req.query as {
        month?: string;
        year?: string;
        currency?: CurrencyEnum;
      };

      return await this.propertySaleService.getAgentRevenueSummary(userId, {
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        currency,
      });
    });
  };

  getMySalesLog = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const userId = req.user?.userId?._id?.toString();
      if (!userId) {
        return {
          results: [],
          page: 1,
          limit: 10,
          totalPages: 0,
          totalResults: 0,
        };
      }

      const { page, limit, month, year, currency } = req.query as {
        page?: string;
        limit?: string;
        month?: string;
        year?: string;
        currency?: CurrencyEnum;
      };

      return await this.propertySaleService.getAgentSalesLog(userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 5,
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        currency,
      });
    });
  };

  getRevenueLeaderboard = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { month, year, currency, limit } = req.query as {
        month?: string;
        year?: string;
        currency?: CurrencyEnum;
        limit?: string;
      };

      return await this.agentLeaderboardService.getRevenueLeaderboard({
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        currency,
        limit: limit ? Number(limit) : undefined,
      });
    });
  };
}
