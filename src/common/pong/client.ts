import {
  Message,
  StatsUpdate,
  Update,
  WebSocketError
} from "./messages";


export class PongEvent<T extends Message> {
  message: T;

  constructor(message: T) {
    this.message = message;
  }
}


export class PongClient {
  ws: WebSocket;
  cb: ((e: PongEvent<Message>) => void) | null;

  constructor(
      url: string,
      cb: (((e: PongEvent<Message>) => void) | null) = null) {
    this.cb = cb;
    console.log("connecting to", url);
    const ws = this.ws = new WebSocket(url);
    ws.onmessage = this.handleMessage.bind(this);
    ws.onerror = this.handleError.bind(this);
  }

  set onchange(cb: (e: PongEvent<Message>) => void) {
    this.cb = cb;
  }

  send(message: any) {
    const m = JSON.stringify(message);
    this.ws.send(m);
  }

  private handleMessage(m: MessageEvent<any>) {
    // // TODO: fix hack (hardcoded to StatsUpdate)
    // const data = new StatsUpdate(JSON.parse(m.data));
    // const e = new PongEvent<StatsUpdate>(data);
    // TODO: fix hack (hardcoded to Update)
    const data = Update.fromJson(m.data);
    const e = new PongEvent<Update>(data);
    this.emitChangeEvent(e);
  }

  private handleError(e: Event) {
    console.log(e);
    const data = new WebSocketError(e.type);
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

