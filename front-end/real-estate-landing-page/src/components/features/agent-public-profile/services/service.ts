import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { AgentPublicProfileEndpoint } from "./config";

export default class AgentPublicProfileService {
  public static readonly detail = (
    agentId: string,
  ): Promise<IResp<IAgentPublicProfileService.ProfileDTO>> => {
    return request({
      url: AgentPublicProfileEndpoint.detail(agentId),
      method: AxiosMethod.GET,
    });
  };
}
