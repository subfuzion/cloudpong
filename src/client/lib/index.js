import protobuf from "protobufjs";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = await protobuf.load(path.join(__dirname, "pong.proto"));

const Timestamp = root.lookupType("pong.Timestamp");
const EchoRequest = root.lookupType("pong.EchoRequest");
const EchoReply = root.lookupType("pong.EchoReply");
const MoveBall = root.lookupType("pong.MoveBall");
const MovePaddleRequest = root.lookupType("pong.MovePaddleRequest");
const MovePaddle = root.lookupType("pong.MovePaddle");

export class PongMessages {

  // Encode a message to an Uint8Array (browser) or Buffer (node)
  // data: number | object { data: number }
  /**
   * @param {any} data
   */
  encodeEchoRequest(data) {
    let payload = data;
    if (typeof payload === "number") {
      payload = {data: data};
    }
    if (process.env.NODE_ENV === "dev") {
      // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
      const errMsg = EchoRequest.verify(payload);
      if (errMsg) throw Error(errMsg);
    }
    const message = EchoRequest.create(payload);
    return EchoRequest.encode(message).finish();
  }

  // Decode an Uint8Array (browser) or Buffer (node) to an object
  // returns { data: number }
  /**
   * @param {Uint8Array | protobuf.Reader} buffer
   */
  decodeEchoRequest(buffer) {
    const message = EchoRequest.decode(buffer);
    return EchoRequest.toObject(message, {
      longs: String, enums: String, bytes: String,
    });
  }

  // Encode a message to an Uint8Array (browser) or Buffer (node)
  // data: number | object { data: number }
  /**
   * @param {any} data
   */
  encodeEchoReply(data) {
    let payload = data;
    if (typeof payload === "number") {
      payload = {data: data};
    }
    if (process.env.NODE_ENV === "dev") {
      // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
      const errMsg = EchoReply.verify(payload);
      if (errMsg) throw Error(errMsg);
    }
    const message = EchoReply.create(payload);
    return EchoReply.encode(message).finish();
  }

  // Decode an Uint8Array (browser) or Buffer (node) to an object
  // returns { data: number }
  /**
   * @param {Uint8Array | protobuf.Reader} buffer
   */
  decodeEchoReply(buffer) {
    const message = EchoReply.decode(buffer);
    return EchoReply.toObject(message, {
      longs: String, enums: String, bytes: String,
    });
  }

  // Encode a message to an Uint8Array (browser) or Buffer (node)
  // x, y: number (coordinates) | object { x: number, y: number }
  /**
   * @param {any} x
   * @param {any} y
   */
  encodeMoveBall(x, y) {
    let payload = x;
    if (typeof payload === "number") {
      payload = {x: x, y: y};
    }
    if (process.env.NODE_ENV === "dev") {
      // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
      const errMsg = MoveBall.verify(payload);
      if (errMsg) throw Error(errMsg);
    }
    const message = MoveBall.create(payload);
    return MoveBall.encode(message).finish();
  }

  // Decode an Uint8Array (browser) or Buffer (node) to an object
  // returns { x: number, y: number }
  /**
   * @param {Uint8Array | protobuf.Reader} buffer
   */
  decodeMoveBall(buffer) {
    const message = MoveBall.decode(buffer);
    return MoveBall.toObject(message, {
      longs: String, enums: String, bytes: String,
    });
  }

  // Encode a message to an Uint8Array (browser) or Buffer (node)
  // direction: number (negative for up, positive for down)
  // | object { direction: number }
  /**
   * @param {any} direction
   */
  encodeMovePaddleRequest(direction) {
    let payload = direction;
    if (typeof payload === "number") {
      payload = {direction: direction};
    }
    // normalize number
    payload.direction = payload.direction < 0 ? -1 : payload.direction > 0 ? 1 : 0;
    if (process.env.NODE_ENV === "dev") {
      // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
      const errMsg = MovePaddleRequest.verify(payload);
      if (errMsg) throw Error(errMsg);
    }
    const message = MovePaddleRequest.create(payload);
    return MovePaddleRequest.encode(message).finish();
  }

  // Decode an Uint8Array (browser) or Buffer (node) to an object
  // returns { direction: number }
  /**
   * @param {Uint8Array | protobuf.Reader} buffer
   */
  decodeMovePaddleRequest(buffer) {
    const message = MovePaddleRequest.decode(buffer);
    return MovePaddleRequest.toObject(message, {
      longs: String, enums: String, bytes: String,
    });
  }

  // Encode a message to an Uint8Array (browser) or Buffer (node)
  // y: number (new vertical location) | object { y: number }
  /**
   * @param {any} y
   */
  encodeMovePaddle(y) {
    let payload = y;
    if (typeof payload === "number") {
      payload = {y: y};
    }
    if (process.env.NODE_ENV === "dev") {
      // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
      const errMsg = MovePaddle.verify(payload);
      if (errMsg) throw Error(errMsg);
    }
    const message = MovePaddle.create(payload);
    return MovePaddle.encode(message).finish();
  }

  // Decode an Uint8Array (browser) or Buffer (node) to an object
  // returns { y: number }
  /**
   * @param {Uint8Array | protobuf.Reader} buffer
   */
  decodeMovePaddle(buffer) {
    const message = MovePaddle.decode(buffer);
    return MovePaddle.toObject(message, {
      longs: String, enums: String, bytes: String,
    });
  }
}