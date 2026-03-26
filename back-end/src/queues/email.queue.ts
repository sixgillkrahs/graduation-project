import {
  SendAppointmentConfirmedEmailJob,
  SendOTPEmailJob,
  SendPasswordResetEmailJob,
  SendRejectEmailJob,
  SendReviewInvitationEmailJob,
  SendVerifyEmailJob,
  SendDealClosedEmailJob,
  SendAccountLockedEmailJob,
  SendUnlockRequestReviewedEmailJob,
} from "@/@types/jobTypes";
import { redisConnection } from "@/config/redis.connection";
import { createBullMqJobId } from "@/utils/bullmq";
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
    const jobId = createBullMqJobId("verify", data.email, data.token);

    return this.queue.add("sendVerifyEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  enqueuePasswordResetEmail(data: SendPasswordResetEmailJob) {
    const jobId = createBullMqJobId("password-reset", data.to);
    return this.queue.add("sendPasswordResetEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  enqueueRejectEmail(data: SendRejectEmailJob) {
    const jobId = createBullMqJobId("reject-email", data.to);
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

  enqueueAppointmentConfirmedEmail(data: SendAppointmentConfirmedEmailJob) {
    const jobId = createBullMqJobId(
      "appointment-confirmed",
      data.to,
      Date.now(),
    );
    return this.queue.add("sendAppointmentConfirmedEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  enqueueDealClosedEmail(data: SendDealClosedEmailJob) {
    const jobId = createBullMqJobId("deal-closed", data.to, Date.now());
    return this.queue.add("sendDealClosedEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  enqueueAccountLockedEmail(data: SendAccountLockedEmailJob) {
    const jobId = createBullMqJobId("account-locked", data.to, Date.now());
    return this.queue.add("sendAccountLockedEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  enqueueUnlockRequestReviewedEmail(data: SendUnlockRequestReviewedEmailJob) {
    const jobId = createBullMqJobId(
      `unlock-request-reviewed-${data.decision.toLowerCase()}`,
      data.to,
      Date.now(),
    );
    return this.queue.add("sendUnlockRequestReviewedEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  enqueueReviewInvitationEmail(data: SendReviewInvitationEmailJob) {
    const jobId = createBullMqJobId("review-invitation", data.to, Date.now());
    return this.queue.add("sendReviewInvitationEmail", data, {
      jobId,
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
