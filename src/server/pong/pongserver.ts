import * as http from "http";
import {WebSocketServer} from "ws";
import {Connections} from "./connections.js";
import {Client} from "./client";

export class PongServer {
  readonly server: http.Server;
  readonly wss: WebSocketServer;
  readonly connections = new Connections();

  constructor(server: http.Server) {
    this.server = server;
    this.wss = new WebSocketServer({server: server});

    this.wss.on("listening", () => {
      console.log("wss listening");
    });

    this.wss.on("connection", ws => {
      console.log("open event");
      this.connections.add(ws);
    });
  }

  close(callback?: (err?: Error) => void): PongServer {
    if (callback) this.server.close(callback);
    return this;
  }

  // This is an example of optimizing string generation
  // (avoids using JSON.stringify inside a loop).
  // broadcast() can be invoked with different generators.
  * stats(): Generator<[Client, string]> {
    // Get stats outside of the loop and stringify early.
    const stats = JSON.stringify(process.memoryUsage());
    const statsPostfix = "\", \"stats\": " + stats + "}";
    for (const client of this.connections.values()) {
      // No stringification, just concatenate in the loop.
      const message = "{\"id\": \"" + client.id + statsPostfix;
      yield [client, message];
    }
  }
}