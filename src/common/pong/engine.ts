import {BallUpdate, Message, PaddleUpdate} from "./messages";
import {Ball, Paddle, Table} from "../../client/pong";


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