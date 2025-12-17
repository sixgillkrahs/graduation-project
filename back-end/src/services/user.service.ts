import { logger } from "@/config/logger";
import { singleton } from "@/decorators/singleton";
import UserModel, { IUser } from "@/models/user.model";

@singleton
export class UserService {
  constructor() {}

  createUser = async (user: IUser) => {
    return UserModel.create(user);
  };

  getUserByEmail = async (email: string) => {
    return UserModel.findOne({
      where: {
        email,
      },
    });
  };

  getUserById = async (id: string) => {
    return UserModel.findById(id);
  };
}
