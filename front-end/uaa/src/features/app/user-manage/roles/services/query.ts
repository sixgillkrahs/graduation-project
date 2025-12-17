import { RoleQueryKey } from "./config";
import RoleService from "./service";
import type { Id, IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetRoles = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [RoleQueryKey.getRoles, params],
    queryFn: () => RoleService.GetRoles(params),
  });
};

export const useGetRole = (id: Id) => {
  return useQuery({
    queryKey: [RoleQueryKey.getRole, id],
    queryFn: () => RoleService.GetRoleById(id),
    enabled: !!id,
  });
};
