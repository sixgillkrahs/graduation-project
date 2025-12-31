import { RoleEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { Id, IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class RoleService {
  public static readonly GetRoles = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IRoleService.RoleDTO>> => {
    return request({
      url: RoleEndpoint.GetRoles(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly DeleteRole = (id: Id): Promise<IResp<void>> => {
    return request({
      url: RoleEndpoint.DeleteRole(id),
      method: AxiosMethod.DELETE,
    });
  };

  public static readonly CreateRole = (role: IRoleService.CreateRoleDTO): Promise<IResp<void>> => {
    return request({
      url: RoleEndpoint.CreateRole(),
      method: AxiosMethod.POST,
      data: role,
    });
  };

  public static readonly GetRoleById = (id: Id): Promise<IResp<IRoleService.RoleDTO>> => {
    return request({
      url: RoleEndpoint.GetRoleById(id),
      method: AxiosMethod.GET,
    });
  };

  public static readonly UpdateRole = (role: IRoleService.UpdateRoleDTO): Promise<IResp<void>> => {
    return request({
      url: RoleEndpoint.UpdateRole(role.id),
      method: AxiosMethod.PUT,
      data: role,
    });
  };

  //   public static readonly ChangeStatusPermission = (
  //     permission: IPermissionService.UpdatePermissionStatusDTO,
  //   ): Promise<IResp<void>> => {
  //     return request({
  //       url: PermissionEndpoint.UpdatePermission(permission.id),
  //       method: AxiosMethod.PATCH,
  //       data: permission,
  //     });
  //   };
}
