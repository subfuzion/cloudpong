import {EventEmitter} from "events";
import {Redis} from "ioredis";

import {createRedisClient} from "../redis/client.js";
import {Connections} from "./connections.js";
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


/**
 * PlayerQueue manages players waiting to be matched and handles
 * communication with Redis.
 */
export class PlayerQueue extends EventEmitter {
  private readonly client: Redis;
  private readonly playerList = "players";

  private readonly waitingChannel = "waiting";
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  private waiting: Player[] = [];
  private matching: Match2[] = [];

  private readonly connections?: Connections;

  constructor(connections?: Connections) {
    super();
    this.client = createRedisClient();
    this.publisher = createRedisClient();
    this.subscriber = createRedisClient();
    this.subscriber.subscribe(this.waitingChannel);
    this.subscriber.on("message", this.handleMessage.bind(this));
    this.connections = connections;
  }

  disconnect(): void {
    this.removeAllListeners("ready");
    this.client.disconnect();
    this.publisher.disconnect();
    this.subscriber.removeListener("message", this.handleMessage);
    this.subscriber.unsubscribe();
    this.subscriber.disconnect();
  }

  /**
   * Register a callback when players have been matched and are
   * ready to play.
   * @param cb
   */
  onReady(cb: (match: Match2) => void): void {
    this.addListener("ready", cb);
  }

  /**
   * Adds the player to the end of "playerList".
   * Since Upstash doesn't support keyspace notifications,
   * this also publishes a message to "waitingChannel".
   * @param player
   */
  async enqueue(player: Player): Promise<void> {
    const p = JSON.stringify(player);
    await this.client.rpush(this.playerList, p);
    await this.publisher.publish(this.waitingChannel, p);
  }

  /**
   * Handles messages from "waitingChannel" by pushing players to
   * the local "waiting" queue.
   * @private
   */
  private handleMessage(channel: string, player: string): void {
    if (channel === this.waitingChannel) {
      console.log(channel, player);

      let p = JSON.parse(player) as Player;
      // Check to see if client/player is already on this server;
      // if so, use the existing instance so that state changes
      // are reported to connected clients.
      // By current convention, the player name is the client ID.
      const clientId = p.name;
      const client = this.connections?.findClient(clientId);
      if (client && client.player) {
        p = client.player;
      }

      const length = this.waiting.push(p);
      if (length >= 2) {
        this.matchPlayers();
      }
    }
  };

  /**
   * Emitted once both player states are ready.
   * @private
   */
  private emitPlayersReady(match: Match2): void {
    this.emit("ready", match);
  }

  /**
   * Simplified matching for now.
   * @private
   */
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

    this.emitPlayersReady(match);
  }
}
