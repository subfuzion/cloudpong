import P5 from "p5";
import {BallUpdate, Message, PaddleUpdate} from "../lib/pong/client";

export class PongEngine {
  screenWidth: number;
  screenHeight: number;
  table: Table;
  ball: Ball;
  player1: Paddle;
  player2: Paddle;

  cb: ((e: Message) => void) | null = null;

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

  onStateChange(cb: (e: Message) => void): void {
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
    this.fireStateChange(new PaddleUpdate([
                                            this.player1.y,
                                            this.player2.y,
                                          ]));
  }

  private fireStateChange(e: Message): void {
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

    const e = new BallUpdate(ball.x, ball.y, ball.vx, ball.vy);
    this.fireStateChange(e);
  }
}

// Super simple logic-less graphics library (game logic is on the server).

export class GraphicsContext {
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
export class Sprite {
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
export class Container extends Sprite {
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

  override paint(g: GraphicsContext): void {
    super.paint(g);
    for (const s of this.sprites) {
      s.paint(g);
    }
  }
}

export class Table extends Container {
  constructor(x = 0, y = 0, width = 600, height = 370) {
    super(x, y, width, height);
  }
}

export class Ball extends Sprite {
  constructor(x = 0, y = 0, width = 10, height = 10) {
    super(x, y, width, height);
  }

  override update(g: GraphicsContext) {
    g.p5.ellipse(this.x, this.y, this.width, this.height);
  }
}

export class Paddle extends Sprite {
  downKey: number = 0;
  upKey: number = 0;
  cb: ((y: number) => void) | null;

  constructor(x = 0, y = 0, width = 20, height = 100) {
    super(x, y, width, height);
    this.cb = null;
  }

  override update(g: GraphicsContext): void {
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