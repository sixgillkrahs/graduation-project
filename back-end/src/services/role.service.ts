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
    select?: string,
  ) => {
    filter = filter || {};
    return await RoleModel.paginate?.(options, filter, select);
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

  getRoleById = async (id: string) => {
    return await RoleModel.findById(id).lean().exec();
  };

  getRoleDefault = async () => {
    return await RoleModel.findOne({ isDefault: true });
  };

  getRoleByCode = async (code: string) => {
    return await RoleModel.findOne({ code: code });
  };
}
