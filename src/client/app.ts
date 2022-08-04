import P5, {Element} from "p5";
import {
  Ball,
  Paddle,
  Table
} from "./lib/pong";
import {
  PongClient,
  PongEvent,
} from "./lib/client";
import {
  Update,
  Message,
  StatsUpdate
} from "../common/pong/messages";
import {P5App} from "./lib/p5app";
//import {PongEngine} from "../common/pong/engine";
import {GraphicsContext} from "./lib/gfx";


// Support multiple deployment targets: local | local+docker | hosted.
// Supports webpack devServer (frontend :8080, backend :8081).
const WS_PROTOCOL = location.protocol === "https:" ? "wss:" : "ws:";
const WS_HOSTS = [
  `${WS_PROTOCOL}//${location.host}`,
  `${WS_PROTOCOL}//${location.hostname}:8081`,
];

process.env.NODE_ENV ===
"development" ? `${WS_PROTOCOL}//localhost:8081` :
`${WS_PROTOCOL}//${location.host}`;


class PongApp extends P5App {
  // stats dom elements
  id: HTMLElement | null;
  rss: HTMLElement | null;
  heapTotal: HTMLElement | null;
  heapUsed: HTMLElement | null;
  external: HTMLElement | null;

  // game engine client
  client: PongClient;

  // game objects
  table: Table;
  ball: Ball;
  player1: Paddle;
  player2: Paddle;

  constructor(
      p5: P5,
      parent: string | Element | object,
      width: number,
      height: number,
      hosts: Array<string>) {
    super(p5, parent, width, height);

    this.id = document.getElementById("id");
    this.rss = document.getElementById("rss");
    this.heapTotal = document.getElementById("heapTotal");
    this.heapUsed = document.getElementById("heapUsed");
    this.external = document.getElementById("external");

    this.client = new PongClient(hosts);
    this.client.connect();
    this.client.onchange = this.onmessage.bind(this);

    // game objects
    const table = new Table(0, 0, this.width, this.height);
    table.background = "black";

    const ball = new Ball(250, 100);

    const player1 = new Paddle(30, 250);
    player1.upKey = 65;    // up:   'a'
    player1.downKey = 90;  // down: 'z'

    const player2 = new Paddle(table.width - 50, 250);
    player2.upKey = p5.UP_ARROW;
    player2.downKey = p5.DOWN_ARROW;

    table.add(ball, player1, player2);

    // TODO: need player id assigned from server
    player1.onchange(y => {
      ////pongEngine.movePaddle(0, y);
      this.client.send({
        id: 0,
        y: y
      });
    });
    player2.onchange(y => {
      //pongEngine.movePaddle(1, y);
      this.client.send({
        id: 1,
        y: y
      });
    });

    this.table = table;
    this.ball = ball;
    this.player1 = player1;
    this.player2 = player2;
  }

  override setup() {
    super.setup();
    const canvas = this.p5.createCanvas(this.width, this.height);
    try {
      canvas.parent(this.parent);
    } catch (err) {
      throw new Error(`canvas.parent(${this.parent}) Is '${this.parent}' the correct element?) ${err}`);
    }
    this.p5.frameRate(60);
//    this.pongEngine.start();
  }

  override draw() {
    super.draw();
    const g = new GraphicsContext(this.p5, 0, 0, this.width, this.height);
    this.table.paint(g);
  }

  private onmessage(e: PongEvent<Message>): void {
    console.log(e);
    // if (e.message instanceof StatsUpdate) {
    //   const m = e.message as StatsUpdate;
    //   this.id!.textContent = m.id;
    //   this.rss!.textContent = m.stats.rss;
    //   this.heapTotal!.textContent = m.stats.heapTotal;
    //   this.heapUsed!.textContent = m.stats.heapUsed;
    //   this.external!.textContent = m.stats.external;
    // } else if (e.message instanceof Update) {
    //   const m = e.message as Update;
    //   this.ball.x = m.x;
    //   this.ball.y = m.y;
    //   this.ball.vx = m.vx;
    //   this.ball.vy = m.vy;
    //   this.player1.y = m.player1y;
    //   this.player2.y = m.player2y;
    // }
    if (e.message instanceof Update) {
      const m = e.message as Update;
      this.ball.x = m.x;
      this.ball.y = m.y;
      this.ball.vx = m.vx;
      this.ball.vy = m.vy;
      this.player1.y = m.player1y;
      this.player2.y = m.player2y;
    }
  }
}


// "pong" is the DOM element that will be used for the p5 canvas.
await P5App.create(PongApp, "pong", 600, 370, WS_HOSTS);
