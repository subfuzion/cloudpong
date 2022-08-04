import {
  Update,
  Message,
} from "../../common/pong/messages.js";
import {
  Ball,
  Paddle,
  Table
} from "../../common/pong/elements.js";


const frameRate = 1000 / 30; // 30 fps


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

    this.ball = new Ball(250, 100);
    this.ball.vx = 12;
    this.ball.vy = 2;

    this.player1 = new Paddle(30, 250);
    this.player1.y = (this.table.height - this.player1.height) / 2;
    this.player1.vy = 8;

    this.player2 = new Paddle(this.table.width - 50, 250);
    this.player2.y = (this.table.height - this.player2.height) / 2;
    this.player2.vy = 8;

    this.table.add(this.ball, this.player1, this.player2);
  }

  onStateChange(cb: (e: Message) => void): void {
    this.cb = cb;
  }

  start() {
    setInterval(() => {
      this.update();
    }, frameRate);
  }

  movePaddle(id: number, y: number): void {
    switch (id) {
      case 0:
        this.player1.y += this.player1.vy * y;
        break;
      case 1:
        this.player2.y += this.player2.vy * y;
        break;
      default:
        console.log(`error: invalid player id: ${id}`);
        return;
    }
  }

  private fireStateChange(e: Message): void {
    if (this.cb) {
      const self = this;
      setTimeout(() => {
        if (self.cb) self.cb(e);
      });
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

    // If ball bounces off a paddle, reverse direction.
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

    // Each time the ball reverses direction after bouncing
    // off a paddle, vx increases by a constant and vy
    // increases by a random amount.
    // TODO: take into consideration where the ball hits the paddle.
    if (reverse) {
      const xFactor = -1.1;
      const yFactor = 1 + (Math.random() * 0.5);
      ball.vx *= xFactor;
      ball.vy *= yFactor;
    }

    // Move the ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    const e = new Update(
        ball.x,
        ball.y,
        ball.vx,
        ball.vy,
        this.player1.y,
        this.player2.y);
    this.fireStateChange(e);
  }
}