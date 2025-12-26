import { AgentRegistrationEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class AgentRegistrationService {
  public static readonly STATUS = [
    {
      value: "PENDING",
      label: "Chờ duyệt",
      color: "orange",
    },
    {
      value: "APPROVED",
      label: "Duyệt",
      color: "green",
    },
    {
      value: "REJECTED",
      label: "Từ chối",
      color: "red",
    },
  ];

  public static readonly GetAgentsRegistrations = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IAgentRegistrationService.AgentRegistration>> => {
    return request({
      url: AgentRegistrationEndpoint.GetAgentsRegistrations(),
      method: AxiosMethod.GET,
      params,
    });
  };
  public static readonly GetAgentsRegistration = (
    id: string,
  ): Promise<IResp<IAgentRegistrationService.AgentRegistration>> => {
    return request({
      url: AgentRegistrationEndpoint.GetAgentsRegistration(id),
      method: AxiosMethod.GET,
    });
  };
}
