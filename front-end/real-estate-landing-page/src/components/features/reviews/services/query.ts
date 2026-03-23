import { useQuery } from "@tanstack/react-query";
import { ReviewsQueryKey } from "./config";
import ReviewsService from "./service";

export const useGetPublicAgentReviews = (
  agentUserId: string,
  params?: IReviewService.GetPublicParams,
) => {
  return useQuery({
    queryKey: [ReviewsQueryKey.publicList, agentUserId, params],
    queryFn: () => ReviewsService.getPublicByAgent(agentUserId, params),
    enabled: Boolean(agentUserId),
  });
};

export const useGetAgentReviewEligibility = (
  agentUserId: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: [ReviewsQueryKey.eligibility, agentUserId],
    queryFn: () => ReviewsService.getEligibilityByAgent(agentUserId),
    enabled: enabled && Boolean(agentUserId),
    retry: false,
  });
};

export const useGetMyReviews = (params?: IReviewService.GetMyParams) => {
  return useQuery({
    queryKey: [ReviewsQueryKey.myList, params],
    queryFn: () => ReviewsService.getMyReviews(params),
  });
};
