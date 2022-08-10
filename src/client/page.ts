import {StatsUpdate} from "../common/pong/messages";


/**
 * Page handles the UI for everything that is not part of the Pong element.
 */
export class Page {
  // stats dom elements
  user: HTMLElement;
  system: HTMLElement;
  id: HTMLElement;
  rss: HTMLElement;
  heapTotal: HTMLElement;
  heapUsed: HTMLElement;
  external: HTMLElement;

  constructor() {
    // DOM elements (updated by StatsUpdate messages).
    // This is just a temporary example; the stats will be different and
    // rendered as part of the game UI.
    const id = (id: string) => this.byId(id);
    this.user = id("user")!;
    this.system = id("system")!;
    this.id = id("id")!;
    this.rss = id("rss")!;
    this.heapTotal = id("heapTotal")!;
    this.heapUsed = id("heapUsed")!;
    this.external = id("external")!;
  }

  setStats(m: StatsUpdate): void {
    this.user.textContent = m.stats.cpu.user;
    this.system.textContent = m.stats.cpu.system;
    this.id.textContent = m.id;
    this.rss.textContent = m.stats.memory.rss;
    this.heapTotal.textContent = m.stats.memory.heapTotal;
    this.heapUsed.textContent = m.stats.memory.heapUsed;
    this.external.textContent = m.stats.memory.external;
  }

  private byId(id: string): HTMLElement {
    const e = document.getElementById(id);
    if (!e) throw new Error(`${id} not found in document`);
    return e;
  }
}