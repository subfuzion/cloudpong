/**
 * This is the entrypoint for the server. It starts an Express app
 * for handling HTTP connections and wraps it with PongWebSocketServer
 * to handle WebSocket connection upgrades for bi-directional game
 * traffic.
 */

import {app} from "./app.js";
import {AddressInfo} from "net";

import {PongWebSocketServer} from "./pong/websocketserver.js";


const network = "0.0.0.0";
const port = Number(process.env.PORT) || 8080;

// HTTP server
const server = app.listen(port, network, () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Listening on ${address}:${port}`);
});

// WebSocket server
const pongServer = new PongWebSocketServer(server);

async function shutdown(signal: string) {
  if (signal == "SIGINT") console.log();
  console.log(`Received ${signal}, shutting down server.`);
  await pongServer.close(); // closes the wrapped HTTP server
  process.exit();
}

["SIGTERM", "SIGINT"].forEach((sig) => {
  process.on(sig, () => shutdown(sig));
});
