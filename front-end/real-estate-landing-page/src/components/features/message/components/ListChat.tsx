"use client";

import { AlertCircle, MessageSquareMore } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import StateSurface from "@/components/ui/state-surface";
import { ROUTES } from "@/const/routes";
import { getAgentCmsCopy } from "@/lib/agent-cms-copy";
import { useLocale } from "next-intl";
import { useGetMe } from "@/shared/auth/query";
import { useConversations } from "../services/query";
import MessageItem from "./MessageItem";

interface ListChatProps {
  onSelectConversation?: (conversation: any) => void;
}

const ListChat = ({ onSelectConversation }: ListChatProps) => {
  const copy = getAgentCmsCopy(useLocale()).messages;
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
          eyebrow={copy.title}
          icon={<Spinner className="h-5 w-5" />}
          title={copy.loadingConversationsTitle}
          description={copy.loadingConversationsDescription}
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
          eyebrow={copy.title}
          icon={<AlertCircle className="h-5 w-5" />}
          title={copy.conversationsErrorTitle}
          description={copy.conversationsErrorDescription}
          primaryAction={{
            label: copy.tryAgain,
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
          eyebrow={copy.title}
          icon={<MessageSquareMore className="h-5 w-5" />}
          title={copy.noConversationsTitle}
          description={copy.noConversationsDescription}
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
            title={item.displayName || copy.defaultUser}
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
