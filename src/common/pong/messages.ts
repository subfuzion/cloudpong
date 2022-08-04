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
  constructor(data: object) {
    this.merge(data);
  }

  /**
   *
   * @param type The message (sub)class. Must have a zero-argument constructor.
   * @param s The JSON string.
   */
  static parseJSON<T extends Message>(
      type: { new(data?: object): T },
      s: string): T {
    const j = JSON.parse(s);
    if (!j.type) throw new Error(`No property "type" on ${s}`);
    if (this.name !=
        j.type) throw new Error(`Parsing ${j.type}: can't parse as ${this.name}`);

    // Safe equivalent to using eval, such as:
    // const o: any = eval(`new ${this.name}`);
    const o: any = new type(j);
    return o as T;
  }

  /**
   * Returns the name of this class.
   */
  type(): string {
    return this.constructor.name;
  }

  /**
   * Ensures messages are serialized with a "type" property.
   * If overriding, call `super.toJSON()` and then add additional properties.
   */
  toJSON(): object {
    const j: any = {
      type: this.type(),
    };
    for (const [key, value] of Object.entries(this)) {
      j[key] = value;
    }
    return j;
  }

  /**
   * Must be called by every subclass constructor *after* calling
   * `super(data)` or values set by base class will be overwritten
   * when subclass instance properties finish initializing.
   * @param data An object with properties to merge into this instance.
   *             Be careful: this is a shotgun, don't blow your foot off.
   *             There is no validation that data properties belong in
   *             the instance.
   * @protected
   */
  protected merge(data: object) {
    if (data) {
      const self: any = this;
      for (const [key, val] of Object.entries(data)) {
        self[key] = val;
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

  constructor(data: object) {
    super(data);
    this.merge(data);
  }
}


export class Update extends ServerMessage {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  player1y = 0;
  player2y = 0;

  constructor(data: object) {
    super(data);
    this.merge(data);
  }
}


export class StatsUpdate extends ServerMessage {
  id = "";
  stats: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  } = {
    rss: "",
    heapTotal: "",
    heapUsed: "",
    external: "",
  };

  constructor(data: object) {
    super(data);
    this.merge(data);
  }
}