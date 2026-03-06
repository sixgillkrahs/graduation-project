import { UpsertPropertyEmbeddingJob } from "@/@types/jobTypes";
import { redisConnection } from "@/config/redis.connection";
import { QdrantService } from "@/services/qdrant.service";
import { JobService } from "@/services/job.service";
import { Worker } from "bullmq";
import { logger } from "@/config/logger";
import { JobTypeEnum, JobStatusEnum } from "@/models/job.model";

export class QdrantWorker {
  private worker: Worker;
  private jobService: JobService;

  constructor(private qdrantService: QdrantService) {
    this.jobService = new JobService();
    this.worker = new Worker(
      "qdrant",
      async (job) => {
        if (job.name === "upsertPropertyEmbedding") {
          const { propertyId, textData, payload } =
            job.data as UpsertPropertyEmbeddingJob;

          logger.info(
            `[QdrantWorker] Processing upsert encoding job for property ${propertyId}`,
          );
          await this.qdrantService.upsertPropertyEmbedding(
            propertyId,
            textData,
            payload,
          );
        }
      },
      {
        connection: redisConnection,
      },
    );

    this.worker.on("completed", (job) => {
      logger.info(`[QdrantWorker] completed job ${job.id}`);
    });

    this.worker.on("failed", async (job, err) => {
      logger.error(`[QdrantWorker] failed job ${job?.id}`, err);
      // Log to database on final failure
      if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
        try {
          const { propertyId } = job.data as UpsertPropertyEmbeddingJob;
          await this.jobService.createJob({
            type: JobTypeEnum.PROPERTY_EMBEDDING,
            payload: { propertyId },
            status: JobStatusEnum.FAILED,
            attempts: job.attemptsMade,
            maxAttempts: job.opts.attempts || 3,
            error: err.message || "Unknown error",
            lastRunAt: new Date(),
          });
        } catch (dbErr) {
          logger.error(
            `[QdrantWorker] failed to save job failure to DB`,
            dbErr,
          );
        }
      }
    });
  }
}
