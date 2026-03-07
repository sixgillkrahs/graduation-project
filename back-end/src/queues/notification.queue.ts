import { SendNotificationJob } from "@/@types/jobTypes";
import { redisConnection } from "@/config/redis.connection";
import { Queue } from "bullmq";

export class NotificationQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("notification", {
      connection: redisConnection,
    });
  }

  enqueueNotification(data: SendNotificationJob) {
    const jobId = `notification:${data.userId}:${Date.now()}`;
    return this.queue.add("sendNotification", data, {
      jobId,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
