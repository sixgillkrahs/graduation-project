"use client";

import { ToastProvider } from "@/lib/react-hot-toast/ToastProvider";
import { queryClient } from "@/lib/react-query/queryClient";
import { store } from "@/store";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Provider } from "react-redux";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ToastProvider />
        {children}
      </Provider>
    </QueryClientProvider>
  );
};

export default Wrapper;
