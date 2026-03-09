import { useQuery } from "@tanstack/react-query";
import LeaderboardService from "./service";
import { LeaderboardQueryKey } from "./config";

export const usePublicLeaderboard = (params?: {
  month?: number;
  year?: number;
  currency?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [
      LeaderboardQueryKey.publicLeaderboard,
      params?.month,
      params?.year,
      params?.currency,
      params?.limit,
    ],
    queryFn: () => LeaderboardService.getPublicLeaderboard(params),
  });
};
