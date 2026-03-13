import { formatChatTime } from "gra-helper";
import { MessageSquareMore, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CsButton } from "@/components/custom";
import { Avatar } from "@/components/ui/avatar";
import StateSurface from "@/components/ui/state-surface";
import { queryClient } from "@/lib/react-query/queryClient";
import { cn } from "@/lib/utils";
import { useGetMe } from "@/shared/auth/query";
import { ConversationsQueryKey } from "../services/config";
import { useSocket } from "../services/socket-context";

interface ChatDetailProps {
  messages: IConversationService.ConversationDetailDTO[];
  conversation: any;
}

const ChatDetail = ({ messages, conversation }: ChatDetailProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const socket = useSocket();
  const [localMessages, setLocalMessages] = useState<
    IConversationService.ConversationDetailDTO[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // We need current user ID for sending messages and typing events
  const { data: userData } = useGetMe();
  const myId = userData?.data?.userId?._id;
  const conversationId = conversation?.id || conversation?._id;

  const mergeMessages = (
    prevMessages: IConversationService.ConversationDetailDTO[],
    nextMessage: IConversationService.ConversationDetailDTO,
  ) => {
    const exists = prevMessages.some(
      (message) => message.id === nextMessage.id,
    );

    if (exists) {
      return prevMessages.map((message) =>
        message.id === nextMessage.id
          ? { ...message, ...nextMessage }
          : message,
      );
    }

    return [...prevMessages, nextMessage];
  };

  const updateConversationDetailCache = (
    nextMessage: IConversationService.ConversationDetailDTO,
  ) => {
    if (!conversationId) {
      return;
    }

    queryClient.setQueryData(
      [ConversationsQueryKey.conversationDetail, conversationId],
      (oldData: any) => {
        if (!oldData?.data) {
          return oldData;
        }

        return {
          ...oldData,
          data: {
            ...oldData.data,
            results: mergeMessages(oldData.data.results || [], nextMessage),
          },
        };
      },
    );
  };

  const updateConversationsCache = (
    nextMessage: IConversationService.ConversationDetailDTO,
  ) => {
    queryClient.setQueryData(
      [ConversationsQueryKey.conversations],
      (oldData: any) => {
        if (!oldData?.data?.results) {
          return oldData;
        }

        const nextResults = [...oldData.data.results];
        const targetIndex = nextResults.findIndex(
          (item) => item.id === conversationId,
        );

        if (targetIndex === -1) {
          return oldData;
        }

        const targetConversation = nextResults[targetIndex];
        const senderId =
          typeof nextMessage.senderId === "string"
            ? nextMessage.senderId
            : nextMessage.senderId.id;
        const isIncomingMessage = senderId !== myId;
        nextResults[targetIndex] = {
          ...targetConversation,
          lastMessage: {
            id: nextMessage.id,
            content: nextMessage.content,
            type: "TEXT",
            senderId,
            createdAt: nextMessage.createdAt,
            isRead: nextMessage.isRead,
          },
          updatedAt: nextMessage.createdAt,
          unreadCount:
            isIncomingMessage && !nextMessage.isRead
              ? (targetConversation.unreadCount || 0) + 1
              : 0,
        };

        const [latestConversation] = nextResults.splice(targetIndex, 1);

        return {
          ...oldData,
          data: {
            ...oldData.data,
            results: [latestConversation, ...nextResults],
          },
        };
      },
    );
  };

  // Sync props messsages to local state when conversation changes or messages load
  useEffect(() => {
    if (messages) {
      setLocalMessages(messages);
    }
  }, [messages]);

  // Join conversation room
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("chat:start", {
      header: { method: "GET" },
      body: { conversationId },
    });

    const handleReceiveMessage = (
      message: IConversationService.ConversationDetailDTO,
    ) => {
      const enrichedMessage = {
        ...message,
        isMine:
          (typeof message.senderId === "string"
            ? message.senderId
            : message.senderId.id) === myId,
      };
      setLocalMessages((prev) => mergeMessages(prev, enrichedMessage));
      updateConversationDetailCache(enrichedMessage);
      updateConversationsCache(enrichedMessage);

      if (!enrichedMessage.isMine && myId) {
        socket.emit("chat:read", {
          header: { method: "POST" },
          body: { conversationId, userId: myId },
        });
      }
    };

    const handleTyping = (data: {
      conversationId: string;
      userId: string;
      isTyping: string;
    }) => {
      if (data.userId !== myId) {
        setIsTyping(data.isTyping === "true");
      }
    };

    // Handle read receipt from other user
    const handleRead = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        setLocalMessages((prev) =>
          prev.map((msg) => ({ ...msg, isRead: true })),
        );
        queryClient.setQueryData(
          [ConversationsQueryKey.conversations],
          (oldData: any) => {
            if (!oldData?.data?.results) {
              return oldData;
            }

            return {
              ...oldData,
              data: {
                ...oldData.data,
                results: oldData.data.results.map((item: any) =>
                  item.id === conversationId
                    ? {
                        ...item,
                        unreadCount: 0,
                        lastMessage: item.lastMessage
                          ? { ...item.lastMessage, isRead: true }
                          : item.lastMessage,
                      }
                    : item,
                ),
              },
            };
          },
        );
        queryClient.setQueryData(
          [ConversationsQueryKey.conversationDetail, conversationId],
          (oldData: any) => {
            if (!oldData?.data?.results) {
              return oldData;
            }

            return {
              ...oldData,
              data: {
                ...oldData.data,
                results: oldData.data.results.map((message: any) => ({
                  ...message,
                  isRead: true,
                })),
              },
            };
          },
        );
      }
    };

    // Listen for incoming messages
    socket.on("chat:receive", handleReceiveMessage);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:read", handleRead);

    // Mark as read when entering the room
    if (myId) {
      socket.emit("chat:read", {
        header: { method: "POST" },
        body: { conversationId, userId: myId },
      });
    }

    return () => {
      socket.off("chat:receive", handleReceiveMessage);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:read", handleRead);
    };
  }, [socket, conversationId, myId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, isTyping]);

  const otherParticipant = {
    fullName: conversation?.displayName,
    avatar: conversation?.displayAvatar,
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !socket || !myId) return;

    const payload = {
      header: { method: "POST" },
      body: {
        conversationId,
        senderId: myId,
        content: inputValue.trim(),
      },
    };

    socket.emit("chat:send", payload);
    setInputValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (!socket || !myId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("chat:typing", {
      header: { method: "POST" },
      body: { conversationId, userId: myId, isTyping: "true" },
    });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:typing", {
        header: { method: "POST" },
        body: {
          conversationId,
          userId: myId,
          isTyping: "false",
        },
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localMessages.length === 0 ? (
          <div className="flex h-full min-h-64 items-center justify-center">
            <StateSurface
              size="compact"
              tone="brand"
              eyebrow="Conversation"
              icon={<MessageSquareMore className="h-5 w-5" />}
              title="No messages yet"
              description={`Start the conversation with ${otherParticipant.fullName || "this contact"} from the composer below.`}
            />
          </div>
        ) : (
          localMessages?.map((msg) => {
            // Use backend-provided isMine, or fall back to ID comparison if missing (e.g. realtime before refresh)
            const isSenderMe =
              msg.isMine !== undefined
                ? msg.isMine
                : (typeof msg.senderId === "string"
                    ? msg.senderId
                    : msg.senderId.id) === myId;

            return (
              <div
                key={msg.id}
                className={cn(
                  "group mb-4 flex w-full items-end gap-2",
                  isSenderMe ? "justify-end" : "justify-start",
                )}
              >
                {!isSenderMe && (
                  <Avatar
                    src={otherParticipant?.avatar}
                    alt={otherParticipant?.fullName}
                    className="mb-1 h-8 w-8 shrink-0"
                  />
                )}

                {isSenderMe && (
                  <span className="order-1 mb-2 text-[10px] text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                    {formatChatTime(msg.createdAt)}
                  </span>
                )}

                <div
                  className={cn(
                    "relative order-2 max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                    isSenderMe
                      ? "cs-bg-red rounded-br-none text-white"
                      : "rounded-bl-none border border-gray-100 bg-white text-gray-900",
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {!isSenderMe && (
                  <span className="order-3 mb-2 text-[10px] text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                    {formatChatTime(msg.createdAt)}
                  </span>
                )}
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex w-full items-end gap-2 mb-4 justify-start">
            <Avatar
              src={otherParticipant?.avatar}
              alt={otherParticipant?.fullName}
              className="w-8 h-8 shrink-0 mb-1"
            />
            <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-2 text-sm border border-gray-200">
              <span className="text-gray-500 text-xs italic">Typing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
        <input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
          placeholder="Type a message..."
        />
        <CsButton
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
          className="h-9 w-9 cs-bg-red rounded-full flex items-center justify-center text-white shadow-md hover:opacity-90 transition-opacity"
          icon={<Send className="w-4 h-4 mr-0.5" />}
        />
      </div>
    </div>
  );
};

export default ChatDetail;
