import type { ServiceEndpoint } from "@shared/types/service";

export const RoleEndpoint: ServiceEndpoint = {
  GetRoles: () => "/roles",
  DeleteRole: (id: string | number) => `/roles/${id}`,
  CreateRole: () => "/roles",
  GetRoleById: (id: string | number) => `/roles/${id}`,
  UpdateRole: (id: string | number) => `/roles/${id}`,
  UpdateRoleStatus: (id: string | number) => `/roles/${id}/status`,
} as const;

export const RoleQueryKey = {
  getRoles: "getRoles",
  deleteRole: "deleteRole",
  createRole: "createRole",
  getRole: "getRole",
  updateRole: "updateRole",
  updateRoleStatus: "updateRoleStatus",
} as const;
