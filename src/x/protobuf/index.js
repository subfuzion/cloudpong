// https://github.com/protobufjs/protobuf.js
var protobuf = require("protobufjs");

protobuf.load("pong.proto", function (err, root) {
  if (err) throw err;

  // Obtain a message type (package.message)
  var PaddleMoveRequest = root.lookupType("pong.PaddleMoveRequest");

  // Exemplary payload
  var payload = {direction: -1};

  // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
  var errMsg = PaddleMoveRequest.verify(payload);
  if (errMsg) throw Error(errMsg);

  // Create a new message
  var message = PaddleMoveRequest.create(payload); // or use .fromObject if conversion is necessary

  // Encode a message to an Uint8Array (browser) or Buffer (node)
  var buffer = PaddleMoveRequest.encode(message).finish();
  // ... do something with buffer

  // Decode an Uint8Array (browser) or Buffer (node) to a message
  var message = PaddleMoveRequest.decode(buffer);
  // ... do something with message
  console.log(message);

  // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.

  // Maybe convert the message back to a plain object
  var object = PaddleMoveRequest.toObject(message, {
    longs: String, enums: String, bytes: String, // see ConversionOptions
  });
});