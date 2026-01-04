import IORedis from "ioredis";
import { ENV } from "./env";

export const redisConnection = new IORedis({
    host: ENV.REDIS_HOST,
    port: Number(ENV.REDIS_PORT),
    password: ENV.REDIS_PASS,
    db: Number(ENV.REDIS_DB),

    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});