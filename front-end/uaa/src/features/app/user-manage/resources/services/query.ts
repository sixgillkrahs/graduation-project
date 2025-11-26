import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";
import { ResourceQueryKey } from "./config";
import ResourceService from "./service";

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

