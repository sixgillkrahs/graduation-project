import { SignInEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IResp } from "@shared/types/service";

export default class SignInService {
  public static readonly signIn = (
    data: ISignInService.SignInRequest,
  ): Promise<IResp<ISignInService.SignInResponse>> => {
    return request({
      url: SignInEndpoint.SignIn(),
      method: AxiosMethod.POST,
      data,
    });
  };
}
