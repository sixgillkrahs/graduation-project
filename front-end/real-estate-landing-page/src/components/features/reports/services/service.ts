import type { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { ReportsEndpoint } from "./config";

export const createReport = (
  payload: IReportService.CreateReportPayload,
): Promise<IResp<IReportService.ReportItem>> => {
  return request({
    url: ReportsEndpoint.create(),
    method: AxiosMethod.POST,
    data: payload,
  });
};
