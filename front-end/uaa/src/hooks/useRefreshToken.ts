import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import { useMutation } from "@tanstack/react-query";

const refreshToken = (): Promise<void> => {
  return request({
    url: "/auth/refresh-token",
    method: AxiosMethod.POST,
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationKey: ["refresh-token"],
    mutationFn: () => refreshToken(),
  });
};
