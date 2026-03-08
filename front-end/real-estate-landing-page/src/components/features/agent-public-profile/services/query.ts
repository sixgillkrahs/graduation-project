import { useQuery } from "@tanstack/react-query";
import AgentPublicProfileService from "./service";
import { AgentPublicProfileQueryKey } from "./config";

export const useAgentPublicProfile = (agentId: string) => {
  return useQuery({
    queryKey: [AgentPublicProfileQueryKey.detail, agentId],
    queryFn: () => AgentPublicProfileService.detail(agentId),
    enabled: !!agentId,
  });
};
