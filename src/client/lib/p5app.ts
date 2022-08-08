import P5, {Element} from "p5";


/**
 * A very rudimentary wrapper around P5.js to simplify implementing Pong for
 * an ESM / TypeScript environment.
 */
export class P5App {
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

    // Configure/start p5.js
    p5.setup = this.setup.bind(this);
    p5.draw = this.draw.bind(this);
  }

  /**
   * Creates a new P5App object of the subclass type, initialized by P5.
   * @param type The P5App subclass.
   * @param parent The DOM element to use for drawing.
   * @param width The width of the P5 canvas.
   * @param height The height of the P5 canvas.
   * @param hosts The WebSocket server addresses (wss://example.com).
   */
  static async create<T extends P5App>(
      type: { new(...args: any[]): T },
      parent: string | Element | object,
      width: number,
      height: number,
      hosts: Array<string>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      new P5((p5: P5) => {
        try {
          const instance = new type(p5, parent, width, height, hosts);
          resolve(instance);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  /**
   * Called directly before setup(), the preload() function is used to handle
   * asynchronous loading of external files in a blocking way. If a preload
   * function is defined, setup() will wait until any load calls within have
   * finished. Nothing besides load calls (loadImage, loadJSON, loadFont,
   * loadStrings, etc.) should be inside the preload function. If asynchronous
   * loading is preferred, the load methods can instead be called in setup() or
   * anywhere else with the use of a callback parameter. By default, the text
   * “loading…” will be displayed. To make your own loading page, include an
   * HTML element with id “p5_loading” in your page. More information here.
   */
  preload(): void {
  }

  /**
   * The setup() function is called once when the program starts. It's used to
   * define initial environment properties such as screen size and background
   * color and to load media such as images and fonts as the program starts.
   * There can only be one setup() function for each program, and it shouldn't
   * be called again after its initial execution. Note: Variables declared
   * within setup() are not accessible within other functions, including
   * draw().
   */
  setup(): void {
  }

  /**
   * Called directly after setup(), the draw() function continuously executes
   * the lines of code contained inside its block until the program is stopped
   * or noLoop() is called. Note if noLoop() is called in setup(), draw() will
   * still be executed once before stopping. draw() is called automatically and
   * should never be called explicitly. It should always be controlled with
   * noLoop(), redraw() and loop(). After noLoop() stops the code in draw()
   * from executing, redraw() causes the code inside draw() to execute once,
   * and loop() will cause the code inside draw() to resume executing
   * continuously. The number of times draw() executes in each second may be
   * controlled with the frameRate() function. There can only be one draw()
   * function for each sketch, and draw() must exist if you want the code to
   * run continuously, or to process events such as mousePressed(). Sometimes,
   * you might have an empty call to draw() in your program, as shown in the
   * above example. It is important to note that the drawing coordinate system
   * will be reset at the beginning of each draw() call. If any transformations
   * are performed within draw() (ex: scale, rotate, translate), their effects
   * will be undone at the beginning of draw(), so transformations will not
   * accumulate over time. On the other hand, styling applied (ex: fill,
   * stroke, etc) will remain in effect
   */
  draw(): void {
  }
}