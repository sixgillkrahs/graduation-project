import { useQuery } from "@tanstack/react-query";
import { ReviewInvitationKey } from "./config";
import ReviewInvitationService from "./service";

export const useGetReviewInvitation = (token: string) => {
  return useQuery({
    queryKey: [ReviewInvitationKey.getInvitation, token],
    queryFn: () => ReviewInvitationService.getInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });
};
