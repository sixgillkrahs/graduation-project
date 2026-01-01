import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";
import { AgentQueryKey } from "./config";
import AgentRegistrationService from "./service";


export const useGetAgents = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [AgentQueryKey.GetAgents, params],
    queryFn: () => AgentRegistrationService.GetAgents(params),
  });
};
