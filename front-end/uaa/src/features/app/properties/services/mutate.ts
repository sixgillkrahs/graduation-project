import type { IProperty } from "../model/property.model";
import { PropertiesQueryKey } from "./config";
import PropertiesService from "./service";
import { queryClient } from "@shared/queryClient";
import { useMutation } from "@tanstack/react-query";

export const useUpdateProperty = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<IProperty> }) =>
      PropertiesService.UpdateProperty(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PropertiesQueryKey.GetPropertiesPending] });
      queryClient.invalidateQueries({
        queryKey: [PropertiesQueryKey.GetPropertyDetail, variables.id],
      });
    },
  });
};

export const useApproveProperty = () => {
  return useMutation({
    mutationFn: (id: string) => PropertiesService.ApproveProperty(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PropertiesQueryKey.GetPropertiesPending, variables],
      });
      queryClient.invalidateQueries({
        queryKey: [PropertiesQueryKey.GetPropertyDetail, variables],
      });
    },
  });
};

export const useRejectProperty = () => {
  return useMutation({
    mutationFn: (id: string) => PropertiesService.RejectProperty(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PropertiesQueryKey.GetPropertiesPending, variables],
      });
      queryClient.invalidateQueries({
        queryKey: [PropertiesQueryKey.GetPropertyDetail, variables],
      });
    },
  });
};
