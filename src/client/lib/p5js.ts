import P5, {Element} from "p5";


/**
 * A very rudimentary wrapper around P5.js to simplify implementing Pong for
 * an ESM / TypeScript environment.
 */
export class P5JS {
  readonly p5: P5;
  readonly parent: string | Element | object;
  width: number;
  height: number;

  constructor(
      p5: P5,
      parent: string | Element | object,
      width: number,
      height: number) {
    this.p5 = p5;
    this.parent = parent;
    this.width = width;
    this.height = height;
    p5.setup = this.setup.bind(this);
    p5.draw = this.draw.bind(this);
  }

  /**
   * Creates a new P5JS object of the subclass type, initialized by P5.
   * @param type The P5JS subclass.
   * @param parent The DOM element to use for drawing.
   * @param width The width of the P5 canvas.
   * @param height The height of the P5 canvas.
   * @param cb Use the callback if you want a reference to the new object.
   */
  static create<T extends P5JS>(
      type: { new(...args: any[]): T; },
      parent: string | Element | object,
      width: number,
      height: number,
      cb?: (instance: T) => void) {
    new P5((p5: P5) => {
      const instance = new type(p5, parent, width, height);
      if (cb) {
        setTimeout(() => {
          cb(instance);
        });
      }
    });
  }

  setup(): void {
  }

  draw(): void {
  }
}