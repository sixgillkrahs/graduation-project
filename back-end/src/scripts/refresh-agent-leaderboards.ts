import mongoDB from "@/config/database";
import { logger } from "@/config/logger";
import { AgentLeaderboardService } from "@/services/agent-leaderboard.service";

const run = async () => {
  const agentLeaderboardService = new AgentLeaderboardService();

  logger.info("Starting agent leaderboard snapshot refresh");
  await mongoDB.connect();

  try {
    const results = await agentLeaderboardService.refreshAllMonthlyLeaderboards();

    logger.info("Agent leaderboard snapshot refresh completed", {
      periods: results.length,
      results,
    });
  } finally {
    await mongoDB.disconnect();
  }
};

run().catch(async (error) => {
  logger.error("Agent leaderboard snapshot refresh crashed", { error });

  try {
    await mongoDB.disconnect();
  } catch (disconnectError) {
    logger.error("Failed to disconnect after leaderboard refresh crash", {
      error: disconnectError,
    });
  }

  process.exit(1);
});
