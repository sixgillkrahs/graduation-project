import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { ReviewInvitationEndpoint } from "./config";

export default class ReviewInvitationService {
  public static readonly getInvitation = (
    token: string,
  ): Promise<IResp<IReviewInvitationService.InvitationDTO>> => {
    return request({
      url: ReviewInvitationEndpoint.getInvitation(token),
      method: AxiosMethod.GET,
    });
  };

  public static readonly createReview = (
    data: IReviewInvitationService.CreateReviewPayload,
  ): Promise<IResp<IReviewInvitationService.CreateReviewResponse>> => {
    return request({
      url: ReviewInvitationEndpoint.createReview(),
      method: AxiosMethod.POST,
      data,
    });
  };
}
