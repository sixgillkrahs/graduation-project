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

export const useGetRevenueSummary = (currency: "VND" | "USD") => {
  return useQuery({
    queryKey: [DashboardQueryKey.revenueSummary, currency],
    queryFn: () => DashboardService.getRevenueSummary(currency),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetSalesLog = (currency: "VND" | "USD", limit = 5) => {
  return useQuery({
    queryKey: [DashboardQueryKey.salesLog, currency, limit],
    queryFn: () => DashboardService.getSalesLog(currency, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetRevenueLeaderboard = (
  currency: "VND" | "USD",
  limit = 10,
) => {
  return useQuery({
    queryKey: [DashboardQueryKey.revenueLeaderboard, currency, limit],
    queryFn: () => DashboardService.getRevenueLeaderboard(currency, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
