"use client";

import { queryClient } from "@/lib/react-query/queryClient";
import { store } from "@/store";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { PhotoProvider } from "react-photo-view";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

import { SocketProvider } from "@/components/features/message/services/socket-context";
import { CallProvider } from "@/components/features/call/CallProvider";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <SocketProvider>
          <CallProvider>
            <PhotoProvider>{children}</PhotoProvider>
            <Toaster />
          </CallProvider>
        </SocketProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default Wrapper;
