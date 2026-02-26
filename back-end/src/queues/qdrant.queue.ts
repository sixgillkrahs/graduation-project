import { UpsertPropertyEmbeddingJob } from "@/@types/jobTypes";
import { redisConnection } from "@/config/redis.connection";
import { Queue } from "bullmq";

export class QdrantQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("qdrant", {
      connection: redisConnection,
    });
  }

  enqueueUpsertPropertyEmbedding(data: UpsertPropertyEmbeddingJob) {
    const jobId = `upsert-embedding:${data.propertyId}`;

    return this.queue.add("upsertPropertyEmbedding", data, {
      jobId,
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
