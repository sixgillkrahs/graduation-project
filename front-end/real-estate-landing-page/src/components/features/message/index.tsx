"use client";

import { Spinner } from "@/components/ui/spinner";
import ChatDetail from "./components/ChatDetail";
import { useConversationDetail, useConversations } from "./services/query";
import { useParams } from "next/navigation";

const Message = () => {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { data: messagesData, isLoading: isLoadingMessages } =
    useConversationDetail(conversationId || "");
  const { data: conversationsData, isLoading: isLoadingConversations } =
    useConversations();

  if (isLoadingMessages || isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  const conversation = conversationsData?.data?.results?.find(
    (c: any) => c.id === conversationId,
  );

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Conversation not found
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
