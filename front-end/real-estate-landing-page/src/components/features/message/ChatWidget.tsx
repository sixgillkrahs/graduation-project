"use client";

import { CsButton } from "@/components/custom";
import { ArrowLeft, MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import ListChat from "./components/ListChat";
import { useConversationDetail } from "./services/query";
import { Spinner } from "@/components/ui/spinner";
import ChatDetail from "./components/ChatDetail";
import { SocketProvider } from "./services/socket-context";
import { useGetMe } from "@/shared/auth/query";

const ChatWidget = () => {
  const { data: me } = useGetMe();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const { data, isLoading } = useConversationDetail(selectedConversation?.id);

  if (!me?.data?.userId) {
    return null;
  }

  return (
    <SocketProvider>
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <CsButton
              onClick={() => setIsOpen(true)}
              className="h-10 w-10 rounded-full shadow-lg flex items-center justify-center p-0"
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </CsButton>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            <div className="cs-bg-red text-white p-4 flex items-center justify-between shrink-0 z-10 relative">
              <div className="font-semibold text-lg flex items-center gap-2">
                {selectedConversation ? (
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="hover:bg-white/20 rounded-full p-1 -ml-2 mr-1 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                ) : (
                  <MessageCircle className="h-5 w-5" />
                )}
                <span className="truncate max-w-[200px]">
                  {selectedConversation
                    ? selectedConversation.participants?.[1]?.fullName || "Chat"
                    : "Messages"}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative bg-gray-50">
              <AnimatePresence initial={false} mode="popLayout">
                {selectedConversation ? (
                  <motion.div
                    key="chat"
                    initial={{ x: -380, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -380, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 bg-white flex flex-col"
                  >
                    {isLoading ? (
                      <div className="p-4 flex-1 overflow-y-auto justify-center items-center h-full w-full">
                        <Spinner />
                      </div>
                    ) : (
                      <ChatDetail
                        messages={data?.data?.results || []}
                        conversation={selectedConversation}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ x: -380, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 380, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 overflow-y-auto"
                  >
                    <ListChat onSelectConversation={setSelectedConversation} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SocketProvider>
  );
};

export default ChatWidget;
