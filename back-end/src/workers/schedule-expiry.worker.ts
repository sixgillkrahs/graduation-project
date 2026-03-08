import { logger } from "@/config/logger";
import { ScheduleService } from "@/services/schedule.service";

const DEFAULT_INTERVAL_MS = 60_000;

export class ScheduleExpiryWorker {
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly intervalMs = DEFAULT_INTERVAL_MS,
  ) {}

  start() {
    if (this.intervalId) {
      return;
    }

    const run = async () => {
      try {
        const expiredCount =
          await this.scheduleService.expireConfirmedSchedules();

        if (expiredCount > 0) {
          logger.info(
            `[ScheduleExpiryWorker] expired ${expiredCount} confirmed schedules`,
          );
        }
      } catch (error) {
        logger.error("[ScheduleExpiryWorker] failed to expire schedules", error);
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
