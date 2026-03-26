"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { PhotoProvider } from "react-photo-view";
import { Provider } from "react-redux";
import { GlobalAuthDialog } from "@/components/custom/auth/GlobalAuthDialog";
import { SocketProvider } from "@/components/features/message/services/socket-context";
import { LandingSettingsProvider } from "@/components/providers/LandingSettingsProvider";
import PropertyCompareSync from "@/components/features/properties/compare/PropertyCompareSync";
import { ThemeProvider } from "@/components/theme-provider";
import type { LandingSettings } from "@/lib/landing-settings";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/react-query/queryClient";
import { store } from "@/store";

const Wrapper = ({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: LandingSettings;
}) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LandingSettingsProvider settings={settings}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PropertyCompareSync />
            <SocketProvider>
              <PhotoProvider>{children}</PhotoProvider>
              <Toaster position="top-right" />
              <GlobalAuthDialog />
            </SocketProvider>
          </Provider>
        </QueryClientProvider>
      </LandingSettingsProvider>
    </ThemeProvider>
  );
};

export default Wrapper;
