import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query/queryClient";
import LeadService from "./service";
import { LeadQueryKey } from "./config";
import { CreateLeadRequest, UpdateLeadStatusRequest } from "./type";

export const useCreateLead = () => {
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => LeadService.create(data),
    meta: {
      ERROR_SOURCE: "Failed to send inquiry",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LeadQueryKey.agent],
      });
    },
  });
};

export const useUpdateLeadStatus = () => {
  return useMutation({
    mutationFn: (data: UpdateLeadStatusRequest) => LeadService.updateStatus(data),
    meta: {
      ERROR_SOURCE: "Failed to update lead status",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LeadQueryKey.agent],
      });
    },
  });
};
