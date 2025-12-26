import type { ServiceEndpoint } from "@shared/types/service";

export const AgentRegistrationEndpoint: ServiceEndpoint = {
  GetAgentsRegistrations: () => "/agents-registrations",
  GetAgentsRegistration: (id: string) => `/agents-registrations/${id}`,
} as const;

export const AgentRegistrationQueryKey = {
  GetAgentsRegistrations: "GetAgentsRegistrations",
  GetAgentsRegistration: "GetAgentsRegistration",
} as const;
