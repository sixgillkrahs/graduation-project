import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";

interface IUser {
  userId: {
    _id: string;
    fullName: string;
    email: string;
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

  public static readonly logout = (): Promise<IResp<{ message: string }>> => {
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
