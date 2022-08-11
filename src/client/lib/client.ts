import {
  Message,
  WebSocketError
} from "../../common/pong/messages";


/**
 * PongClient handles connections to the websocket server.
 */
export class PongClient {
  static readonly DefaultTimeout = 5 * 1000;

  hosts: Array<string>;
  mapper?: Map<string, [{ new(data: object): Message; }, (m: any) => void]>;
  ws?: WebSocket;

  /**
   *
   * @param hosts An array of websocket server addresses.
   * @param mapper Maps a message type (string) to a message class.
   */
  constructor(
      hosts: Array<string>,
      mapper: Map<string, [{ new(data: object): Message; }, (m: any) => void]>) {
    this.hosts = hosts;
    this.mapper = mapper;
  }

  /**
   * Send a message to the websocket server. There is no error checking here.
   * If this method throws, it's probably because `connect` wasn't called first.
   * @param message
   */
  send(message: any) {
    const m = JSON.stringify(message);
    this.ws!.send(m);
  }

  /**
   * Connect to one of the websocket hosts specified in the constructor.
   * @param timeout In milliseconds.
   */
  async connect(timeout = PongClient.DefaultTimeout): Promise<WebSocket> {
    console.log("connecting to", this.hosts);
    const self = this;
    const hosts = this.hosts;
    // map pending websocket connections to timers
    const pending = new Map<WebSocket, NodeJS.Timeout>();

    const _connect = (host: string): Promise<WebSocket> => {
      return new Promise((resolve, reject) => {
        try {
          const timer = setTimeout(() => {
            throw new Error(`websocket connection attempt timed out (${timeout} ms)`);
          }, timeout);
          const ws = new WebSocket(host);
          // console.log(`attempting to connect to ${ws.url}`);
          pending.set(ws, timer);
          ws.addEventListener("open", () => {
            // console.log(`clearing timeout for ${ws.url}`);
            clearTimeout(timer);
            resolve(ws);
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    return new Promise((resolve, reject) => {
      const connections = hosts.map(host => _connect(host));
      Promise.any(connections)
             .then(ws => {
               console.log(`connected to: ${ws.url}`);
               ws.onmessage = self.handleMessage.bind(self);
               ws.onerror = self.handleError.bind(self);
               self.ws = ws;

               // Clear any other pending connections.
               for (const [s, timer] of pending.entries()) {
                 if (s === ws) continue;
                 // console.log(`clearing timeout for ${s.url}`);
                 clearTimeout(timer);
                 try {
                   s.close();
                 } catch (ignore) {
                   // Calling close before a websocket is open will still show
                   // up in the console log as warning under Chrome.
                 }
               }
               resolve(ws);
             })
             .catch(err => reject(err));
    });
  }

  private handleMessage(msg: MessageEvent<any>) {
    if (!this.mapper) {
      throw new Error(`client needs to be configured with a message mapper`);
    }

    const data = JSON.parse(msg.data.toString());
    const tuple = this.mapper.get(data.type);
    if (!tuple) {
      throw new Error(`unrecognized message type: ${data.type}`);
    }

    const [type, handler] = tuple;
    const m = new type!(data);
    this.emitMessage(handler, m);
  }

  private handleError(e: Event) {
    console.log(e);
    if (!this.mapper) {
      throw new Error(`client needs to be configured with a message mapper`);
    }

    const tuple = this.mapper.get(WebSocketError.name);
    if (!tuple) {
      throw new Error(`client needs to be configured with a WebSocketError handler`);
    }
    const [, handler] = tuple;
    const m = new WebSocketError({message: e.type});
    this.emitMessage(handler, m);
  }

  private emitMessage(handler: (me: Message) => void, m: Message): void {
    handler(m);
  }
}