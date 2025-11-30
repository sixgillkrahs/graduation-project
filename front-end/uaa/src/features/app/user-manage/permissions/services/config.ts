import type { ServiceEndpoint } from "@shared/types/service";

export const PermissionEndpoint: ServiceEndpoint = {
  GetPermissions: () => "/permissions",
  DeletePermission: (id: string | number) => `/permissions/${id}`,
} as const;

export const PermissionQueryKey = {
  getPermissions: "getPermissions",
  deletePermission: "deletePermission",
} as const;
