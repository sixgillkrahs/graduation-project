import { queryClient } from "@/lib/react-query/queryClient";
import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { NoticeKey } from "./config";
import NoticeService from "./service";

export const useDeleteAllNotices = (): UseMutationResult<
  any,
  Error,
  void,
  void
> => {
  return useMutation({
    mutationFn: () => NoticeService.deleteAllNotices(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NoticeKey.getMyNotices] });
    },
  });
};

export const useReadNotice = (): UseMutationResult<
  any,
  Error,
  string,
  void
> => {
  return useMutation({
    mutationFn: (id: string) => NoticeService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NoticeKey.getMyNotices] });
    },
  });
};

export const useDeleteNotice = (): UseMutationResult<
  any,
  Error,
  string,
  void
> => {
  return useMutation({
    mutationFn: (id: string) => NoticeService.deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NoticeKey.getMyNotices] });
    },
  });
};
