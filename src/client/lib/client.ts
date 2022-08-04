import {
  Message,
  StatsUpdate,
  Update,
  WebSocketError
} from "../../common/pong/messages";


export class PongEvent<T extends Message> {
  message: T;

  constructor(message: T) {
    this.message = message;
  }
}


export class PongClient {
  hosts: Array<string>;
  ws?: WebSocket;
  cb: ((e: PongEvent<Message>) => void) | null;

  constructor(
      hosts: Array<string>,
      cb: (((e: PongEvent<Message>) => void) | null) = null) {
    this.hosts = hosts;
    this.cb = cb;
  }

  set onchange(cb: (e: PongEvent<Message>) => void) {
    this.cb = cb;
  }

  send(message: any) {
    const m = JSON.stringify(message);
    this.ws!.send(m);
  }

  async connect(): Promise<WebSocket> {
    console.log("connecting to", this.hosts);
    const self = this;
    const hosts = this.hosts;

    const _connect = (host: string): Promise<WebSocket> => {
      return new Promise((resolve, reject) => {
        try {
          const ws = new WebSocket(host);
          ws.addEventListener("open", () => {
            resolve(ws);
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    // TODO: cleanup for the other ws
    return new Promise((resolve, reject) => {
      const connections = hosts.map(host => _connect(host));
      Promise.any(connections)
             .then(ws => {
               console.log(`connected to: ${ws.url}`);
               ws.onmessage = self.handleMessage.bind(self);
               ws.onerror = self.handleError.bind(self);
               self.ws = ws;
               resolve(ws);
             })
             .catch(err => reject(err));
    });
  }

  private handleMessage(msg: MessageEvent<any>) {
    const data = JSON.parse(msg.data.toString());
    let m: Message;
    let e: PongEvent<Message>;
    switch (data.type) {
      case "Update":
        m = new Update(data);
        e = new PongEvent<Update>(m as Update);
        this.emitChangeEvent(e);
        break;
      case "StatsUpdate":
        m = new StatsUpdate(data);
        e = new PongEvent<StatsUpdate>(m as StatsUpdate);
        this.emitChangeEvent(e);
        break;
      default:
        console.log("Error: unrecognized message type: ${data.type}");
    }
  }

  private handleError(e: Event) {
    console.log(e);
    const data = new WebSocketError({message: e.type});
    this.emitChangeEvent(new PongEvent<WebSocketError>(data));
  }

  private emitChangeEvent(e: PongEvent<Message>): void {
    if (this.cb) {
      setTimeout(() => {
        if (this.cb) this.cb(e);
      });
    }
  }
}

