import { ENV } from "@/config/env";
import { singleton } from "@/decorators/singleton";
import AuthModel, { IAuth } from "@/models/auth.model";
import jwt, { SignOptions } from "jsonwebtoken";
import { PopulateOptions } from "mongoose";

@singleton
export class AuthService {
  constructor() {}

  async getAuthByUsername<T>(
    username: string,
    populate?: string | PopulateOptions | (string | PopulateOptions)[],
  ): Promise<T | null> {
    return AuthModel.findOne({
      username: username,
    })
      .populate(
        populate ? (Array.isArray(populate) ? populate : [populate]) : [],
      )
      .lean()
      .exec() as Promise<T | null>;
  }

  async createAuth(auth: IAuth) {
    return AuthModel.create(auth);
  }

  async updateAuth(id: string, auth: Partial<IAuth>) {
    return AuthModel.findByIdAndUpdate(id, auth);
  }

  async getAuthById<T>(
    id: string,
    populate?: string | PopulateOptions | (string | PopulateOptions)[],
    select?: string,
  ): Promise<T | null> {
    const query = AuthModel.findById(id);

    if (populate) {
      query.populate(Array.isArray(populate) ? populate : [populate]);
    }

    if (select) {
      query.select(select);
    }

    return query.lean().exec() as Promise<T | null>;
  }

  async getAuthByUserId<T>(
    id: string,
    populate?: string | PopulateOptions | (string | PopulateOptions)[],
  ): Promise<T | null> {
    return AuthModel.findOne({
      userId: id,
    })
      .populate(
        populate ? (Array.isArray(populate) ? populate : [populate]) : [],
      )
      .lean()
      .exec() as Promise<T | null>;
  }

  async refreshToken(refreshToken: string) {
    const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET) as {
      userId: string;
    };
    return decoded;
  }

  generateAccessToken(
    payload: object,
    expiresTime: number,
    secret = ENV.JWT_SECRET,
  ): string {
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const options: SignOptions = {
      algorithm: "HS256",
      expiresIn: expiresTime,
    };
    return jwt.sign(payload, secret, options);
  }

  generateRefreshToken(payload: object, expiresTime: number): string {
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

  validateToken(token: string, secret = ENV.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      return false;
    }
  }

  getAuths = async (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any> = {},
    select?: string,
  ) => {
    return AuthModel.paginate?.(options, filter, select);
  };

  getOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
