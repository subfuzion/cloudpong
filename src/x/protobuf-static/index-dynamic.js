import assert from "assert/strict";
import protobuf from "protobufjs";

class PongMessages {
  constructor() {
  }
}

const {err, root} = await protobuf.load("pong.proto");
if (err) throw err;

// Obtain a message type (package.message)
const PaddleMoveRequest = root.lookupType("pong.PaddleMoveRequest");

// Exemplary payload
let payload = {direction: -1};

if (process.env.NODE_ENV === "dev") {
  // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
  const errMsg = PaddleMoveRequest.verify(payload);
  if (errMsg) throw Error(errMsg);
}

// Create a new message
let message = PaddleMoveRequest.create(payload); // or use .fromObject if conversion is necessary

// Encode a message to an Uint8Array (browser) or Buffer (node)
const buffer = PaddleMoveRequest.encode(message).finish();
// ... do something with buffer

// Decode an Uint8Array (browser) or Buffer (node) to a message
message = PaddleMoveRequest.decode(buffer);
// ... do something with message
console.log(message);

// If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.

// Maybe convert the message back to a plain object
const payload2 = PaddleMoveRequest.toObject(message, {
  longs: String, enums: String, bytes: String, // see ConversionOptions
});

// Full round trip: convert back one more time
if (process.env.NODE_ENV === "dev") {
  // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
  const errMsg = PaddleMoveRequest.verify(payload2);
  if (errMsg) throw Error(errMsg);
}
let message2 = PaddleMoveRequest.create(payload2);
console.log(message2);
assert.deepEqual(message2, message);