import { ReviewModerationQueryKey } from "./config";
import ReviewModerationService from "./service";
import { queryClient } from "@shared/queryClient";
import { useMutation } from "@tanstack/react-query";

export const useApproveReview = () => {
  return useMutation({
    mutationFn: ({ reviewId, note }: { reviewId: string; note?: string }) =>
      ReviewModerationService.Approve(reviewId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ReviewModerationQueryKey.GetQueue],
      });
    },
  });
};

export const useRejectReview = () => {
  return useMutation({
    mutationFn: ({ reviewId, note }: { reviewId: string; note?: string }) =>
      ReviewModerationService.Reject(reviewId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ReviewModerationQueryKey.GetQueue],
      });
    },
  });
};
