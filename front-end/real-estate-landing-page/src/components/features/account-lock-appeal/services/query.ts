import { useQuery } from "@tanstack/react-query";
import AccountLockAppealService from "./service";

export const useGetAccountLockAppealContext = (token: string) => {
  return useQuery({
    queryKey: ["AccountLockAppealContext", token],
    queryFn: () => AccountLockAppealService.getContext(token),
    enabled: !!token,
    retry: false,
  });
};
