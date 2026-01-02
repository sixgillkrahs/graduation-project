import { logger } from "@/config/logger";
import { singleton } from "@/decorators/singleton";
import UserModel, { IUser } from "@/models/user.model";
import { populate } from "dotenv";

@singleton
export class UserService {
  constructor() {
    console.log("UserService constructor");
  }

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
    return UserModel.findById(id).lean().exec();
  };

  updateUser = async (id: string, user: Partial<IUser>) => {
    return UserModel.findByIdAndUpdate(id, user);
  };
}
