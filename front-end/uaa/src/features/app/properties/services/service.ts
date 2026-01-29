import type { IProperty } from "../model/property.model";
import { PropertiesEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class PropertiesService {
  public static readonly GetPropertiesPending = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IProperty>> => {
    return request({
      url: PropertiesEndpoint.GetPropertiesPending(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly GetPropertyDetail = (id: string): Promise<IResp<IProperty>> => {
    return request({
      url: PropertiesEndpoint.GetPropertyDetail(id),
      method: AxiosMethod.GET,
    });
  };

  public static readonly UpdateProperty = (
    id: string,
    payload: Partial<IProperty>,
  ): Promise<IProperty> => {
    return request({
      url: PropertiesEndpoint.UpdateProperty(id),
      method: AxiosMethod.PUT,
      data: payload,
    });
  };

  public static readonly ApproveProperty = (id: string): Promise<IProperty> => {
    return request({
      url: PropertiesEndpoint.ApproveProperty(id),
      method: AxiosMethod.PATCH,
    });
  };

  public static readonly RejectProperty = (id: string): Promise<IProperty> => {
    return request({
      url: PropertiesEndpoint.RejectProperty(id),
      method: AxiosMethod.PATCH,
    });
  };
}
