import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";
import ResourceModel from "./resource.model";

export enum Operation {
  Read = "read",
  Create = "create",
  Update = "update",
  Delete = "delete",
  Approve = "approve",
  Export = "export",
}

export interface IPermission {
  name: string;
  description: string;
  resourceId: mongoose.Schema.Types.ObjectId;
  operation: Operation;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPermissionMethods {}

interface PermissionModel
  extends mongoose.Model<IPermission, {}, IPermissionMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
  ) => Promise<mongoose.HydratedDocument<IPermission, IPermissionMethods>[]>;
  createPermission(
    permission: IPermission,
  ): Promise<mongoose.HydratedDocument<IPermission, IPermissionMethods>>;
  getPermissionById(
    id: string,
  ): Promise<mongoose.HydratedDocument<IPermission, IPermissionMethods> | null>;
  updatePermission(
    id: string,
    permission: Partial<IPermission>,
  ): Promise<mongoose.HydratedDocument<IPermission, IPermissionMethods> | null>;
  deletePermission(
    id: string,
  ): Promise<mongoose.HydratedDocument<IPermission, IPermissionMethods> | null>;
  searchPermissions(
    page: number,
    limit: number,
    searchTerm: string,
  ): Promise<mongoose.HydratedDocument<IPermission, IPermissionMethods>[]>;
}

const permissionSchema = new mongoose.Schema<
  IPermission,
  PermissionModel,
  IPermissionMethods
>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.resources,
    },
    operation: {
      type: String,
      enum: Operation,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

permissionSchema.plugin(toJSON as any);
permissionSchema.plugin(paginate as any);

class PermissionClass {
  static async createPermission(
    this: PermissionModel,
    permissionData: IPermission,
  ) {
    return await this.create(permissionData);
  }

  static async getPermissionById(this: PermissionModel, id: string) {
    return await this.findById(id).exec();
  }

  static async updatePermission(
    this: PermissionModel,
    id: string,
    updateData: Partial<IPermission>,
  ) {
    return await this.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  static async deletePermission(this: PermissionModel, id: string) {
    return await this.findByIdAndDelete(id).exec();
  }

  static async searchPermissions(
    this: PermissionModel,
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

  getSummary(this: mongoose.HydratedDocument<IPermission, IPermissionMethods>) {
    return {
      name: this.name,
      description: this.description?.substring(0, 100) + "...",
      createdAt: this.createdAt,
      resource: this.resourceId,
      operation: this.operation,
    };
  }
}

permissionSchema.loadClass(PermissionClass);

const PermissionModel = mongoose.model<IPermission, PermissionModel>(
  collections.permissions,
  permissionSchema,
);

export default PermissionModel;
