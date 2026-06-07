import {
  DeletePropertyEmbeddingJob,
  UpsertPropertyEmbeddingJob,
} from "@/@types/jobTypes";
import { redisConnection } from "@/config/redis.connection";
import { Queue } from "bullmq";

export class QdrantQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("qdrant", {
      connection: redisConnection,
    });
  }

  private addJob(
    name: "upsertPropertyEmbedding" | "deletePropertyEmbedding",
    data: UpsertPropertyEmbeddingJob | DeletePropertyEmbeddingJob,
  ) {
    const jobId = `${name}-${data.propertyId}-${Date.now()}`;

    return this.queue.add(name, data, {
      jobId,
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  enqueueUpsertPropertyEmbedding(data: UpsertPropertyEmbeddingJob) {
    return this.addJob("upsertPropertyEmbedding", {
      ...data,
      operation: "UPSERT",
    });
  }

  enqueueDeletePropertyEmbedding(data: DeletePropertyEmbeddingJob) {
    return this.addJob("deletePropertyEmbedding", data);
  }
}
