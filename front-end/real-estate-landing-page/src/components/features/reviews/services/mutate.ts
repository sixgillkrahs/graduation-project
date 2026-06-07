import { queryClient } from "@/lib/react-query/queryClient";
import { useMutation } from "@tanstack/react-query";
import { ReviewsQueryKey } from "./config";
import ReviewsService from "./service";

const replaceReviewInPaginatedCache = <
  T extends
    | IReviewService.AgentListResponse
    | IReviewService.PublicListResponse,
>(
  cache: { data?: T } | undefined,
  review: IReviewService.ReviewItem,
) => {
  if (!cache?.data?.results?.length) {
    return cache;
  }

  let hasUpdatedReview = false;
  const nextResults = cache.data.results.map((currentReview) => {
    if (currentReview.id !== review.id) {
      return currentReview;
    }

    hasUpdatedReview = true;
    return {
      ...currentReview,
      ...review,
    };
  });

  if (!hasUpdatedReview) {
    return cache;
  }

  return {
    ...cache,
    data: {
      ...cache.data,
      results: nextResults,
    },
  };
};

const syncReviewCaches = (review: IReviewService.ReviewItem) => {
  queryClient.setQueriesData(
    {
      queryKey: [ReviewsQueryKey.myList],
    },
    (cache: { data?: IReviewService.AgentListResponse } | undefined) =>
      replaceReviewInPaginatedCache(cache, review),
  );

  queryClient.setQueriesData(
    {
      queryKey: [ReviewsQueryKey.publicList],
    },
    (cache: { data?: IReviewService.PublicListResponse } | undefined) =>
      replaceReviewInPaginatedCache(cache, review),
  );
};

export const useReplyReview = () => {
  return useMutation({
    mutationFn: (payload: IReviewService.ReplyPayload) =>
      ReviewsService.replyToReview(payload),
    meta: {
      ERROR_SOURCE: "Không thể gửi phản hồi",
      SUCCESS_MESSAGE: "Đã gửi phản hồi cho khách hàng",
    },
    onSuccess: (response) => {
      syncReviewCaches(response.data);
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.myList],
      });
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.publicList],
      });
    },
  });
};

export const useCreateAgentReview = () => {
  return useMutation({
    mutationFn: (payload: IReviewService.CreateAgentReviewPayload) =>
      ReviewsService.createByAgent(payload),
    meta: {
      ERROR_SOURCE: "Khong the gui danh gia",
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.publicList, variables.agentUserId],
      });
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.eligibility, variables.agentUserId],
      });
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.myList],
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
    onSuccess: (response) => {
      syncReviewCaches(response.data);
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
    onSuccess: (response) => {
      syncReviewCaches(response.data);
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
    onSuccess: (response) => {
      syncReviewCaches(response.data);
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
    onSuccess: (response) => {
      syncReviewCaches(response.data);
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.myList],
      });
      queryClient.invalidateQueries({
        queryKey: [ReviewsQueryKey.publicList],
      });
    },
  });
};
