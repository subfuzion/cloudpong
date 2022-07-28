import P5, {Element} from "p5";
import {Ball, GraphicsContext, Paddle, PongEngine, Table} from "./pong";
import {BallUpdate, Message, PaddleUpdate, PongClient, PongEvent, StatsUpdate,} from "../lib/pong/client";

// TODO: need to bundle with correct url for deployment
// const HOST = `ws://${location.host}`;
const HOST = "ws://localhost:8081";

/**
 * A very rudimentary wrapper around P5.js to simplify implementing Pong for
 * an ESM / TypeScript environment.
 */
class P5JS {
  readonly p5: P5;
  readonly parent: string | Element | object;
  width: number;
  height: number;

  constructor(
      p5: P5,
      parent: string | Element | object,
      width: number,
      height: number) {
    this.p5 = p5;
    this.parent = parent;
    this.width = width;
    this.height = height;
    p5.setup = this.setup.bind(this);
    p5.draw = this.draw.bind(this);
  }

  /**
   * Creates a new P5JS object of the subclass type, initialized by P5.
   * @param type The P5JS subclass.
   * @param parent The DOM element to use for drawing.
   * @param width The width of the P5 canvas.
   * @param height The height of the P5 canvas.
   * @param cb Use the callback if you want a reference to the new object.
   */
  static create<T extends P5JS>(
      type: { new(...args: any[]): T; },
      parent: string | Element | object,
      width: number,
      height: number,
      cb?: (instance: T) => void) {
    new P5((p5: P5) => {
      const instance = new type(p5, parent, width, height);
      if (cb) {
        setTimeout(() => {
          cb(instance);
        });
      }
    });
  }

  setup(): void {
  }

  draw(): void {
  }
}

class Pong extends P5JS {
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
  events: Array<Message>;

  constructor(
      p5: P5,
      parent: (string | Element | object) = "pong",
      width: number,
      height: number) {
    super(p5, parent, width, height);

    this.id = document.getElementById("id");
    this.rss = document.getElementById("rss");
    this.heapTotal = document.getElementById("heapTotal");
    this.heapUsed = document.getElementById("heapUsed");
    this.external = document.getElementById("external");

    this.client = new PongClient(HOST);
    this.client.onchange = this.onmessage.bind(this);

    // game objects
    const table = new Table(0, 0, this.width, this.height);
    table.background = "black";

    const ball = new Ball(250, 100);
    ball.vx = 4;
    ball.vy = 2;

    const player1 = new Paddle(30, 250);
    player1.vy = 4;
    player1.upKey = 65;    // up:   'a'
    player1.downKey = 90;  // down: 'z'

    const player2 = new Paddle(table.width - 50, 250);
    player2.vy = 4;
    player2.upKey = p5.UP_ARROW;
    player2.downKey = p5.DOWN_ARROW;

    table.add(ball, player1, player2);

    const events = new Array<Message>();
    const pongEngine = new PongEngine();
    pongEngine.onStateChange(e => {
      if (e instanceof PaddleUpdate) {
        events.unshift(e);
      } else {
        events.push(e);
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
    this.events = events;
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
    const width = this.width;
    const height = this.height;
    const table = this.table;
    const events = this.events;
    const ball = this.ball;
    const player1 = this.player1;
    const player2 = this.player2;

    const g = new GraphicsContext(this.p5, 0, 0, width, height);
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

// "pong" is the DOM element that will be used for the P5 canvas.
P5JS.create(Pong, "pong", 600, 370);
