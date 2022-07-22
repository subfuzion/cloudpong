import {app} from "./app.js";
import {AddressInfo} from "net";

import {PongServer} from "./pong/pongserver.js";

const network = "0.0.0.0";
const port = Number(process.env.PORT) || 8080;

// HTTP server
const server = app.listen(port, network, () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Listening on ${address}:${port}`);
});

// WebSocket server
const pongServer = new PongServer(server);

async function shutdown(signal: string) {
  if (signal == "SIGINT") console.log();
  console.log(`Received ${signal}, shutting down server.`);
  await pongServer.close(); // closes the wrapped HTTP server
  process.exit();
}

["SIGTERM", "SIGINT"].forEach((sig) => {
  process.on(sig, () => shutdown(sig));
});
