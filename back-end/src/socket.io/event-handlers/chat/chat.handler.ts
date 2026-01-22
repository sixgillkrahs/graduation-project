import { Socket } from "socket.io";
import { ChatService } from "@/services/chat.service";
import { WebSocketService } from "@/services/websocket.service";
import { ISocketEventSetting, SocketEventAction } from "@/@types/socket";
import { eventProcess } from "@/socket.io/event";

const chatService = new ChatService();

// const chatStartAction: SocketEventAction = async (data, socket) => {
//   const { participants } = data.body;
//   if (!participants || participants.length < 2) {
//     throw new Error("Invalid participants");
//   }
//   const conversation = await chatService.createConversation(participants);

//   // Auto join the room
//   const room = conversation._id.toString();
//   socket.join(room);

//   // Note: Original code emitted 'chat:started'.
//   // eventProcess will emit response on 'chat:start'.
//   // If strict backward compat is needed, we could allow manual emit, but standardizing implies using the return.

//   return {
//     code: 200,
//     state: 1,
//     data: conversation,
//     message: "Chat started successfully",
//   };
// };

// const chatJoinAction: SocketEventAction = async (data, socket) => {
//   const { conversationId } = data.body;
//   if (!conversationId) throw new Error("Missing conversationId");

//   socket.join(conversationId);

//   return {
//     code: 200,
//     state: 1,
//     message: `Joined room ${conversationId}`,
//   };
// };

// const chatLeaveAction: SocketEventAction = async (data, socket) => {
//   const { conversationId } = data.body;
//   if (!conversationId) throw new Error("Missing conversationId");

//   socket.leave(conversationId);

//   return {
//     code: 200,
//     state: 1,
//     message: `Left room ${conversationId}`,
//   };
// };

// const chatSendAction: SocketEventAction = async (data, socket) => {
//   const { conversationId, senderId, content } = data.body;
//   const wsService = WebSocketService.getInstance();

//   if (!conversationId || !senderId || !content) {
//     throw new Error("Missing fields");
//   }

//   const message = await chatService.sendMessage(
//     conversationId,
//     senderId,
//     content,
//   );

//   // Broadcast to everyone in the room
//   wsService.getWss().to(conversationId).emit("chat:receive", message);

//   return {
//     code: 200,
//     state: 1,
//     data: message,
//     message: "Message sent",
//   };
// };

// const chatTypingAction: SocketEventAction = async (data, socket) => {
//   const { conversationId, userId, isTyping } = data.body;
//   // Broadcast to others in the room
//   socket
//     .to(conversationId)
//     .emit("chat:typing", { conversationId, userId, isTyping });

//   return {
//     code: 200,
//     state: 1,
//     message: "Typing status sent",
//   };
// };

// const chatReadAction: SocketEventAction = async (data, socket) => {
//   const { conversationId, userId } = data.body;

//   await chatService.markMessagesAsRead(conversationId, userId);

//   socket.to(conversationId).emit("chat:read_receipt", {
//     conversationId,
//     userId,
//   });

//   return {
//     code: 200,
//     state: 1,
//     message: "Messages marked as read",
//   };
// };

// export function ChatHandler(socket: Socket) {
//   const events: ISocketEventSetting[] = [
//     { name: "chat:start", method: "POST", action: chatStartAction },
//     { name: "chat:join", method: "POST", action: chatJoinAction },
//     { name: "chat:leave", method: "POST", action: chatLeaveAction },
//     { name: "chat:send", method: "POST", action: chatSendAction },
//     { name: "chat:typing", method: "POST", action: chatTypingAction },
//     { name: "chat:read", method: "PUT", action: chatReadAction },
//   ];

//   events.forEach((setting) => eventProcess(socket, setting));
// }
