/**
 * This module defines all the messages passed over WebSockets between game
 * client and server.
 */


/**
 * A message can be serialized and unserialized.
 */
export class Message {
  type(): string {
    return this.constructor.name;
  }
}


export class ServerMessage extends Message {}


export class ClientMessage extends Message {}


export class WebSocketError extends Message {
  message: string;

  constructor(message: string) {
    super();
    this.message = message;
  }
}


export class Update extends ServerMessage {
  x: number;
  y: number;
  vx: number;
  vy: number;
  player1y: number;
  player2y: number;

  constructor(
      x: number,
      y: number,
      vx: number,
      vy: number,
      player1y: number,
      player2y: number) {
    super();
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.player1y = player1y;
    this.player2y = player2y;
  }

  static fromJson(data: Buffer): Update {
    const o = JSON.parse(data.toString());
    return new Update(
        o.x,
        o.y,
        o.vx,
        o.vy,
        o.player1y,
        o.player2y);
  }
}


export class StatsUpdate extends ServerMessage {
  id: string;
  stats: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };

  constructor(data: any) {
    super();
    const {id, stats} = data;
    this.id = id;
    this.stats = {
      rss: stats.rss,
      heapTotal: stats.heapTotal,
      heapUsed: stats.heapUsed,
      external: stats.external,
    };
  }
}