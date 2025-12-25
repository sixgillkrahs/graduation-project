import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IResp } from "@shared/types/service";

export default class AuthService {
  public static readonly refresh = (): Promise<IResp<void>> => {
    return request({
      url: "/auth/refresh-token",
      method: AxiosMethod.POST,
    });
  };
}
