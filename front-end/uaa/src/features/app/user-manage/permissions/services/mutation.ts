import { PermissionQueryKey } from "./config";
import PermissionService from "./service";
import { queryClient } from "@shared/queryClient";
import type { IResp } from "@shared/types/service";
import { type UseMutationResult, useMutation } from "@tanstack/react-query";

export const useDeletePermission = (): UseMutationResult<IResp<void>, Error, string, void> => {
  return useMutation({
    mutationFn: (id: string) => {
      return PermissionService.DeletePermission(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PermissionQueryKey.getPermissions],
      });
      queryClient.removeQueries({
        queryKey: [PermissionQueryKey.getPermissions],
      });
    },
    meta: {
      ERROR_SOURCE: "[Delete permission failed]",
      SUCCESS_MESSAGE: "The permission has been successfully deleted",
    },
  });
};

export const useCreatePermission = (): UseMutationResult<
  IResp<void>,
  Error,
  IPermissionService.CreatePermissionDTO,
  void
> => {
  return useMutation({
    mutationFn: (permission: IPermissionService.CreatePermissionDTO) => {
      return PermissionService.CreatePermission(permission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PermissionQueryKey.getPermissions],
      });
      queryClient.removeQueries({
        queryKey: [PermissionQueryKey.getPermissions],
      });
    },
    meta: {
      ERROR_SOURCE: "[Create permission failed]",
      SUCCESS_MESSAGE: "The permission has been successfully created",
    },
  });
};

export const useUpdatePermission = (): UseMutationResult<
  IResp<void>,
  Error,
  IPermissionService.UpdatePermissionDTO,
  void
> => {
  return useMutation({
    mutationFn: (permission: IPermissionService.UpdatePermissionDTO) => {
      return PermissionService.UpdatePermission(permission);
    },
    meta: {
      ERROR_SOURCE: "[Update permission failed]",
      SUCCESS_MESSAGE: "The permission has been successfully updated",
    },
  });
};

export const useUpdatePermissionStatus = (): UseMutationResult<
  IResp<void>,
  Error,
  IPermissionService.UpdatePermissionStatusDTO,
  void
> => {
  return useMutation({
    mutationFn: (permission: IPermissionService.UpdatePermissionStatusDTO) => {
      return PermissionService.ChangeStatusPermission(permission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PermissionQueryKey.getPermissions],
      });
    },
    meta: {
      ERROR_SOURCE: "[Update permission status failed]",
      SUCCESS_MESSAGE: "The permission status has been successfully updated",
    },
  });
};
