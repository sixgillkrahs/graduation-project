import { ISocketEventSetting } from "@/@types/socket";
import { HeroService } from "@/services/hero.service";
import { eventProcess } from "@/socket.io/event";
import { Socket } from "socket.io";

const heroService = new HeroService()

export function ChatChit(socket: Socket) {
    const chatchitEventSetting: ISocketEventSetting = {
        name: "chatchit",
        method: "GET",
        action: handler,
    };

    async function handler(data: {
        body: any;
        header: any
    }): Promise<{
        code: number;
        state: number;
        data: any;
    }> {
        const resp = await heroService.test()
        return {
            code: 200,
            state: 1,
            data: resp,
        }
    }

    eventProcess(socket, chatchitEventSetting);
}

