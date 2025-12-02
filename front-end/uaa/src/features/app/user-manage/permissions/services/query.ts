import { PermissionQueryKey } from "./config";
import PermissionService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

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
