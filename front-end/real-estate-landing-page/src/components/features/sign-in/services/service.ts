import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { RegistrationResponseJSON } from "@simplewebauthn/browser";
import { SignInEndpoint } from "./config";

export default class SignInService {
  public static readonly signIn = (
    data: ISignInService.IBodySignIn,
  ): Promise<IResp<ISignInService.ISignInResponse>> => {
    return request({
      url: SignInEndpoint.signIn(),
      method: AxiosMethod.POST,
      data,
    });
  };

  public static readonly signInPasskey = (
    data: ISignInService.IBodySignInPasskey,
  ): Promise<IResp<void>> => {
    return request({
      url: SignInEndpoint.signInPasskey(),
      method: AxiosMethod.POST,
      data,
    });
  };
  public static readonly verifySignInPasskey = (
    data: ISignInService.IBodyVerifySignInPasskey,
  ): Promise<IResp<any>> => {
    return request({
      url: SignInEndpoint.verifySignInPasskey(),
      method: AxiosMethod.POST,
      data,
    });
  };

  public static readonly registerPasskey = (): Promise<IResp<any>> => {
    return request({
      url: SignInEndpoint.registerPasskey(),
      method: AxiosMethod.POST,
    });
  };

  public static readonly verifyPasskey = (
    credential: RegistrationResponseJSON,
  ): Promise<IResp<void>> => {
    return request({
      url: SignInEndpoint.verifyPasskey(),
      method: AxiosMethod.POST,
      data: credential,
    });
  };
}
