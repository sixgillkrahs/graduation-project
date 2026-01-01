import { AgentRegistrationQueryKey } from "./config";
import AgentRegistrationService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetAgentsRegistrations = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [AgentRegistrationQueryKey.GetAgentsRegistrations, params],
    queryFn: () => AgentRegistrationService.GetAgentsRegistrations(params),
  });
};

export const useGetAgentsRegistration = (id: string) => {
  return useQuery({
    queryKey: [AgentRegistrationQueryKey.GetAgentsRegistration, id],
    queryFn: () => AgentRegistrationService.GetAgentsRegistration(id),
    enabled: !!id,
  });
};
