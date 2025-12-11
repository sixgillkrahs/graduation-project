import { singleton } from "@/decorators/singleton";
import RoleModel, { IRole } from "@/models/role.model";

@singleton
export class RoleService {
  constructor() {}

  createRole = async (role: IRole) => {
    return await RoleModel.createRole(role);
  };

  getRolePaginated = async (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter?: Record<string, any>,
  ) => {
    filter = filter || {};
    return await RoleModel.paginate?.(options, filter);
  };

  updateRole = async (id: string, role: IRole) => {
    return await RoleModel.updateRole(id, role);
  };

  deleteRole = async (id: string) => {
    return await RoleModel.deleteRole(id);
  };

  changeStatus = async (id: string, status: boolean) => {
    return await RoleModel.findByIdAndUpdate(id, { isActive: status });
  };

  changeDefaultStatus = async (id: string, status: boolean) => {
    return await RoleModel.findByIdAndUpdate(id, { isDefault: status });
  };
}
