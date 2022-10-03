import {EventEmitter} from "events";
import {Redis} from "ioredis";

import {createRedisClient} from "../redis/client.js";
import {Player} from "./player.js";


export class Match2 {
  // Left player
  player1: Player;

  // Right player
  player2: Player;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;
  }
}


export class PlayerQueue extends EventEmitter {
  private readonly client: Redis;
  private readonly playerList = "players";

  private readonly waitingChannel = "waiting";
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  private waiting: Player[] = [];
  private matching: Match2[] = [];

  constructor() {
    super();
    this.client = createRedisClient();
    this.publisher = createRedisClient();
    this.subscriber = createRedisClient();
    this.subscriber.subscribe(this.waitingChannel);

    this.subscriber.on("message", this.handleMessage.bind(this));
  }


  disconnect(): void {
    this.client.disconnect();
    this.publisher.disconnect();
    this.subscriber.removeListener("message", this.handleMessage);
    this.subscriber.unsubscribe();
    this.subscriber.disconnect();
  }

  onMessage(cb: (player: Player) => void): void {
    this.subscriber.on("message", (_, player) => cb(player));
  }

  onReady(cb: (players: Player[]) => void): void {
    this.on("ready", cb);
  }

  /**
   * Adds the player to the tail of "playerList".
   * Since Upstash doesn't support keyspace notifications,
   * this also publishes a message to "waitingChannel".
   * @param player
   */
  async push(player: Player): Promise<void> {
    const p = player.stringify();
    await this.client.rpush(this.playerList, p);
    await this.publisher.publish(this.waitingChannel, p);
  }

  private handleMessage(channel: string, player: Player): void {
    if (channel === this.waitingChannel) {
      console.log(channel, player);
      const length = this.waiting.push(player);
      if (length >= 2) {
        this.matchPlayers();
      }
    }
  };

  private firePlayersReady(players: Player[]): void {
    this.emit("ready", players);
  }

  private matchPlayers() {
    const player1 = this.waiting.shift()!;
    const player2 = this.waiting.shift()!;
    this.matching.push(new Match2(player1, player2));
    // await this.client.
  }
}
