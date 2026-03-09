import { IPaginationResp, IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { DashboardEndpoint } from "./config";
import { IScheduleDTO } from "../../schedule/dto/schedule.dto";
import {
  IRevenueLeaderboardDto,
  IRevenueSummaryDto,
  ISalesLogItemDto,
} from "../dto/revenue.dto";

export default class DashboardService {
  public static readonly countPropertiesByAgent = (
    period?: string,
  ): Promise<
    IResp<{
      count: number;
    }>
  > => {
    return request({
      url: DashboardEndpoint.countPropertiesByAgent(period),
      method: AxiosMethod.GET,
    });
  };

  public static readonly countTotalView = (
    period?: string,
  ): Promise<
    IResp<{
      totalViews: number;
    }>
  > => {
    return request({
      url: DashboardEndpoint.countTotalView(period),
      method: AxiosMethod.GET,
    });
  };

  public static readonly countSoldPropertiesByAgent = (
    period?: string,
  ): Promise<
    IResp<{
      count: number;
    }>
  > => {
    return request({
      url: DashboardEndpoint.countSoldPropertiesByAgent(period),
      method: AxiosMethod.GET,
    });
  };

  public static readonly getSchedulesToday = (
    params: any,
  ): Promise<IPaginationResp<IScheduleDTO>> => {
    return request({
      url: DashboardEndpoint.getSchedulesToday(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly getAnalytics = (
    period?: string,
  ): Promise<
    IResp<
      {
        label: string;
        views: number;
        leads: number;
      }[]
    >
  > => {
    return request({
      url: DashboardEndpoint.analytics(period),
      method: AxiosMethod.GET,
    });
  };

  public static readonly getRevenueSummary = (
    currency: "VND" | "USD",
  ): Promise<IResp<IRevenueSummaryDto>> => {
    return request({
      url: DashboardEndpoint.revenueSummary(currency),
      method: AxiosMethod.GET,
    });
  };

  public static readonly getSalesLog = (
    currency: "VND" | "USD",
    limit = 5,
  ): Promise<IPaginationResp<ISalesLogItemDto>> => {
    return request({
      url: DashboardEndpoint.salesLog(currency, limit),
      method: AxiosMethod.GET,
    });
  };

  public static readonly getRevenueLeaderboard = (
    currency: "VND" | "USD",
    limit = 10,
  ): Promise<IResp<IRevenueLeaderboardDto>> => {
    return request({
      url: DashboardEndpoint.revenueLeaderboard(currency, limit),
      method: AxiosMethod.GET,
    });
  };
}
