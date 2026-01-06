import { UserService } from "@/services/user.service";
import { BaseController } from "./base.controller";
import { NextFunction, Request, Response } from "express";
import { AgentService } from "@/services/agent.service";
import { AppError } from "@/utils/appError";
import { validationMessages } from "@/i18n/validationMessages";
import { ErrorCode } from "@/utils/errorCodes";
import { ApiRequest } from "@/utils/apiRequest";
import { EditProfileDto } from "@/dto/user.dto";

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

  updateProfile = (
    req: Request<{}, {}, EditProfileDto>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const currentUser = req.user;
      const {
        nameRegister,
        phone,
        certificateNumber,
        taxCode,
        yearsOfExperience,
        workingArea,
        specialization,
        bankAccountName,
        bankAccountNumber,
        bankName,
      } = req.body;
      const resp = await this.agentService.getAgentByUserId(
        currentUser.userId._id,
      );
      if (!resp) {
        throw new AppError(
          validationMessages[lang].userNotFound || "User not found",
          401,
          ErrorCode.USER_NOT_FOUND,
        );
      }
      await this.agentService.updateAgentRegistration(resp._id.toString(), {
        bankInfo: {
          bankAccountName:
            bankAccountName || resp.bankInfo?.bankAccountName || "",
          bankAccountNumber:
            bankAccountNumber || resp.bankInfo?.bankAccountNumber || "",
          bankName: bankName || resp.bankInfo?.bankName || "",
        },
        basicInfo: {
          nameRegister: nameRegister || resp.basicInfo.nameRegister,
          phoneNumber: phone || resp.basicInfo.phoneNumber,
          email: resp.basicInfo.email,
          identityInfo: {
            IDNumber: resp.basicInfo.identityInfo.IDNumber,
            fullName: resp.basicInfo.identityInfo.fullName,
            dateOfBirth: resp.basicInfo.identityInfo.dateOfBirth,
            gender: resp.basicInfo.identityInfo.gender,
            nationality: resp.basicInfo.identityInfo.nationality,
            placeOfBirth: resp.basicInfo.identityInfo.placeOfBirth,
          },
        },
        businessInfo: {
          certificateNumber:
            certificateNumber || resp.businessInfo.certificateNumber,
          taxCode: taxCode || resp.businessInfo.taxCode,
          yearsOfExperience:
            yearsOfExperience || resp.businessInfo.yearsOfExperience,
          workingArea: workingArea || resp.businessInfo.workingArea,
          specialization: specialization || resp.businessInfo.specialization,
        },
      });
      return true;
    });
  };
}
