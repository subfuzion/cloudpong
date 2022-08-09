import {
  Message,
  StatsUpdate,
  Update,
  WebSocketError
} from "../../common/pong/messages";


export class PongClient {
  hosts: Array<string>;
  ws?: WebSocket;
  cb: ((m: Message) => void) | null;

  constructor(
      hosts: Array<string>,
      cb: (((m: Message) => void) | null) = null) {
    this.hosts = hosts;
    this.cb = cb;
  }

  set onchange(cb: (m: Message) => void) {
    this.cb = cb;
  }

  send(message: any) {
    const m = JSON.stringify(message);
    this.ws!.send(m);
  }

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

               // clear pending
               for (const [s, timer] of pending.entries()) {
                 if (s != ws) {
                   // console.log(`clearing timeout for ${s.url}`);
                   clearTimeout(timer);
                   try {
                     s.close();
                   } catch (ignore) {
                     // console.log(`canceled websocket for ${s.url}`);
                   }
                 }
               }

               resolve(ws);
             })
             .catch(err => reject(err));
    });
  }

  private handleMessage(msg: MessageEvent<any>) {
    const data = JSON.parse(msg.data.toString());
    let m: Message;
    switch (data.type) {
      case "Update":
        m = new Update(data);
        this.emitChangeEvent(m);
        break;
      case "StatsUpdate":
        m = new StatsUpdate(data);
        this.emitChangeEvent(m);
        break;
      default:
        console.log("Error: unrecognized message type: ${data.type}");
    }
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

