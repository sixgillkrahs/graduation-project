import type { ServiceEndpoint } from "@shared/types/service";

export const ResourceEndpoint: ServiceEndpoint = {
  GetResources: () => "/resources",
  GetResourcesByFilter: () => "/resources/search",
  DeleteResource: (id: string) => `/resources/${id}`,
  CreateResource: () => `/resources`,
  UpdateResource: (id: string) => `/resources/${id}`,
  GetResource: (id: string) => `/resources/${id}`,
} as const;

export const ResourceQueryKey = {
  getResources: "getResources",
  getResourcesByFilter: "getResourcesByFilter",
  deleteResource: "deleteResource",
  createResource: "createResource",
  updateResource: "updateResource",
  getResource: "getResource",
} as const;
