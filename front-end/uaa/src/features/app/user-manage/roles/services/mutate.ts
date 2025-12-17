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
      queryClient.refetchQueries({
        queryKey: [RoleQueryKey.getRoles],
        type: "active",
      });
    },
    meta: {
      ERROR_SOURCE: "[Create role failed]",
      SUCCESS_MESSAGE: "The role has been successfully created",
    },
  });
};

export const useDeleteRole = (): UseMutationResult<IResp<void>, Error, string, void> => {
  return useMutation({
    mutationFn: (id: string) => {
      return RoleService.DeleteRole(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [RoleQueryKey.getRoles],
      });
    },
    meta: {
      ERROR_SOURCE: "[Delete resource failed]",
      SUCCESS_MESSAGE: "The resource has been successfully deleted",
    },
  });
};

export const useUpdateRole = (): UseMutationResult<
  IResp<void>,
  Error,
  IRoleService.UpdateRoleDTO,
  void
> => {
  return useMutation({
    mutationFn: (role: IRoleService.UpdateRoleDTO) => {
      return RoleService.UpdateRole(role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [RoleQueryKey.getRoles],
      });
      queryClient.refetchQueries({
        queryKey: [RoleQueryKey.getRoles],
        type: "active",
      });
    },
    meta: {
      ERROR_SOURCE: "[Update role failed]",
      SUCCESS_MESSAGE: "The role has been successfully updated",
    },
  });
};
