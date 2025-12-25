import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IResp } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

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

const getMe = (): Promise<IResp<IUser>> => {
  return request({
    url: "/auth/me",
    method: AxiosMethod.GET,
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
  });
};
