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
      const accessToken = this.generateAccessToken(
        {
          user: user,
          roleId: auth.roleId,
        },
        15 * 1000 * 60,
      );
      const refreshToken = this.generateRefreshToken(
        {
          userId: user.id,
        },
        15 * 1000 * 60 * 24,
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 60 * 1000,
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

      if (req.cookies && req.cookies.refreshToken) {
        res.cookie("refreshToken", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: new Date(0),
          path: "/",
        });
      }
      return { success: true, message: "Đăng xuất thành công" };
    });
  };

  private generateAccessToken(payload: object, expiresTime: number): string {
    const secret = ENV.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const options: SignOptions = {
      algorithm: "HS256",
      expiresIn: expiresTime,
    };
    return jwt.sign(payload, secret, options);
  }

  private generateRefreshToken(payload: object, expiresTime: number): string {
    const secret = ENV.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new Error("REFRESH_TOKEN_SECRET is not defined");
    }
    const options: SignOptions = {
      algorithm: "HS256",
      expiresIn: expiresTime,
    };
    return jwt.sign(payload, secret, options);
  }
}
