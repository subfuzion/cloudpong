import {StatsUpdate} from "../common/pong/messages";


/**
 * Page handles the UI for everything that is not part of the Pong element.
 */
export class Page {
  user = document.getElementById("user")!;
  system = document.getElementById("system")!;
  id = document.getElementById("id")!;
  rss = document.getElementById("rss")!;
  heapTotal = document.getElementById("heapTotal")!;
  heapUsed = document.getElementById("heapUsed")!;
  external = document.getElementById("external")!;

  setStats(m: StatsUpdate): void {
    this.user.textContent = m.stats.cpu.user;
    this.system.textContent = m.stats.cpu.system;
    this.id.textContent = m.id;
    this.rss.textContent = m.stats.memory.rss;
    this.heapTotal.textContent = m.stats.memory.heapTotal;
    this.heapUsed.textContent = m.stats.memory.heapUsed;
    this.external.textContent = m.stats.memory.external;
  }
}