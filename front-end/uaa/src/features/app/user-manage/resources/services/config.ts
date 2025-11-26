import type { ServiceEndpoint } from "@shared/types/service";

export const ResourceEndpoint: ServiceEndpoint = {
  GetResources: () => "/resources",
  GetResourcesByFilter: () => "/resources/search",
} as const;

export const ResourceQueryKey = {
  getResources: "getResources",
  getResourcesByFilter: "getResourcesByFilter",
} as const;
