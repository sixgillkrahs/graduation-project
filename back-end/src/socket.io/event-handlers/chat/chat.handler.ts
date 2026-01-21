import { Socket } from "socket.io";
import { ChatService } from "@/services/chat.service";
import { WebSocketService } from "@/services/websocket.service";

const chatService = new ChatService();

export function ChatHandler(socket: Socket) {
  const wsService = WebSocketService.getInstance();

  // Event: chat:start
  // Initialize or fetch conversation
  socket.on("chat:start", async (data: { participants: string[] }) => {
    try {
      if (!data.participants || data.participants.length < 2) {
        socket.emit("chat:error", { message: "Invalid participants" });
        return;
      }
      const conversation = await chatService.createConversation(
        data.participants,
      );

      // Auto join the room
      const room = conversation._id.toString();
      socket.join(room);

      socket.emit("chat:started", conversation);
    } catch (error: any) {
      console.error("Chat start error:", error);
      socket.emit("chat:error", { message: error.message || "Internal error" });
    }
  });

  // Event: chat:join
  socket.on("chat:join", async (data: { conversationId: string }) => {
    if (!data.conversationId) return;
    socket.join(data.conversationId);
    // console.log(`Socket ${socket.id} joined room ${data.conversationId}`);
  });

  // Event: chat:leave
  socket.on("chat:leave", async (data: { conversationId: string }) => {
    if (!data.conversationId) return;
    socket.leave(data.conversationId);
  });

  // Event: chat:send
  socket.on(
    "chat:send",
    async (data: {
      conversationId: string;
      senderId: string;
      content: string;
    }) => {
      try {
        const { conversationId, senderId, content } = data;

        if (!conversationId || !senderId || !content) {
          socket.emit("chat:error", { message: "Missing fields" });
          return;
        }

        const message = await chatService.sendMessage(
          conversationId,
          senderId,
          content,
        );

        // Broadcast to everyone in the room (including sender to confirm receipt/update UI)
        wsService.getWss().to(conversationId).emit("chat:receive", message);
      } catch (error) {
        console.error("Chat error:", error);
        socket.emit("chat:error", { message: "Internal server error" });
      }
    },
  );

  // Event: chat:typing
  socket.on(
    "chat:typing",
    (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      // Broadcast to others in the room
      socket.to(data.conversationId).emit("chat:typing", data);
    },
  );

  // Event: chat:read (optional)
  socket.on(
    "chat:read",
    async (data: { conversationId: string; userId: string }) => {
      try {
        await chatService.markMessagesAsRead(data.conversationId, data.userId);
        socket
          .to(data.conversationId)
          .emit("chat:read_receipt", {
            conversationId: data.conversationId,
            userId: data.userId,
          });
      } catch (e) {
        console.error(e);
      }
    },
  );
}
