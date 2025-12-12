import { RoleQueryKey } from "./config";
import RoleService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetRoles = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [RoleQueryKey.getRoles, params],
    queryFn: () => RoleService.GetRoles(params),
  });
};
