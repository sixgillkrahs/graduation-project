import { useMutation } from "@tanstack/react-query";
import PropertyService from "./service";
import { queryClient } from "@/lib/react-query/queryClient";
import { PropertyQueryKey } from "./config";

export const useIncreaseView = () => {
  return useMutation({
    mutationFn: (id: string) => PropertyService.increaseView(id),
  });
};

export const useRecordInteraction = () => {
  return useMutation({
    mutationFn: ({
      id,
      type,
      metadata,
    }: {
      id: string;
      type: "VIEW_PHONE" | "CONTACT_FORM" | "SCHEDULE_REQUEST" | "FAVORITE";
      metadata?: any;
    }) => PropertyService.recordInteraction(id, type, metadata),
    meta: {
      ERROR_SOURCE: "[Record interaction failed]",
      SUCCESS_MESSAGE: "The interaction has been successfully recorded",
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [PropertyQueryKey.detail, id],
      });
    },
  });
};
