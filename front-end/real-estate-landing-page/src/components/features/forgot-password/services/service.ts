import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { ForgotPasswordEndpoint } from "./config";

export default class ForgotPasswordService {
  public static readonly forgotPassword = (
    data: IForgotPasswordService.IBodyForgotPassword
  ): Promise<IResp<void>> => {
    return request({
      url: ForgotPasswordEndpoint.forgotPassword(),
      method: AxiosMethod.POST,
      data,
    });
  };

  public static readonly verifyOTP = (
    data: IForgotPasswordService.IBodyVerifyOTP
  ): Promise<IResp<IForgotPasswordService.IRespVerifyOTP>> => {
    return request({
      url: ForgotPasswordEndpoint.verifyOTP(),
      method: AxiosMethod.POST,
      data,
    });
  };

  public static readonly resetPassword = (
    data: IForgotPasswordService.IBodyResetPassword
  ): Promise<IResp<void>> => {
    return request({
      url: ForgotPasswordEndpoint.resetPassword(),
      method: AxiosMethod.POST,
      data,
    });
  };
}
