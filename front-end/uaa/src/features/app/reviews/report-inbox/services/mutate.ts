import { ReportInboxQueryKey } from "./config";
import ReportInboxService from "./service";
import { queryClient } from "@shared/queryClient";
import { useMutation } from "@tanstack/react-query";

export const useMarkReportNoticeAsRead = () => {
  return useMutation({
    mutationFn: (id: string) => ReportInboxService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ReportInboxQueryKey.list],
      });
    },
  });
};
