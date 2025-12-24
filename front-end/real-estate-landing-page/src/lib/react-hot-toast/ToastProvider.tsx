"use client";

import { Toaster } from "react-hot-toast";

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Bạn có thể config default style ở đây nếu không muốn custom 100%
        duration: 3000,
      }}
    />
  );
};
