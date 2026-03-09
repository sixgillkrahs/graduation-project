"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { RootState } from "@/store";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const socketBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_SOCKET ||
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:8080";

    const socketInstance = io(
      socketBaseUrl,
      {
        transports: ["websocket"],
        autoConnect: true,
        path: "/io",
      },
    );

    socketInstance.on("connect", () => {
      console.log("[Socket] Connected:", socketInstance.id);

      // Auto-identity if user exists on connect
      const userId = user?.id || user?._id;
      if (userId) {
        socketInstance.emit("identity", {
          header: { method: "POST" },
          body: { userId },
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]); // Re-run if user changes to re-emit identity

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
