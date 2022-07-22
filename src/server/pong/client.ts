import {EventEmitter} from "events";
import {WebSocket} from "ws";
import {v4 as uuid} from "uuid";

/**
 * A Client wraps a websocket.
 */
export class Client extends EventEmitter {
  public readonly ws: WebSocket;
  public readonly id: string;

  constructor(ws: WebSocket) {
    super();
    this.ws = ws;
    this.id = uuid();
  }

  send(data: any, cb?: (err?: Error) => void): void {
    this.ws.send(data, cb);
  }
}
