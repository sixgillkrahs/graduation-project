"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { PhotoProvider } from "react-photo-view";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { GlobalAuthDialog } from "@/components/custom/auth/GlobalAuthDialog";
import { SocketProvider } from "@/components/features/message/services/socket-context";
import { ThemeProvider } from "@/components/theme-provider";
import { queryClient } from "@/lib/react-query/queryClient";
import { store } from "@/store";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <SocketProvider>
            <PhotoProvider>{children}</PhotoProvider>
            <Toaster />
            <GlobalAuthDialog />
          </SocketProvider>
        </Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Wrapper;
