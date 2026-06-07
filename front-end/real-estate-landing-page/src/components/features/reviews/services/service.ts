import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import {
  normalizeAgentReviewListApiResponse,
  normalizePublicReviewListApiResponse,
  normalizeReviewResponse,
} from "./normalize";
import { ReviewsEndpoint } from "./config";

export default class ReviewsService {
  public static readonly getEligibilityByAgent = (
    agentUserId: string,
  ): Promise<IResp<IReviewService.ReviewEligibility>> => {
    return request({
      url: ReviewsEndpoint.getEligibilityByAgent(agentUserId),
      method: AxiosMethod.GET,
    });
  };

  public static readonly createByAgent = (
    payload: IReviewService.CreateAgentReviewPayload,
  ): Promise<IResp<IReviewInvitationService.CreateReviewResponse>> => {
    return request({
      url: ReviewsEndpoint.createByAgent(payload.agentUserId),
      method: AxiosMethod.POST,
      data: {
        rating: payload.rating,
        tags: payload.tags,
        comment: payload.comment,
      },
    });
  };

  public static readonly getPublicByAgent = (
    agentUserId: string,
    params?: IReviewService.GetPublicParams,
  ): Promise<IResp<IReviewService.PublicListResponse>> => {
    return request({
      url: ReviewsEndpoint.getPublicByAgent(agentUserId),
      method: AxiosMethod.GET,
      params,
    }).then(normalizePublicReviewListApiResponse);
  };

  public static readonly getMyReviews = (
    params?: IReviewService.GetMyParams,
  ): Promise<IResp<IReviewService.AgentListResponse>> => {
    return request({
      url: ReviewsEndpoint.getMyReviews(),
      method: AxiosMethod.GET,
      params,
    }).then(normalizeAgentReviewListApiResponse);
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
    }).then(normalizeReviewResponse);
  };

  public static readonly generateAutoReply = (
    payload: IReviewService.GenerateAutoReplyPayload,
  ): Promise<IResp<IReviewService.ReviewItem>> => {
    return request({
      url: ReviewsEndpoint.generateAutoReply(payload.reviewId),
      method: AxiosMethod.POST,
    }).then(normalizeReviewResponse);
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
    }).then(normalizeReviewResponse);
  };

  public static readonly discardAutoReply = (
    payload: IReviewService.DiscardAutoReplyPayload,
  ): Promise<IResp<IReviewService.ReviewItem>> => {
    return request({
      url: ReviewsEndpoint.discardAutoReply(payload.reviewId),
      method: AxiosMethod.PATCH,
    }).then(normalizeReviewResponse);
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
    }).then(normalizeReviewResponse);
  };
}
