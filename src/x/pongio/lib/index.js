import protobuf from "protobufjs";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {err, root} = await protobuf.load(path.join(__dirname, "pong.proto"));
if (err) throw err;

const MovePaddleRequest = root.lookupType("pong.MovePaddleRequest");
const MovePaddle = root.lookupType("pong.MovePaddle");

export class PongMessages {
  // Encode a message to an Uint8Array (browser) or Buffer (node)
  // direction: number (negative for up, positive for down)
  // | object { direction: number }
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
  decodeMovePaddleRequest(buffer) {
    const message = MovePaddleRequest.decode(buffer);
    return MovePaddleRequest.toObject(message, {
      longs: String, enums: String, bytes: String,
    });
  }

  // Encode a message to an Uint8Array (browser) or Buffer (node)
  // y: number (new vertical location) | object { y: number }
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
  decodeMovePaddle(buffer) {
    const message = MovePaddle.decode(buffer);
    return MovePaddle.toObject(message, {
      longs: String, enums: String, bytes: String,
    });
  }
}