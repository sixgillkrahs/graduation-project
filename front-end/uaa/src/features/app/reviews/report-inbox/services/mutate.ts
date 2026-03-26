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

export const useResolveReport = () => {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: IReportNoticeService.ResolveBody }) =>
      ReportInboxService.resolve(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ReportInboxQueryKey.list],
      });
      queryClient.invalidateQueries({
        queryKey: [ReportInboxQueryKey.detail, variables.id],
      });
    },
  });
};
