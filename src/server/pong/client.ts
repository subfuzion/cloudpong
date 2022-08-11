import {EventEmitter} from "events";
import {WebSocket} from "ws";
import {v4 as uuid} from "uuid";
import {Message} from "../../common/pong/messages.js";


/**
 * A Client is a light wrapper over a websocket with a unique ID.
 */
export class Client extends EventEmitter {
  readonly ws: WebSocket;
  readonly id: string;

  constructor(ws: WebSocket) {
    super();
    this.ws = ws;
    this.id = uuid();
  }

  /**
   * Data are sent with no callbacks.
   * @param data Stringified JSON.
   */
  send(data: string): void {
    this.ws.send(data);
  }

  /**
   * Messages are sent with no callbacks.
   * @param m An instance of Message (or one of its subclasses).
   */
  sendMessage(m: Message): void {
    this.ws.send(JSON.stringify(m));
  }
}