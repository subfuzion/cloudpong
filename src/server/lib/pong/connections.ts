import {EventEmitter} from "events";
import {WebSocket} from "ws";
import {Message} from "../../../common/pong/messages";
import {Client} from "./client.js";


/**
 * Connections provides a mapping of websockets to clients, is
 * iterable, and supports message broadcasting.
 *
 * Events:
 * - wserror
 * - wsclose
 * - wsdelete
 */
export class Connections extends EventEmitter {
  public readonly connections = new Map<WebSocket, Client>();
  private intervalId?: NodeJS.Timer;

  /**
   * Returns the number of connections.
   */
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

  findClient(id: string): Client | undefined {
    for (let client of this.values()) {
      if (client.id === id) return client as Client;
    }
    return undefined;
  }

  /**
   * Creates a Client and adds the websocket to client mapping.
   * @param ws
   */
  add(ws: WebSocket): Client {
    const client = new Client(ws);
    this.connections.set(ws, client);

    ws.on("error", err => {
      this.emit("client_error", err, client);
      this.delete(ws);
    });

    ws.on("close", () => {
      this.emit("client_close", client);
      this.delete(ws);
    });

    return client;
  }

  /**
   * Returns the client associated with a websocket.
   * @param ws
   */
  get(ws: WebSocket): Client | undefined {
    return this.connections.get(ws);
  }

  /**
   * Deletes the mapping for the websocket.
   * @param ws
   */
  delete(ws: WebSocket): void {
    const client = this.connections.get(ws);
    this.connections.delete(ws);
    if (client) this.emit("client_delete", client);
  }

  /**
   * Broadcast message to all clients.
   */
  broadcast(message: Message): void {
    for (const client of this.connections.values()) {
      client.sendMessage(message);
    }
  }

  /**
   * Broadcast to all clients using a message generator function.
   */
  broadcastg(g: Generator<[Client, Message]>): void {
    for (const [client, message] of g) {
      client.sendMessage(message);
    }
  }

  /**
   * Starts broadcasting to all clients using a Message generator
   * function at the specified interval.
   * @param g
   * @param interval in milliseconds
   */
  startBroadcasting(
      g: () => Generator<[Client, Message]>,
      interval: number): void {
    this.intervalId = setInterval(() => this.broadcastg(g()), interval);
  }

  /**
   * Stop broadcasting to all clients.
   */
  stopBroadcasting(): void {
    clearInterval(this.intervalId);
  }

  /**
   * Closes all connections, which should be done on a shutdown signal.
   * Active clients will need to reconnect to a new instance.
   */
  async close(): Promise<void> {
    return new Promise(resolve => {
      this.stopBroadcasting();
      for (const [ws] of this.connections) {
        ws.close();
      }
      // Wait a second for websocket connections to close.
      setInterval(() => {
        this.connections.clear();
        resolve();
      }, 1000);
    });
  }
}
