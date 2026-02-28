import { IResp } from "@/@types/service";
import { UseMutationResult, useMutation } from "@tanstack/react-query";
import PropertyService from "./service";
import { IPropertyDto } from "../dto/property.dto";
import { ListingFormData } from "../dto/listingformdata.dto";

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
  });
};
