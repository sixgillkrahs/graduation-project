import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatChatTime } from "@/shared/helper/formatChatTime";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../services/socket-context";
import { CsButton } from "@/components/custom";
import { useGetMe } from "@/shared/auth/query";

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

  // Sync props messsages to local state when conversation changes or messages load
  useEffect(() => {
    if (messages) {
      setLocalMessages(messages);
    }
  }, [messages]);

  // Join conversation room
  useEffect(() => {
    if (!socket || !conversation?.id) return;

    socket.emit("chat:start", {
      header: { method: "GET" },
      body: { conversationId: conversation.id },
    });

    const handleReceiveMessage = (
      message: IConversationService.ConversationDetailDTO,
    ) => {
      // If the incoming message is from me, ensure isMine is true locally if backend handles it
      // or we check senderId here.
      // But for incoming real-time message, we might not have 'isMine' computed yet if it comes straight from socket broadcast without enrichment?
      // Actually, socket broadcast usually sends the raw object.
      // We can patch it here:
      const enrichedMessage = {
        ...message,
        isMine:
          (typeof message.senderId === "string"
            ? message.senderId
            : message.senderId.id) === myId,
      };
      setLocalMessages((prev) => [...prev, enrichedMessage]);

      // If message is NOT mine, mark it as read immediately if window is focused (or just do it since we are in the chat)
      if (!enrichedMessage.isMine && myId) {
        socket.emit("chat:read", {
          header: { method: "POST" },
          body: { conversationId: conversation.id, userId: myId },
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
      if (data.conversationId === conversation.id) {
        // Other user read my messages. Update local messages "isRead" status
        setLocalMessages((prev) =>
          prev.map((msg) => ({ ...msg, isRead: true })),
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
        body: { conversationId: conversation.id, userId: myId },
      });
    }

    return () => {
      socket.off("chat:receive", handleReceiveMessage);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:read", handleRead);
    };
  }, [socket, conversation?.id, myId]);

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
        conversationId: conversation.id,
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
      body: { conversationId: conversation.id, userId: myId, isTyping: "true" },
    });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:typing", {
        header: { method: "POST" },
        body: {
          conversationId: conversation.id,
          userId: myId,
          isTyping: "false",
        },
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localMessages?.map((msg) => {
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
                "flex w-full items-end gap-2 group mb-4",
                isSenderMe ? "justify-end" : "justify-start",
              )}
            >
              {!isSenderMe && (
                <Avatar
                  src={otherParticipant?.avatar}
                  alt={otherParticipant?.fullName}
                  className="w-8 h-8 shrink-0 mb-1"
                />
              )}

              {isSenderMe && (
                <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2 order-1">
                  {formatChatTime(msg.createdAt)}
                </span>
              )}

              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm relative order-2",
                  isSenderMe
                    ? "cs-bg-red text-white rounded-br-none"
                    : "bg-white text-gray-900 rounded-bl-none border border-gray-100",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {!isSenderMe && (
                <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2 order-3">
                  {formatChatTime(msg.createdAt)}
                </span>
              )}
            </div>
          );
        })}
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
          className="h-9 w-9 cs-bg-red rounded-full flex items-center justify-center text-white shadow-md hover:opacity-90 transition-opacity"
          icon={<Send className="w-4 h-4 mr-0.5" />}
        />
      </div>
    </div>
  );
};

export default ChatDetail;
