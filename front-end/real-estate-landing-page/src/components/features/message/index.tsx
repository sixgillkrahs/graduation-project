"use client";

import { AlertCircle, MessageSquareMore } from "lucide-react";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import StateSurface from "@/components/ui/state-surface";
import { useGetMe } from "@/shared/auth/query";
import ChatDetail from "./components/ChatDetail";
import { useConversationDetail, useConversations } from "./services/query";

const Message = () => {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { data: me } = useGetMe();
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    refetch: refetchMessages,
  } = useConversationDetail(conversationId || "");
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    isError: isConversationsError,
    refetch: refetchConversations,
  } = useConversations(!!me?.data?.userId);

  if (isLoadingMessages || isLoadingConversations) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <StateSurface
          size="compact"
          tone="brand"
          eyebrow="Conversation"
          icon={<Spinner className="h-5 w-5" />}
          title="Loading conversation"
          description="Fetching message history and participant details."
        />
      </div>
    );
  }

  if (isMessagesError || isConversationsError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <StateSurface
          size="compact"
          tone="danger"
          eyebrow="Conversation"
          icon={<AlertCircle className="h-5 w-5" />}
          title="Could not load this conversation"
          description="The chat service is temporarily unavailable. Retry to restore the thread."
          primaryAction={{
            label: "Try again",
            onClick: () => {
              void refetchMessages();
              void refetchConversations();
            },
          }}
        />
      </div>
    );
  }

  const conversation = conversationsData?.data?.results?.find(
    (c: any) => c.id === conversationId,
  );

  if (!conversation) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <StateSurface
          size="compact"
          tone="brand"
          eyebrow="Conversation"
          icon={<MessageSquareMore className="h-5 w-5" />}
          title="Conversation not found"
          description="This thread may have been removed or you may no longer have access to it."
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-100 p-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={
                conversation.displayAvatar || "https://github.com/shadcn.png"
              }
              alt={conversation.displayName}
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {conversation.displayName}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Active now
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatDetail
          messages={messagesData?.data?.results || []}
          conversation={conversation}
        />
      </div>
    </div>
  );
};

export default Message;
