import * as http from "http";
import {WebSocket, WebSocketServer} from "ws";
import {Message, StatsUpdate} from "../../common/pong/messages.js";
import {Connections} from "./connections.js";
import {PongEngine} from "./engine.js";
import {Player} from "./player";


export class PongServer {
  readonly server: http.Server;
  readonly wss: WebSocketServer;
  readonly connections = new Connections();
  private intervalMs = 100;

  constructor(server: http.Server) {
    this.server = server;
    this.wss = new WebSocketServer({server: server});

    this.connections.on("wserror", (err: Error, client: Player) => {
      console.log(`error: websocket (${client.id}):`, err);
    });

    this.connections.on("wsclose", client => {
      console.log(`close: websocket (${client.id})`);
    });

    this.connections.on("wsdelete", client => {
      if (!this.connections.size) {
        // After the last client connection is closed, clear the
        // interval to stop broadcasting stats.
        this.connections.stopBroadcasting();
        console.log("stopped heartbeat broadcast");
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

  // stats generator.
  // This is an example of optimizing string generation
  // (avoids using JSON.stringify inside a loop).
  // broadcast() can be invoked with different generators.
  * stats(): Generator<[Player, string]> {
    // Get stats outside the loop and stringify early.
    // const stats = JSON.stringify(process.memoryUsage());
    // const statsPostfix = "\", \"stats\": " + stats + "}";
    const stats = {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
    };
    const message = new StatsUpdate({stats: stats});
    for (const client of this.connections.values()) {
      // No stringification, just concatenate in the loop.
      //const message = "{\"id\": \"" + client.id + statsPostfix;
      message.id = client.id;
      yield [client, JSON.stringify(message)];
    }
  }

  startGame(ws: WebSocket) {
    const player = this.connections.get(ws);
    if (!player) {
      throw new Error(`fatal: unable to get websocket for client`);
    }

    const game = new PongEngine();

    game.onStateChange((m: Message) => {
      // console.log(m);
      //ws.send(JSON.stringify(m));
      player.sendMessage(m);
    });

    ws.on("message", data => {
      const m = JSON.parse(data.toString());
      game.movePaddle(m.id, m.y);
    });

    game.start();
  }

}