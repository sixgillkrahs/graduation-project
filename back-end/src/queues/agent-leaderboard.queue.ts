import { RefreshMonthlyLeaderboardJob } from "@/@types/jobTypes";
import { redisConnection } from "@/config/redis.connection";
import { Queue } from "bullmq";

export class AgentLeaderboardQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("agent-leaderboard", {
      connection: redisConnection,
    });
  }

  enqueueRefreshMonthlyLeaderboard(data: RefreshMonthlyLeaderboardJob) {
    const jobId = `agent-leaderboard:${data.year}:${data.month}:${data.currency}`;

    return this.queue.add("refreshMonthlyLeaderboard", data, {
      jobId,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
