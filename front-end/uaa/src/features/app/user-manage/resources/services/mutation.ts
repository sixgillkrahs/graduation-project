import ResourceService from "./service";
import type { IResp } from "@shared/types/service";
import { type UseMutationResult, useMutation } from "@tanstack/react-query";

export const useDeleteResource = (): UseMutationResult<IResp<void>, Error, string, void> => {
  return useMutation({
    mutationFn: (id: string) => {
      return ResourceService.deleteResource(id);
    },
    meta: {
      ERROR_SOURCE: "[Delete resource failed]",
      SUCCESS_MESSAGE: "The resource has been successfully deleted",
    },
  });
};

export const useCreateResource = (): UseMutationResult<
  IResp<IResourceService.ResourceDTO>,
  Error,
  IResourceService.CreateResourceDTO,
  void
> => {
  return useMutation({
    mutationFn: (resource: IResourceService.CreateResourceDTO) => {
      return ResourceService.createResource(resource);
    },
    meta: {
      ERROR_SOURCE: "[Create resource failed]",
      SUCCESS_MESSAGE: "The resource has been successfully created",
    },
  });
};

export const useUpdateResource = (): UseMutationResult<
  IResp<IResourceService.ResourceDTO>,
  Error,
  IResourceService.UpdateResourceDTO,
  void
> => {
  return useMutation({
    mutationFn: (resource: IResourceService.UpdateResourceDTO) => {
      return ResourceService.updateResource(resource);
    },
    meta: {
      ERROR_SOURCE: "[Update resource failed]",
      SUCCESS_MESSAGE: "The resource has been successfully updated",
    },
  });
};
