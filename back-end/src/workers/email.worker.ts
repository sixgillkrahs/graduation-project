import {
  SendPasswordResetEmailJob,
  SendRejectEmailJob,
  SendVerifyEmailJob,
} from "@/@types/jobTypes";
import { RedisConnection } from "@/config/redis";
import { Worker } from "bullmq";

export interface IEmailService {
  sendVerificationEmail(
    email: string,
    name: string | undefined,
    token: string,
  ): Promise<void>;
  sendPasswordResetEmail(
    to: string,
    name: string,
    resetToken: string,
  ): Promise<void>;
  sendRejectEmail(to: string, name: string, reason: string): Promise<void>;
}

export class EmailWorker {
  private worker: Worker;

  constructor(private emailService: IEmailService) {
    this.worker = new Worker(
      "email",
      async (job) => {
        if (job.name === "sendVerifyEmail") {
          const { email, name, token } = job.data as SendVerifyEmailJob;
          await this.emailService.sendVerificationEmail(email, name, token);
        } else if (job.name === "sendPasswordResetEmail") {
          const { to, name, resetToken } =
            job.data as SendPasswordResetEmailJob;
          await this.emailService.sendPasswordResetEmail(to, name, resetToken);
        } else if (job.name === "sendRejectEmail") {
          const { to, name, reason } = job.data as SendRejectEmailJob;
          await this.emailService.sendRejectEmail(to, name, reason);
        }
      },
      {
        connection: RedisConnection.getInstance(),
      },
    );

    this.worker.on("completed", (job) => {
      console.log(`[EmailWorker] completed job ${job.id}`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[EmailWorker] failed job ${job?.id}`, err);
    });
  }
}
