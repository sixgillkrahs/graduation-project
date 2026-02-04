import { IPaginationResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { LandlordEndpoint } from "./config";

export default class LandlordService {
  public static readonly getLandlords = (): Promise<IPaginationResp<any>> => {
    return request({
      url: LandlordEndpoint.GetLandlords(),
      method: AxiosMethod.GET,
    });
  };

  public static readonly createLandlord = (data: any): Promise<any> => {
    return request({
      url: LandlordEndpoint.CreateLandlord(),
      method: AxiosMethod.POST,
      data,
    });
  };
}
