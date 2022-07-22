import {EventEmitter} from "events";
import {WebSocket} from "ws";
import {Client} from "./client.js";

let intervalId: NodeJS.Timer | undefined;

/**
 * Connections maps websockets to clients.
 */
export class Connections extends EventEmitter {
  public readonly connections = new Map<WebSocket, Client>();

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
      this.delete(ws);
    });

    ws.on("close", () => {
      console.log("close event");
      this.delete(ws);
    });

    const client = new Client(ws);
    this.connections.set(ws, client);

    // Start an interval for the first client; broadcast
    // stats every 100 ms for all connected clients.
    if (!intervalId) {
      console.log("started interval");
      intervalId = setInterval(() => this.broadcastg(this.stats()), 100);
    }
  }

  delete(ws: WebSocket): void {
    console.log("removing connection");
    this.connections.delete(ws);
    // After the last client connection is closed, clear the
    // interval to stop broadcasting stats.
    if (!this.size) {
      console.log("stopping interval");
      clearInterval(intervalId);
      intervalId = undefined;
    }
  }

  // Simple broadcast.
  broadcast(message: string): void {
    for (const client of this.connections.values()) {
      client.send(message, (err) => {
        console.log(err);
      });
    }
  }

  // Broadcast using generators.
  broadcastg(g: Generator<[Client, string]>): void {
    for (const [client, message] of g) {
      client.send(message, err => {
        if (err) console.log(err);
      });
    }
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

  // without generator
  // broadcastStats(): void {
  //   // get stats outside of the loop and stringify early
  //   const stats = JSON.stringify(process.memoryUsage());
  //   const statsPostfix = "\", \"stats\": " + stats + "}";
  //   for (const client of this.connections.values()) {
  //     // no stringification, just concatenate in the loop
  //     const message = "{\"id\": \"" + client.id + statsPostfix;
  //     client.send(message, err => {
  //       if (err) console.log(err);
  //     });
  //   }
  // }

  // broadcastStats(): void {
  //   const self = this;
  //   const statsGenerator = function* (): Generator<[Client, string]> {
  //     // get stats outside of the loop and stringify early
  //     const stats = JSON.stringify(process.memoryUsage());
  //     const statsPostfix = "\", \"stats\": " + stats + "}";
  //     for (const client of self.connections.values()) {
  //       // no stringification, just concatenate in the loop
  //       const message = "{\"id\": \"" + client.id + statsPostfix;
  //       yield [client, message];
  //     }
  //   };
  //   self.broadcastx(statsGenerator());
  // }
}