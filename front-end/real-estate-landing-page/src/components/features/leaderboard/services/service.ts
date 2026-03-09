import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { LeaderboardEndpoint } from "./config";

export interface LeaderboardEntry {
  agentUserId: string;
  fullName: string;
  avatarUrl?: string;
  revenue: number;
  deals: number;
  rank: number;
  latestSoldAt?: string;
}

export interface LeaderboardResponse {
  month: number;
  year: number;
  currency: string;
  results: LeaderboardEntry[];
}

export default class LeaderboardService {
  public static readonly getPublicLeaderboard = (params?: {
    month?: number;
    year?: number;
    currency?: string;
    limit?: number;
  }): Promise<IResp<LeaderboardResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.month) searchParams.set("month", String(params.month));
    if (params?.year) searchParams.set("year", String(params.year));
    if (params?.currency) searchParams.set("currency", params.currency);
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();

    return request({
      url: `${LeaderboardEndpoint.publicLeaderboard}${query ? `?${query}` : ""}`,
      method: AxiosMethod.GET,
    });
  };
}
