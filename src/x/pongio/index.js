"use strict";

const express = require("express");
const path = require("path");
const uuid = require("@root/uuid").v4;
const {createServer} = require("http");
const {WebSocketServer} = require("ws");

const app = express();
app.use(express.static(path.join(__dirname, "/public")));

const server = createServer(app);
const wss = new WebSocketServer({server: server});

const connections = new Map();
let intervalId;

function addConnection(ws) {
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

function removeConnection(ws) {
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

const port = Number(process.env.PORT) || 8080;
server.listen(port, () => {
  console.log(`Listening on :${port}`);
});