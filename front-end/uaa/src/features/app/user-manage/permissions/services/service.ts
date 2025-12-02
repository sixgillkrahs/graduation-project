import { PermissionEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class PermissionService {
  public static readonly OPERATION: IPermissionService.IOperation[] = [
    {
      value: "create",
      label: "Create",
      color: "#49cc90",
    },
    { value: "read", label: "Read", color: "#61affe" },
    { value: "update", label: "Update", color: "#fca130" },
    { value: "delete", label: "Delete", color: "#f93e3e" },
    { value: "approve", label: "Approve", color: "#49cc90" },
    { value: "export", label: "Export", color: "#61affe" },
  ];

  public static readonly GetPermissions = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IPermissionService.PermissionDTO>> => {
    return request({
      url: PermissionEndpoint.GetPermissions(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly DeletePermission = (id: string | number): Promise<IResp<void>> => {
    return request({
      url: PermissionEndpoint.DeletePermission(id),
      method: AxiosMethod.DELETE,
    });
  };

  public static readonly CreatePermission = (
    permission: IPermissionService.CreatePermissionDTO,
  ): Promise<IResp<void>> => {
    return request({
      url: PermissionEndpoint.CreatePermission(),
      method: AxiosMethod.POST,
      data: permission,
    });
  };

  public static readonly GetPermissionById = (
    id: string | number,
  ): Promise<IResp<IPermissionService.PermissionDTO>> => {
    return request({
      url: PermissionEndpoint.GetPermissionById(id),
      method: AxiosMethod.GET,
    });
  };

  public static readonly UpdatePermission = (
    permission: IPermissionService.UpdatePermissionDTO,
  ): Promise<IResp<void>> => {
    return request({
      url: PermissionEndpoint.UpdatePermission(permission.id),
      method: AxiosMethod.PUT,
      data: permission,
    });
  };

  public static readonly ChangeStatusPermission = (
    permission: IPermissionService.UpdatePermissionStatusDTO,
  ): Promise<IResp<void>> => {
    return request({
      url: PermissionEndpoint.UpdatePermission(permission.id),
      method: AxiosMethod.PATCH,
      data: permission,
    });
  };
}
