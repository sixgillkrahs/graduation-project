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

  public static readonly changePassword = (
    data: IProfileService.ChangePasswordRequest
  ): Promise<IResp<void>> => {
    return request({
      url: ProfileEndpoint.changePassword(),
      method: AxiosMethod.PUT,
      data,
    });
  };
}
