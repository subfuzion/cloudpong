import {EventEmitter} from "events";
import {WebSocket} from "ws";
import {Client} from "./client.js";

/**
 * Connections maps websockets to clients.
 */
export class Connections extends EventEmitter {
  public readonly connections = new Map<WebSocket, Client>();
  private intervalId?: NodeJS.Timer;

  get size(): number {
    return this.connections.size;
  }

  [Symbol.iterator]() {
    return this.connections[Symbol.iterator];
  }

  entries(): IterableIterator<[WebSocket, Client]> {
    return this.connections.entries();
  }

  keys(): IterableIterator<WebSocket> {
    return this.connections.keys();
  }

  values(): IterableIterator<Client> {
    return this.connections.values();
  }

  add(ws: WebSocket): void {

    ws.on("error", err => {
      console.log("error event: " + err.message);
      this.emit("wserror", err, this.connections.get(ws));
      this.delete(ws);
    });

    ws.on("close", () => {
      console.log("close event");
      this.emit("wsclose", this.connections.get(ws));
      this.delete(ws);
    });

    const client = new Client(ws);
    this.connections.set(ws, client);
  }

  delete(ws: WebSocket): void {
    console.log("delete connection");
    this.emit("wsdelete", this.connections.get(ws));
    this.connections.delete(ws);
    process.nextTick(() => {
    });
  }

  // Simple broadcast to all clients.
  broadcast(message: string): void {
    for (const client of this.connections.values()) {
      client.send(message, (err) => {
        console.log(err);
      });
    }
  }

  // Broadcast to all clients with a generator.
  broadcastg(g: Generator<[Client, string]>): void {
    for (const [client, message] of g) {
      client.send(message, err => {
        if (err) console.log(err);
      });
    }
  }

  startBroadcasting(g: () => Generator<[Client, string]>, intervalMs: number): void {
    this.intervalId = setInterval(() => {
      this.broadcastg(g());
    }, intervalMs);
  }

  stopBroadcasting() {
    clearInterval(this.intervalId);
  }
}