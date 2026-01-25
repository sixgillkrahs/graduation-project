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
      email,
    });
  };

  getUsers = async (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any> = {},
    select?: string,
  ) => {
    return UserModel.paginate?.(options, filter, select);
  };

  getUserById = async (id: string) => {
    return UserModel.findById(id).lean().exec();
  };

  updateUser = async (id: string, user: Partial<IUser>) => {
    return UserModel.findByIdAndUpdate(id, user);
  };
}
