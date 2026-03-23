import { AgentsEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class AgentsService {
  public static readonly GetAgents = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IAgentService.Agent>> => {
    return request({
      url: AgentsEndpoint.GetAgents(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly GetAgentPublicProfile = (
    userId: string,
  ): Promise<IResp<IAgentService.PublicProfile>> => {
    return request({
      url: AgentsEndpoint.GetAgentPublicProfile(userId),
      method: AxiosMethod.GET,
    });
  };
}
