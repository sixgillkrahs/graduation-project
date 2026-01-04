import {
  SendOTPEmailJob,
  SendPasswordResetEmailJob,
  SendRejectEmailJob,
  SendVerifyEmailJob,
} from "@/@types/jobTypes";
import { redisConnection } from "@/config/redis.connection";
import { Queue } from "bullmq";

export class EmailQueue {
  private queue: Queue;

  constructor() {
    console.log("initial jobs");
    this.queue = new Queue("email", {
      connection: redisConnection,
    });
  }

  enqueueVerifyEmail(data: SendVerifyEmailJob) {
    const jobId = `verify:${data.email}:${data.token}`;

    return this.queue.add("sendVerifyEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  enqueuePasswordResetEmail(data: SendPasswordResetEmailJob) {
    const jobId = `password-reset:${data.to}`;
    return this.queue.add("sendPasswordResetEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  enqueueRejectEmail(data: SendRejectEmailJob) {
    const jobId = `reject-email:${data.to}`;
    return this.queue.add("sendRejectEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  sendOTPEmail(data: SendOTPEmailJob) {
    const jobId = `otp-email-${data.to}`;
    return this.queue.add("sendOTPEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
