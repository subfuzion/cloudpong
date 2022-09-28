import {PongApp} from "./pong";
import {P5App} from "./lib/p5app";


async function main(): Promise<void> {
  // Supports multiple deployment targets: local | local+docker | hosted.
  // If served from a secure host, then need to use `wss` for websockets.
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";

  // Can serve frontend and backend from different hosts:
  // - during development (using webpack devServer for frontend).
  // - in production (for example, to serve frontend from CDN).
  // Define PONGHOST using DefinePlugin in webpack.config.js. If it is not set,
  // then assume that the host is where the frontend was served from.
  // @ts-ignore (PONGHOST is declared externally in webpack config)
  const host = PONGHOST ? PONGHOST : `${protocol}//${location.host}`;

  // Can have multiple websocket servers. The client uses the websocket for the
  // first host it can connect to. For example:
  // const hosts = [host, `${protocol}//${location.hostname}:8081`];
  const hosts = [host];

  // "pong" is the DOM element that's used for rendering the p5 canvas.
  const app = await P5App.create(PongApp, "pong", 600, 370, hosts);
  await app.connect(hosts);
}


await main();