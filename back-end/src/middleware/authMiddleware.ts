import { ENV } from "@/config/env";
import { logger } from "@/config/logger";
import { AuthService } from "@/services/auth.service";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import { parse } from "cookie";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface Root {
  _id: string;
  username: string;
  password: string;
  userId: UserId;
  roleId: RoleId;
  passwordHistories: PasswordHistory[];
  createdAt: string;
  updatedAt: string;
}

interface UserId {
  _id: string;
  email: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  avatarUrl: string;
}

interface RoleId {
  _id: string;
  name: string;
  code: string;
  permissionIds: any[];
}

interface PasswordHistory {
  password: string;
  createdAt: Date;
}

interface JwtPayload {
  user: {
    email: string;
    _id: string;
    [k: string]: any;
  };
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user: Root;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      throw new AppError(
        "Unauthorized - Invalid token",
        401,
        ErrorCode.INVALID_TOKEN,
      );
    }
    const cookies = parse(cookieHeader);
    const token = cookies.accessToken;
    if (!token) {
      throw new AppError("No token provided", 401, ErrorCode.UNAUTHORIZED);
    }
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
      const authService = new AuthService();
      const user = (await authService.getAuthByUserId(decoded.user._id, [
        {
          path: "roleId",
          select: "_id name code permissionIds",
        },
        {
          path: "userId",
          select: "_id email fullName isActive phone avatarUrl",
        },
      ])) as Root;
      if (!user) {
        throw new AppError("User not found", 404, ErrorCode.NOT_FOUND);
      }
      req.user = user;
      next();
    } catch (error) {
      logger.warn({
        message: "Invalid token",
        context: "AuthMiddleware.requireAuth",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new AppError(
        "Unauthorized - Invalid token",
        401,
        ErrorCode.INVALID_TOKEN,
      );
    }
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user?.roleId._id || !roles.includes(req.user.roleId.code)) {
        logger.warn({
          message: "Insufficient permissions",
          context: "AuthMiddleware.requireRole",
          requiredRoles: roles,
          userRole: req.user?.roleId.code,
          userId: req.user?.userId._id,
        });
        throw new AppError(
          "Forbidden - Insufficient permissions",
          403,
          ErrorCode.FORBIDDEN,
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cookieHeader = req.headers.cookie;
    // Check Authorization header as fallback if no cookie
    const authHeader = req.headers.authorization;

    let token;

    if (cookieHeader) {
      const cookies = parse(cookieHeader);
      token = cookies.accessToken;
    }

    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
      const authService = new AuthService();
      const user = (await authService.getAuthByUserId(decoded.user._id, [
        {
          path: "roleId",
          select: "_id name code permissionIds",
        },
        {
          path: "userId",
          select: "_id email fullName isActive phone avatarUrl",
        },
      ])) as Root;

      if (user) {
        req.user = user;
      }
      next();
    } catch (error) {
      // Token invalid or expired - just ignore and proceed as guest
      next();
    }
  } catch (error) {
    next();
  }
};
