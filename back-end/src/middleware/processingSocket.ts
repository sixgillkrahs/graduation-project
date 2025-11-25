import { ISocketEventSetting } from "@/@types/socket";
import { Socket } from "socket.io";


export const processingSocket = (socket: Socket, setting: ISocketEventSetting, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!data?.body || !data?.header || !data?.header?.method) {
            reject(new Error('No data body or header'));
            return;
        }
        const req = {
            body: data?.body,
            header: data?.header,
            event: setting,
            requestTime: new Date(Date.now()).toISOString(),
            prototype: "SOCKET",
            method: data?.header?.method,
            clientIP: socket.handshake.address || 'unknown',
        };
        resolve({ req });
    })
}

export const processResponse = (result: any): object => {
    const response = {
        code: result.code,
        state: result.state ?? 2,
        data: result.data,
        message: result.message
    };
    return response;
}