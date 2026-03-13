import { ENV } from "@/config/env";
import { redisConnection } from "@/config/redis.connection";
import { ChangePasswordRequest } from "@/dto/auth.dto";
import { validationMessages } from "@/i18n/validationMessages";
import { IAuth } from "@/models/auth.model";
import { IRole } from "@/models/role.model";
import { IUser } from "@/models/user.model";
import { EmailQueue } from "@/queues/email.queue";
import { AuthService } from "@/services/auth.service";
import { RoleService } from "@/services/role.service";
import { UserService } from "@/services/user.service";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import {
  AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import bcrypt from "bcrypt";
import { parse } from "cookie";
import { randomBytes } from "crypto";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";

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

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    rememberMe?: boolean,
  ) {
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
  }

  private resolveFrontendRedirectUrl(callbackUrl?: string) {
    const fallbackUrl = ENV.FRONTEND_URLLANDINGPAGE;

    if (!callbackUrl?.trim()) {
      return fallbackUrl;
    }

    if (callbackUrl.startsWith("/")) {
      return new URL(callbackUrl, fallbackUrl).toString();
    }

    const allowedOrigins = [ENV.FRONTEND_URLLANDINGPAGE, ENV.FRONTEND_URL];
    const isAllowed = allowedOrigins.some((origin) =>
      callbackUrl.startsWith(origin),
    );

    return isAllowed ? callbackUrl : fallbackUrl;
  }

  private buildGoogleErrorRedirect(mode?: string, callbackUrl?: string) {
    const fallbackPath = mode === "sign-up" ? "/sign-up" : "/sign-in";
    const safeCallbackUrl = this.resolveFrontendRedirectUrl(callbackUrl);
    const safeUrl = new URL(fallbackPath, ENV.FRONTEND_URLLANDINGPAGE);

    if (safeCallbackUrl) {
      safeUrl.searchParams.set("callbackUrl", safeCallbackUrl);
    }

    safeUrl.searchParams.set("authError", "google_auth_failed");
    return safeUrl.toString();
  }

  private getGoogleCallbackUrl() {
    return (
      ENV.GOOGLE_REDIRECT_URI ||
      new URL("/api/auth/google/callback", ENV.SERVER_URL).toString()
    );
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const lang = req.lang;
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

      this.setAuthCookies(res, accessToken, refreshToken, rememberMe);
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
      const lang = req.lang;
      const {
        username,
        password,
        email,
        firstName,
        lastName,
        phone,
        roleCode,
      } = req.body;
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
        avatarUrl:
          "https://res.cloudinary.com/dr1akv5p4/image/upload/v1769763068/default-avatar_rolye6.jpg",
        isActive: true,
        isDeleted: false,
      });
      const hashedPassword = await bcrypt.hash(password, 10);
      let roleDefault = await this.roleService.getRoleByCode(roleCode);
      if (!roleDefault) {
        roleDefault = await this.roleService.getRoleDefault();
      }
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
      const lang = req.lang;
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
      const { password, passwordHistories, ...rest } = user;
      return rest;
    });
  };

  changePassword = (
    req: Request<{}, {}, ChangePasswordRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { oldPassword, newPassword } = req.body;
      const lang = req.lang;
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
      const lang = req.lang;
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
      const lang = req.lang;
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

      const options = await generateRegistrationOptions({
        rpName: "Havenly",
        rpID:
          process.env.NODE_ENV === "production" ? "example.com" : "localhost",
        userID: new Uint8Array(Buffer.from(currentUser._id.toString())),
        userName: currentUser.userId.email,
        timeout: 60000,
        attestationType: "none",
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
        },
      });

      res.cookie("webauthn_register_challenge", options.challenge, {
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
      const lang = req.lang;
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
      const userAuth = await this.authService.getAuthById<IAuth>(
        currentUser._id as string,
      );
      const currentPasskeys = userAuth?.passkeys || [];
      await this.authService.updateAuth(currentUser._id, {
        passkeys: [
          ...currentPasskeys,
          {
            counter: credential.counter,
            credentialID: credential.id,
            publicKey: Buffer.from(credential.publicKey).toString("base64url"),
            transports: (credential.transports as unknown as string[]) || [],
          },
        ],
      });
      res.clearCookie("webauthn_register_challenge");
      return true;
    });
  };

  loginPasskey = (
    req: Request<{}, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const options = generateAuthenticationOptions({
        rpID:
          process.env.NODE_ENV === "production" ? "example.com" : "localhost",
        userVerification: "preferred",
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

  verifyLoginPasskey = (
    req: Request<{}, {}, { response: any }>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = req.lang;
      const { response } = req.body;
      const expectedChallenge = req.headers.cookie
        ?.split("; ")
        .find((item) => item.startsWith("webauthn_login_challenge"))
        ?.split("=")[1];

      if (!expectedChallenge) {
        throw new AppError(
          lang === "vi"
            ? "Mã đăng nhập không hợp lệ"
            : "WebAuthn challenge not found",
          410,
          ErrorCode.WEBAUTHN_CHALLENGE_NOT_FOUND,
        );
      }

      const auth = await this.authService.getAuthByPasskeyCredentialID<
        IAuth & {
          _id: string;
          roleId: IRole & { _id: string };
          userId: IUser & { _id: string };
        }
      >(response.id, [
        {
          path: "roleId",
          select: "_id name code permissionIds",
        },
        {
          path: "userId",
          select: "_id email fullName isActive phone",
        },
      ]);

      if (!auth) {
        throw new AppError(
          lang === "vi" ? "Khóa thông minh không hợp lệ" : "Passkey not found",
          401,
          ErrorCode.INCORRECT_CREDENTIALS,
        );
      }

      if (!auth.userId.isActive) {
        throw new AppError(
          lang === "vi" ? "Tài khoản chưa được kích hoạt" : "User not active",
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

      const passkey = passkeys.find((pk) => pk.credentialID === response.id);
      if (!passkey) {
        throw new AppError(
          lang === "vi" ? "Khóa thông minh không hợp lệ" : "Passkey not found",
          401,
          ErrorCode.INCORRECT_CREDENTIALS,
        );
      }

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin:
          process.env.NODE_ENV === "production"
            ? "https://app.example.com"
            : "http://localhost:3000",
        expectedRPID:
          process.env.NODE_ENV === "production" ? "example.com" : "localhost",
        credential: {
          id: passkey.credentialID,
          publicKey: new Uint8Array(
            Buffer.from(passkey.publicKey, "base64url"),
          ),
          counter: passkey.counter,
          transports: passkey.transports as AuthenticatorTransportFuture[],
        },
      });

      if (!verification.verified) {
        throw new AppError(
          lang === "vi"
            ? "Xác thực khóa thông minh thất bại"
            : "WebAuthn verification failed",
          410,
          ErrorCode.WEBAUTHN_VERIFICATION_FAILED,
        );
      }

      // Update counter
      await this.authService.updateAuth(auth._id.toString(), {
        passkeys: passkeys.map((pk) =>
          pk.credentialID === response.id
            ? { ...pk, counter: verification.authenticationInfo.newCounter }
            : pk,
        ),
      });

      res.clearCookie("webauthn_login_challenge");

      // Generate tokens
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

      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

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

  googleAuth = async (req: Request, res: Response) => {
    const callbackUrl = this.resolveFrontendRedirectUrl(
      String(req.query.callbackUrl || ""),
    );
    const mode =
      String(req.query.mode || "sign-in") === "sign-up" ? "sign-up" : "sign-in";
    const stateToken = randomBytes(24).toString("hex");
    const statePayload = Buffer.from(
      JSON.stringify({
        token: stateToken,
        callbackUrl,
        mode,
      }),
    ).toString("base64url");

    res.cookie("google_oauth_state", stateToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
      path: "/",
    });

    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    googleAuthUrl.searchParams.set("client_id", ENV.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set("redirect_uri", this.getGoogleCallbackUrl());
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "online");
    googleAuthUrl.searchParams.set("prompt", "select_account");
    googleAuthUrl.searchParams.set("state", statePayload);

    res.redirect(googleAuthUrl.toString());
  };

  googleAuthCallback = async (req: Request, res: Response) => {
    let mode = "sign-in";
    let callbackUrl = ENV.FRONTEND_URLLANDINGPAGE;

    try {
      const { state: rawState, code, error } = req.query;

      if (!rawState || typeof rawState !== "string") {
        throw new AppError(
          "Invalid Google OAuth state",
          400,
          ErrorCode.INVALID_REQUEST,
        );
      }

      const parsedState = JSON.parse(
        Buffer.from(rawState, "base64url").toString("utf8"),
      ) as {
        token?: string;
        callbackUrl?: string;
        mode?: string;
      };

      mode = parsedState.mode === "sign-up" ? "sign-up" : "sign-in";
      callbackUrl = this.resolveFrontendRedirectUrl(parsedState.callbackUrl);

      const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
      const storedState = cookies.google_oauth_state;

      if (!storedState || storedState !== parsedState.token) {
        throw new AppError(
          "Google OAuth state mismatch",
          400,
          ErrorCode.INVALID_REQUEST,
        );
      }

      res.clearCookie("google_oauth_state", { path: "/" });

      if (error || !code || typeof code !== "string") {
        throw new AppError(
          "Google OAuth authorization failed",
          400,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: ENV.GOOGLE_CLIENT_ID,
          client_secret: ENV.GOOGLE_CLIENT_SECRET,
          redirect_uri: this.getGoogleCallbackUrl(),
          grant_type: "authorization_code",
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!tokenResponse.ok) {
        throw new AppError(
          "Failed to exchange Google authorization code",
          502,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }

      const tokenPayload = (await tokenResponse.json()) as {
        access_token?: string;
      };

      if (!tokenPayload.access_token) {
        throw new AppError(
          "Google access token missing",
          502,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }

      const profileResponse = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenPayload.access_token}`,
          },
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!profileResponse.ok) {
        throw new AppError(
          "Failed to fetch Google profile",
          502,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }

      const googleProfile = (await profileResponse.json()) as {
        email?: string;
        email_verified?: boolean;
        given_name?: string;
        family_name?: string;
        name?: string;
        picture?: string;
      };

      if (!googleProfile.email || !googleProfile.email_verified) {
        throw new AppError(
          "Google account email is not verified",
          400,
          ErrorCode.INVALID_REQUEST,
        );
      }

      let user = await this.userService.getUserByEmail(googleProfile.email);

      if (!user) {
        const fullName =
          googleProfile.name?.trim() ||
          [googleProfile.given_name, googleProfile.family_name]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          googleProfile.email;

        user = await this.userService.createUser({
          email: googleProfile.email,
          fullName,
          phone: "",
          prefixPhone: "+84",
          address: "",
          avatarUrl: googleProfile.picture || "",
          isActive: true,
          isDeleted: false,
        });
      } else if (!user.isActive) {
        throw new AppError("User not active", 401, ErrorCode.USER_NOT_ACTIVE);
      } else {
        const updates: Partial<IUser> = {};

        if (!user.avatarUrl && googleProfile.picture) {
          updates.avatarUrl = googleProfile.picture;
        }

        if (!user.fullName && googleProfile.name) {
          updates.fullName = googleProfile.name;
        }

        if (Object.keys(updates).length > 0) {
          await this.userService.updateUser(String(user._id), updates);
          user = await this.userService.getUserByEmail(googleProfile.email);
        }
      }

      if (!user) {
        throw new AppError(
          "User provisioning failed",
          500,
          ErrorCode.INTERNAL_SERVER_ERROR,
        );
      }

      let auth = await this.authService.getAuthByUserId<
        IAuth & {
          _id: string;
          roleId: IRole & { _id: string };
          userId: IUser & { _id: string };
        }
      >(String((user as any)._id), [
        {
          path: "roleId",
          select: "_id name code permissionIds",
        },
        {
          path: "userId",
          select: "_id email fullName isActive phone avatarUrl",
        },
      ]);

      if (!auth) {
        let roleDefault = await this.roleService.getRoleByCode("USER");
        if (!roleDefault) {
          roleDefault = await this.roleService.getRoleDefault();
        }

        if (!roleDefault?._id) {
          throw new AppError(
            "Default user role not configured",
            500,
            ErrorCode.INTERNAL_SERVER_ERROR,
          );
        }

        const generatedPassword = randomBytes(32).toString("hex");
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        await this.authService.createAuth({
          username: googleProfile.email,
          password: hashedPassword,
          userId: (user as any)._id,
          roleId: roleDefault._id as any,
          passwordHistories: [
            {
              password: hashedPassword,
              createdAt: new Date(),
            },
          ],
        } as IAuth);

        auth = await this.authService.getAuthByUserId<
          IAuth & {
            _id: string;
            roleId: IRole & { _id: string };
            userId: IUser & { _id: string };
          }
        >(String((user as any)._id), [
          {
            path: "roleId",
            select: "_id name code permissionIds",
          },
          {
            path: "userId",
            select: "_id email fullName isActive phone avatarUrl",
          },
        ]);
      }

      if (!auth?.roleId || !auth?.userId) {
        throw new AppError(
          "Failed to resolve Google account role",
          500,
          ErrorCode.INTERNAL_SERVER_ERROR,
        );
      }

      const accessToken = this.authService.generateAccessToken(
        {
          user: auth.userId,
          role: auth.roleId,
        },
        15 * 1000 * 60,
      );
      const refreshToken = this.authService.generateRefreshToken(
        {
          userId: auth.userId._id,
        },
        15 * 1000 * 60 * 24,
      );

      this.setAuthCookies(res, accessToken, refreshToken);
      res.redirect(callbackUrl);
    } catch (error) {
      res.clearCookie("google_oauth_state", { path: "/" });
      res.redirect(this.buildGoogleErrorRedirect(mode, callbackUrl));
    }
  };
}
