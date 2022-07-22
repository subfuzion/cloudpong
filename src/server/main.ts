import {app} from "./app.js";
import * as http from "http";
import {AddressInfo} from "net";
import WebSocket, {WebSocketServer} from "ws";
import {v4 as uuid} from "uuid";

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

const wss = new WebSocketServer({server});

const connections = new Map();
let intervalId: NodeJS.Timer | undefined;

function addConnection(ws: WebSocket) {
  const id = uuid();
  connections.set(ws, id);
  console.log("adding connection: " + id);
  if (!intervalId) {
    console.log("started interval");
    intervalId = setInterval(() => {
      // get stats outside of the loop and stringify early
      const stats = JSON.stringify(process.memoryUsage());
      const statsPostfix = "\", \"stats\": " + stats + "}";
      for (const [ws, id] of connections) {
        // no stringification, just concatenate in the loop
        const message = "{\"id\": \"" + id + statsPostfix;
        ws.send(message, () => {
          // Ignore errors.
        }, 100);
      }
    });
  }
}

function removeConnection(ws: WebSocket) {
  console.log("removing connection");
  connections.delete(ws);
  if (!connections.size) {
    console.log("stopping interval");
    clearInterval(intervalId);
    intervalId = undefined;
  }
}

wss.on("connection", ws => {
  console.log("open event");
  ws.on("error", err => {
    console.log("error event: " + err.message);
    removeConnection(ws);
  });

  ws.on("close", () => {
    console.log("close event");
    removeConnection(ws);
  });

  addConnection(ws);
});
