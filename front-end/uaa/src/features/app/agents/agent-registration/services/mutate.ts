import { AgentRegistrationQueryKey } from "./config";
import AgentRegistrationService from "./service";
import { queryClient } from "@shared/queryClient";
import type { Id, IResp } from "@shared/types/service";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export const useDeleteAgentsRegistration = (): UseMutationResult<
  IResp<void>,
  Error,
  Id,
  void
> => {
  return useMutation({
    mutationFn: AgentRegistrationService.DeleteAgentsRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AgentRegistrationQueryKey.GetAgentsRegistrations],
      });
    },
    meta: {
      ERROR_SOURCE: "[Delete agent registration failed]",
      SUCCESS_MESSAGE: "The agent registration has been successfully deleted",
    },
  });
};

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
      ERROR_SOURCE: "[Reject agent registration failed]",
      SUCCESS_MESSAGE: "The agent registration has been successfully rejected",
    },
  });
};

export const useAcceptAgentsRegistration = (): UseMutationResult<
  IResp<void>,
  Error,
  { id: string; body: IAgentRegistrationService.ApproveBody },
  void
> => {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: IAgentRegistrationService.ApproveBody }) => {
      return AgentRegistrationService.ApproveAgentsRegistration(id, body);
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
      ERROR_SOURCE: "[Approve agent registration failed]",
      SUCCESS_MESSAGE: "The agent registration has been successfully approved",
    },
  });
};
