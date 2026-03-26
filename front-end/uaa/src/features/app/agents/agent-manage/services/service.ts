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

  public static readonly GetUnlockRequests = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IAgentService.UnlockRequestItem>> => {
    return request({
      url: AgentsEndpoint.GetUnlockRequests(),
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

  public static readonly LockAgentAccount = (
    registrationId: string,
    data: IAgentRegistrationService.LockAccountBody,
  ): Promise<
    IResp<{
      success: boolean;
      lockType: string;
      reason?: string | null;
      lockedUntil?: string | null;
    }>
  > => {
    return request({
      url: AgentsEndpoint.LockAgentAccount(registrationId),
      method: AxiosMethod.PATCH,
      data,
    });
  };

  public static readonly UnlockAgentAccount = (
    registrationId: string,
  ): Promise<IResp<{ success: boolean }>> => {
    return request({
      url: AgentsEndpoint.UnlockAgentAccount(registrationId),
      method: AxiosMethod.PATCH,
    });
  };

  public static readonly RejectUnlockRequest = (
    registrationId: string,
  ): Promise<IResp<{ success: boolean }>> => {
    return request({
      url: AgentsEndpoint.RejectUnlockRequest(registrationId),
      method: AxiosMethod.PATCH,
    });
  };
}
