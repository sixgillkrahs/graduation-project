import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { SignInEndpoint } from "./config";

export default class SignInService {
  public static readonly signIn = (
    data: ISignInService.IBodySignIn
  ): Promise<IResp<void>> => {
    return request({
      url: SignInEndpoint.signIn(),
      method: AxiosMethod.POST,
      data,
    });
  };
}
