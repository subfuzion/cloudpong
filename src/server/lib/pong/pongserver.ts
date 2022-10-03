import {create} from "domain";
import * as http from "http";
import {AddressInfo} from "net";
import * as os from "os";
import {WebSocket, WebSocketServer} from "ws";
import {Message, StatsUpdate, Update} from "../../../common/pong/messages.js";
import {Connections} from "./connections.js";
import {PongEngine} from "./engine.js";
import {Client} from "./client";
import {PongMachine} from "./pongmachine";
import {createRedisClient} from "../redis/client";


export class PongServer extends PongMachine {
  readonly server: http.Server;
  readonly wss: WebSocketServer;
  readonly connections = new Connections();
  private intervalMs = 100;

  constructor(server: http.Server) {
    super();
    this.server = server;
    this.wss = new WebSocketServer({server: server});

    this.connections.on("wserror", (err: Error, client: Client) => {
      console.log(`error: websocket (${client.id}):`, err);
    });

    this.connections.on("wsclose", client => {
      console.log(`close: websocket (${client.id})`);
    });

    this.connections.on("wsdelete", client => {
      console.log(`delete: websocket (${client.id})`);
      if (!this.connections.size) {
        // After the last client connection is closed, clear the
        // interval to stop broadcasting stats.
        this.connections.stopBroadcasting();
        console.log("no more connections; stopped broadcasting");
      }
    });

    this.wss.on("listening", () => {
      console.log("websocket server listening");
    });

    this.wss.on("connection", ws => {
      console.log("websocket server connection");
      this.connections.add(ws);
      if (this.connections.size === 1) {
        // Start an interval for the first client; broadcast stats every 100 ms
        // for all connected clients.
        this.connections.startBroadcasting(
            this.stats.bind(this),
            this.intervalMs);
      }
      this.startGame(ws);
    });
  }

  async close(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.connections.close();
      this.server.close(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * This is a generator used to send data to the client on an
   * interval. This is periodic update data (stats, etc.) that is
   * not part of the actual game state.
   */
  * stats(): Generator<[Client, Message]> {
    let addressInfo = this.server.address() as AddressInfo;
    let hostname = os.hostname();
    if (addressInfo != null) {
      console.log("========================================");
      console.log(`${hostname}, ${addressInfo.address}, ${addressInfo.port}`);
      console.log("========================================");
    }
    const stats = {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
    };
    const message = new StatsUpdate({stats: stats});
    for (const client of this.connections.values()) {
      message.clientId = client.id;
      yield [client, message];
    }
  }

  startGame(ws: WebSocket) {
    const player = this.connections.get(ws);
    if (!player) {
      throw new Error(`fatal: unable to get websocket for client`);
    }

    const game = new PongEngine();

    let channel = player.id;
    let publisher = createRedisClient();

    let subscriber = createRedisClient();
    subscriber.subscribe(channel);

    subscriber.on("message", (channel: string, message: string): void => {
      console.log(`channel: ${channel}, data: ${message}`);
      let m = Message.parseJSON(Update, message);
      player.sendMessage(m);
    });

    game.onStateChange((m: Message) => {
      // player.sendMessage(m);
      publisher.publish(channel, m.stringify());
    });

    ws.on("message", data => {
      const m = JSON.parse(data.toString());
      game.movePaddle(m.id, m.y);
    });

    game.start();
  }

  addPlayerToQueue(player: Client): void {
    throw new Error("Method not implemented.");
  }
}
