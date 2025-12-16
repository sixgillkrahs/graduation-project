import { PermissionQueryKey } from "./config";
import PermissionService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useGetPermissions = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [PermissionQueryKey.getPermissions, params],
    queryFn: () => PermissionService.GetPermissions(params),
  });
};

export const useGetPermission = (id: string | number) => {
  return useQuery({
    queryKey: [PermissionQueryKey.getPermission, id],
    queryFn: () => PermissionService.GetPermissionById(id),
    enabled: !!id,
    refetchOnMount: "always",
  });
};

export const useGetInfinitePermissions = (params: IParamsPagination) => {
  return useInfiniteQuery({
    queryKey: [PermissionQueryKey.getInfinitePermissions, params],
    initialPageParam: params.page,
    queryFn: ({ pageParam }) => {
      return PermissionService.GetPermissions({ ...params, page: pageParam as number });
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data;
      const next = page + 1;
      return next <= totalPages ? next : undefined;
    },
  });
};