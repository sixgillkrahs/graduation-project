import AuthService from "./AuthService";
import { useQuery } from "@tanstack/react-query";

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => AuthService.getMe(),
  });
};
