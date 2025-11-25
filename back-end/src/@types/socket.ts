import { Socket } from "socket.io";

export type SocketEventAction = (data: {
    body: any;
    header: any
}, socket: Socket) => Promise<{
    code: number;
    state: number;
    data?: any;
    message?: string;
}>;
export interface ISocketEventSetting {
    name: string;
    method: string;
    action: SocketEventAction;
}