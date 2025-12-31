import type { Id } from "@shared/types/service";

export const ResourceEndpoint = {
  GetResources: () => "/resources",
  GetResourcesByFilter: () => "/resources/search",
  DeleteResource: (id: Id) => `/resources/${id}`,
  CreateResource: () => `/resources`,
  UpdateResource: (id: Id) => `/resources/${id}`,
  GetResource: (id: Id) => `/resources/${id}`,
} as const;

export const ResourceQueryKey = {
  getResources: "getResources",
  getResourcesByFilter: "getResourcesByFilter",
  deleteResource: "deleteResource",
  createResource: "createResource",
  updateResource: "updateResource",
  getResource: "getResource",
  getInfiniteResources: "getInfiniteResources",
} as const;
