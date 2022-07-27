import P5 from "p5";
import {
  Ball,
  GraphicsContext,
  Paddle,
  PongEngine,
  Table
} from "./pong";
import {
  BallUpdate,
  Message,
  PaddleUpdate,
  PongClient,
  StatsUpdate,
  PongEvent,
} from "../lib/pong/client";

class Pong {
  id: HTMLElement | null;
  rss: HTMLElement | null;
  heapTotal: HTMLElement | null;
  heapUsed: HTMLElement | null;
  external: HTMLElement | null;

  //ws: WebSocket;
  client: PongClient;

  constructor() {
    this.id = document.getElementById("id");
    this.rss = document.getElementById("rss");
    this.heapTotal = document.getElementById("heapTotal");
    this.heapUsed = document.getElementById("heapUsed");
    this.external = document.getElementById("external");

    // this.ws = this.connect();
    this.client = new PongClient(`ws://${location.host}`);
    this.client.onchange = this.onmessage.bind(this);
  }

  // connect(): WebSocket {
  //   const ws = new WebSocket(`ws://${location.host}`);
  //   ws.onmessage = this.onmessage.bind(this);
  //   return ws;
  // }

  // private onmessage(event: MessageEvent<any>): void {
  //   const {id, stats} = JSON.parse(event.data);
  //   this.id!.textContent = id;
  //   this.rss!.textContent = stats.rss;
  //   this.heapTotal!.textContent = stats.heapTotal;
  //   this.heapUsed!.textContent = stats.heapUsed;
  //   this.external!.textContent = stats.external;
  // }
  //private onmessage(e: PongEvent): void {
  private onmessage(e: PongEvent<Message>): void {
    if (e.message instanceof StatsUpdate) {
      const m = e.message as StatsUpdate;
      this.id!.textContent = m.id;
      this.rss!.textContent = m.stats.rss;
      this.heapTotal!.textContent = m.stats.heapTotal;
      this.heapUsed!.textContent = m.stats.heapUsed;
      this.external!.textContent = m.stats.external;
    }
  }
}

export const sketch = (p5: P5) => {
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

  const events = new Array<Message>();
  const pong = new PongEngine();
  pong.onStateChange(e => {
    if (e instanceof PaddleUpdate) {
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
      if (e instanceof BallUpdate) {
        console.log(`${e.constructor.name}: e: ${e.x}, y: ${e.y}`);
        ball.x = e.x;
        ball.y = e.y;
      } else if (e instanceof PaddleUpdate) {
        console.log(`${e.constructor.name}: #1 y: ${e.y}, #2 y: ${e.y}`);
        player1.y = e.y[0];
        player2.y = e.y[1];
      } else {
        console.log(`error: unrecognized event type: ${e!.type}`);
      }
    }
  };
};

new Pong();
// new P5(sketch);
