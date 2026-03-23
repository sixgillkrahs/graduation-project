import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import type { IResp } from "@/@types/service";
import { queryClient } from "@/lib/react-query/queryClient";
import type { ListingFormData } from "../dto/listingformdata.dto";
import type { IPropertyDto } from "../dto/property.dto";
import { PropertyKey } from "./config";
import PropertyService from "./service";

export const useCreateProperty = (): UseMutationResult<
  IResp<IPropertyDto>,
  Error,
  ListingFormData,
  void
> => {
  return useMutation({
    mutationFn: (data: ListingFormData) => {
      return PropertyService.createProperty(data);
    },
    meta: {
      ERROR_SOURCE: "notifications.createPropertyFailed",
      SUCCESS_MESSAGE: "notifications.createPropertySuccess",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PropertyKey.getProperties],
      });
    },
  });
};

export const useUpdateProperty = (): UseMutationResult<
  IResp<IPropertyDto>,
  Error,
  { id: string; data: ListingFormData },
  void
> => {
  return useMutation({
    mutationFn: ({ id, data }) => {
      return PropertyService.updateProperty(id, data);
    },
    meta: {
      ERROR_SOURCE: "notifications.updatePropertyFailed",
      SUCCESS_MESSAGE: "notifications.updatePropertySuccess",
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [PropertyKey.getProperties],
      });
      queryClient.invalidateQueries({
        queryKey: [PropertyKey.getPropertyDetail, id],
      });
    },
  });
};
