/**
 * This is the entrypoint for the server. It starts an Express app for handling
 * HTTP connections and wraps it with PongServer to handle WebSocket connection
 * upgrades for bidirectional game traffic. Closing PongServer also closes the
 * wrapped Express app.
 */

import {AddressInfo} from "net";
import {app} from "./app.js";
import {PongServer} from "./lib/pong/pongserver.js";


const network = "0.0.0.0";
const port = Number(process.env.PORT) || 8080;

// Express API server.
const server = app.listen(port, network, () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Listening on ${address}:${port}`);
});

// Pong websocket server.
const pongServer = new PongServer(server);

// Handle signals for graceful shutdown.
["SIGTERM", "SIGINT"].forEach(sig => {
  process.on(sig, async () => await shutdown(sig));
});

async function shutdown(signal: string) {
  if (signal == "SIGINT") console.log();
  console.log(`Received ${signal}, shutting down server.`);
  await pongServer.close(); // Close the wrapped HTTP server.
  console.log("Done.");
  process.exit();
}
