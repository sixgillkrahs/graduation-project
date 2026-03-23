import { AgentQueryKey } from "./config";
import AgentRegistrationService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetAgents = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [AgentQueryKey.GetAgents, params],
    queryFn: () => AgentRegistrationService.GetAgents(params),
  });
};

export const useGetAgentPublicProfile = (userId: string) => {
  return useQuery({
    queryKey: [AgentQueryKey.GetAgentPublicProfile, userId],
    queryFn: () => AgentRegistrationService.GetAgentPublicProfile(userId),
    enabled: !!userId,
  });
};
