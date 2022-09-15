import Redis from "ioredis";

export class RedisClient {
  static readonly url = process.env.REDIS;
  readonly redis: Redis;

  constructor() {
    if (!RedisClient.url) throw new Error(`REDIS environment variable not set`);
    this.redis = new Redis(RedisClient.url);
  }
}

export class RedisPublisher extends RedisClient {
  publish(channel: string, data: any) {
    let str;
    if (data instanceof Buffer) str = data;
    else if (typeof data === "string") str = data;
    else if (typeof data === "object") str = JSON.stringify(data);
    else throw new Error(`Invalid data: ${data} (type: ${typeof data})`);
    
    this.redis.publish(channel, data);
  }
}

export class RedisSubscriber extends RedisClient {
  subscribe(channel: string, cb: (err: Error) => void): void {
    this.redis.subscribe(channel);
  }

  unsubscribe(channel: string) {
    this.redis.unsubscribe(channel, () => {
      console.log(`unsubscribed from ${channel}`);
    });
  }
}

