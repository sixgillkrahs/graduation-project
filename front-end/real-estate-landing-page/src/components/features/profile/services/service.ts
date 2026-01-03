import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { ProfileEndpoint } from "./config";

export default class ProfileService {
  public static readonly profile = (): Promise<
    IResp<IProfileService.ProfileDTO>
  > => {
    return request({
      url: ProfileEndpoint.profile(),
      method: AxiosMethod.GET,
    });
  };
}
