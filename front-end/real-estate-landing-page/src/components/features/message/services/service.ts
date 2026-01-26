import { IPaginationResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import { ConversationsEndpoint } from "./config";
import request from "@/lib/axios/request";

export default class ConversationService {
  public static readonly conversations = (): Promise<
    IPaginationResp<IConversationService.ConversationDTO>
  > => {
    return request({
      url: ConversationsEndpoint.Conversations(),
      method: AxiosMethod.GET,
    });
  };

  public static readonly conversationDetail = (
    conversationId: string,
  ): Promise<IPaginationResp<IConversationService.ConversationDetailDTO>> => {
    return request({
      url: ConversationsEndpoint.ConversationDetail(conversationId),
      method: AxiosMethod.GET,
    });
  };
}
