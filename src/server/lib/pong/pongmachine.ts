/**
 * PongMachine responds to events and determines a course of action.
 */
import {EventEmitter} from "events";
import {Client} from "./client";


class PlayerConnection {
  player: Client;

  constructor(player: Client) {
    this.player = player;
  }
}


export class Queue<T> {
  queue = new Array<T>();

  get length(): number {
    return this.queue.length;
  }

  isEmpty() {
    return this.length === 0;
  }

  enqueue(item: T) {
    this.queue.push(item);
  }

  dequeue(): T {
    return this.queue.shift() as T;
  }
}


class PlayerQueue extends EventEmitter {
  public readonly players = new Queue();


}


export abstract class PongMachine {

  onPlayerConnection(playerConnection: Client): void {

  }


  abstract addPlayerToQueue(player: Client): void;
}
