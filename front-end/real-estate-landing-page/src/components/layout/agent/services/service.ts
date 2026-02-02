import { IPaginationResp, IParamsPagination } from "@/@types/service";
import request from "@/lib/axios/request";
import { NoticeEndpoint } from "./config";
import { INoticeDto } from "../dto/notice.dto";
import { AxiosMethod } from "@/lib/axios/method";

export default class NoticeService {
  public static readonly getMyNotices = (
    params?: IParamsPagination,
  ): Promise<IPaginationResp<INoticeDto>> => {
    return request({
      url: NoticeEndpoint.getMyNotices(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly markAsRead = (id: string) => {
    return request({
      url: NoticeEndpoint.readNotice(id),
      method: AxiosMethod.PATCH,
    });
  };

  public static readonly deleteAllNotices = () => {
    return request({
      url: NoticeEndpoint.deleteAllNotices(),
      method: AxiosMethod.DELETE,
    });
  };

  public static readonly deleteNotice = (id: string) => {
    return request({
      url: NoticeEndpoint.deleteNotice(id),
      method: AxiosMethod.DELETE,
    });
  };
}
