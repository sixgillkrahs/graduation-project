import IORedis from "ioredis";

export class RedisConnection {
  private static instance: IORedis;

  constructor() {
    console.log("connected Redis success");
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new IORedis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null,
      });
    }
    return this.instance;
  }
}
