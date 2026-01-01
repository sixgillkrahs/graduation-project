import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IPaginationResp, IParamsPagination } from "@shared/types/service";
import { AgentsEndpoint } from "./config";

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
}