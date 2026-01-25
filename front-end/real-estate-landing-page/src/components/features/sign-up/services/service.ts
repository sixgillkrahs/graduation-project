import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { SignUpEndpoint } from "./config";

export default class SignInService {
  public static readonly signUp = (
    data: ISignUpService.IBodySignUp
  ): Promise<IResp<void>> => {
    return request({
      url: SignUpEndpoint.signUp(),
      method: AxiosMethod.POST,
      data,
    });
  };
}
