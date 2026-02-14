import { IPaginationResp, IParamsPagination, IResp } from "@/@types/service";
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

  public static readonly getById = (
    id: string,
  ): Promise<IResp<PropertyDto & { isFavorite: boolean }>> => {
    return request({
      url: PropertyEndpoint.getById(id),
      method: AxiosMethod.GET,
    });
  };

  public static readonly increaseView = (id: string): Promise<any> => {
    return request({
      url: PropertyEndpoint.increaseView(id),
      method: AxiosMethod.PATCH,
    });
  };

  public static readonly recordInteraction = (
    id: string,
    type: "VIEW_PHONE" | "CONTACT_FORM" | "SCHEDULE_REQUEST" | "FAVORITE",
    metadata?: any,
  ): Promise<any> => {
    return request({
      url: PropertyEndpoint.interact(id),
      method: AxiosMethod.POST,
      data: { type, metadata },
    });
  };
}
