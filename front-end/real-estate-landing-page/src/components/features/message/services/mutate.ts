import { queryClient } from "@/lib/react-query/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConversationsQueryKey } from "./config";
import ConversationService from "./service";

export const useCreateConversation = () => {
  return useMutation({
    mutationFn: (participantIds: string[]) =>
      ConversationService.createConversation(participantIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ConversationsQueryKey.conversations],
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Lỗi khi tạo tin nhắn");
    },
  });
};
