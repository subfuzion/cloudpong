export class PongClient {
  ws: WebSocket;
  cb: ((e: PongEvent) => void) | null;

  constructor(url: string, cb: (((e: PongEvent) => void) | null) = null) {
    this.cb = cb;
    const ws = this.ws = new WebSocket(url);
    ws.onmessage = this.handleMessage.bind(this);

    ws.onmessage = (e: MessageEvent<any>)

    ws.onerror = this.handleError.bind(this);
  }

  set onchange(cb: (e: PongEvent) => void) {
    this.cb = cb;
  }

  private handleMessage(e: MessageEvent<any>) {
    this.emitChangeEvent(new StatsEvent(JSON.parse(e.data)));
  }

  private handleError(e: Event) {
    // TODO: fix hack (hardcoded to stats)
    this.emitChangeEvent(new PongErrorEvent(e.type));
  }

  private emitChangeEvent(e: PongEvent): void {
    if (this.cb) {
      setTimeout(() => {
        if (this.cb) this.cb(e);
      });
    }
  }
}

export class PongEvent {
  get type(): string {
    return this.constructor.name;
  }
}

export class PongErrorEvent extends PongEvent {
  message: string;

  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class BallChangeEvent extends PongEvent {
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

export class PaddleChangeEvent extends PongEvent {
  y: Array<number>;

  constructor(y: Array<number>) {
    super();
    this.y = y;
  }
}

export class StatsEvent extends PongEvent {
  id: string;
  rss: string;
  heapTotal: string;
  heapUsed: string;
  external: string;

  constructor(data: any) {
    super();
    const {id, stats} = data;
    this.id = id;
    this.rss = stats?.rss;
    this.heapTotal = stats?.heapTotal;
    this.heapUsed = stats?.heapUsed;
    this.external = stats?.external;
  }
}