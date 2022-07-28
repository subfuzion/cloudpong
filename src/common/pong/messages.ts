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