import P5, {Element} from "p5";
import {
  Message, StatsUpdate, Update, WebSocketError
} from "../common/pong/messages";
import {PongClient} from "./lib/client";
import {P5App} from "./lib/p5app";
import {Ball, Paddle, Table} from "./lib/sprites";
import {Page} from "./page";


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

  // page (for manipulating things outside the game canvas)
  page: Page;

  // game objects
  table: Table;
  ball: Ball;
  paddle1: Paddle;
  paddle2: Paddle;

  // Maps message type to a [message class, message handler].
  mapper = new Map<string, [{ new(data: object): Message; }, (m: any) => void]>;

  // game engine client
  client?: PongClient;


  constructor(
      p5: P5,
      parent: string | Element | object,
      width: number,
      height: number) {
    super(p5, parent, width, height);

    // HTML UI (updated by StatsUpdate messages).
    //
    this.page = new Page();

    // Game UI (updated by Update messages).
    //
    const table = new Table(0, 0, this.width, this.height);
    table.background = "black";

    const ball = new Ball(250, 100);

    // TODO: this is a temporary hack for player1; player1 will use actual
    // cursor keys (currently assigned to player2).
    const paddle1 = new Paddle(30, 250);
    paddle1.upKey = 65;    // up:   'a'
    paddle1.downKey = 90;  // down: 'z'

    // TODO: player2 is a hack right now until player matching works (and maybe
    // single player mode).
    const paddle2 = new Paddle(table.width - 50, 250);
    paddle2.upKey = p5.UP_ARROW;
    paddle2.downKey = p5.DOWN_ARROW;

    table.add(ball, paddle1, paddle2);

    // TODO: need actual player id assigned from server.
    paddle1.onchange(y => { this.client!.send({id: 0, y: y}); });
    paddle2.onchange(y => { this.client!.send({id: 1, y: y}); });

    this.table = table;
    this.ball = ball;
    this.paddle1 = paddle1;
    this.paddle2 = paddle2;

    // Message handling.
    //
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
    throw new Error(`WebSocketError: ${m.message}`);
  }

  // TODO: potential optimization: only report vector changes, let client
  // compute, occasionally synchronize/reconcile?
  private onUpdate(m: Update): void {
    this.ball.x = m.x;
    this.ball.y = m.y;
    this.ball.vx = m.vx;
    this.ball.vy = m.vy;
    this.paddle1.y = m.paddle1y;
    this.paddle2.y = m.paddle2y;
  }

  private onStatsUpdate(m: StatsUpdate): void {
    this.page.setStats(m);
  }
}