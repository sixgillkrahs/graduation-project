import { ChatService } from "@/services/chat.service";
import { UserService } from "@/services/user.service";
import { WebSocketService } from "@/services/websocket.service";
import { BaseEvent } from "@/socket.io/base.event";
import { Socket } from "socket.io";

export class ChatEvent extends BaseEvent {
  private chatService: ChatService;
  private userService: UserService;

  constructor(chatService: ChatService, userService: UserService) {
    super();
    this.chatService = chatService;
    this.userService = userService;
  }

  chatStart = async (req: {
    header: {
      method: string;
    };
    body: {
      participants?: string[];
      conversationId?: string;
    };
    socket: Socket;
  }): Promise<{
    code: number;
    state: number;
    data: any;
    message?: string;
  }> => {
    return this.handleRequest(req, async () => {
      const { participants, conversationId } = req.body;
      const socket = req.socket;

      if (conversationId) {
        socket.join(conversationId);
        return {
          code: 200,
          state: 1,
          data: {
            conversationId,
            message: "Joined conversation room",
          },
        };
      }

      if (participants) {
        const user = await Promise.all(
          participants.map((id) => this.userService.getUserById(id)),
        );
        const userNotFound = user.some((userItem) => userItem === null);
        if (userNotFound) {
          return {
            code: 404,
            state: 0,
            data: {
              message: "User not found",
            },
          };
        }
        const conversation =
          await this.chatService.createConversation(participants);
        const room = conversation._id.toString();
        socket.join(room);
        return {
          code: 200,
          state: 1,
          data: {
            users: user,
          },
        };
      }

      return {
        code: 400,
        state: 0,
        message: "Missing conversationId or participants",
        data: null,
      };
    });
  };

  sendMessage = async (req: {
    header: {
      method: string;
    };
    body: {
      conversationId: string;
      senderId: string;
      content: string;
    };
    socket: Socket;
  }): Promise<{
    code: number;
    state: number;
    data: any;
    message?: string;
  }> => {
    return this.handleRequest(req, async () => {
      console.log("Processing sendMessage request:", JSON.stringify(req.body));
      const { conversationId, senderId, content } = req.body;

      const wsService = WebSocketService.getInstance();
      if (!conversationId || !senderId || !content) {
        console.error("Missing fields in sendMessage:", req.body);
        throw new Error("Missing fields");
      }

      const message = await this.chatService.sendMessage(
        conversationId,
        senderId,
        content,
      );

      console.log("Message saved, emitting to room:", conversationId);
      wsService.getWss().to(conversationId).emit("chat:receive", message);

      return {
        code: 200,
        state: 1,
        data: {
          users: conversationId,
        },
      };
    });
  };

  typingMessage = async (req: {
    header: {
      method: string;
    };
    body: {
      conversationId: string;
      userId: string;
      isTyping: string;
    };
    socket: Socket;
  }): Promise<{
    code: number;
    state: number;
    data: any;
    message?: string;
  }> => {
    return this.handleRequest(req, async () => {
      const { conversationId, userId, isTyping } = req.body;
      req.socket
        .to(conversationId)
        .emit("chat:typing", { conversationId, userId, isTyping });

      return {
        code: 200,
        state: 1,
        message: "Typing status sent",
      };
    });
  };

  readMessage = async (req: {
    header: { method: string };
    body: { conversationId: string; userId: string };
    socket: Socket;
  }): Promise<{
    code: number;
    state: number;
    data: any;
    message?: string;
  }> => {
    return this.handleRequest(req, async () => {
      const { conversationId, userId } = req.body;

      await this.chatService.markMessagesAsRead(conversationId, userId);

      // Notify others in the room that messages have been read
      req.socket
        .to(conversationId)
        .emit("chat:read", { conversationId, userId });

      return {
        code: 200,
        state: 1,
        message: "Messages marked as read",
      };
    });
  };
}
