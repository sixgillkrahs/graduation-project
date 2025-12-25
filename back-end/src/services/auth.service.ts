import { ENV } from "@/config/env";
import { singleton } from "@/decorators/singleton";
import AuthModel, { IAuth } from "@/models/auth.model";
import jwt from "jsonwebtoken";

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
}
