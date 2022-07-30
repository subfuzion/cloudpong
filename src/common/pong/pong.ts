import {
  View,
  GraphicsContext,
  Sprite
} from "./gfx";


export class Table extends View {
  constructor(x = 0, y = 0, width = 600, height = 370) {
    super(x, y, width, height);
  }
}


export class Ball extends Sprite {
  constructor(x = 0, y = 0, width = 10, height = 10) {
    super(x, y, width, height);
  }

  override update(g: GraphicsContext) {
    g.p5.ellipse(this.x, this.y, this.width, this.height);
  }
}


export class Paddle extends Sprite {
  downKey: number = 0;
  upKey: number = 0;
  cb: ((y: number) => void) | null;

  constructor(x = 0, y = 0, width = 20, height = 100) {
    super(x, y, width, height);
    this.cb = null;
  }

  override update(g: GraphicsContext): void {
    // TODO: handle extended keydown to accelerate paddle?
    if (g.p5.keyIsDown(this.downKey) && this.y < g.height - this.height - 5) {
      this.fireChangeEvent(1);
    }
    if (g.p5.keyIsDown(this.upKey) && this.y > 5) {
      this.fireChangeEvent(-1);
    }
    super.update(g);
  }

  onchange(cb: (y: number) => void): void {
    this.cb = cb;
  }

  private fireChangeEvent(y: number): void {
    if (this.cb) {
      setTimeout(() => {
        if (this.cb) this.cb(y);
      }, 0);
    }
  }
}