import type { ServiceEndpoint } from "@shared/types/service";

export const PermissionEndpoint: ServiceEndpoint = {
  GetPermissions: () => "/permissions",
  DeletePermission: (id: string | number) => `/permissions/${id}`,
  CreatePermission: () => "/permissions",
  GetPermissionById: (id: string | number) => `/permissions/${id}`,
  UpdatePermission: (id: string | number) => `/permissions/${id}`,
  UpdatePermissionStatus: (id: string | number) => `/permissions/${id}/status`,
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
