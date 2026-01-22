import { ISocketEventSetting } from "@/@types/socket";
import { AppError } from "@/utils/appError";
import { Socket } from "socket.io";

export const processingSocket = (
  socket: Socket,
  setting: ISocketEventSetting,
  data: any,
) => {
  if (!data?.body || !data?.header) {
    throw new AppError("Missing body/header");
  }

  if (data?.header?.method !== setting.method) {
    throw new AppError("Invalid method");
  }

  return {
    req: {
      body: data.body,
      header: data.header,
      event: setting,
      requestTime: new Date().toISOString(),
      prototype: "SOCKET",
      method: data.header.method,
      clientIP: socket.handshake.address || "unknown",
      socket: socket,
    },
  };
};

export const processResponse = (result: any): object => {
  const response = {
    code: result.code,
    state: result.state ?? 2,
    data: result.data,
    message: result.message,
  };
  return response;
};
