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
import {GraphicsContext} from "./lib/gfx";


class PongApp extends P5App {
  // stats dom elements
  user: HTMLElement | null;
  system: HTMLElement | null;
  id: HTMLElement | null;
  rss: HTMLElement | null;
  heapTotal: HTMLElement | null;
  heapUsed: HTMLElement | null;
  external: HTMLElement | null;

  // game engine client
  client?: PongClient;

  // game objects
  table: Table;
  ball: Ball;
  player1: Paddle;
  player2: Paddle;

  constructor(
      p5: P5,
      parent: string | Element | object,
      width: number,
      height: number) {
    super(p5, parent, width, height);

    this.user = document.getElementById("user");
    this.system = document.getElementById("system");
    this.id = document.getElementById("id");
    this.rss = document.getElementById("rss");
    this.heapTotal = document.getElementById("heapTotal");
    this.heapUsed = document.getElementById("heapUsed");
    this.external = document.getElementById("external");

    // game objects
    const table = new Table(0, 0, this.width, this.height);
    table.background = "black";

    const ball = new Ball(250, 100);

    // TODO: this is a temporary hack
    const player1 = new Paddle(30, 250);
    player1.upKey = 65;    // up:   'a'
    player1.downKey = 90;  // down: 'z'

    const player2 = new Paddle(table.width - 50, 250);
    player2.upKey = p5.UP_ARROW;
    player2.downKey = p5.DOWN_ARROW;

    table.add(ball, player1, player2);

    // TODO: need player id assigned from server
    player1.onchange(y => {
      this.client!.send({
        id: 0,
        y: y
      });
    });
    player2.onchange(y => {
      this.client!.send({
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
  }

  override draw() {
    super.draw();
    const g = new GraphicsContext(this.p5, 0, 0, this.width, this.height);
    this.table.paint(g);
  }

  async connect(hosts: Array<string>): Promise<void> {
    this.client = new PongClient(hosts);
    await this.client.connect();
    this.client.onchange = this.onmessage.bind(this);
  }

  private onmessage(e: PongEvent<Message>): void {
    if (e.message instanceof StatsUpdate) {
      const m = e.message as StatsUpdate;
      this.user!.textContent = m.stats.cpu.user;
      this.system!.textContent = m.stats.cpu.system;
      this.id!.textContent = m.id;
      this.rss!.textContent = m.stats.memory.rss;
      this.heapTotal!.textContent = m.stats.memory.heapTotal;
      this.heapUsed!.textContent = m.stats.memory.heapUsed;
      this.external!.textContent = m.stats.memory.external;
    } else if (e.message instanceof Update) {
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


async function main(): Promise<void> {
  // Supports multiple deployment targets: local | local+docker | hosted.
  // If served from a secure host, then need to use `wss` for websockets.
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";

  // Can serve frontend and backend from different hosts:
  // - during development (using webpack devServer for frontend).
  // - in production (for example, to serve frontend from CDN).
  // Define PONGHOST using DefinePlugin in webpack.config.js. If it is not set,
  // then assume that the host is where the frontend was served from.
  // @ts-ignore (PONGHOST is declared externally in webpack config)
  const host = PONGHOST ? PONGHOST : `${protocol}//${location.host}`;

  // Can have multiple websocket servers. The client uses the websocket for the
  // first host it can connect to. For example:
  // const hosts = [host, `${protocol}//${location.hostname}:8081`];
  const hosts = [host];

  // "pong" is the DOM element that's used for rendering the p5 canvas.
  const app = await P5App.create(PongApp, "pong", 600, 370, hosts);
  await app.connect(hosts);
}


await main();