/**
 * This is the entrypoint for the server. It starts an Express app for handling
 * HTTP connections and wraps it with PongWebSocketServer to handle WebSocket
 * connection upgrades for bidirectional game traffic.
 */

import {AddressInfo} from "net";
import {app} from "./app.js";
import {PongServer} from "./lib/pong/pongserver.js";


const network = "0.0.0.0";
const port = Number(process.env.PORT) || 8080;

// HTTP/API server
const server = app.listen(port, network, () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Listening on ${address}:${port}`);
});

// Game websocket server
const pongServer = new PongServer(server);

async function shutdown(signal: string) {
  if (signal == "SIGINT") console.log();
  console.log(`Received ${signal}, shutting down server.`);
  await pongServer.close(); // Close the wrapped HTTP server.
  console.log("Done.");
  process.exit();
}

["SIGTERM", "SIGINT"].forEach((sig) => {
  process.on(sig, () => shutdown(sig));
});
