import { singleton } from "@/decorators/singleton";
import { IPermission } from "@/models/permission.model";
import PermissionModel from "@/models/permission.model";

@singleton
export class PermissionService {
  constructor() {}

  createPermission = async (permission: IPermission) => {
    return await PermissionModel.createPermission(permission);
  };

  getPermissionsPaginated = async (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter?: Record<string, any>,
  ) => {
    filter = filter || {};
    return await PermissionModel.paginate?.(options, filter);
  };

  deletePermission = async (id: string) => {
    return await PermissionModel.findByIdAndDelete(id);
  };

  getPermissionById = async (id: string) => {
    return await PermissionModel.findById(id);
  };

  updatePermission = async (id: string, permission: Partial<IPermission>) => {
    return await PermissionModel.findByIdAndUpdate(id, permission);
  };
}
