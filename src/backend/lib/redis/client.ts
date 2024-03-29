import Redis from "ioredis";


/**
 * Creates a new Redis client that gets its url from process.env.REDIS.
 * @constructor
 * @throws if REDIS environment variable isn't set.
 */
export function createRedisClient(): Redis {
  const url = process.env.REDIS;
  if (!url) throw new Error(`REDIS environment variable not set`);
  return new Redis(url);
}

/**
 * Configure Redis. Not currently supported with Upstash (throws).
 * @param {string} config
 * @see https://redis.io/docs/manual/keyspace-notifications/
 * @see https://github.com/redis/redis/blob/unstable/redis.conf#L1863-L1915
 * @throws Not supported on Upstash:
 * @see https://discord.com/channels/807028371451936838/807028371451936841/941458579792220240
 */
export async function configure(
    redis: Redis,
    config: string = "KEA"): Promise<void> {
  await redis.config("SET", config);
}


export class Client {
  redis: Redis;

  /**
   * Creates a Redis client. If `url` is not provided, attempts to read the
   * `REDIS` environment variable for the connection url.
   * @param url
   */
  constructor(url?: string) {
    this.redis = url ? new Redis(url) : createRedisClient();
  }

  async configure(config: string): Promise<void> {
    await configure(this.redis, config);
  }
}
