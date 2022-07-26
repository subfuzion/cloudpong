import P5 from "p5";

class ChangeEvent {
  get type(): string {
    return this.constructor.name;
  }
}

class BallChangeEvent extends ChangeEvent {
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

class PaddleChangeEvent extends ChangeEvent {
  y: Array<number>;

  constructor(y: Array<number>) {
    super();
    this.y = y;
  }
}

class PongEngine {
  screenWidth: number;
  screenHeight: number;
  table: Table;
  ball: Ball;
  player1: Paddle;
  player2: Paddle;

  cb: ((e: ChangeEvent) => void) | null = null;

  constructor() {
    this.screenWidth = 600;
    this.screenHeight = 370;

    this.table = new Table(0, 0, this.screenWidth, this.screenHeight);
    this.table.background = "black";

    this.ball = new Ball(250, 100);
    this.ball.vx = 4;
    this.ball.vy = 2;

    this.player1 = new Paddle(30, 250);
    this.player1.vy = 4;

    this.player2 = new Paddle(this.table.width - 50, 250);
    this.player2.vy = 4;

    this.table.add(this.ball, this.player1, this.player2);
  }

  onStateChange(cb: (e: ChangeEvent) => void): void {
    this.cb = cb;
  }

  start() {
    setInterval(() => {
      this.update();
    }, 20);
  }

  movePaddle(id: number, y: number): void {
    switch (id) {
      case 0:
        this.player1.y = y;
        break;
      case 1:
        this.player2.y = y;
        break;
      default:
        console.log(`error: invalid player id: ${id}`);
        return;
    }
    this.fireStateChange(new PaddleChangeEvent([
      this.player1.y,
      this.player2.y,
    ]));
  }

  private fireStateChange(e: ChangeEvent): void {
    if (this.cb) {
      const self = this;
      setTimeout(() => {
        if (self.cb) self.cb(e);
      }, 0);
    }
  }

  private update() {
    const table = this.table;
    const ball = this.ball;
    const player1 = this.player1;
    const player2 = this.player2;

    // Ball bounces off the top and bottom sides of the table.
    if (ball.y > table.height - 5 || ball.y < 5) {
      ball.vy *= -1;
    }

    // Ball bounces off paddles. The x velocity increases by a
    // constant and the y velocity increases by a random amount.
    const xFactor = -1.1;
    const yFactor = (Math.random() * 6) - 3;

    let reverse = false;
    // if ball bounces off player 1 paddle
    if (
      ball.x < player1.x + player1.width + 10 &&
      ball.y > player1.y &&
      ball.y < player1.y + player1.height
    ) {
      reverse = true;
    }

    // if ball bounces off player 2 paddle
    if (
      ball.x > player2.x - 10 &&
      ball.y > player2.y &&
      ball.y < player2.y + player2.height
    ) {
      reverse = true;
    }

    if (reverse) {
      ball.vx *= xFactor;
      ball.vy = yFactor;
    }

    // Move the ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    const e = new BallChangeEvent(ball.x, ball.y, ball.vx, ball.vy);
    this.fireStateChange(e);
  }
}

class Pong {
  id: HTMLElement | null;
  rss: HTMLElement | null;
  heapTotal: HTMLElement | null;
  heapUsed: HTMLElement | null;
  external: HTMLElement | null;

  ws: WebSocket;

  constructor() {
    this.id = document.getElementById("id");
    this.rss = document.getElementById("rss");
    this.heapTotal = document.getElementById("heapTotal");
    this.heapUsed = document.getElementById("heapUsed");
    this.external = document.getElementById("external");
    if (!(this.id && this.rss && this.heapTotal && this.heapUsed && this.external)) {
      throw new Error("error getting stats elements");
    }
    this.ws = this.connect();
  }

  connect(): WebSocket {
    const ws = new WebSocket(`ws://${location.host}`);
    ws.onmessage = this.onmessage.bind(this);
    return ws;
  }

  onmessage(event: MessageEvent<any>): void {
    const {id, stats} = JSON.parse(event.data);
    // @ts-ignore
    this.id.textContent = id;
    // @ts-ignore
    this.rss.textContent = stats.rss;
    // @ts-ignore
    this.heapTotal.textContent = stats.heapTotal;
    // @ts-ignore
    this.heapUsed.textContent = stats.heapUsed;
    // @ts-ignore
    this.external.textContent = stats.external;
  }
}

// Super simple logic-less graphics library (game logic is on the server).

class GraphicsContext {
  p5: P5;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(p5: P5, x: number, y: number, width: number, height: number) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

// A sprite is something that knows how to draw itself.
class Sprite {
  x: number;
  y: number;
  width: number;
  height: number;
  vx = 0;
  vy = 0;
  background: string;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.background = "white";
  }

  update(g: GraphicsContext): void {
    g.p5.rect(this.x, this.y, this.width, this.height);
  }

  paint(g: GraphicsContext): void {
    g.p5.fill(this.background);
    this.update(g);
  }
}

// A container is a sprite that contains other sprites within its boundaries.
class Container extends Sprite {
  sprites: Set<Sprite>;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    super(x, y, width, height);
    this.sprites = new Set<Sprite>();
  }

  add(...sprites: Array<Sprite>): void {
    for (const s of sprites) {
      this.sprites.add(s);
    }
  }

  paint(g: GraphicsContext): void {
    super.paint(g);
    for (const s of this.sprites) {
      s.paint(g);
    }
  }
}

class Table extends Container {
  constructor(x = 0, y = 0, width = 600, height = 370) {
    super(x, y, width, height);
  }
}

class Ball extends Sprite {
  constructor(x = 0, y = 0, width = 10, height = 10) {
    super(x, y, width, height);
  }

  update(g: GraphicsContext) {
    g.p5.ellipse(this.x, this.y, this.width, this.height);
  }
}

class Paddle extends Sprite {
  downKey: number = 0;
  upKey: number = 0;
  cb: ((y: number) => void) | null;

  constructor(x = 0, y = 0, width = 20, height = 100) {
    super(x, y, width, height);
    this.cb = null;
  }

  update(g: GraphicsContext): void {
    if (g.p5.keyIsDown(this.downKey) && this.y < g.height - this.height - 5) {
      this.fireChangeEvent(this.y + this.vy);
    }
    if (g.p5.keyIsDown(this.upKey) && this.y > 5) {
      this.fireChangeEvent(this.y - this.vy);
    }
    super.update(g);
  }

  onchange(cb: (y: number) => void): void {
    this.cb = cb;
  }

  private fireChangeEvent(y: number): void {
    if (this.cb) {
      setTimeout(() => {
        if (this.cb) this.cb(y);
      }, 0);
    }
  }
}

const sketch = (p5: P5) => {
  const screenWidth = 600;
  const screenHeight = 370;

  const table = new Table(0, 0, screenWidth, screenHeight);
  table.background = "black";

  const ball = new Ball(250, 100);
  ball.vx = 4;
  ball.vy = 2;

  const player1 = new Paddle(30, 250);
  player1.vy = 4;
  player1.downKey = 90;  // down: 'z'
  player1.upKey = 65;    // up:   'a'

  const player2 = new Paddle(table.width - 50, 250);
  player2.vy = 4;
  player2.downKey = p5.DOWN_ARROW;
  player2.upKey = p5.UP_ARROW;

  table.add(ball, player1, player2);

  const events = new Array<ChangeEvent>();
  const pong = new PongEngine();
  pong.onStateChange(e => {
    if (e instanceof PaddleChangeEvent) {
      events.unshift(e);
    } else {
      events.push(e);
    }
  });
  // TODO: need player id assigned from server
  player1.onchange(y => {
    pong.movePaddle(0, y);
  });
  player2.onchange(y => {
    pong.movePaddle(1, y);
  });

  p5.setup = () => {
    const canvas = p5.createCanvas(screenWidth, screenHeight);
    canvas.parent("pong");
    p5.frameRate(60);
    pong.start();
  };

  p5.draw = () => {
    const g = new GraphicsContext(p5, 0, 0, screenWidth, screenHeight);
    table.paint(g);

    if (events.length) {
      const e = events.shift()!;
      if (e instanceof BallChangeEvent) {
        console.log(`${e.constructor.name}: e: ${e.x}, y: ${e.y}`);
        ball.x = e.x;
        ball.y = e.y;
      } else if (e instanceof PaddleChangeEvent) {
        console.log(`${e.constructor.name}: #1 y: ${e.y}, #2 y: ${e.y}`);
        player1.y = e.y[0];
        player2.y = e.y[1];
      } else {
        console.log(`error: unrecognized event type: ${e!.type}`);
      }
    }
  };
};

// (new Pong()).connect();
new P5(sketch);
