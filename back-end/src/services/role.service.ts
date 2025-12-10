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
}
