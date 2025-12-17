import { singleton } from "@/decorators/singleton";
import AuthModel, { IAuth } from "@/models/auth.model";

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
}
