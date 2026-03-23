export const AgentsEndpoint = {
  GetAgents: () => "/agents",
  GetAgentPublicProfile: (userId: string) => `/agents/${userId}/public-profile`,
} as const;

export const AgentQueryKey = {
  GetAgents: "GetAgents",
  GetAgentPublicProfile: "GetAgentPublicProfile",
} as const;
