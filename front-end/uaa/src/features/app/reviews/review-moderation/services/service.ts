import { ReviewModerationEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class ReviewModerationService {
  public static readonly GetQueue = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IReviewModerationService.ReviewDTO>> => {
    return request({
      url: ReviewModerationEndpoint.GetQueue(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly Approve = (
    reviewId: string,
    note?: string,
  ): Promise<IResp<IReviewModerationService.ReviewDTO>> => {
    return request({
      url: ReviewModerationEndpoint.Approve(reviewId),
      method: AxiosMethod.PATCH,
      data: note ? { note } : {},
    });
  };

  public static readonly Reject = (
    reviewId: string,
    note?: string,
  ): Promise<IResp<IReviewModerationService.ReviewDTO>> => {
    return request({
      url: ReviewModerationEndpoint.Reject(reviewId),
      method: AxiosMethod.PATCH,
      data: note ? { note } : {},
    });
  };
}
