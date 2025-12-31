import { ENV } from "@/config/env";
import { singleton } from "@/decorators/singleton";
import AuthModel, { IAuth } from "@/models/auth.model";
import jwt, { SignOptions } from "jsonwebtoken";

@singleton
export class AuthService {
  constructor() {}

  async getAuthByUsername(username: string) {
    return AuthModel.findOne({
      username,
    });
  }

  async createAuth(auth: IAuth) {
    return AuthModel.create(auth);
  }

  async getAuthById(id: string) {
    return AuthModel.findById(id);
  }

  async getAuthByUserId(id: string) {
    return AuthModel.findOne({
      userId: id,
    });
  }

  async refreshToken(refreshToken: string) {
    const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET) as {
      userId: string;
    };
    return decoded;
  }

  generateAccessToken(payload: object, expiresTime: number): string {
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
}
