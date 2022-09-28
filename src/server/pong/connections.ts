import {EventEmitter} from "events";
import {WebSocket} from "ws";
import {Player} from "./player.js";


/**
 * Connections provides a mapping of websockets to clients, is
 * iterable, and supports message broadcasting.
 */
export class Connections extends EventEmitter {
  public readonly connections = new Map<WebSocket, Player>();
  private intervalId?: NodeJS.Timer;

  get size(): number {
    return this.connections.size;
  }

  [Symbol.iterator]() {
    return this.connections[Symbol.iterator];
  }

  entries(): IterableIterator<[WebSocket, Player]> {
    return this.connections.entries();
  }

  keys(): IterableIterator<WebSocket> {
    return this.connections.keys();
  }

  values(): IterableIterator<Player> {
    return this.connections.values();
  }

  add(ws: WebSocket): void {
    const client = new Player(ws);
    this.connections.set(ws, client);

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
  }

  get(ws: WebSocket): Player | undefined {
    return this.connections.get(ws);
  }

  delete(ws: WebSocket): void {
    console.log("delete connection");
    this.emit("wsdelete", this.connections.get(ws));
    this.connections.delete(ws);
  }

  // Simple broadcast to all clients.
  broadcast(message: string): void {
    for (const client of this.connections.values()) {
      client.send(message);
    }
  }

  // Broadcast to all clients using a generator function.
  broadcastg(g: Generator<[Player, string]>): void {
    for (const [client, message] of g) {
      client.send(message);
    }
  }

  startBroadcasting(
      g: () => Generator<[Player, string]>,
      intervalMs: number): void {
    this.intervalId = setInterval(() => this.broadcastg(g()), intervalMs);
  }

  stopBroadcasting(): void {
    clearInterval(this.intervalId);
  }

  /**
   * Closes all connections, which should be done on a shutdown signal.
   * Active clients will need to reconnect to a new instance.
   */
  close(): Promise<void> {
    return new Promise(resolve => {
      this.stopBroadcasting();
      for (const [ws] of this.connections) {
        ws.close();
      }
      resolve();
    });
  }
}
