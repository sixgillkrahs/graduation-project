import type { Id } from "@shared/types/service";

export const RoleEndpoint = {
  GetRoles: () => "/roles",
  DeleteRole: (id: Id) => `/roles/${id}`,
  CreateRole: () => "/roles",
  GetRoleById: (id: Id) => `/roles/${id}`,
  UpdateRole: (id: Id) => `/roles/${id}`,
  UpdateRoleStatus: (id: Id) => `/roles/${id}/status`,
} as const;

export const RoleQueryKey = {
  getRoles: "getRoles",
  deleteRole: "deleteRole",
  createRole: "createRole",
  getRole: "getRole",
  updateRole: "updateRole",
  updateRoleStatus: "updateRoleStatus",
} as const;
