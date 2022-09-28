import * as http from "http";
import * as os from "os";
import {v4 as uuid} from "uuid";
import {WebSocketServer} from "ws";

import {Message, Update} from "../../../common/pong/messages.js";
import {createRedisClient} from "../redis/client.js";
import {Client} from "./client.js";
import {Connections} from "./connections.js";
import {GameState, PongEngine} from "./engine.js";
import {Player, PlayerState} from "./player.js";
import {Match2, PlayerQueue} from "./playerqueue.js";
import {Stats} from "./stats";


export class PongServer {
  readonly serverId = uuid();
  readonly server: http.Server;
  readonly wss: WebSocketServer;
  readonly connections = new Connections();
  private readonly queue: PlayerQueue;
  private intervalMs = 100;
  private stats = new Stats();
  private closed = true;

  constructor(server: http.Server) {
    this.queue = new PlayerQueue(this.connections);
    this.queue.onReady(this.startGame.bind(this));

    this.server = server;
    this.wss = new WebSocketServer({server: server});
    this.closed = false;

    this.stats.serverCheckin(this.serverId).catch(reason => {
      console.error(`Server failed to check in: ${reason}`);
      process.exit(1);
    });

    this.connections.on("client_error", (err: Error, client: Client) => {
      console.log(`error: websocket (${client.id}):`, err);
    });

    this.connections.on("client_close", client => {
      this.stats.playerConnectionUpdate(client.player, "close")
          .then(() => console.log(`close: websocket (${client.id})`))
          .catch(err => console.error(`error: close: websocket (${client.id}): ${err}`));
    });

    this.connections.on("client_delete", client => {
      if (!this.connections.size) {
        // After the last client connection is closed, clear the
        // interval to stop broadcasting stats.
        this.connections.stopBroadcasting();
        console.log("Connections closed; broadcasting stopped.");
      }
    });

    this.wss.on("listening", () => {
      console.log("websocket server listening");
    });

    this.wss.on("connection", async (ws, req) => {
      const client = this.connections.add(ws, req);
      this.stats.playerConnectionUpdate(client.player!, "connect")
          .then(() => console.log(`connect: websocket (${client.id})`))
          .catch(err => console.error(`error: connect: websocket (${client.id}): ${err}`));

      if (this.connections.size === 1) {
        // Start an interval for the first client; broadcast stats every 100 ms
        // for all connected clients.
        this.connections.startBroadcasting(
            this.statsGenerator.bind(this),
            this.intervalMs);
      }
      await this.clientConnected(client);
    });
  }

  async clientConnected(client: Client): Promise<void> {
    // For now, use client.id for name
    const player = new Player(client.id, os.hostname());
    client.player = player;
    await this.queue.enqueue(player);
    await this.stats.incrQueue();
  }

  async close(): Promise<void> {
    if (this.closed) return Promise.resolve();
    this.closed = true;
    return new Promise(async resolve => {
      await this.stats.serverCheckout(this.serverId);
      await this.connections.close();
      this.queue.disconnect();
      this.server.close(err => {
        if (err) console.log(err);
        console.log("Pong server closed");
        resolve();
      });
    });
  }

  /**
   * This is a generator to send periodic stats to the client.
   */
  * statsGenerator(): Generator<[Client, Message]> {
    const message = this.stats.toStatsUpdate();
    // console.log(`NEW STATS: ${JSON.stringify(message)}`);
    for (const client of this.connections.values()) {
      const player = client.player!;
      message.player.playerId = player.name;
      message.player.opponentId = player.opponent || "";
      message.player.state = player.state;
      message.player.messages = player.messages;
      yield [client, message];
    }
  }

  startGame(match: Match2): void {
    console.log(`start game: ${JSON.stringify(match)}`);
    // Players actually connected to this server
    let client;
    const players: Player[] = [];
    // left player ws
    client = this.connections.findClient(match.player1.name);
    if (client) {
      match.player1.client = client;
      players.push(match.player1);
    }
    client = this.connections.findClient(match.player2.name);
    if (client) {
      match.player2.client = client;
      players.push(match.player2);
    }

    const game = new PongEngine();

    const server = os.hostname();
    let sameServer = true;
    for (let i = 0; i < players.length; i++) {
      if (players[i].server !== server) {
        sameServer = false;
        break;
      }
    }
    if (sameServer) {
      console.log("Optimizing message traffic");
    }

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const id = i;
      const channel = player.client?.id!;
      const publisher = createRedisClient();
      const subscriber = createRedisClient();
      subscriber.subscribe(channel);

      // TODO: Can we make this more efficient?
      // 1) Rather than separate channels per player, maybe one channel per
      // match and then loop to send updates to each player.
      // If any dropped pub/sub messages, at least a better chance that all
      // players see the same thing (the websocket connections are reliable).
      // 2) ✅ DONE: If both players are connected to the same server, then
      // bypass pub/sub entirely and send messages directly.

      // Publishes game updates on the player channel.
      game.addStateChangeListener((m: Message) => {
        if (m instanceof Update) {
          if (m.state === GameState.GameOver) {
            player.state = PlayerState.GameOver;
          }
        }
        try {
          if (sameServer) {
            player.client!.sendMessage(m);
            player.messages++;
            this.stats.incrServerMessages();
          } else {
            publisher.publish(channel, m.stringify());
          }
        } catch (err) {
          // ignore occasional write errors, continue publishing
          // until connection is closed.
        }
      });

      if (!sameServer) {
        // Subscribes to game updates on the player channel to send to player.
        subscriber.on("message", (channel: string, message: string): void => {
          // console.log(`channel: ${channel}, data: ${message}`);
          let m = Message.parseJSON(Update, message);
          try {
            player.client!.sendMessage(m);
            player.messages++;
            this.stats.incrServerMessages();
          } catch (err) {
            // ignore occasional write errors, continue publishing
            // until connection is closed.
          }
        });
      }

      // Receives player updates to send to the game engine.
      player.client!.ws.on("message", data => {
        const m = JSON.parse(data.toString());
        m.id = id;
        game.movePaddle(m.id, m.y);
      });

      this.stats.decrQueue().catch(err => {
        console.error(`error: startGame() => decrQueue: ${err}`);
      });
      player.state = PlayerState.Playing;
    }

    this.stats.gameStart().catch(err => {
      console.error(`startGame() -> gameStart(): ${err}`);
    });
    game.addStateChangeListener(async (m: Message) => {
      if (m instanceof Update && m.state === GameState.GameOver) {
        await this.stats.gameEnd();
      }
    });

    game.start();
  }
}
