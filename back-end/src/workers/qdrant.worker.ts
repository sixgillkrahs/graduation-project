import { UpsertPropertyEmbeddingJob } from "@/@types/jobTypes";
import { redisConnection } from "@/config/redis.connection";
import { QdrantService } from "@/services/qdrant.service";
import { Worker } from "bullmq";
import { logger } from "@/config/logger";

export class QdrantWorker {
  private worker: Worker;

  constructor(private qdrantService: QdrantService) {
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

    this.worker.on("failed", (job, err) => {
      logger.error(`[QdrantWorker] failed job ${job?.id}`, err);
    });
  }
}
