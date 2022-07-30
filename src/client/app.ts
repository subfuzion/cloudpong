import P5, {Element} from "p5";
import {
  Ball,
  Paddle,
  Table
} from "./pong";
import {
  PongClient,
  PongEvent,
} from "../common/pong/client";
import {
  Update,
  Message,
  StatsUpdate
} from "../common/pong/messages";
import {P5js} from "./lib/p5js";
import {PongEngine} from "../common/pong/engine";
import {GraphicsContext} from "./lib/gfx";

// TODO: Use "wss://" instead of "ws://" for production.
// TODO: Need to bundle with correct url for deployment.
// const HOST = `ws://${location.host}`;
const HOST = "ws://localhost:8081";


class Pong extends P5js {
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
  pongEngine: PongEngine;

  constructor(
      p5: P5,
      parent: string | Element | object,
      width: number,
      height: number,
      host: string) {
    super(p5, parent, width, height);

    this.id = document.getElementById("id");
    this.rss = document.getElementById("rss");
    this.heapTotal = document.getElementById("heapTotal");
    this.heapUsed = document.getElementById("heapUsed");
    this.external = document.getElementById("external");

    this.client = new PongClient(host);
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

    const pongEngine = new PongEngine();
    pongEngine.onStateChange(e => {
      if (e instanceof Update) {
        this.ball.x = e.x;
        this.ball.y = e.y;
        this.ball.vx = e.vx;
        this.ball.vy = e.vy;
        this.player1.y = e.player1y;
        this.player2.y = e.player2y;
      }
    });

    // TODO: need player id assigned from server
    player1.onchange(y => {
      pongEngine.movePaddle(0, y);
    });
    player2.onchange(y => {
      pongEngine.movePaddle(1, y);
    });

    this.table = table;
    this.ball = ball;
    this.player1 = player1;
    this.player2 = player2;
    this.pongEngine = pongEngine;
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
    this.pongEngine.start();
  }

  override draw() {
    super.draw();
    const g = new GraphicsContext(this.p5, 0, 0, this.width, this.height);
    this.table.paint(g);
  }

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


// "pong" is the DOM element that will be used for the p5 canvas.
P5js.create(Pong, "pong", 600, 370, HOST);
