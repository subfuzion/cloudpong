import {
  Message,
  WebSocketError
} from "../../common/pong/messages";


/**
 * PongClient handles connections to the websocket server.
 */
export class PongClient {
  hosts: Array<string>;
  mapper?: Map<string, { new(data: object): Message; }>;
  cb: ((m: Message) => void) | null;
  ws?: WebSocket;

  /**
   *
   * @param hosts An array of websocket server addresses.
   * @param mapper Maps a message type (string) to a message class.
   * @param cb The callback for messages.
   */
  constructor(
      hosts: Array<string>,
      mapper: Map<string, { new(data: object): Message }>,
      cb: (((m: Message) => void) | null) = null) {
    this.hosts = hosts;
    this.mapper = mapper;
    this.cb = cb;
  }

  set onchange(cb: (m: Message) => void) {
    this.cb = cb;
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
  async connect(timeout = 5 * 1000): Promise<WebSocket> {
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
    const data = JSON.parse(msg.data.toString());
    if (!this.mapper) {
      throw new Error(`client needs to be configured with a message mapper`);
    }
    if (!this.mapper.has(data.type)) {
      throw new Error(`unrecognized message type: ${data.type}`);
    }

    const type = this.mapper.get(data.type);
    this.emitChangeEvent(new type!(data));
  }

  private handleError(e: Event) {
    console.log(e);
    const data = new WebSocketError({message: e.type});
    this.emitChangeEvent(new WebSocketError(data));
  }

  private emitChangeEvent(m: Message): void {
    if (this.cb) {
      setTimeout(() => {
        if (this.cb) this.cb(m);
      });
    }
  }
}

