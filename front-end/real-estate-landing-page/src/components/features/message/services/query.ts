import { useQuery } from "@tanstack/react-query";
import { ConversationsQueryKey } from "./config";
import ConversationService from "./service";

export const useConversations = () => {
  return useQuery({
    queryKey: [ConversationsQueryKey.conversations],
    queryFn: () => ConversationService.conversations(),
  });
};
