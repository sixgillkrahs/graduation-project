import { AgentRegistrationQueryKey } from "../../agent-registration/services/config";
import { AgentQueryKey } from "./config";
import AgentsService from "./service";
import { queryClient } from "@shared/queryClient";
import type { IResp } from "@shared/types/service";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export const useLockAgentAccount = (): UseMutationResult<
  IResp<{ success: boolean; lockType: string; reason?: string | null; lockedUntil?: string | null }>,
  Error,
  { registrationId: string; body: IAgentRegistrationService.LockAccountBody },
  void
> => {
  return useMutation({
    mutationFn: ({ registrationId, body }) => AgentsService.LockAgentAccount(registrationId, body),
    onSuccess: (_, { registrationId }) => {
      queryClient.invalidateQueries({
        queryKey: [AgentRegistrationQueryKey.GetAgentsRegistration, registrationId],
      });
      queryClient.invalidateQueries({
        queryKey: [AgentQueryKey.GetAgents],
      });
      queryClient.invalidateQueries({
        queryKey: [AgentQueryKey.GetUnlockRequests],
      });
    },
    meta: {
      ERROR_SOURCE: "[Lock agent account failed]",
    },
  });
};

export const useUnlockAgentAccount = (): UseMutationResult<
  IResp<{ success: boolean }>,
  Error,
  { registrationId: string },
  void
> => {
  return useMutation({
    mutationFn: ({ registrationId }) => AgentsService.UnlockAgentAccount(registrationId),
    onSuccess: (_, { registrationId }) => {
      queryClient.invalidateQueries({
        queryKey: [AgentRegistrationQueryKey.GetAgentsRegistration, registrationId],
      });
      queryClient.invalidateQueries({
        queryKey: [AgentQueryKey.GetAgents],
      });
      queryClient.invalidateQueries({
        queryKey: [AgentQueryKey.GetUnlockRequests],
      });
    },
    meta: {
      ERROR_SOURCE: "[Unlock agent account failed]",
    },
  });
};

export const useRejectUnlockRequest = (): UseMutationResult<
  IResp<{ success: boolean }>,
  Error,
  { registrationId: string },
  void
> => {
  return useMutation({
    mutationFn: ({ registrationId }) => AgentsService.RejectUnlockRequest(registrationId),
    onSuccess: (_, { registrationId }) => {
      queryClient.invalidateQueries({
        queryKey: [AgentRegistrationQueryKey.GetAgentsRegistration, registrationId],
      });
      queryClient.invalidateQueries({
        queryKey: [AgentQueryKey.GetUnlockRequests],
      });
    },
    meta: {
      ERROR_SOURCE: "[Reject unlock request failed]",
    },
  });
};
