import P5, {Element} from "p5";
import {
  Message, StatsUpdate, Update, WebSocketError
} from "../common/pong/messages";
import {PongClient} from "./lib/client";
import {P5App} from "./lib/p5app";
import {Ball, Paddle, Table} from "./lib/sprites";


/**
 * PongApp is responsible for setting up the game UI, but the UI is updated
 * according to game state messages it receives from the server (even the
 * player's paddle movements). The server is authoritative for game state.
 *
 * The bulk of modifying the game for the browser app is here, but:
 * - If more UI elements (sprites) are needed, add them to ./lib/sprites.ts.
 * - If more messages are needed, add them to ../common/messages.ts, and then
 *   update the mapper in this constructor and add a handler method.
 */
export class PongApp extends P5App {
  // Note: the server's target framerate is only 30 fps, but this framerate
  // is intended to support any other animations we want to render.
  static readonly DefaultFrameRate = 60;

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

  // Maps message type to a [message class, handler].
  mapper = new Map<string, [{ new(data: object): Message; }, (m: any) => void]>;


  constructor(
      p5: P5,
      parent: string | Element | object,
      width: number,
      height: number) {
    super(p5, parent, width, height);

    // Message mapper used by websocket client to instantiate incoming messages
    // and route them to handler methods on this instance.
    // TODO: using a tuple right now, but probably want to create a dedicated
    // type.
    this.mapper.set("Update", [Update, this.onUpdate.bind(this)]);
    this.mapper.set(
        "StatsUpdate",
        [StatsUpdate, this.onStatsUpdate.bind(this)]);
    this.mapper.set(
        "WebSocketError",
        [WebSocketError, this.onWebSocketError.bind(this)]);

    // DOM elements (updated by StatsUpdate messages).
    // This is just a temporary example; the stats will be different and
    // rendered as part of the game UI.
    this.user = document.getElementById("user");
    this.system = document.getElementById("system");
    this.id = document.getElementById("id");
    this.rss = document.getElementById("rss");
    this.heapTotal = document.getElementById("heapTotal");
    this.heapUsed = document.getElementById("heapUsed");
    this.external = document.getElementById("external");

    //
    // Game UI (updated by Update messages).
    //
    const table = new Table(0, 0, this.width, this.height);
    table.background = "black";

    const ball = new Ball(250, 100);

    // TODO: this is a temporary hack for player #1; player will use actual
    // cursor keys (currently assigned to player2).
    const player1 = new Paddle(30, 250);
    player1.upKey = 65;    // up:   'a'
    player1.downKey = 90;  // down: 'z'

    // TODO: player2 is a hack right now until player matching works (and maybe
    // single player mode).
    const player2 = new Paddle(table.width - 50, 250);
    player2.upKey = p5.UP_ARROW;
    player2.downKey = p5.DOWN_ARROW;

    table.add(ball, player1, player2);

    // TODO: need actual player id assigned from server.
    player1.onchange(y => { this.client!.send({id: 0, y: y}); });
    player2.onchange(y => { this.client!.send({id: 1, y: y}); });

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
    this.p5.frameRate(PongApp.DefaultFrameRate);
  }

  override draw() {
    super.draw();
    this.table.paint(this.getGraphicsContext());
  }

  async connect(hosts: Array<string>): Promise<void> {
    this.client = new PongClient(hosts, this.mapper);
    await this.client.connect();
  }

  private onWebSocketError(m: WebSocketError) {
    console.log(m);
    // TODO: Strategy: Try to reconnect a few times, stop game, ? Throw for now.
    throw new Error(`WebSocketError: ${m.message});
  }

  private onUpdate(m: Update): void {
    this.ball.x = m.x;
    this.ball.y = m.y;
    this.ball.vx = m.vx;
    this.ball.vy = m.vy;
    this.player1.y = m.player1y;
    this.player2.y = m.player2y;
  }

  private onStatsUpdate(m: StatsUpdate): void {
    this.user!.textContent = m.stats.cpu.user;
    this.system!.textContent = m.stats.cpu.system;
    this.id!.textContent = m.id;
    this.rss!.textContent = m.stats.memory.rss;
    this.heapTotal!.textContent = m.stats.memory.heapTotal;
    this.heapUsed!.textContent = m.stats.memory.heapUsed;
    this.external!.textContent = m.stats.memory.external;
  }
}