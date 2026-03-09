import { RefreshMonthlyLeaderboardJob } from "@/@types/jobTypes";
import { redisConnection } from "@/config/redis.connection";
import { AgentLeaderboardService } from "@/services/agent-leaderboard.service";
import { Worker } from "bullmq";

export class AgentLeaderboardWorker {
  private worker: Worker;

  constructor(private agentLeaderboardService: AgentLeaderboardService) {
    this.worker = new Worker(
      "agent-leaderboard",
      async (job) => {
        if (job.name === "refreshMonthlyLeaderboard") {
          const { month, year, currency } =
            job.data as RefreshMonthlyLeaderboardJob;

          await this.agentLeaderboardService.refreshMonthlyLeaderboard({
            month,
            year,
            currency,
          });
        }
      },
      {
        connection: redisConnection,
      },
    );

    this.worker.on("completed", (job) => {
      console.log(`[AgentLeaderboardWorker] completed job ${job.id}`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[AgentLeaderboardWorker] failed job ${job?.id}`, err);
    });
  }
}
