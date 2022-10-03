import {EventEmitter} from "events";
import {Redis} from "ioredis";

import {createRedisClient} from "../redis/client.js";
import {Player, PlayerState} from "./player.js";


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

  onReady(cb: (match: Match2) => void): void {
    this.on("ready", cb);
  }

  /**
   * Adds the player to the tail of "playerList".
   * Since Upstash doesn't support keyspace notifications,
   * this also publishes a message to "waitingChannel".
   * @param player
   */
  async push(player: Player): Promise<void> {
    const p = JSON.stringify(player);
    await this.client.rpush(this.playerList, p);
    await this.publisher.publish(this.waitingChannel, p);
  }

  private handleMessage(channel: string, player: string): void {
    if (channel === this.waitingChannel) {
      console.log(channel, player);
      const length = this.waiting.push(JSON.parse(player) as Player);
      if (length >= 2) {
        this.matchPlayers();
      }
    }
  };

  private firePlayersReady(match: Match2): void {
    this.emit("ready", match);
  }

  private matchPlayers() {
    console.log("matchPlayers");
    const player1 = this.waiting.shift()!;
    player1.state = PlayerState.Matching;
    const player2 = this.waiting.shift()!;
    player1.state = PlayerState.Matching;

    // skip actual matching process for now...
    const match = new Match2(player1, player2);
    this.matching.push(match);

    player1.state = PlayerState.Ready;
    player1.opponent = player2.name;

    player2.state = PlayerState.Ready;
    player2.opponent = player1.name;

    this.firePlayersReady(match);
  }
}
