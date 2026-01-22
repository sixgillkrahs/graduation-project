import { IPaginationResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import { ConversationsEndpoint } from "./config";
import request from "@/lib/axios/request";

export default class ConversationService {
  public static readonly conversations = (): Promise<
    IPaginationResp<IConversationService.ConversationDTO>
  > => {
    return request({
      url: ConversationsEndpoint.conversations(),
      method: AxiosMethod.GET,
    });
  };
}
