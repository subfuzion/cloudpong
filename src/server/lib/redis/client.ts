import Redis from "ioredis";


export class RedisClient {
  static readonly url = process.env.REDIS;
  static readonly defaultRedisConfig = "KEA";

  readonly redis: Redis;

  constructor() {
    if (!RedisClient.url) throw new Error(`REDIS environment variable not set`);
    this.redis = new Redis(RedisClient.url);
  }

  /**
   * Configure Redis. Not currently supported with Upstash (throws).
   * @param {string} config
   * @see https://redis.io/docs/manual/keyspace-notifications/
   * @see https://github.com/redis/redis/blob/unstable/redis.conf#L1863-L1915
   * @throws Not supported on Upstash:
   * @see https://discord.com/channels/807028371451936838/807028371451936841/941458579792220240
   */
  public async configure(config: string = RedisClient.defaultRedisConfig): Promise<void> {
    await this.redis.config("SET", config);
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

