/**
 * This module defines all the messages passed over WebSockets between game
 * client and server.
 */


/**
 * A message can be serialized and unserialized. It contains a
 * `type` field to identify the message type when deserializing.
 */
export class Message {
  /**
   * @param data Be careful: this is a shotgun, don't blow your foot off. There
   *             is no validation that data properties belong in the instance.
   */
  constructor(data?: object) {
    this.merge(data);
  }

  /**
   * Returns the name of this class.
   */
  get type(): string {
    return this.constructor.name;
  }

  /**
   *
   * @param type The message subclass (must have a single-argument constructor).
   * @param s The JSON string.
   */
  static parseJSON<T extends Message>(
      type: { new(data: object): T },
      s: string): T {
    const j = JSON.parse(s);
    if (!j.type) throw new Error(`No property "type" on ${s}`);
    if (type.name !=
        j.type) throw new Error(`Can't parse ${j.type} as ${type.name}`);
    // Safe equivalent to using eval, such as:
    // const o: any = eval(`new ${this.name}`);
    const o: any = new type(j);
    return o as T;
  }

  /**
   * Ensures messages are serialized with a "type" property.
   * If overriding, call `super.toJSON()` and then add additional properties.
   */
  toJSON(): object {
    const j: any = {
      type: this.type,
    };
    for (const [key, value] of Object.entries(this)) {
      j[key] = value;
    }
    return j;
  }

  /**
   * Returns JSON string.
   */
  stringify(): string {
    return JSON.stringify(this.toJSON());
  }

  /**
   * Must be called by every subclass constructor *after* calling
   * `super(data)` or values set by base class will be overwritten
   * when subclass instance properties finish initializing.
   * @param data An object with properties to merge into this instance.
   *             Be careful: this is a shotgun, don't blow your foot off.
   *             There is no validation that data properties belong in
   *             the instance. Be especially careful when renaming fields
   *             to change all usages.
   */
  merge(data?: object) {
    if (data) {
      const self: any = this;
      for (const [key, val] of Object.entries(data)) {
        if (key !== "type" && val) self[key] = val;
      }
    }
  }
}


/**
 * A ServerMessage is only sent by a server.
 */
export class ServerMessage extends Message {}


/**
 * A ClientMessage is only sent by a client.
 */
export class ClientMessage extends Message {}


export class WebSocketError extends Message {
  message = "";

  constructor(data?: object) {
    super(data);
    this.merge(data);
  }
}


export class Update extends ServerMessage {
  state = "INITIAL";
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  paddle1y = 0;
  paddle2y = 0;
  leftScore = 0;
  rightScore = 0;

  constructor(data?: object) {
    super(data);
    this.merge(data);
  }
}


export class GlobalStats {
  currentInstanceCount = 0;
  peakInstanceCount = 0;
  totalInstanceCount = 0;
  currentGameCount = 0;
  peakGameCount = 0;
  totalGameCount = 0;
  currentPlayerCount = 0;
  peakPlayerCount = 0;
  totalPlayerCount = 0;
  currentQueueCount = 0;
  peakQueueCount = 0;
  totalQueueCount = 0;
  avgQueueWait = 0;
  avgQueueWaitDropped = 0;
  totalQueueDropped = 0;
}


export class ServerStats {
  serverId = "";
  runningSince = 0;
  uptime = 0;
  currentConnectionCount = 0;
  peakConnectionCount = 0;
  totalConnectionCount = 0;
  messages = 0;
  mps = 0;
  p95 = 0;
  p99 = 0;
}


export class PlayerStats {
  playerId = "";
  state = "";
  opponentId = "";
  messages = 0;
  mps = 0;
  p95 = 0;
  p99 = 0;
}


export class StatsUpdate extends ServerMessage {
  global = new GlobalStats();
  server = new ServerStats();
  player = new PlayerStats();

  constructor(data?: object) {
    super(data);
    this.merge(data);
  }
}
