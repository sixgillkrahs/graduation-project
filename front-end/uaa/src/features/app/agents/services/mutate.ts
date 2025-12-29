import { AgentRegistrationQueryKey } from "./config";
import AgentRegistrationService from "./service";
import { queryClient } from "@shared/queryClient";
import type { IResp } from "@shared/types/service";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export const useRejectAgentsRegistration = (): UseMutationResult<
  IResp<void>,
  Error,
  { id: string; body: IAgentRegistrationService.RejectBody },
  void
> => {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: IAgentRegistrationService.RejectBody }) => {
      return AgentRegistrationService.RejectAgentsRegistration(id, body);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [AgentRegistrationQueryKey.GetAgentsRegistration, id],
      });
      queryClient.invalidateQueries({
        queryKey: [AgentRegistrationQueryKey.GetAgentsRegistrations],
      });
    },
    meta: {
      ERROR_SOURCE: "[Delete permission failed]",
      SUCCESS_MESSAGE: "The permission has been successfully deleted",
    },
  });
};
