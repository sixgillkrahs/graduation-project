import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";

export interface IUser {
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  prefixPhone?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {}

interface UserModel extends mongoose.Model<IUser, {}, IUserMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<IUser, IUserMethods>[]>;
  createUser(
    user: IUser,
  ): Promise<mongoose.HydratedDocument<IUser, IUserMethods>>;
  getUserById(
    id: string,
  ): Promise<mongoose.HydratedDocument<IUser, IUserMethods> | null>;
  updateUser(
    id: string,
    user: Partial<IUser>,
  ): Promise<mongoose.HydratedDocument<IUser, IUserMethods> | null>;
  deleteUser(
    id: string,
  ): Promise<mongoose.HydratedDocument<IUser, IUserMethods> | null>;
  searchUsers(
    page: number,
    limit: number,
    searchTerm: string,
  ): Promise<mongoose.HydratedDocument<IUser, IUserMethods>[]>;
}

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    prefixPhone: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.plugin(toJSON as any);
userSchema.plugin(paginate as any);

class UserClass {
  static async createUser(this: UserModel, userData: IUser) {
    return await this.create(userData);
  }

  static async getUserById(this: UserModel, id: string) {
    return await this.findById(id).exec();
  }

  static async updateUser(
    this: UserModel,
    id: string,
    updateData: Partial<IUser>,
  ) {
    return await this.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  static async deleteUser(this: UserModel, id: string) {
    return await this.findByIdAndDelete(id).exec();
  }

  static async searchUsers(
    this: UserModel,
    page: number = 1,
    limit: number = 10,
    searchTerm: string,
  ) {
    const searchRegex = new RegExp(searchTerm, "i");

    return await this.paginate?.(
      {
        page,
        limit,
        sortBy: "createdAt:desc",
        populate: "roleIds",
      },
      {
        $or: [{ fullName: searchRegex }, { email: searchRegex }],
      },
    );
  }
}

userSchema.loadClass(UserClass);

const UserModel = mongoose.model<IUser, UserModel>(
  collections.users,
  userSchema,
);

export default UserModel;
