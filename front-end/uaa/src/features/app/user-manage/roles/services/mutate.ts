import { RoleQueryKey } from "./config";
import RoleService from "./service";
import { queryClient } from "@shared/queryClient";
import type { IResp } from "@shared/types/service";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export const useCreateRole = (): UseMutationResult<
  IResp<void>,
  Error,
  IRoleService.CreateRoleDTO,
  void
> => {
  return useMutation({
    mutationFn: (role: IRoleService.CreateRoleDTO) => {
      return RoleService.CreateRole(role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [RoleQueryKey.getRoles],
      });
      queryClient.removeQueries({
        queryKey: [RoleQueryKey.getRoles],
      });
    },
    meta: {
      ERROR_SOURCE: "[Create role failed]",
      SUCCESS_MESSAGE: "The role has been successfully created",
    },
  });
};
