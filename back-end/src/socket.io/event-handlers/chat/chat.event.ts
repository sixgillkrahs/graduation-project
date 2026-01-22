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
      participants: string[];
    };
    socket: Socket;
  }): Promise<{
    code: number;
    state: number;
    data: any;
    message?: string;
  }> => {
    return this.handleRequest(req, async () => {
      const { participants } = req.body;
      const socket = req.socket;
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
      const { conversationId, senderId, content } = req.body;
      const wsService = WebSocketService.getInstance();
      if (!conversationId || !senderId || !content) {
        throw new Error("Missing fields");
      }

      const message = await this.chatService.sendMessage(
        conversationId,
        senderId,
        content,
      );

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
}
