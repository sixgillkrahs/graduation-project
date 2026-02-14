import { IParamsPagination } from "@/@types/service";
import { useQuery } from "@tanstack/react-query";
import { DashboardQueryKey } from "./config";
import DashboardService from "./service";
import { format } from "date-fns";

export const useCountPropertiesByAgent = (period?: string) => {
  return useQuery({
    queryKey: [DashboardQueryKey.countPropertiesByAgent, period],
    queryFn: () => DashboardService.countPropertiesByAgent(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCountTotalView = (period?: string) => {
  return useQuery({
    queryKey: [DashboardQueryKey.countTotalView, period],
    queryFn: () => DashboardService.countTotalView(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCountSoldPropertiesByAgent = (period?: string) => {
  return useQuery({
    queryKey: [DashboardQueryKey.countSoldPropertiesByAgent, period],
    queryFn: () => DashboardService.countSoldPropertiesByAgent(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetSchedulesToday = () => {
  const today = format(new Date(), "yyyy-MM-dd");
  return useQuery({
    queryKey: [DashboardQueryKey.getSchedulesToday, today],
    queryFn: () =>
      DashboardService.getSchedulesToday({
        start: `${today} 00:00:00`,
        end: `${today} 23:59:59`,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetAnalytics = (period?: string) => {
  return useQuery({
    queryKey: [DashboardQueryKey.analytics, period],
    queryFn: () => DashboardService.getAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
