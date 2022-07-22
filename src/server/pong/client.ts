import {WebSocket} from "ws";

export class Client {
  public readonly ws: WebSocket;
  public readonly id: string;

  constructor(ws: WebSocket, id: string) {
    this.ws = ws;
    this.id = id;
  }

  send(data: any, cb?: (err?: Error) => void): void {
    this.ws.send(data, cb);
  }
}
