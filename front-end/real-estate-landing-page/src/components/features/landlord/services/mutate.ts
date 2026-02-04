import { CreateLandlordRequest } from "@/components/features/landlord/dto/landlord.model";
import { useMutation } from "@tanstack/react-query";
import LandlordService from "./service";

export const useCreateLandlord = () => {
  return useMutation({
    mutationFn: (data: CreateLandlordRequest) => {
      return LandlordService.createLandlord(data);
    },
    meta: {
      ERROR_SOURCE: "[Create landlord failed]",
      SUCCESS_MESSAGE: "The landlord has been successfully created",
    },
  });
};
