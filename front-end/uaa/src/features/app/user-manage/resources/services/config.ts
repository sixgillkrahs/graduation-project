import type { ServiceEndpoint } from "@shared/types/service";

export const ResourceEndpoint: ServiceEndpoint = {
  GetResources: () => "/resources",
} as const;

export const ResourceQueryKey = {
  getResources: "getResources",
} as const;
