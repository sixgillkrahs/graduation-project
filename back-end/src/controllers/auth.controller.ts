import { AuthService } from "@/services/auth.service";
import { ApiRequest } from "@/utils/apiRequest";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { validationMessages } from "@/i18n/validationMessages";
import { UserService } from "@/services/user.service";
import jwt, { SignOptions } from "jsonwebtoken";
import { ENV } from "@/config/env";
import { RoleService } from "@/services/role.service";
import { parse } from "cookie";

export class AuthController extends BaseController {
  private userService: UserService;
  private authService: AuthService;
  private roleService: RoleService;

  constructor(
    authService: AuthService,
    userService: UserService,
    roleService: RoleService,
  ) {
    super();
    this.userService = userService;
    this.authService = authService;
    this.roleService = roleService;
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { username, password, rememberMe } = req.body;
      const auth = await this.authService.getAuthByUsername(username);
      if (!auth || !auth.password) {
        throw new AppError(
          lang === "vi" ? "Sai tài khoản" : "Incorrect username",
          401,
          ErrorCode.INCORRECT_CREDENTIALS,
        );
      }
      const user = await this.userService.getUserById(auth.userId.toString());
      if (!user) {
        throw new AppError(
          validationMessages[lang].userNotFound || "User not found",
          401,
          ErrorCode.USER_NOT_FOUND,
        );
      }
      const isPasswordValid = await bcrypt.compare(password, auth.password);
      if (!isPasswordValid) {
        throw new AppError(
          lang === "vi" ? "Sai mật khẩu" : "Incorrect password",
          401,
          ErrorCode.INCORRECT_CREDENTIALS,
        );
      }
      if (!user.isActive) {
        throw new AppError(
          validationMessages[lang].userNotActive || "User not active",
          401,
          ErrorCode.INVALID_TOKEN,
        );
      }
      const accessToken = this.authService.generateAccessToken(
        {
          user: user,
          roleId: auth.roleId,
        },
        15 * 1000 * 60, // 15 phút
      );
      const refreshToken = this.authService.generateRefreshToken(
        {
          userId: user.id,
        },
        15 * 1000 * 60 * 24, // 15 ngày
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 1000 * 60,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 1000 * 24 * 7,
      });
      return user;
    });
  };

  signup = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { username, password, email, firstName, lastName, phone } =
        req.body;
      const userExists = await this.authService.getAuthByUsername(username);
      if (userExists) {
        throw new AppError(
          validationMessages[lang].usernameExist || "Username already exists",
          400,
          ErrorCode.USERNAME_EXISTS,
        );
      }
      const emailExists = await this.userService.getUserByEmail(email);
      if (emailExists) {
        throw new AppError(
          validationMessages[lang].emailExist || "Email already exists",
          400,
          ErrorCode.EMAIL_EXISTS,
        );
      }
      const user = await this.userService.createUser({
        email,
        fullName: firstName + " " + lastName,
        phone,
        prefixPhone: "+84",
        address: "",
        isActive: true,
        isDeleted: false,
      });
      const hashedPassword = await bcrypt.hash(password, 10);
      const roleDefault = await this.roleService.getRoleDefault();
      const userAuth = await this.authService.createAuth({
        username,
        password: hashedPassword,
        userId: user.id,
        roleId: roleDefault?.id || "",
        passwordHistories: [
          {
            password: hashedPassword,
            createdAt: new Date(),
          },
        ],
      });
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: userAuth.roleId,
        },
      };
    });
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      res.cookie("accessToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/",
      });
      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/",
      });
      return { success: true, message: "Đăng xuất thành công" };
    });
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const cookieHeader = req.headers.cookie;
      if (!cookieHeader) {
        throw new AppError(
          "Unauthorized - Invalid token",
          401,
          ErrorCode.INVALID_TOKEN,
        );
      }
      const cookies = parse(cookieHeader);
      const token = cookies.refreshToken;
      if (!token) {
        throw new AppError(
          validationMessages[lang].refreshTokenNotExist ||
            "Refresh token not exist",
          400,
          ErrorCode.INVALID_TOKEN,
        );
      }
      const decoded = await this.authService.refreshToken(token);
      if (!decoded) {
        throw new AppError(
          validationMessages[lang].refreshTokenNotExist ||
            "Refresh token not exist",
          400,
          ErrorCode.INVALID_TOKEN,
        );
      }
      const user = await this.userService.getUserById(
        decoded.userId.toString(),
      );
      if (!user) {
        throw new AppError(
          validationMessages[lang].userNotFound || "User not found",
          401,
          ErrorCode.USER_NOT_FOUND,
        );
      }
      if (!user.isActive) {
        throw new AppError(
          validationMessages[lang].userNotActive || "User not active",
          401,
          ErrorCode.INVALID_TOKEN,
        );
      }
      const userAuth = await this.authService.getAuthByUserId(
        decoded.userId.toString(),
      );
      if (!userAuth) {
        throw new AppError(
          validationMessages[lang].userNotFound || "User not found",
          401,
          ErrorCode.USER_NOT_FOUND,
        );
      }
      const accessToken = this.authService.generateAccessToken(
        {
          user: user,
          roleId: userAuth.roleId,
        },
        15 * 1000 * 60,
      );
      const refreshToken = this.authService.generateRefreshToken(
        {
          userId: user.id,
        },
        15 * 1000 * 60 * 24, // 15 ngày
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 1000 * 60,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 1000 * 60 * 24, // 15 ngày
      });
      return user;
    });
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const user = req.user;
      return user;
    });
  };
}
