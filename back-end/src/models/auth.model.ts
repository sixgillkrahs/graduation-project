import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";

export interface IAuth {
  password: string;
  username: string;
  passwordHistories?: {
    password: string;
    createdAt: Date;
  }[];
  userId: mongoose.Schema.Types.ObjectId;
  roleId: mongoose.Schema.Types.ObjectId;
  passkeys?: Array<{
    credentialID: string;
    publicKey: string;
    counter: number;
    transports: string[];
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuthMethods {}

interface AuthModel extends mongoose.Model<IAuth, {}, IAuthMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<IAuth, IAuthMethods>[]>;
  createAuth(
    auth: IAuth,
  ): Promise<mongoose.HydratedDocument<IAuth, IAuthMethods>>;
  getAuthById(
    id: string,
  ): Promise<mongoose.HydratedDocument<IAuth, IAuthMethods> | null>;
  updateAuth(
    id: string,
    auth: Partial<IAuth>,
  ): Promise<mongoose.HydratedDocument<IAuth, IAuthMethods> | null>;
  deleteAuth(
    id: string,
  ): Promise<mongoose.HydratedDocument<IAuth, IAuthMethods> | null>;
  searchAuths(
    page: number,
    limit: number,
    searchTerm: string,
  ): Promise<mongoose.HydratedDocument<IAuth, IAuthMethods>[]>;
}

const authSchema = new mongoose.Schema<IAuth, AuthModel, IAuthMethods>(
  {
    password: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
    },
    passwordHistories: {
      type: [
        {
          password: {
            type: String,
            required: true,
            trim: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
      unique: true,
      trim: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.roles,
    },
    passkeys: {
      type: [
        {
          credentialID: {
            type: String,
            required: true,
            trim: true,
          },
          publicKey: {
            type: String,
            required: true,
            trim: true,
          },
          counter: {
            type: Number,
            required: true,
            trim: true,
          },
          transports: {
            type: [String],
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

authSchema.plugin(toJSON as any);
authSchema.plugin(paginate as any);

class AuthClass {
  static async createAuth(this: AuthModel, authData: IAuth) {
    return await this.create(authData);
  }

  static async getAuthById(this: AuthModel, id: string) {
    return await this.findById(id).exec();
  }

  static async updateAuth(
    this: AuthModel,
    id: string,
    updateData: Partial<IAuth>,
  ) {
    return await this.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  static async deleteAuth(this: AuthModel, id: string) {
    return await this.findByIdAndDelete(id).exec();
  }

  static async searchAuths(
    this: AuthModel,
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
        populate: "roleId",
      },
      {
        $or: [{ username: searchRegex }],
      },
    );
  }
}

authSchema.loadClass(AuthClass);

const AuthModel = mongoose.model<IAuth, AuthModel>(
  collections.auths,
  authSchema,
);

export default AuthModel;
