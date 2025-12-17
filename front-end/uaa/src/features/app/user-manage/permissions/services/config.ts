import type { Id, ServiceEndpoint } from "@shared/types/service";

export const PermissionEndpoint: ServiceEndpoint = {
  GetPermissions: () => "/permissions",
  DeletePermission: (id: Id) => `/permissions/${id}`,
  CreatePermission: () => "/permissions",
  GetPermissionById: (id: Id) => `/permissions/${id}`,
  UpdatePermission: (id: Id) => `/permissions/${id}`,
  UpdatePermissionStatus: (id: Id) => `/permissions/${id}/status`,
} as const;

export const PermissionQueryKey = {
  getPermissions: "getPermissions",
  deletePermission: "deletePermission",
  createPermission: "createPermission",
  getPermission: "getPermission",
  updatePermission: "updatePermission",
  updatePermissionStatus: "updatePermissionStatus",
  getInfinitePermissions: "getInfinitePermissions",
} as const;
