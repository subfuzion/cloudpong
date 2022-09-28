import {
  Update,
  Message
} from "../../common/pong/messages.js";
import {
  Ball,
  Paddle,
  Table
} from "../../common/pong/elements.js";


/**
 * PongEngine implements the server-side pong runtime, which provides the
 * authoritative state of play. This state is updated on each call to `update`
 * (determined by `frameRate`).
 */
export class PongEngine {
  static readonly DefaultFrameRate = 30; // fps

  frameRate: number;
  screenWidth: number;
  screenHeight: number;
  table: Table;
  ball: Ball;
  paddle1: Paddle;
  paddle2: Paddle;

  cb: ((e: Message) => void) | null = null;

  constructor(frameRate: number = PongEngine.DefaultFrameRate) {
    this.frameRate = frameRate;
    this.screenWidth = 600;
    this.screenHeight = 370;

    this.table = new Table(0, 0, this.screenWidth, this.screenHeight);

    this.ball = new Ball(250, 100);
    this.ball.vx = 12;
    this.ball.vy = 2;

    this.paddle1 = new Paddle(30, 250);
    this.paddle1.y = (this.table.height - this.paddle1.height) / 2;
    this.paddle1.vy = 10;

    this.paddle2 = new Paddle(this.table.width - 50, 250);
    this.paddle2.y = (this.table.height - this.paddle2.height) / 2;
    this.paddle2.vy = 10;

    this.table.add(this.ball, this.paddle1, this.paddle2);
  }

  /**
   * Triggered by emitStateChange
   * @param cb The state change callback
   */
  onStateChange(cb: (e: Message) => void): void {
    this.cb = cb;
  }

  start() {
    const frameInterval = 1000 / this.frameRate; // ms per frame
    setInterval(() => {
      this.update();
    }, frameInterval);
  }

  movePaddle(id: number, y: number): void {
    switch (id) {
      case 0:
        this.paddle1.y += this.paddle1.vy * y;
        break;
      case 1:
        this.paddle2.y += this.paddle2.vy * y;
        break;
      default:
        console.log(`error: invalid paddle id: ${id}`);
        return;
    }
  }

  /**
   * Listener is registered with onStateChange
   * @param e The state change message
   * @private
   */
  private emitStateChange(e: Message): void {
    if (this.cb) this.cb(e);
  }

  private update() {
    const table = this.table;
    const ball = this.ball;
    const paddle1 = this.paddle1;
    const paddle2 = this.paddle2;

    // Ball bounces off the top and bottom sides of the table.
    if (ball.y > table.height - 5 || ball.y < 5) {
      ball.vy *= -1;
    }

    // If ball bounces off a paddle, reverse direction.
    let reverse = false;
    // if ball bounces off paddle1
    if (
        ball.x < paddle1.x + paddle1.width + 10 &&
        ball.y > paddle1.y &&
        ball.y < paddle1.y + paddle1.height
    ) {
      reverse = true;
    }
    // if ball bounces off paddle2
    if (
        ball.x > paddle2.x - 10 &&
        ball.y > paddle2.y &&
        ball.y < paddle2.y + paddle2.height
    ) {
      reverse = true;
    }

    // Each time the ball reverses direction after bouncing
    // off a paddle, vx increases by a constant and vy
    // increases by a random amount.
    // TODO: take into consideration where the ball hits the paddle.
    // The original pong had 8 different paddle regions affecting bounce.
    if (reverse) {
      const xFactor = -1.1;
      const yFactor = 1 + (Math.random() * 0.5);
      ball.vx *= xFactor;
      ball.vy *= yFactor;
    }

    // Move the ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    const e = new Update({
      x: ball.x,
      y: ball.y,
      vx: ball.vx,
      vy: ball.vy,
      paddle1y: this.paddle1.y,
      paddle2y: this.paddle2.y,
    });
    this.emitStateChange(e);
  }
}
