import http2 from "http2";
import fs from "fs";

// ====================================
// routing
// ====================================

// liveness check
const pingHandler = (stream, headers) => {
  if (stream.closed) {
    return;
  }
  console.log({headers});
  stream.respond({
    ":status": 200
  });
  stream.end("pong");
};

// 404
const notFoundHandler = (stream, headers) => {
  stream.respond({
    "content-type": "text/plain; charset=utf-8",
    ":status": 404
  });
  stream.end("path not found");
};

const router = (stream, headers) => {
  stream.on("close", () => console.log("stream closed"));
  stream.on("error", (err) => console.log("stream error", err));

  const path = headers[":path"];
  const method = headers[":method"];

  let handler;
  if (path === "/ping" && method === "GET") {
    handler = pingHandler;
  } else {
    handler = notFoundHandler;
  }

  handler(stream, headers);
};

// ====================================
// server
// ====================================

const server = http2.createSecureServer({
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem")
});

server.on("stream", router);
server.on("error", (err) => console.error(err));

server.on("session", session => {
  console.log("session started");
  session.on("close", () => console.log("session closed"));
  session.on("error", err => console.error("session error", err));
});

server.listen(8443);
