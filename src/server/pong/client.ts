import {WebSocket} from "ws";
import {v4 as uuid} from "uuid";

export class Client {
  public readonly ws: WebSocket;
  public readonly id: string;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.id = uuid();
  }

  send(data: any, cb?: (err?: Error) => void): void {
    this.ws.send(data, cb);
  }
}
