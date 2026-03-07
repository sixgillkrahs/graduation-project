import { SendNotificationJob } from "@/@types/jobTypes";
import { redisConnection } from "@/config/redis.connection";
import { NoticeService } from "@/services/notice.service";
import { WebSocketService } from "@/services/websocket.service";
import { Worker } from "bullmq";

export class NotificationWorker {
  private worker: Worker;

  constructor(private noticeService: NoticeService) {
    this.worker = new Worker(
      "notification",
      async (job) => {
        if (job.name === "sendNotification") {
          const { userId, title, content, type, metadata, socketEvent } =
            job.data as SendNotificationJob;

          // 1. Save to DB
          const notice = await this.noticeService.createNotice({
            userId: userId as any,
            title,
            content,
            isRead: false,
            type: type as any,
            metadata,
          });

          // 2. Emit via Socket.IO to the user's room
          const wsService = WebSocketService.getInstance();
          const io = wsService.getWss();

          if (io) {
            const eventName = socketEvent || "notification:new";
            const payload = {
              id: (notice as any).id || (notice as any)._id,
              message: content,
              title,
              status: type,
              type,
              timestamp: (notice as any).createdAt || new Date().toISOString(),
              isRead: false,
              metadata,
            };

            io.to(userId).emit(eventName, payload);
            console.log(
              `[NotificationWorker] Sent "${eventName}" to room ${userId}`,
            );
          }
        }
      },
      {
        connection: redisConnection,
      },
    );

    this.worker.on("completed", (job) => {
      console.log(`[NotificationWorker] completed job ${job.id}`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[NotificationWorker] failed job ${job?.id}`, err);
    });
  }
}
