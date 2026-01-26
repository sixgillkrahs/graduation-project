import { ISocketEventSetting } from "@/@types/socket";
import { processingSocket } from "@/middleware/processingSocket";
import { ChatService } from "@/services/chat.service";
import { UserService } from "@/services/user.service";
import { Socket } from "socket.io";
import { ChatEvent } from "./event-handlers/chat/chat.event";

const chatEvent = new ChatEvent(new ChatService(), new UserService());

export function socketEventHandle(socket: Socket) {
  eventProcess(socket, {
    name: "chat:start",
    method: "GET",
    action: chatEvent.chatStart,
  });
  eventProcess(socket, {
    name: "chat:send",
    method: "POST",
    action: chatEvent.sendMessage,
  });
  eventProcess(socket, {
    name: "chat:typing",
    method: "POST",
    action: chatEvent.typingMessage,
  });
  eventProcess(socket, {
    name: "chat:read",
    method: "POST",
    action: chatEvent.readMessage,
  });
}

export const eventProcess = (
  socket: Socket,
  setting: ISocketEventSetting,
): void => {
  socket.on(setting.name, async (data) => {
    try {
      const { req } = await processingSocket(socket, setting, data);

      const resp = await setting.action(req);

      socket.emit(setting.name, resp);
    } catch (err: any) {
      console.error(`Error processing ${setting.name}:`, err);
      socket.emit(setting.name, {
        error: err?.message || "Internal server error",
      });
    }
  });
};
