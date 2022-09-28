/**
 * This module provides a common base for game element state that is modeled on
 * both the client and the server.
 * - The server game engine operates in "headless" mode while updating and
 *   broadcasting game state to player and spectator clients.
 * - The client is responsible for rendering objects on the game screen and
 *   sending active player events to the server.
 */


/**
 * An element represents physical game object state.
 */
export class Element {
  x: number;
  y: number;
  width: number;
  height: number;
  vx = 0;
  vy = 0;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}


/**
 * A container is an element that contains other elements.
 */
export class Container<T extends Element> extends Element {
  elements = new Set<T>();

  constructor(x = 0, y = 0, width = 0, height = 0) {
    super(x, y, width, height);
  }

  add(...elements: Array<T>): void {
    for (const e of elements) {
      this.elements.add(e);
    }
  }
}


export class Table extends Container<Element> {
  constructor(x = 0, y = 0, width = 600, height = 370) {
    super(x, y, width, height);
  }
}


export class Ball extends Element {
  constructor(x = 0, y = 0, width = 15, height = 15) {
    super(x, y, width, height);
  }
}


export class Paddle extends Element {
  constructor(x = 0, y = 0, width = 20, height = 100) {
    super(x, y, width, height);
  }
}
