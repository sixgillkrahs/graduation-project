import { Socket } from "socket.io";
import { ChatService } from "@/services/chat.service";
import { WebSocketService } from "@/services/websocket.service";
import { ISocketEventSetting, SocketEventAction } from "@/@types/socket";
import { eventProcess } from "@/socket.io/event";

const chatService = new ChatService();
