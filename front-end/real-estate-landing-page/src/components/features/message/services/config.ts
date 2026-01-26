export const ConversationsEndpoint = {
  Conversations: () => `/chat/conversations`,
  ConversationDetail: (conversationId: string) =>
    `/chat/conversations/${conversationId}/messages`,
} as const;

export const ConversationsQueryKey = {
  conversations: "conversations",
  conversationDetail: "conversationDetail",
} as const;
