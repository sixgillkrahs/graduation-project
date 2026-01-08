import AuthService from "./AuthService";
import { useQuery } from "@tanstack/react-query";

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const resp = await AuthService.getMe();
        if (resp?.success) {
          localStorage.setItem("isLoggedIn", "true");
        }
        return resp;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 0,
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};
