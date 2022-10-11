import P5, {Element} from "p5";

import {
  Message, StatsUpdate, Update, WebSocketError
} from "../common/pong/messages";
import {PongClient} from "./lib/client";
import {P5App} from "./lib/p5app";
import {Ball, Centerline, Paddle, Score, Table} from "./lib/sprites";
import {Page} from "./page";


/**
 * Essentially this is a dumb terminal that displays what its told. Only key
 * presses (j for down, k for up) are sent to the server, where the game logic
 * is processed (see `src/backend/pong/engine.ts`).
 *
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
    table.background = [0, 0, 0, 255];

    /////////
    // This is the only message we need to send to the server!
    // The paddle up or down message will be used by the server game engine
    // to determine what happens next and notify the players.
    table.onchange(y => { this.client!.send({id: 0, y: y}); });
    /////////

    const centerline = new Centerline();
    centerline.background = [255, 0, 0, 255];
    centerline.x = table.width / 2;
    centerline.y = 0;
    centerline.width = 0;
    centerline.height = table.height;

    const ball = new Ball(250, 100);

    const paddle1 = new Paddle(30, 250);
    const paddle2 = new Paddle(table.width - 50, 250);

    table.add(centerline, ball, paddle1, paddle2);

    this.table = table;
    this.ball = ball;
    this.paddle1 = paddle1;
    this.paddle2 = paddle2;

    // Message handling.
    // Message mapper used by websocket client to instantiate incoming messages
    // and route them to handler methods on this instance.
    // TODO: using a tuple right now, but might want to use a dedicated type.
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
    canvas.id("canvas");
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
    throw new Error(`WebSocketError: ${m.message}`);
  }

  /**
   * Basically the frontend is just a "dumb" terminal -- all it does is use
   * messages from the server to update sprites.
   * @param m
   * @private
   */
  private onUpdate(m: Update): void {
    this.ball.x = m.x;
    this.ball.y = m.y;
    this.ball.vx = m.vx;
    this.ball.vy = m.vy;
    this.paddle1.y = m.paddle1y;
    this.paddle2.y = m.paddle2y;
    this.table.leftScore = m.leftScore;
    this.table.rightScore = m.rightScore;
  }

  private onStatsUpdate(m: StatsUpdate): void {
    this.page.setStats(m);
  }
}
