import type { Id } from "@shared/types/service";

export const AgentRegistrationEndpoint = {
  GetAgentsRegistrations: () => "/agents-registrations",
  GetAgentsRegistration: (id: Id) => `/agents-registrations/${id}`,
  DeleteAgentsRegistration: (id: Id) => `/agents-registrations/${id}`,
  RejectAgentsRegistration: (id: Id) => `/agents-registrations/${id}/reject`,
  ApproveAgentsRegistration: (id: Id) => `/agents-registrations/${id}/approve`,
} as const;


export const AgentRegistrationQueryKey = {
  GetAgentsRegistrations: "GetAgentsRegistrations",
  GetAgentsRegistration: "GetAgentsRegistration",
  DeleteAgentsRegistration: "DeleteAgentsRegistration",
  RejectAgentsRegistration: "RejectAgentsRegistration",
  ApproveAgentsRegistration: "ApproveAgentsRegistration",
} as const;
