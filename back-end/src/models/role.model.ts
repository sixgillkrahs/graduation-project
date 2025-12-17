import mongoose, { SortOrder } from "mongoose";
import toJSON from "./plugins/toJSON.plugin";
import paginate from "./plugins/paginate.plugin";
import collections from "./config/collections";

export interface IRole {
  name: string;
  permissionIds: mongoose.Schema.Types.ObjectId[];
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRoleMethods {}

interface RoleModel extends mongoose.Model<IRole, {}, IRoleMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<IRole, IRoleMethods>[]>;
  createRole(
    role: IRole,
  ): Promise<mongoose.HydratedDocument<IRole, IRoleMethods>>;
  getRoleById(
    id: string,
  ): Promise<mongoose.HydratedDocument<IRole, IRoleMethods> | null>;
  updateRole(
    id: string,
    role: Partial<IRole>,
  ): Promise<mongoose.HydratedDocument<IRole, IRoleMethods> | null>;
  deleteRole(
    id: string,
  ): Promise<mongoose.HydratedDocument<IRole, IRoleMethods> | null>;
  searchRoles(
    page: number,
    limit: number,
    searchTerm: string,
  ): Promise<mongoose.HydratedDocument<IRole, IRoleMethods>[]>;
}

const roleSchema = new mongoose.Schema<IRole, RoleModel, IRoleMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    permissionIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: collections.permissions,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

roleSchema.plugin(toJSON as any);
roleSchema.plugin(paginate as any);

class RoleClass {
  static async createRole(this: RoleModel, roleData: IRole) {
    return await this.create(roleData);
  }

  static async getRoleById(this: RoleModel, id: string) {
    return await this.findById(id).exec();
  }

  static async updateRole(
    this: RoleModel,
    id: string,
    updateData: Partial<IRole>,
  ) {
    return await this.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  static async deleteRole(this: RoleModel, id: string) {
    return await this.findByIdAndDelete(id).exec();
  }

  static async searchRoles(
    this: RoleModel,
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
        populate: "resource",
      },
      {
        $or: [{ name: searchRegex }, { description: searchRegex }],
      },
    );
  }
}

roleSchema.loadClass(RoleClass);

const RoleModel = mongoose.model<IRole, RoleModel>(
  collections.roles,
  roleSchema,
);

export default RoleModel;
