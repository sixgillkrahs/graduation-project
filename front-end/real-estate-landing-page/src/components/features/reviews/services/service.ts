import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { ReviewsEndpoint } from "./config";

export default class ReviewsService {
  public static readonly getPublicByAgent = (
    agentUserId: string,
    params?: IReviewService.GetPublicParams,
  ): Promise<IResp<IReviewService.PublicListResponse>> => {
    return request({
      url: ReviewsEndpoint.getPublicByAgent(agentUserId),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly getMyReviews = (
    params?: IReviewService.GetMyParams,
  ): Promise<IResp<IReviewService.AgentListResponse>> => {
    return request({
      url: ReviewsEndpoint.getMyReviews(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly replyToReview = (
    payload: IReviewService.ReplyPayload,
  ): Promise<IResp<IReviewService.ReviewItem>> => {
    return request({
      url: ReviewsEndpoint.reply(payload.reviewId),
      method: AxiosMethod.PATCH,
      data: {
        reply: payload.reply,
      },
    });
  };

  public static readonly generateAutoReply = (
    payload: IReviewService.GenerateAutoReplyPayload,
  ): Promise<IResp<IReviewService.ReviewItem>> => {
    return request({
      url: ReviewsEndpoint.generateAutoReply(payload.reviewId),
      method: AxiosMethod.POST,
    });
  };

  public static readonly applyAutoReply = (
    payload: IReviewService.ApplyAutoReplyPayload,
  ): Promise<IResp<IReviewService.ReviewItem>> => {
    return request({
      url: ReviewsEndpoint.applyAutoReply(payload.reviewId),
      method: AxiosMethod.PATCH,
      data: {
        reply: payload.reply,
      },
    });
  };

  public static readonly discardAutoReply = (
    payload: IReviewService.DiscardAutoReplyPayload,
  ): Promise<IResp<IReviewService.ReviewItem>> => {
    return request({
      url: ReviewsEndpoint.discardAutoReply(payload.reviewId),
      method: AxiosMethod.PATCH,
    });
  };

  public static readonly reportReview = (
    payload: IReviewService.ReportPayload,
  ): Promise<IResp<IReviewService.ReviewItem>> => {
    return request({
      url: ReviewsEndpoint.report(payload.reviewId),
      method: AxiosMethod.PATCH,
      data: {
        reason: payload.reason,
      },
    });
  };
}
