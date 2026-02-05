import { IPaginationResp, IParamsPagination, IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { CreateLandlordRequest, ILandlord } from "../dto/landlord.model";
import { LandlordEndpoint } from "./config";

export default class LandlordService {
  public static readonly getLandlords = (
    pagination: IParamsPagination,
  ): Promise<IPaginationResp<any>> => {
    return request({
      url: LandlordEndpoint.GetLandlords(),
      method: AxiosMethod.GET,
      params: pagination,
    });
  };

  public static readonly createLandlord = (
    data: CreateLandlordRequest,
  ): Promise<any> => {
    return request({
      url: LandlordEndpoint.CreateLandlord(),
      method: AxiosMethod.POST,
      data,
    });
  };

  public static readonly deleteLandlord = (id: string): Promise<any> => {
    return request({
      url: LandlordEndpoint.DeleteLandlord(id),
      method: AxiosMethod.DELETE,
    });
  };

  public static readonly updateLandlord = (
    id: string,
    data: CreateLandlordRequest,
  ): Promise<any> => {
    return request({
      url: LandlordEndpoint.UpdateLandlord(id),
      method: AxiosMethod.PUT,
      data,
    });
  };

  public static readonly getLandlordDetail = (
    id: string,
  ): Promise<IResp<ILandlord>> => {
    return request({
      url: LandlordEndpoint.GetLandlordDetail(id),
      method: AxiosMethod.GET,
    });
  };
}
