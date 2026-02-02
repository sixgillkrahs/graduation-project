import { BaseEvent } from "@/socket.io/base.event";
import { Socket } from "socket.io";

export class NoticeEvent extends BaseEvent {
  constructor() {
    super();
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
      console.log(`[NoticeEvent] Socket ${socket.id} joining room: ${userId}`);
      socket.join(userId);
      return {
        code: 200,
        state: 1,
        message: "Success",
        data: null,
      };
    });
  };
}
