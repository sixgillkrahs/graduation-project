import { useQuery } from "@tanstack/react-query";
import { ConversationsQueryKey } from "./config";
import ConversationService from "./service";

export const useConversations = () => {
  return useQuery({
    queryKey: [ConversationsQueryKey.conversations],
    queryFn: () => ConversationService.conversations(),
  });
};

export const useConversationDetail = (conversationId: string) => {
  return useQuery({
    queryKey: [ConversationsQueryKey.conversationDetail, conversationId],
    queryFn: () => ConversationService.conversationDetail(conversationId),
    enabled: !!conversationId,
  });
};
