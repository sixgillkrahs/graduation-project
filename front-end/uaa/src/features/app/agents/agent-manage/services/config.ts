export const AgentsEndpoint = {
  GetAgents: () => "/agents",
  GetUnlockRequests: () => "/agents-registrations/unlock-requests",
  GetAgentPublicProfile: (userId: string) => `/agents/${userId}/public-profile`,
  LockAgentAccount: (registrationId: string) =>
    `/agents-registrations/${registrationId}/account-lock`,
  UnlockAgentAccount: (registrationId: string) =>
    `/agents-registrations/${registrationId}/account-unlock`,
  RejectUnlockRequest: (registrationId: string) =>
    `/agents-registrations/${registrationId}/unlock-request/reject`,
} as const;

export const AgentQueryKey = {
  GetAgents: "GetAgents",
  GetUnlockRequests: "GetUnlockRequests",
  GetAgentPublicProfile: "GetAgentPublicProfile",
  LockAgentAccount: "LockAgentAccount",
  UnlockAgentAccount: "UnlockAgentAccount",
  RejectUnlockRequest: "RejectUnlockRequest",
} as const;
