import { useMutation } from "@tanstack/react-query";
import ReviewInvitationService from "./service";

export const useCreateReview = () => {
  return useMutation({
    mutationFn: (data: IReviewInvitationService.CreateReviewPayload) =>
      ReviewInvitationService.createReview(data),
    meta: {
      ERROR_SOURCE: "notifications.error",
    },
  });
};
