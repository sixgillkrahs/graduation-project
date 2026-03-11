import { ENV } from "@/config/env";
import { logger } from "@/config/logger";
import { ReviewService } from "@/services/review.service";

export class ReviewModerationWorker {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private readonly reviewService: ReviewService,
    private readonly intervalMs = ENV.REVIEW_MODERATION_INTERVAL_MS,
    private readonly batchSize = ENV.REVIEW_MODERATION_BATCH_SIZE,
  ) {}

  start() {
    if (this.intervalId) {
      return;
    }

    const run = async () => {
      if (this.isRunning) {
        return;
      }

      this.isRunning = true;

      try {
        const result = await this.reviewService.processPendingReviewBatch(
          this.batchSize,
        );

        if (result.processed > 0) {
          logger.info(
            `[ReviewModerationWorker] processed=${result.processed}, awaitingAdmin=${result.movedToAdmin}, rejected=${result.rejected}`,
          );
        }
      } catch (error) {
        logger.error("[ReviewModerationWorker] failed to process review batch", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        this.isRunning = false;
      }
    };

    void run();
    this.intervalId = setInterval(() => {
      void run();
    }, this.intervalMs);
  }

  stop() {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}
