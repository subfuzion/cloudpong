import {EventEmitter} from "events";
import {WebSocket} from "ws";
import {v4 as uuid} from "uuid";
import {Message} from "../../../common/pong/messages.js";


/**
 * A Client is a light wrapper over a websocket with a unique ID and
 * a method for sending Message data.
 */
export class Client extends EventEmitter {
  readonly ws: WebSocket;
  readonly id: string;
  name: string = "";

  constructor(ws: WebSocket) {
    super();
    this.ws = ws;
    this.id = uuid();
  }

  /**
   * Messages are sent with no error callbacks.
   * @param m Message to send to the client.
   */
  sendMessage(m: Message): void {
    this.ws.send(m.stringify());
  }
}
