import {GlobalStats, ServerStats, StatsUpdate} from "../common/pong/messages";


/**
 * Page handles the UI for everything that is not part of the Pong element.
 */
export class Page {
  // global
  instances = id("instances");
  // games = id("games");
  players = id("players");
  // queue = id("queue");

  // server
  serverId = id("serverId");
  runningSince = id("runningSince");
  uptime = id("uptime");
  serverCurrentPlayers = id("serverCurrentPlayers");
  serverTraffic = id("serverTraffic");

  // player
  playerId = id("playerId");
  playerState = id("playerState");
  opponentId = id("opponentId");
  playerTraffic = id("playerTraffic");

  setStats(m: StatsUpdate): void {
    // global
    this.instances.textContent = formatGlobalInstances(m.global);
    // this.games.textContent = formatGlobalGames(m.global);
    this.players.textContent = formatGlobalPlayers(m.global);
    // this.queue.textContent = formatGlobalQueue(m.global);

    // server
    this.serverId.textContent = m.server.serverId;
    this.runningSince.textContent = new Date(m.server.runningSince).toString();
    this.uptime.textContent = formatTimeDifference(m.server.uptime);
    this.serverCurrentPlayers.textContent = formatServerActivePlayers(m.server);
    this.serverTraffic.textContent = formatServerTraffic(m.server);

    // player
    this.playerId.textContent = m.player.playerId;
    this.playerState.textContent = m.player.state;
    this.opponentId.textContent = m.player.opponentId;
  }
}


function id(domElement: string): HTMLElement {
  return document.getElementById(domElement)!;
}

function formatGlobalInstances(global: GlobalStats): string {
  const current = global.currentInstanceCount.toLocaleString();
  const peak = global.peakInstanceCount.toLocaleString();
  const total = global.totalInstanceCount.toLocaleString();
  return `Current: ${current}, Peak: ${peak}, Total: ${total}`;
}

function formatGlobalGames(global: GlobalStats): string {
  const current = global.currentGameCount.toLocaleString();
  const peak = global.peakGameCount.toLocaleString();
  const total = global.totalGameCount.toLocaleString();
  return `Current: ${current}, Peak: ${peak}, Total: ${total}`;
}

function formatGlobalPlayers(global: GlobalStats): string {
  const current = global.currentPlayerCount.toLocaleString();
  const peak = global.peakPlayerCount.toLocaleString();
  const total = global.totalPlayerCount.toLocaleString();
  // return `Current: ${current}, Peak: ${peak}, Total: ${total}`;
  const queue = global.currentQueueCount.toLocaleString();
  return `Active: ${current}, Queued: ${queue}, Peak: ${peak}, Total: ${total}`;
}

function formatGlobalQueue(global: GlobalStats): string {
  const current = global.currentQueueCount.toLocaleString();
  const peak = global.peakQueueCount.toLocaleString();
  const total = global.totalQueueCount.toLocaleString();
  return `Current: ${current}, Peak: ${peak}, Total: ${total}`;
}

function formatServerActivePlayers(server: ServerStats): string {
  const current = server.currentConnectionCount.toLocaleString();
  const peak = server.peakConnectionCount.toLocaleString();
  const total = server.totalConnectionCount.toLocaleString();
  return `Current: ${current}, Peak: ${peak}, Total: ${total}`;
}

function formatServerTraffic(server: ServerStats): string {
  const messages = server.messages.toLocaleString();
  const mps = server.mps.toFixed(1).toLocaleString();
  const p95 = server.p95.toLocaleString();
  const p99 = server.p99.toLocaleString();
  return `Messages: ${messages}, MPS: ${mps}, P95: ${p95}, P99: ${p99}`;
}

function formatTimeDifference(diff: number) {
  let str = "";
  let localeDiff = diff.toLocaleString();

  const days = Math.floor(diff / 1000 / 60 / 60 / 24);
  diff -= days * 1000 * 60 * 60 * 24;

  const hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;

  const minutes = Math.floor(diff / 1000 / 60);
  diff -= minutes * 1000 * 60;

  const seconds = Math.floor(diff / 1000);

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  return `${localeDiff} ms (${days}D : ${hh}H : ${mm}M : ${ss}S)`;
}
