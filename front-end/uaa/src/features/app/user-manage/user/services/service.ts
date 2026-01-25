import { UserEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { Id, IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class UserService {
  public static readonly GetUsers = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IUserService.UsersDTO>> => {
    return request({
      url: UserEndpoint.GetUsers(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly GetUserById = (id: Id): Promise<IResp<IUserService.UserDTO>> => {
    return request({
      url: UserEndpoint.GetUser(id),
      method: AxiosMethod.GET,
    });
  };
}
