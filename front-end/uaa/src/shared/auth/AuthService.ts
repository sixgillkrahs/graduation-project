import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IResp } from "@shared/types/service";

interface IUser {
  user: {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
    [k: string]: any;
  };
  roleId: string;
}

export default class AuthService {
  public static readonly refresh = (): Promise<IResp<void>> => {
    return request({
      url: "/auth/refresh-token",
      method: AxiosMethod.POST,
    });
  };

  public static readonly logout = (): Promise<IResp<void>> => {
    return request({
      url: "/auth/logout",
      method: AxiosMethod.POST,
    });
  };

  public static readonly getMe = (): Promise<IResp<IUser>> => {
    return request({
      url: "/auth/me",
      method: AxiosMethod.GET,
    });
  };
}
