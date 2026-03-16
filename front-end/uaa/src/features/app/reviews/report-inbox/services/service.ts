import { ReportInboxEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IParamsPagination, IResp } from "@shared/types/service";

export default class ReportInboxService {
  public static readonly getList = (
    params: IParamsPagination,
  ): Promise<IResp<IReportNoticeService.ReportNoticeListResponse>> => {
    return request({
      url: ReportInboxEndpoint.list(),
      method: AxiosMethod.GET,
      params: {
        ...params,
        type: "REPORT",
      },
    });
  };

  public static readonly markAsRead = (
    id: string,
  ): Promise<IResp<IReportNoticeService.ReportNoticeDTO>> => {
    return request({
      url: ReportInboxEndpoint.markAsRead(id),
      method: AxiosMethod.PATCH,
    });
  };
}
