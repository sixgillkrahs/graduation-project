import { useQuery } from "@tanstack/react-query";
import { ConversationsQueryKey } from "./config";
import ConversationService from "./service";

export const useConversations = (enabled?: boolean) => {
  return useQuery({
    queryKey: [ConversationsQueryKey.conversations],
    queryFn: () => ConversationService.conversations(),
    enabled: enabled !== undefined ? enabled : true,
  });
};

export const useConversationDetail = (conversationId: string) => {
  return useQuery({
    queryKey: [ConversationsQueryKey.conversationDetail, conversationId],
    queryFn: () => ConversationService.conversationDetail(conversationId),
    enabled: !!conversationId,
  });
};
