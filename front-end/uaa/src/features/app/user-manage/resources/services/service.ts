import { ResourceEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class ResourceService {
  public static readonly INITIAL_VISIBLE_COLUMNS = [
    "name",
    "description",
    "createdAt",
    "updatedAt",
    "action",
  ];
  public static readonly columns = [
    { name: "ID", uid: "id", sortable: true },
    { name: "NAME", uid: "name", sortable: true },
    { name: "DESCRIPTION", uid: "description", sortable: true },
    { name: "CREATED_AT", uid: "createdAt", sortable: true },
    { name: "UPDATED_AT", uid: "updatedAt", sortable: true },
    { name: "ACTION", uid: "action" },
  ];
  public static readonly getResources = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IResourceService.ResourceDTO>> => {
    return request({
      url: ResourceEndpoint.GetResources(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly getResourcesByFilter = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IResourceService.ResourceDTO>> => {
    return request({
      url: ResourceEndpoint.GetResourcesByFilter(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly deleteResource = (
    id: string,
  ): Promise<IPaginationResp<IResourceService.ResourceDTO>> => {
    return request({
      url: ResourceEndpoint.DeleteResource(id),
      method: AxiosMethod.DELETE,
    });
  };

  public static readonly createResource = (
    resource: IResourceService.CreateResourceDTO,
  ): Promise<IResp<IResourceService.ResourceDTO>> => {
    return request({
      url: ResourceEndpoint.CreateResource(),
      method: AxiosMethod.POST,
      data: resource,
    });
  };

  public static readonly updateResource = (
    resource: IResourceService.UpdateResourceDTO,
  ): Promise<IResp<IResourceService.ResourceDTO>> => {
    const { id, ...rest } = resource;
    return request({
      url: ResourceEndpoint.UpdateResource(id),
      method: AxiosMethod.PUT,
      data: rest,
    });
  };

  public static readonly getResource = (
    id: string,
  ): Promise<IResp<IResourceService.ResourceDTO>> => {
    return request({
      url: ResourceEndpoint.GetResource(id),
      method: AxiosMethod.GET,
    });
  };
}
