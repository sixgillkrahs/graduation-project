"use client";

import { AlertCircle, MessageSquareMore } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import StateSurface from "@/components/ui/state-surface";
import { ROUTES } from "@/const/routes";
import { useGetMe } from "@/shared/auth/query";
import { useConversations } from "../services/query";
import MessageItem from "./MessageItem";

interface ListChatProps {
  onSelectConversation?: (conversation: any) => void;
}

const ListChat = ({ onSelectConversation }: ListChatProps) => {
  const router = useRouter();
  const { data: me } = useGetMe();
  const { data, isLoading, isError, refetch } = useConversations(
    !!me?.data?.userId,
  );

  if (isLoading) {
    return (
      <div className="px-3 pb-3">
        <StateSurface
          size="compact"
          tone="brand"
          eyebrow="Messages"
          icon={<Spinner className="h-5 w-5" />}
          title="Loading conversations"
          description="Fetching your latest chats and unread activity."
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-3 pb-3">
        <StateSurface
          size="compact"
          tone="danger"
          eyebrow="Messages"
          icon={<AlertCircle className="h-5 w-5" />}
          title="Could not load conversations"
          description="The inbox is temporarily unavailable. Retry to reconnect."
          primaryAction={{
            label: "Try again",
            onClick: () => {
              void refetch();
            },
          }}
        />
      </div>
    );
  }

  if (!data?.data?.results?.length) {
    return (
      <div className="px-3 pb-3">
        <StateSurface
          size="compact"
          tone="brand"
          eyebrow="Messages"
          icon={<MessageSquareMore className="h-5 w-5" />}
          title="No conversations yet"
          description="When a buyer or agent starts a chat, it will appear here."
        />
      </div>
    );
  }

  const handleGetMessage = (item: any) => {
    if (onSelectConversation) {
      onSelectConversation(item);
    } else {
      router.push(ROUTES.AGENT_MESSAGE_DETAIL(item.id));
    }
  };

  return (
    <div>
      {data?.data?.results?.map((item) => {
        return (
          <MessageItem
            key={item.id}
            avatar={item.displayAvatar || ""}
            title={item.displayName || "User"}
            message={item.lastMessage?.content || ""}
            time={item.lastMessage?.createdAt || ""}
            isRead={item.lastMessage?.isRead}
            onClick={() => handleGetMessage(item)}
          />
        );
      })}
    </div>
  );
};

export default ListChat;
