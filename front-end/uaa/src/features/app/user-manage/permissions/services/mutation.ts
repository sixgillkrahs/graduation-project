import { PermissionQueryKey } from "./config";
import { queryClient } from "@shared/queryClient";
import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import PermissionService from "./service";
import type { IResp } from "@shared/types/service";

export const useDeletePermission = (): UseMutationResult<
  IResp<void>,
  Error,
  string,
  void
> => {
  return useMutation({
    mutationFn: (id: string) => {
      return PermissionService.DeletePermission(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PermissionQueryKey.getPermissions],
      });
    },
    meta: {
      ERROR_SOURCE: "[Delete permission failed]",
      SUCCESS_MESSAGE: "The permission has been successfully deleted",
    },
  });
};

// export const useCreateResource = (): UseMutationResult<
//   IResp<IResourceService.ResourceDTO>,
//   Error,
//   IResourceService.CreateResourceDTO,
//   void
// > => {
//   return useMutation({
//     mutationFn: (resource: IResourceService.CreateResourceDTO) => {
//       return ResourceService.createResource(resource);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: [ResourceQueryKey.getResources],
//       });
//     },
//     meta: {
//       ERROR_SOURCE: "[Create resource failed]",
//       SUCCESS_MESSAGE: "The resource has been successfully created",
//     },
//   });
// };

// export const useUpdateResource = (): UseMutationResult<
//   IResp<IResourceService.ResourceDTO>,
//   Error,
//   IResourceService.UpdateResourceDTO,
//   void
// > => {
//   return useMutation({
//     mutationFn: (resource: IResourceService.UpdateResourceDTO) => {
//       return ResourceService.updateResource(resource);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: [ResourceQueryKey.getResources],
//       });
//     },
//     meta: {
//       ERROR_SOURCE: "[Update resource failed]",
//       SUCCESS_MESSAGE: "The resource has been successfully updated",
//     },
//   });
// };
