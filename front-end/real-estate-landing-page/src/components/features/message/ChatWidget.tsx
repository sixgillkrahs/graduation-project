"use client";

import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { CsButton } from "@/components/custom";
import { cn } from "@/lib/utils";
import ListChat from "./components/ListChat";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
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
            <div className="cs-bg-red text-white p-4 flex items-center justify-between shrink-0">
              <div className="font-semibold text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>Messages</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50">
              <ListChat />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
