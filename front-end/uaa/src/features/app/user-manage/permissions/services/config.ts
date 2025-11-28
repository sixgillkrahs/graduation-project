import type { ServiceEndpoint } from "@shared/types/service";

export const PermissionEndpoint: ServiceEndpoint = {
  GetPermissions: () => "/permissions",
} as const;

export const PermissionQueryKey = {
  getPermissions: "getPermissions",
} as const;
