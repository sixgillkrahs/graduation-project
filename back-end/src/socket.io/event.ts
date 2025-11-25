import { processingSocket } from '@/middleware/processingSocket';
// import { ISocketEventSetting } from "@/@types/global";
import { Socket } from "socket.io";
import { ChatChit } from "./event-handlers";
import { processResponse } from "@/middleware/processingSocket";
import { ISocketEventSetting } from '@/@types/socket';


export function socketEventHandle(socket: Socket) {
    ChatChit(socket);
}

export const eventProcess = (
    socket: Socket,
    setting: ISocketEventSetting,
): void => {
    socket.on(setting.name, (data) => {
        processingSocket(socket, setting, data).then(({ req }) => {
            setting.action(data, socket).then((resp) => {
                socket.emit(setting.name, processResponse(resp));
            }).catch((err) => {
                console.error(`Error processing ${setting.name} event:`, err);
                socket.emit(setting.name, { error: 'Internal server error' });
            });
        });
    })
}

// export const eventProcess = (socket: Socket, setting: ISocketEventSetting): void => {
//     socket.on(setting.name, (data: any) => {
//         console.log(`[WS] Event ${setting.name} received, socket: ${socket.id}, data:`, JSON.stringify(data, null, 2));
//         processingSocket(socket, data, setting.serviceAction).catch((error: any) => {
//             console.error(`[WS] Error processing ${setting.name}, socket: ${socket.id}, error:`, error);
//             socket.emit("error", { message: "Internal server error", error });
//         });
//     });
// };