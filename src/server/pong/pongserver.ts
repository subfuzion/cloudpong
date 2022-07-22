import * as http from "http";
import {WebSocketServer} from "ws";
import {Connections} from "./connections.js";

export class PongServer {
  server: http.Server;
  wss: WebSocketServer;
  connections = new Connections();

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
}