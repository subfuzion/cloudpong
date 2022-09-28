import {Redis} from "ioredis";

import {
  GlobalStats, PlayerStats, ServerStats, StatsUpdate
} from "../../../common/pong/messages.js";
import {createRedisClient} from "../redis/client.js";
import {Player, PlayerState} from "./player.js";


export class Stats {

  global = new GlobalStats();
  server = new ServerStats();
  player = new PlayerStats();

  private redis?: Redis;

  private currentInstanceCountKey = "global:instance:count:current";
  private peakInstanceCountKey = "global:instance:count:peak";
  private totalInstanceCountKey = "global:instance:count:total";

  private currentGameCountKey = "global:game:count:current";
  private peakGameCountKey = "global:game:count:peak";
  private totalGameCountKey = "global:game:count:total";

  private currentPlayerCountKey = "global:player:count:current";
  private peakPlayerCountKey = "global:player:count:peak";
  private totalPlayerCountKey = "global:player:count:total";

  private currentQueueCountKey = "global:queue:count:current";
  private peakQueueCountKey = "global:queue:count:peak";
  private totalQueueCountKey = "global:queue:count:total";

  /**
   * Update global instance stats.
   * @param id
   */
  async serverCheckin(id: string): Promise<void> {
    this.server.serverId = id;
    this.server.runningSince = Date.now();

    // TODO: ensure actually running on an instance or counts will be inflated.
    const redis = this.getRedis();

    let current = await redis.incr(this.currentInstanceCountKey);
    if (current < 1) {
      await redis.set(this.currentInstanceCountKey, current);
    }
    this.global.currentInstanceCount = current;

    let peak = await redis.get(this.peakInstanceCountKey);
    let nPeak = peak ? parseInt(peak) : 0;
    if (current > nPeak) {
      nPeak = current;
      await redis.set(this.peakInstanceCountKey, nPeak);
      this.global.peakInstanceCount = nPeak;
    }

    this.global.totalInstanceCount = await redis.incr(this.totalInstanceCountKey);
  }

  /**
   * Update global instance stats; this should be called last, right before
   * server exits.
   * @param id
   */
  async serverCheckout(id: string): Promise<void> {
    const redis = this.getRedis();
    this.global.currentInstanceCount = await redis.decr(this.currentInstanceCountKey);
    await new Promise<void>(resolve => {
      setTimeout(() => {
        redis.disconnect();
        resolve();
      }, 1000);
    });
  }

  async gameStart(): Promise<void> {
    const redis = this.getRedis();

    let current = await redis.incr(this.currentGameCountKey);
    if (current < 1) {
      current = 1;
      await redis.set(this.currentGameCountKey, current);
    }
    this.global.currentGameCount = current;

    let peak = await redis.get(this.peakGameCountKey);
    let nPeak = peak ? parseInt(peak) : 0;
    if (current > nPeak) {
      nPeak = current;
      await redis.set(this.peakGameCountKey, nPeak);
    }
    this.global.peakGameCount = nPeak;

    this.global.totalGameCount = await redis.incr(this.totalGameCountKey);
  }

  async gameEnd(): Promise<void> {
    const redis = this.getRedis();
    let current = await redis.decr(this.currentGameCountKey);
    if (current < 0) {
      current = 0;
      await redis.set(this.currentGameCountKey, current);
    }
    this.global.currentGameCount = current;
  }

  /**
   * Update server message stats.
   */
  incrServerMessages(): void {
    this.server.messages++;
    // TODO: mps will be artificially low if there are periods when no games
    // are running; need to do *real* sampling.
    // Could hack for now: if message flow drops to zero over an short interval
    const uptime = Date.now() - this.server.runningSince;
    this.server.mps = this.server.messages / uptime * 1000;
  }

  /**
   * Update stats on player connection state changes.
   * @param player
   * @param state
   */
  async playerConnectionUpdate(player: Player, state: string): Promise<void> {
    const redis = this.getRedis();
    switch (state) {
      case "connect":
        this.server.currentConnectionCount++;
        if (this.server.currentConnectionCount >
            this.server.peakConnectionCount) {
          this.server.peakConnectionCount = this.server.currentConnectionCount;
        }
        this.server.totalConnectionCount++;

        const current = await redis.incr(this.currentPlayerCountKey);
        this.global.currentPlayerCount = current;
        let peak = await redis.get(this.peakPlayerCountKey);
        this.global.peakPlayerCount = peak ? parseInt(peak) : 0;
        if (current > this.global.peakPlayerCount) {
          await redis.set(this.peakPlayerCountKey, current);
          this.global.peakPlayerCount = current;
        }
        this.global.totalPlayerCount = await redis.incr(this.totalPlayerCountKey);
        break;

      case "close":
        this.server.currentConnectionCount--;

        if (player && player.state === PlayerState.Playing) {
          let current = await redis.decr(this.currentPlayerCountKey);
          if (current < 0) {
            current = 0;
            await redis.set(this.currentPlayerCountKey, current);
            this.global.currentPlayerCount = current;
          }
        } else {
          let current = await redis.decr(this.currentQueueCountKey);
          if (current < 0) {
            current = 0;
            await redis.set(this.currentQueueCountKey, current);
            this.global.currentQueueCount = current;
          }
        }
        break;

      default:
        console.log(`stats.playerConnectionUpdate: unknown state: ${state}`);
    }
  }

  async incrQueue(): Promise<void> {
    const redis = this.getRedis();
    const current = await redis.incr(this.currentQueueCountKey);
    this.global.currentQueueCount = current;
    let peak = await redis.get(this.peakQueueCountKey);
    this.global.peakQueueCount = peak ? parseInt(peak) : 0;
    if (current > this.global.peakQueueCount) {
      await redis.set(this.peakQueueCountKey, current);
      this.global.peakQueueCount = current;
    }
    this.global.totalQueueCount = await redis.incr(this.totalQueueCountKey);
  }

  async decrQueue(): Promise<void> {
    const redis = this.getRedis();
    this.global.currentQueueCount = await redis.decr(this.currentQueueCountKey);
  }

  /**
   * Transform this for sending to the client as a StatsUpdate message.
   */
  toStatsUpdate(): StatsUpdate {
    const s = new StatsUpdate();

    // global
    s.global.currentInstanceCount = this.global.currentInstanceCount;
    s.global.peakInstanceCount = this.global.peakInstanceCount;
    s.global.totalInstanceCount = this.global.totalInstanceCount;
    s.global.currentGameCount = this.global.currentGameCount;
    s.global.peakGameCount = this.global.peakGameCount;
    s.global.totalGameCount = this.global.totalGameCount;
    s.global.currentPlayerCount = this.global.currentPlayerCount;
    s.global.peakPlayerCount = this.global.peakPlayerCount;
    s.global.totalPlayerCount = this.global.totalPlayerCount;
    s.global.currentQueueCount = this.global.currentQueueCount;
    s.global.peakQueueCount = this.global.peakQueueCount;
    s.global.totalQueueCount = this.global.totalQueueCount;

    // server
    s.server.serverId = this.server.serverId;
    s.server.runningSince = this.server.runningSince;
    s.server.uptime = Date.now() - this.server.runningSince;
    s.server.currentConnectionCount = this.server.currentConnectionCount;
    s.server.peakConnectionCount = this.server.peakConnectionCount;
    s.server.totalConnectionCount = this.server.totalConnectionCount;
    s.server.messages = this.server.messages;
    s.server.mps = this.server.mps;

    // player
    s.player.playerId = this.player.playerId;
    s.player.opponentId = this.player.opponentId;
    s.player.messages = this.player.messages;
    s.player.mps = this.player.mps;

    return s;
  }

  private getRedis() {
    return this.redis ? this.redis : this.redis = createRedisClient();
  }
}
