import { IParamsPagination } from "@/@types/service";
import { useQuery } from "@tanstack/react-query";
import { DashboardQueryKey } from "./config";
import DashboardService from "./service";

export const useCountPropertiesByAgent = () => {
  return useQuery({
    queryKey: [DashboardQueryKey.countPropertiesByAgent],
    queryFn: () => DashboardService.countPropertiesByAgent(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
