/**
 * PongMachine responds to events and determines a course of action.
 */
import {Client} from "./client.js";
import {Player} from "./player.js";
import {Match2, PlayerQueue} from "./playerqueue.js";


export abstract class PongMachine {
  private readonly queue: PlayerQueue;

  protected constructor() {
    this.queue = new PlayerQueue();
    this.queue.onReady(this.startGame.bind(this));
  }

  disconnect() {
    this.queue.disconnect();
  }

  async clientConnected(client: Client): Promise<void> {
    // For now, use client.id for name
    const player = new Player(client.id);
    await this.queue.push(player);
  }


  abstract startGame(match: Match2): void;
}
