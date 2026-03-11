import { queryClient } from "@/lib/react-query/queryClient";
import { useMutation } from "@tanstack/react-query";
import { ReviewsQueryKey } from "./config";
import ReviewsService from "./service";

export const useReplyReview = () => {
  return useMutation({
    mutationFn: (payload: IReviewService.ReplyPayload) =>
      ReviewsService.replyToReview(payload),
    meta: {
      ERROR_SOURCE: "Không thể gửi phản hồi",
      SUCCESS_MESSAGE: "Đã gửi phản hồi cho khách hàng",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.myList],
      });
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.publicList],
      });
    },
  });
};

export const useGenerateAutoReply = () => {
  return useMutation({
    mutationFn: (payload: IReviewService.GenerateAutoReplyPayload) =>
      ReviewsService.generateAutoReply(payload),
    meta: {
      ERROR_SOURCE: "Khong the tao goi y AI",
      SUCCESS_MESSAGE: "Da tao goi y AI cho phan hoi",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.myList],
      });
    },
  });
};

export const useApplyAutoReply = () => {
  return useMutation({
    mutationFn: (payload: IReviewService.ApplyAutoReplyPayload) =>
      ReviewsService.applyAutoReply(payload),
    meta: {
      ERROR_SOURCE: "Khong the ap dung goi y AI",
      SUCCESS_MESSAGE: "Da dang phan hoi bang goi y AI",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.myList],
      });
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.publicList],
      });
    },
  });
};

export const useDiscardAutoReply = () => {
  return useMutation({
    mutationFn: (payload: IReviewService.DiscardAutoReplyPayload) =>
      ReviewsService.discardAutoReply(payload),
    meta: {
      ERROR_SOURCE: "Khong the bo goi y AI",
      SUCCESS_MESSAGE: "Da bo goi y AI",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.myList],
      });
    },
  });
};

export const useReportReview = () => {
  return useMutation({
    mutationFn: (payload: IReviewService.ReportPayload) =>
      ReviewsService.reportReview(payload),
    meta: {
      ERROR_SOURCE: "Không thể báo cáo đánh giá",
      SUCCESS_MESSAGE: "Đã chuyển đánh giá cho Admin kiểm tra",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.myList],
      });
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.publicList],
      });
    },
  });
};
