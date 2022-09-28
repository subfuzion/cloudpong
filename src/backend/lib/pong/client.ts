import {EventEmitter} from "events";
import {IncomingMessage} from "http";
import {WebSocket} from "ws";
import {v4 as uuid} from "uuid";

import {Message} from "../../../common/pong/messages.js";
import {Player} from "./player.js";


/**
 * A Client is a light wrapper over a websocket with a unique ID and
 * a method for sending Message data.
 */
export class Client extends EventEmitter {
  readonly ws: WebSocket;
  readonly id: string;

  player?: Player;

  // The address that the client connected to (server address).
  readonly localAddress?: string;

  // The address that the client connected from (client address).
  readonly remoteAddress?: string;

  // If behind a proxy.
  readonly xForwardedFor?: string;

  constructor(ws: WebSocket, req: IncomingMessage) {
    super();
    this.ws = ws;
    this.id = uuid();
    this.localAddress = req.socket.localAddress;
    this.remoteAddress = req.socket.remoteAddress;
    if (req.headers["x-forwarded-for"]) {
      const header = req.headers["x-forwarded-for"];
      this.xForwardedFor = header[0].split(/\s*,\s*/)[0];
    }
  }

  /**
   * Messages are sent with no error callbacks.
   * @param m Message to send to the client.
   */
  sendMessage(m: Message): void {
    this.ws.send(m.stringify());
  }

  /**
   * Remove properties that can't or shouldn't be serialized to JSON.
   */
  stringifySafe(): object {
    return {...this, ws: undefined, player: undefined};
  }
}
