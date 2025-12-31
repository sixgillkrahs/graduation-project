import type { Id } from "@shared/types/service";

export const AgentRegistrationEndpoint = {
  GetAgentsRegistrations: () => "/agents-registrations",
  GetAgentsRegistration: (id: Id) => `/agents-registrations/${id}`,
  RejectAgentsRegistration: (id: Id) => `/agents-registrations/${id}/reject`,
  AcceptAgentsRegistration: (id: Id) => `/agents-registrations/${id}/accept`,
} as const;

export const AgentRegistrationQueryKey = {
  GetAgentsRegistrations: "GetAgentsRegistrations",
  GetAgentsRegistration: "GetAgentsRegistration",
  RejectAgentsRegistration: "RejectAgentsRegistration",
  AcceptAgentsRegistration: "AcceptAgentsRegistration",
} as const;
