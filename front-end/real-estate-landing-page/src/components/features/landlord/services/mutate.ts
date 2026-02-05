import { CreateLandlordRequest } from "@/components/features/landlord/dto/landlord.model";
import { queryClient } from "@/lib/react-query/queryClient";
import { useMutation } from "@tanstack/react-query";
import { LandlordQueryKey } from "./config";
import LandlordService from "./service";

export const useCreateLandlord = () => {
  return useMutation({
    mutationFn: (data: CreateLandlordRequest) => {
      return LandlordService.createLandlord(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LandlordQueryKey.GetLandlords],
      });
    },
    meta: {
      ERROR_SOURCE: "[Create landlord failed]",
      SUCCESS_MESSAGE: "The landlord has been successfully created",
    },
  });
};

export const useDeleteLandlord = () => {
  return useMutation({
    mutationFn: (id: string) => {
      return LandlordService.deleteLandlord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LandlordQueryKey.GetLandlords],
      });
    },
    meta: {
      ERROR_SOURCE: "[Delete landlord failed]",
      SUCCESS_MESSAGE: "The landlord has been successfully deleted",
    },
  });
};

export const useUpdateLandlord = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLandlordRequest }) => {
      return LandlordService.updateLandlord(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [LandlordQueryKey.GetLandlords],
      });
      queryClient.invalidateQueries({
        queryKey: [LandlordQueryKey.GetLandlordDetail, id],
      });
    },
    meta: {
      ERROR_SOURCE: "[Update landlord failed]",
      SUCCESS_MESSAGE: "The landlord has been successfully updated",
    },
  });
};
