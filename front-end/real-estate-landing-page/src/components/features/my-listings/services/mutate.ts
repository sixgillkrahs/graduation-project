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
      ERROR_SOURCE: "[Create property failed]: The old password is incorrect",
      SUCCESS_MESSAGE: "Create property successfully",
    },
  });
};
