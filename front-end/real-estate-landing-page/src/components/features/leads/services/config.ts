export const LeadEndpoint = {
  create: () => "/leads",
  agent: () => "/leads/agent",
  updateStatus: (id: string) => `/leads/${id}/status`,
} as const;

export const LeadQueryKey = {
  agent: "agentLeads",
} as const;
