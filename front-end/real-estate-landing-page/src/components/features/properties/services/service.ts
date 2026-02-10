import { IPaginationResp, IParamsPagination } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { PropertyDto } from "../dto/property.dto";
import { PropertyEndpoint } from "./config";

export default class PropertyService {
  public static readonly onSale = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<PropertyDto>> => {
    return request({
      url: PropertyEndpoint.onSale(),
      method: AxiosMethod.GET,
      params,
    });
  };
}
