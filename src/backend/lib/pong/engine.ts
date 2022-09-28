import {EventEmitter} from "events";
import {
  Update,
  Message
} from "../../../common/pong/messages.js";
import {
  Ball,
  Paddle,
  Table
} from "../../../common/pong/elements.js";


export enum GameState {
  INITIAL = "INITIAL",
  NewGame = "NEWGAME",
  NewRound = "NEWROUND",
  InPlay = "INPLAY",
  GameOver = "GAMEOVER",
}


/**
 * PongEngine implements the server-side pong runtime, which provides the
 * authoritative state of play. This state is updated on each call to `update`
 * (determined by `frameRate`).
 */
export class PongEngine {
  static readonly DefaultFrameRate = 30; // fps

  state: GameState = GameState.INITIAL;

  heartbeat?: NodeJS.Timer;
  frameRate: number;
  screenWidth: number;
  screenHeight: number;
  table: Table;
  ball: Ball;
  paddle1: Paddle;
  paddle2: Paddle;
  leftScore = 0;
  rightScore = 0;

  eventEmitter: EventEmitter = new EventEmitter();

  pauseUntil: number = 0;

  constructor(frameRate: number = PongEngine.DefaultFrameRate) {
    this.frameRate = frameRate;

    this.screenWidth = 600;
    this.screenHeight = 370;

    this.table = new Table(0, 0, this.screenWidth, this.screenHeight);

    this.ball = new Ball();

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
  addStateChangeListener(cb: (e: Message) => void): void {
    this.eventEmitter.addListener("state", cb);
  }

  start(): void {
    this.state = GameState.InPlay;
    this.serveBall();
    const frameInterval = 1000 / this.frameRate; // ms per frame
    this.heartbeat = setInterval(() => {
      this.update();
    }, frameInterval);
  }

  movePaddle(id: number, y: number): void {
    switch (id) {
      case 0:
        this.paddle1.y += this.paddle1.vy * y;
        this.constrainPaddle(this.paddle1);
        break;
      case 1:
        this.paddle2.y += this.paddle2.vy * y;
        this.constrainPaddle(this.paddle2);
        break;
      default:
        console.log(`error: invalid paddle id: ${id}`);
        return;
    }
  }

  private serveBall(): void {
    this.ball.x = this.table.width / 2;
    this.ball.y = this.table.height / 2;
    this.ball.vx = 12 * (Math.round(Math.random()) * 2 - 1);
    this.ball.vy = 2 * (Math.round(Math.random()) * 2 - 1);
  }

  private hideBall(): void {
    // stop ball and position out of sight
    this.ball.x = 0 - this.ball.width;
    this.ball.y = 0 - this.ball.height;
    this.ball.vx = 0;
    this.ball.vy = 0;
  }

  private newRound(): void {
    this.state = GameState.NewRound;
    this.hideBall();
    this.setPause(2000);
  }

  private gameOver(): void {
    this.state = GameState.GameOver;
    this.hideBall();
    clearInterval(this.heartbeat);
    this.sendUpdate();
  }

  private constrainPaddle(paddle: Paddle): void {
    const padding = 0;
    if (paddle.y < padding) paddle.y = padding;
    if (paddle.y > this.table.height - paddle.height - padding)
      paddle.y = this.table.height - paddle.height - padding;
  }

  /**
   * Listener is registered with onStateChange
   * @param e The state change message
   * @private
   */
  private emitStateChange(e: Message): void {
    this.eventEmitter.emit("state", e);
  }

  private setPause(ms: number) {
    this.pauseUntil = Date.now() + ms;
  }

  private isPaused(): boolean {
    return Date.now() < this.pauseUntil;
  }

  private sendUpdate() {
    const e = new Update({
      state: this.state,
      x: this.ball.x,
      y: this.ball.y,
      vx: this.ball.vx,
      vy: this.ball.vy,
      paddle1y: this.paddle1.y,
      paddle2y: this.paddle2.y,
      leftScore: this.leftScore,
      rightScore: this.rightScore,
    });
    this.emitStateChange(e);
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

    // When ball goes out of bounds, start a new round.
    if (this.state === GameState.InPlay && ball.x < 0 || ball.x >
        this.table.width) {
      if (ball.x < 0) {
        this.rightScore++;
      } else {
        this.leftScore++;
      }

      if (this.leftScore === 11 || this.rightScore === 11) {
        this.gameOver();
      } else {
        this.newRound();
      }
    }

    // After a brief pause for the new round, resume game play.
    if (this.state === GameState.NewRound && !this.isPaused()) {
      this.state = GameState.InPlay;
      this.serveBall();
    }

    if (this.state === GameState.InPlay) {
      // If ball bounces off a paddle, reverse direction.
      let reverse = false;
      // if ball bounces off paddle1
      if (
          ball.x < paddle1.x + paddle1.width + 10 &&
          ball.y > paddle1.y &&
          ball.y < paddle1.y + paddle1.height &&
          ball.vx < 0 // only when coming toward the left paddle
      ) {
        reverse = true;
      }
      // if ball bounces off paddle2
      if (
          ball.x > paddle2.x - 10 &&
          ball.y > paddle2.y &&
          ball.y < paddle2.y + paddle2.height &&
          ball.vx > 0 // only when coming toward the right paddle
      ) {
        reverse = true;
      }

      // Each time the ball reverses direction after bouncing
      // off a paddle, vx increases by a constant and vy
      // increases by a random amount.
      // TODO: take into consideration where the ball hits the paddle.
      // The original pong had 8 different paddle regions affecting bounce.
      if (reverse) {
        const xFactor = -1.03;
        const yFactor = 1 + (Math.random() * 0.2);
        ball.vx *= xFactor;
        ball.vy *= yFactor;
      }

      // Move the ball
      ball.x += ball.vx;
      ball.y += ball.vy;
    }

    this.sendUpdate();
  }
}
