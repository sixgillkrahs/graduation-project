import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { ProfileEndpoint } from "./config";
import { RegistrationResponseJSON } from "@simplewebauthn/browser";

export default class ProfileService {
  public static readonly profile = (): Promise<
    IResp<IProfileService.ProfileUserDTO>
  > => {
    return request({
      url: ProfileEndpoint.profile(),
      method: AxiosMethod.GET,
    });
  };

  public static readonly changePassword = (
    data: IProfileService.ChangePasswordRequest,
  ): Promise<IResp<void>> => {
    return request({
      url: ProfileEndpoint.changePassword(),
      method: AxiosMethod.PUT,
      data,
    });
  };

  public static readonly registerPasskey = (): Promise<
    IResp<{ option: any }>
  > => {
    return request({
      url: ProfileEndpoint.registerPasskey(),
      method: AxiosMethod.POST,
    });
  };

  public static readonly verifyPasskey = (
    data: RegistrationResponseJSON,
  ): Promise<IResp<void>> => {
    return request({
      url: ProfileEndpoint.verifyPasskey(),
      method: AxiosMethod.POST,
      data,
    });
  };
}
