import { ReviewModerationQueryKey } from "./config";
import ReviewModerationService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetReviewModerationQueue = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [ReviewModerationQueryKey.GetQueue, params],
    queryFn: () => ReviewModerationService.GetQueue(params),
  });
};
