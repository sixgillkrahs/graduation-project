"use client";

import { Spinner } from "@/components/ui/spinner";
import { useConversations } from "../services/query";
import MessageItem from "./MessageItem";
import { useRouter } from "next/navigation";

interface ListChatProps {
  onSelectConversation?: (conversation: any) => void;
}

const ListChat = ({ onSelectConversation }: ListChatProps) => {
  const { data, isLoading } = useConversations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  const router = useRouter();

  const handleGetMessage = (item: any) => {
    if (onSelectConversation) {
      onSelectConversation(item);
    } else {
      router.push(`/agent/messages/${item.id}`);
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
