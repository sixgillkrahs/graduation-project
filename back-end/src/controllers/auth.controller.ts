import { ChangePasswordRequest } from "@/dto/auth.dto";
import { validationMessages } from "@/i18n/validationMessages";
import { IAuth } from "@/models/auth.model";
import { IRole } from "@/models/role.model";
import { IUser } from "@/models/user.model";
import { AuthService } from "@/services/auth.service";
import { RoleService } from "@/services/role.service";
import { UserService } from "@/services/user.service";
import { ApiRequest } from "@/utils/apiRequest";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import bcrypt from "bcrypt";
import { parse } from "cookie";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { EmailQueue } from "@/queues/email.queue";
import { redis } from "@/config/redis";
import { redisConnection } from "@/config/redis.connection";
import {
  AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { ENV } from "@/config/env";

export class AuthController extends BaseController {
  private userService: UserService;
  private authService: AuthService;
  private roleService: RoleService;
  private emailQueue: EmailQueue;

  constructor(
    authService: AuthService,
    userService: UserService,
    roleService: RoleService,
    emailQueue: EmailQueue,
  ) {
    super();
    this.userService = userService;
    this.authService = authService;
    this.roleService = roleService;
    this.emailQueue = emailQueue;
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { username, password, rememberMe } = req.body;
      const auth = await this.authService.getAuthByUsername<
        IAuth & {
          roleId: IRole & { _id: string };
          userId: IUser & { _id: string };
        }
      >(username, [
        {
          path: "roleId",
          select: "_id name code permissionIds",
        },
        {
          path: "userId",
          select: "_id email fullName isActive phone",
        },
      ]);
      if (!auth || !auth.password) {
        throw new AppError(
          lang === "vi" ? "Sai tài khoản" : "Incorrect username",
          401,
          ErrorCode.INCORRECT_CREDENTIALS,
        );
      }
      if (!auth.userId.isActive) {
        throw new AppError(
          validationMessages[lang].userNotActive || "User not active",
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
      const accessToken = this.authService.generateAccessToken(
        {
          user: auth.userId,
          role: auth.roleId,
        },
        15 * 1000 * 60, // 15 phút
      );
      const refreshToken = this.authService.generateRefreshToken(
        {
          userId: auth.userId._id,
        },
        15 * 1000 * 60 * 24, // 15 ngày
      );

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none" as const,
      };

      res.cookie(
        "accessToken",
        accessToken,
        rememberMe
          ? {
              ...cookieOptions,
              maxAge: 15 * 60 * 1000,
            }
          : cookieOptions,
      );
      res.cookie(
        "refreshToken",
        refreshToken,
        rememberMe
          ? {
              ...cookieOptions,
              maxAge: 7 * 24 * 60 * 60 * 1000,
            }
          : cookieOptions,
      );
      return {
        user: {
          id: auth.userId._id,
          email: auth.userId.email,
          name: auth.userId.fullName,
        },
        role: {
          id: auth.roleId._id,
          name: auth.roleId.name,
          code: auth.roleId.code,
        },
      };
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
      const userAuth = await this.authService.getAuthByUserId<
        IAuth & { _id: string }
      >(decoded.userId.toString());
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
          userId: user._id,
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

  changePassword = (
    req: Request<{}, {}, ChangePasswordRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { oldPassword, newPassword } = req.body;
      const lang = ApiRequest.getCurrentLang(req);
      const currentUser = req.user;
      if (!currentUser.userId.isActive) {
        throw new AppError(
          validationMessages[lang].userNotActive || "User not active",
          401,
          ErrorCode.USER_NOT_ACTIVE,
        );
      }
      // Kiểm tra mật khẩu cũ có đúng không
      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        currentUser.password,
      );
      if (!isPasswordValid) {
        throw new AppError(
          validationMessages[lang].incorrectPassword || "Incorrect password",
          401,
          ErrorCode.INCORRECT_CREDENTIALS,
        );
      }
      // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
      const isPasswordNewValid = await bcrypt.compare(
        newPassword,
        currentUser.password,
      );
      if (isPasswordNewValid) {
        throw new AppError(
          validationMessages[lang].passwordSame || "Password same",
          400,
          ErrorCode.PASSWORD_MISMATCH,
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const historyPass = currentUser.passwordHistories || [];
      historyPass.push({
        password: hashedPassword,
        createdAt: new Date(),
      });
      await this.authService.updateAuth(currentUser._id, {
        password: hashedPassword,
        passwordHistories: historyPass,
      });
      return true;
    });
  };

  forgotPassword = (
    req: Request<{}, {}, { email: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { email } = req.body;
      const otp = this.authService.getOTP();
      await redisConnection.set(`otp:${email}`, otp, "EX", 6 * 60);
      await this.emailQueue.sendOTPEmail({
        to: email,
        otp,
      });
      return true;
    });
  };

  verifyOTP = (
    req: Request<{}, {}, { email: string; otp: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { email, otp } = req.body;
      const storedOTP = await redisConnection.get(`otp:${email}`);
      if (!storedOTP) {
        throw new AppError(
          validationMessages[lang].otpExpired || "OTP expired",
          410,
          ErrorCode.OTP_EXPIRED,
        );
      }
      if (storedOTP !== otp) {
        throw new AppError(
          validationMessages[lang].incorrectOTP || "Incorrect OTP",
          410,
          ErrorCode.INCORRECT_OTP,
        );
      }
      await redisConnection.del(`otp:${email}`);
      const token = this.authService.generateAccessToken(
        {
          user: {
            email,
          },
        },
        15 * 1000 * 60,
      );
      return {
        token,
      };
    });
  };

  resetPassword = (
    req: Request<{}, {}, { token: string; password: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { token, password } = req.body;
      const lang = ApiRequest.getCurrentLang(req);
      const decoded = (await this.authService.validateToken(token)) as {
        user: {
          email: string;
        };
      };
      if (!decoded) {
        throw new AppError(
          validationMessages[lang].invalidToken || "Invalid token",
          404,
          ErrorCode.INVALID_TOKEN,
        );
      }
      const userAuth = await this.authService.getAuthByUsername<
        IAuth & { _id: string }
      >(decoded.user.email);
      if (!userAuth) {
        throw new AppError(
          validationMessages[lang].userNotFound || "User not found",
          404,
          ErrorCode.USER_NOT_FOUND,
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const isPasswordSame = await Promise.all(
        userAuth?.passwordHistories?.map((item) => {
          return bcrypt.compare(password, item.password);
        }) || [],
      );
      if (isPasswordSame.includes(true)) {
        throw new AppError(
          validationMessages[lang].passwordSame || "Password same",
          400,
          ErrorCode.PASSWORD_MISMATCH,
        );
      }
      userAuth.password = hashedPassword;
      userAuth?.passwordHistories?.push({
        password: hashedPassword,
        createdAt: new Date(),
      });
      await this.authService.updateAuth(userAuth._id, userAuth);
      return true;
    });
  };

  registerPasskey = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;

      const options = generateRegistrationOptions({
        rpName: "My App",
        rpID: "localhost",
        userID: currentUser._id as any,
        userName: currentUser.userId.email,
        timeout: 60000,
        attestationType: "none",
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
        },
      });

      res.cookie("webauthn_register_challenge", (await options).challenge, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2 * 60 * 1000,
      });

      return options;
    });
  };

  verifyPasskey = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const lang = ApiRequest.getCurrentLang(req);
      const expectedChallenge = req.headers.cookie
        ?.split("; ")
        .find((item) => item.startsWith("webauthn_register_challenge"))
        ?.split("=")[1];
      if (!expectedChallenge) {
        throw new AppError(
          lang === "vi"
            ? "Chưa đăng ký khóa thông minh"
            : "WebAuthn challenge not found",
          410,
          ErrorCode.WEBAUTHN_CHALLENGE_NOT_FOUND,
        );
      }
      const verification = await verifyRegistrationResponse({
        response: req.body,
        expectedChallenge,
        expectedOrigin:
          process.env.NODE_ENV === "production"
            ? "https://app.example.com"
            : "http://localhost:3000",
        expectedRPID:
          process.env.NODE_ENV === "production" ? "example.com" : "localhost",
      });

      if (!verification.verified || !verification.registrationInfo) {
        throw new AppError(
          lang === "vi"
            ? "Xác thực khóa thông minh thất bại"
            : "WebAuthn verification failed",
          410,
          ErrorCode.WEBAUTHN_VERIFICATION_FAILED,
        );
      }
      const { credential } = verification.registrationInfo;
      await this.authService.updateAuth(currentUser._id, {
        passkeys: [
          {
            counter: credential.counter,
            credentialID: credential.id,
            publicKey: credential.publicKey.toString(),
            transports: credential.transports!,
          },
        ],
      });
      res.clearCookie("webauthn_register_challenge");
      return true;
    });
  };

  loginPasskey = (
    req: Request<{}, {}, { email: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = ApiRequest.getCurrentLang(req);
      const { email } = req.body;
      const auth = await this.authService.getAuthByUsername<
        IAuth & {
          roleId: IRole & { _id: string };
          userId: IUser & { _id: string };
        }
      >(email, [
        {
          path: "roleId",
          select: "_id name code permissionIds",
        },
        {
          path: "userId",
          select: "_id email fullName isActive phone",
        },
      ]);
      if (!auth || !auth.password) {
        throw new AppError(
          lang === "vi" ? "Sai tài khoản" : "Incorrect username",
          401,
          ErrorCode.INCORRECT_CREDENTIALS,
        );
      }
      if (!auth.userId.isActive) {
        throw new AppError(
          validationMessages[lang].userNotActive || "User not active",
          401,
          ErrorCode.USER_NOT_FOUND,
        );
      }
      const passkeys = auth.passkeys;
      if (!passkeys || !passkeys.length) {
        throw new AppError(
          lang === "vi"
            ? "Chưa đăng ký khóa thông minh"
            : "No passkey registered",
          401,
          ErrorCode.INCORRECT_CREDENTIALS,
        );
      }

      const options = generateAuthenticationOptions({
        rpID:
          process.env.NODE_ENV === "production" ? "example.com" : "localhost",
        userVerification: "preferred",
        allowCredentials: passkeys.map((pk) => ({
          id: Buffer.from(pk.credentialID, "base64").toString("base64"),
          type: "public-key",
          transports: pk.transports as AuthenticatorTransportFuture[],
        })),
        timeout: 60000,
      });
      res.cookie("webauthn_login_challenge", (await options).challenge, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 120000,
      });

      return options;
    });
  };
}
