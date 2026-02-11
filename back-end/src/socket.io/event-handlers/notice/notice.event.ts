import { BaseEvent } from "@/socket.io/base.event";
import { Socket } from "socket.io";
import { UserService } from "@/services/user.service";

export class NoticeEvent extends BaseEvent {
  userService: UserService;
  constructor(userService: UserService) {
    super();
    this.userService = userService;
  }

  identity = async (req: {
    header: {
      method: string;
    };
    body: {
      userId: string;
    };
    socket: Socket;
  }): Promise<{
    code: number;
    state: number;
    data: any;
    message?: string;
  }> => {
    return this.handleRequest(req, async () => {
      const { userId } = req.body;
      const socket = req.socket;
      if (!userId) {
        return {
          code: 400,
          state: 0,
          message: "Missing userId",
          data: null,
        };
      }
      const user = await this.userService.getUserById(userId);
      if (!user) {
        return {
          code: 404,
          state: 0,
          message: "User not found",
          data: null,
        };
      }

      console.log(`[NoticeEvent] Socket ${socket.id} joining room: ${userId}`);
      socket.join(userId);
      socket.data.user = user;

      return {
        code: 200,
        state: 1,
        message: "Success",
        data: null,
      };
    });
  };
}
