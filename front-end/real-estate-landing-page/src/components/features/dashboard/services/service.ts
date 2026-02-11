import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { DashboardEndpoint } from "./config";

export default class DashboardService {
  public static readonly countPropertiesByAgent = (): Promise<
    IResp<{
      count: number;
    }>
  > => {
    return request({
      url: DashboardEndpoint.countPropertiesByAgent(),
      method: AxiosMethod.GET,
    });
  };
}
