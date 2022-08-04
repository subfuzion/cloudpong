import * as http from "http";
import {
  WebSocket,
  WebSocketServer
} from "ws";
import {Connections} from "./connections.js";
import {Client} from "./client";
import {PongEngine} from "./engine.js";
import {Message} from "../../common/pong/messages.js";


export class PongWebSocketServer {
  readonly server: http.Server;
  readonly wss: WebSocketServer;
  readonly connections = new Connections();
  private intervalMs = 100;

  constructor(server: http.Server) {
    this.server = server;
    this.wss = new WebSocketServer({server: server});

    this.connections.on("wserror", (err: Error, client: Client) => {
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
        // this.connections.startBroadcasting(
        //     this.stats.bind(this),
        //     this.intervalMs);
      }
      this.startGame(ws);
    });
  }

  close(callback?: (err?: Error) => void): PongWebSocketServer {
    if (callback) this.server.close(callback);
    return this;
  }

  // stats generator.
  // This is an example of optimizing string generation
  // (avoids using JSON.stringify inside a loop).
  // broadcast() can be invoked with different generators.
  * stats(): Generator<[Client, string]> {
    // Get stats outside the loop and stringify early.
    const stats = JSON.stringify(process.memoryUsage());
    const statsPostfix = "\", \"stats\": " + stats + "}";
    for (const client of this.connections.values()) {
      // No stringification, just concatenate in the loop.
      const message = "{\"id\": \"" + client.id + statsPostfix;
      yield [client, message];
    }
  }

  startGame(ws: WebSocket) {
    const client = this.connections.get(ws);
    if (!client) {
      throw new Error(`fatal: unable to get websocket for client`);
    }

    const game = new PongEngine();

    game.onStateChange((m: Message) => {
      console.log(m);
      ws.send(JSON.stringify(m));
    });

    ws.on("message", data => {
//      console.log(data);
      const m = JSON.parse(data.toString());
      game.movePaddle(m.id, m.y);
    });

    game.start();
  }

}