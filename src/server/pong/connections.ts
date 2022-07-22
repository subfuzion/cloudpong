import {v4 as uuid} from "uuid";
import {WebSocket} from "ws";
import {Client} from "./client.js";

let intervalId: NodeJS.Timer | undefined;

/**
 * Connections maps websockets to clients.
 */
export class Connections {
  connections = new Map<WebSocket, Client>();

  get size() {
    return this.connections.size;
  }

  [Symbol.iterator]() {
    return this.connections[Symbol.iterator];
  }

  add(ws: WebSocket): void {

    ws.on("error", err => {
      console.log("error event: " + err.message);
      this.delete(ws);
    });

    ws.on("close", () => {
      console.log("close event");
      this.delete(ws);
    });

    const id = uuid();
    const client = new Client(ws, id);
    this.connections.set(ws, client);

    if (!intervalId) {
      console.log("started interval");
      intervalId = setInterval(() => this.broadcastStats(), 100);
    }
  }

  delete(ws: WebSocket): void {
    console.log("removing connection");
    this.connections.delete(ws);
    if (!this.connections.size) {
      console.log("stopping interval");
      clearInterval(intervalId);
      intervalId = undefined;
    }
  }

  broadcast(message: string): void {
    for (const [ws, client] of this.connections) {
      ws.send(message, (err) => {
        console.log(err);
      });
    }
  }

  broadcastStats(): void {
    // get stats outside of the loop and stringify early
    const stats = JSON.stringify(process.memoryUsage());
    const statsPostfix = "\", \"stats\": " + stats + "}";
    for (const [ws, client] of this.connections) {
      // no stringification, just concatenate in the loop
      const message = "{\"id\": \"" + client.id + statsPostfix;
      ws.send(message, err => {
        if (err) console.log(err);
      });
    }
  }
}