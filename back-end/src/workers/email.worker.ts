import {
  SendOTPEmailJob,
  SendPasswordResetEmailJob,
  SendRejectEmailJob,
  SendVerifyEmailJob,
} from "@/@types/jobTypes";
import { RedisConnection } from "@/config/redis";
import { EmailService } from "@/services/email.service";
import { Worker } from "bullmq";

export class EmailWorker {
  private worker: Worker;

  constructor(private emailService: EmailService) {
    this.worker = new Worker(
      "email",
      async (job) => {
        if (job.name === "sendVerifyEmail") {
          const { email, name, token } = job.data as SendVerifyEmailJob;
          await this.emailService.sendVerificationEmail(
            email,
            name || "",
            token,
          );
        } else if (job.name === "sendPasswordResetEmail") {
          const { to, name, resetToken } =
            job.data as SendPasswordResetEmailJob;
          await this.emailService.sendPasswordResetEmail(to, name, resetToken);
        } else if (job.name === "sendRejectEmail") {
          const { to, name, reason } = job.data as SendRejectEmailJob;
          await this.emailService.sendRejectEmail(to, name, reason);
        } else if (job.name === "sendOTPEmail") {
          const { to, otp } = job.data as SendOTPEmailJob;
          await this.emailService.sendOTPEmail(to, otp);
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
