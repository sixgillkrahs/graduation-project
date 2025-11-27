import { ResourceQueryKey } from "./config";
import ResourceService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetResources = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [ResourceQueryKey.getResources, params],
    queryFn: () => ResourceService.getResources(params),
  });
};

export const useGetResourcesByFilter = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [ResourceQueryKey.getResourcesByFilter, params],
    queryFn: () => ResourceService.getResourcesByFilter(params),
    enabled: !!params.query,
  });
};

export const useGetResource = (id: string) => {
  return useQuery({
    queryKey: [ResourceQueryKey.getResource, id],
    queryFn: () => ResourceService.getResource(id),
    enabled: !!id,
  });
};
