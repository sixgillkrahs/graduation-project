import { ResourceQueryKey } from "./config";
import ResourceService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

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

export const useGetInfiniteResources = (params: IParamsPagination) => {
  return useInfiniteQuery({
    queryKey: [ResourceQueryKey.getInfiniteResources, params],
    initialPageParam: params.page,
    queryFn: ({ pageParam }) => {
      return ResourceService.getResources({ ...params, page: pageParam as number });
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data;
      const next = page + 1;
      return next <= totalPages ? next : undefined;
    },
  });
};
