import { ReportInboxQueryKey } from "./config";
import ReportInboxService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetReportInbox = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [ReportInboxQueryKey.list, params],
    queryFn: () => ReportInboxService.getList(params),
  });
};
