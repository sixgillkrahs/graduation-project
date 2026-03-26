import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { AccountLockAppealEndpoint } from "./config";

export default class AccountLockAppealService {
  public static readonly getContext = (
    token: string,
  ): Promise<IResp<IAccountLockAppealService.Context>> => {
    return request({
      url: AccountLockAppealEndpoint.detail(token),
      method: AxiosMethod.GET,
    });
  };

  public static readonly submit = (
    payload: IAccountLockAppealService.SubmitPayload,
  ): Promise<IResp<{ success: boolean }>> => {
    return request({
      url: AccountLockAppealEndpoint.submit(),
      method: AxiosMethod.POST,
      data: payload,
    });
  };
}
