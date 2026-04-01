import "../models.d.ts";
import { PaymentQueryKey } from "./config";
import PaymentService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetUpgradeTransactions = (
  params: IParamsPagination & {
    status?: string;
    planDurationMonths?: number;
    query?: string;
  },
) => {
  return useQuery({
    queryKey: [PaymentQueryKey.getUpgradeTransactions, params],
    queryFn: () => PaymentService.GetUpgradeTransactions(params),
  });
};

export const useGetUpgradeSummary = () => {
  return useQuery({
    queryKey: [PaymentQueryKey.getUpgradeSummary],
    queryFn: () => PaymentService.GetUpgradeSummary(),
  });
};
