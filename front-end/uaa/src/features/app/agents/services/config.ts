import type { ServiceEndpoint } from "@shared/types/service";

export const AgentRegistrationEndpoint: ServiceEndpoint = {
  GetAgentsRegistrations: () => "/agents-registrations",
  GetAgentsRegistration: (id: string) => `/agents-registrations/${id}`,
  RejectAgentsRegistration: (id: string) => `/agents-registrations/${id}/reject`,
} as const;

export const AgentRegistrationQueryKey = {
  GetAgentsRegistrations: "GetAgentsRegistrations",
  GetAgentsRegistration: "GetAgentsRegistration",
  RejectAgentsRegistration: "RejectAgentsRegistration",
} as const;
