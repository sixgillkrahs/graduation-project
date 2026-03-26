import { logger } from "@/config/logger";
import { singleton } from "@/decorators/singleton";
import UserModel, { IUser } from "@/models/user.model";

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

  getUsersByIds = async (ids: string[], select?: string) => {
    return UserModel.find({
      _id: {
        $in: ids,
      },
    })
      .select(select || "")
      .lean()
      .exec();
  };

  updateUser = async (id: string, user: Partial<IUser>) => {
    return UserModel.findByIdAndUpdate(id, user, { new: true });
  };

  setUserLock = async (
    id: string,
    lockInfo: NonNullable<IUser["lockInfo"]>,
  ) => {
    return UserModel.findByIdAndUpdate(
      id,
      {
        isActive: false,
        lockInfo,
      },
      { new: true },
    );
  };

  setUnlockRequest = async (
    id: string,
    unlockRequest: NonNullable<IUser["unlockRequest"]>,
  ) => {
    return UserModel.findByIdAndUpdate(
      id,
      {
        unlockRequest,
      },
      { new: true },
    );
  };

  appendUnlockRequestHistory = async (
    id: string,
    historyItem: NonNullable<IUser["unlockRequestHistories"]>[number],
  ) => {
    return UserModel.findByIdAndUpdate(
      id,
      {
        $push: {
          unlockRequestHistories: historyItem,
        },
      },
      { new: true },
    );
  };

  clearUnlockRequest = async (id: string) => {
    return UserModel.findByIdAndUpdate(
      id,
      {
        $unset: {
          unlockRequest: 1,
        },
      },
      { new: true },
    );
  };

  clearUserLock = async (id: string) => {
    return UserModel.findByIdAndUpdate(
      id,
      {
        $unset: {
          lockInfo: 1,
        },
      },
      { new: true },
    );
  };
}
