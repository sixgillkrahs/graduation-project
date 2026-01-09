import { IPaginationResp, IParamsPagination } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { PropertyEndpoint } from "./config";
import { IProperty } from "./type";

export default class PropertyService {
  public static readonly getProperties = (
    params?: IParamsPagination
  ): Promise<IPaginationResp<IProperty>> => {
    return request({
      url: PropertyEndpoint.getProperties(),
      method: AxiosMethod.GET,
      params,
    });
  };
}
