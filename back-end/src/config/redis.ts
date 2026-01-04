import IORedis from "ioredis";
import { ENV } from "./env";
import { redisConnection } from "./redis.connection";

// export class RedisConnection {
//   public static instance: IORedis;

//   constructor() {
//     console.log("connected Redis success");
//   }

//   static getInstance() {
//     if (!this.instance) {
//       this.instance = new IORedis(process.env.REDIS_URL!, {
//         maxRetriesPerRequest: null,
//       });
//     }
//     return this.instance;
//   }
// }

class RedisCaching {
  private redisClient = redisConnection;

  public async connect() {
    try {
      await this.redisClient.set("testconnection", "0", "EX", 1);
      console.log("connected Redis success");
    } catch (error) {
      console.log("SYSTEM ERROR: CONNECT REDIS ERROR", error);
      throw error;
    }
  }

  /** BASIC */
  public del(key: string): Promise<any> {
    return new Promise<any>((res, rej) => {
      this.redisClient.del(key)
        .then(result => res(result))
        .catch(err => rej(err));
    });
  }

  public get(key: string): Promise<any> {
    return new Promise<any>((res, rej) => {
      this.redisClient.get(key)
        .then(result => res(result))
        .catch(err => rej(err));
    });
  }

  public set(key: string, value: any, ttl?: number): Promise<any> {
    return new Promise<any>((res, rej) => {
      if (ttl) {
        this.redisClient.set(key, value, "EX", ttl)
          .then(result => res(result))
          .catch(err => rej(err));
      } else {
        this.redisClient.set(key, value)
          .then(result => res(result))
          .catch(err => rej(err));
      }
    });
  }

  public ttl(key: string): Promise<any> {
    return new Promise<any>((res, rej) => {
      this.redisClient.ttl(key)
        .then(result => res(result))
        .catch(err => rej(err));
    });
  }

  public incr(key: string): Promise<any> {
    return new Promise<any>((res, rej) => {
      this.redisClient.incr(key)
        .then(result => res(result))
        .catch(err => rej(err));
    });
  }

  public clear(): Promise<any> {
    return new Promise<any>((res, rej) => {
      this.redisClient.flushdb()
        .then(result => res(result))
        .catch(err => rej(err));
    });
  }

  /** TYPE SETS */
  public sAdd(key: string, item: any): Promise<any> {
    return new Promise<any>((res, rej) => {
      this.redisClient.sadd(key, JSON.stringify(item))
        .then(result => res(result))
        .catch(err => rej(err));
    });
  }

  public sCard(key: string): Promise<any> {
    return new Promise<any>((res, rej) => {
      this.redisClient.scard(key)
        .then(result => res(result))
        .catch(err => rej(err));
    });
  }

  public sMembers(key: string): Promise<any> {
    return new Promise<any>((res, rej) => {
      this.redisClient.smembers(key)
        .then(result => res(result))
        .catch(err => rej(err));
    });
  }

  public sRem(key: string, item: any): Promise<any> {
    return new Promise<any>((res, rej) => {
      this.redisClient.srem(key, JSON.stringify(item))
        .then(result => res(result))
        .catch(err => rej(err));
    });
  }

  public sSave(key: string, item: any): Promise<any> {
    return this.sRem(key, item)
      .then(() => this.sAdd(key, item));
  }
}

export const redis = new RedisCaching();