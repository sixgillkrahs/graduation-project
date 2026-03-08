export const AgentPublicProfileEndpoint = {
  detail: (agentId: string) => `/agents/${agentId}/public-profile`,
} as const;

export const AgentPublicProfileQueryKey = {
  detail: "agentPublicProfile",
} as const;
