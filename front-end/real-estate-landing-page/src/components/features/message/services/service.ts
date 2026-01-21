import { IPaginationResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import { request } from "http";
import { ConversationsEndpoint } from "./config";

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
