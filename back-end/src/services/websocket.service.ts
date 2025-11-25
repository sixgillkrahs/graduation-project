import { singleton } from '@/decorators/singleton';
import { Server } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { MetricsService } from './metrics.service';
import { socketEventHandle } from '@/socket.io/event';

@singleton
export class WebSocketService {
    private static instance: WebSocketService;
    private metricsService: MetricsService;
    private wss!: IOServer;

    constructor() {
        this.metricsService = new MetricsService();
    }

    public static getInstance(server?: Server): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
            if (server) {
                WebSocketService.instance.initialize(server);
            }
        }
        return WebSocketService.instance;
    }

    public initialize(server: Server): void {
        if (this.wss) return; // tránh khởi tạo lại
        this.wss = new IOServer(server, {
            cors: {
                origin: '*', // tùy config
            },
            path: "/io"
        });
        this.setupEvents();
        console.log('[WebSocketService] initialized');
    }

    private setupEvents(): void {
        this.wss.on('connection', (socket: Socket) => {
            console.log(`[WS] Client connected: ${socket.id}`);
            this.metricsService.recordWebsocketConnection(true);

            socketEventHandle(socket);

            socket.on('disconnect', (reason) => {
                console.log(`[WS] Client disconnected: ${socket.id}, reason: ${reason}`);
                this.metricsService.recordWebsocketConnection(false);
            });

            socket.on("error", (err) => {
                console.error(`[WS] Client error: ${socket.id}, error: ${err.message}`);
            })

            socket.on("message", (msg: string) => {
                console.log(`[WS] Client message: ${socket.id}, message: ${msg}`);
                this.metricsService.recordWebsocketMessage('message', 'in');
            })
        });
    }

    // Gửi tin cho 1 client cụ thể
    public sendToClient(socketId: string, event: string, data: any): void {
        this.wss.to(socketId).emit(event, data);
    }

    // Broadcast cho tất cả client
    public broadcast(event: string, data: any): void {
        this.wss.emit(event, data);
    }

    public getWss(): IOServer {
        return this.wss;
    }
}
