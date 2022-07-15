import {app} from "./app.js";
import * as http from "http";
import {AddressInfo} from "net";

const network = "0.0.0.0";
const port = Number(process.env.PORT) || 8080;

const server = app.listen(port, network, () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Listening on ${address}:${port}`);
});

async function shutdown(signal: string, server: http.Server) {
  if (signal == "SIGINT") console.log();
  console.log(`Received ${signal}, shutting down server.`);
  await server.close();
  process.exit();
}

["SIGTERM", "SIGINT"].forEach((sig) => {
  process.on(sig, () => shutdown(sig, server));
});
