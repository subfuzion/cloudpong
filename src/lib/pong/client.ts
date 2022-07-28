export class PongClient {
  ws: WebSocket;
  cb: ((e: PongEvent<Message>) => void) | null;

  constructor(url: string, cb: (((e: PongEvent<Message>) => void) | null) = null) {
    this.cb = cb;
    console.log("connecting to", url);
    const ws = this.ws = new WebSocket(url);
    ws.onmessage = this.handleMessage.bind(this);
    ws.onerror = this.handleError.bind(this);
  }

  set onchange(cb: (e: PongEvent<Message>) => void) {
    this.cb = cb;
  }

  private handleMessage(m: MessageEvent<any>) {
    // TODO: fix hack (hardcoded to stats)
    const data = new StatsUpdate(JSON.parse(m.data));
    const e = new PongEvent<StatsUpdate>(data);
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

export class PongEvent<T extends Message> {
  message: T;

  constructor(message: T) {
    this.message = message;
  }
}

export class Message {
  type(): string {
    return this.constructor.name;
  }
}

export class WebSocketError extends Message {
  message: string;

  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class BallUpdate extends Message {
  x: number;
  y: number;
  vx: number;
  vy: number;

  constructor(x: number, y: number, vx: number, vy: number) {
    super();
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}

export class PaddleUpdate extends Message {
  y: Array<number>;

  constructor(y: Array<number>) {
    super();
    this.y = y;
  }
}

export class StatsUpdate extends Message {
  id: string;
  stats: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };

  constructor(data: any) {
    super();
    const {id, stats} = data;
    this.id = id;
    this.stats = {
      rss: stats.rss,
      heapTotal: stats.heapTotal,
      heapUsed: stats.heapUsed,
      external: stats.external,
    };
  }
}