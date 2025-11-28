import { PermissionEndpoint } from "./config";
import type { ChipProps } from "@heroui/chip";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IColumn, IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class PermissionService {
  public static readonly INITIAL_VISIBLE_COLUMNS = [
    "name",
    "description",
    "createdAt",
    "updatedAt",
    "action",
  ];
  public static readonly columns: IColumn[] = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "RESOURCE", uid: "resourceId.name", sortable: true },
    { name: "OPERATION", uid: "operation", sortable: true },
    { name: "ACTIVE", uid: "isActive", sortable: true },
  ];
  public static readonly operationConfig: Record<string, { color: ChipProps["color"] }> = {
    create: { color: "success" },
    read: { color: "primary" },
    update: { color: "warning" },
    delete: { color: "danger" },
    approve: { color: "secondary" },
    export: { color: "default" },
  };

  public static readonly GetPermissions = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IPermissionService.PermissionDTO>> => {
    return request({
      url: PermissionEndpoint.GetPermissions(),
      method: AxiosMethod.GET,
      params,
    });
  };
}
