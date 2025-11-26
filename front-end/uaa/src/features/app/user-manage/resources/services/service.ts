import { ResourceEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IPaginationResp, IParamsPagination } from "@shared/types/service";

export default class ResourceService {
  public static readonly INITIAL_VISIBLE_COLUMNS = [
    "name",
    "description",
    "createdAt",
    "updatedAt",
  ];
  public static readonly columns = [
    { name: "ID", uid: "id", sortable: true },
    { name: "NAME", uid: "name", sortable: true },
    { name: "DESCRIPTION", uid: "description", sortable: true },
    { name: "CREATED_AT", uid: "createdAt", sortable: true },
    { name: "UPDATED_AT", uid: "updatedAt" },
  ];
  public static readonly getResources = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IResourceService.ResourceDTO[]>> => {
    return request({
      url: ResourceEndpoint.GetResources(),
      method: AxiosMethod.GET,
      params,
    });
  };
}
