import {
  View,
  GraphicsContext,
  Sprite
} from "./gfx";


export class Table extends View {
  leftScore = 0;
  rightScore = 0;

  // normal keys
  private downKey = 74;  // down: 'j'
  private upKey = 75;    // up:   'k'

  // alternate keys - for shared play mode (two players, same computer)
  // private altDownKey = 70;  // down: 'j'
  // private altUpKey = 68;    // up:   'd'

  private cb: ((y: number) => void) | undefined = undefined;

  constructor(x = 0, y = 0, width = 600, height = 370) {
    super(x, y, width, height);
  }

  override update(g: GraphicsContext): void {
    if (g.p5.keyIsDown(this.downKey)) {
      this.emitChangeEvent(1);
    }
    if (g.p5.keyIsDown(this.upKey)) {
      this.emitChangeEvent(-1);
    }

    super.update(g);

    g.p5.push();
    g.p5.textSize(32);
    g.p5.fill(150);

    g.p5.textAlign(g.p5.RIGHT, g.p5.TOP);
    g.p5.text(this.leftScore, this.width / 2 - 20, 10);

    g.p5.textAlign(g.p5.LEFT, g.p5.TOP);
    g.p5.text(this.rightScore, this.width / 2 + 20, 10);
    g.p5.pop();

  }

  onchange(cb: (y: number) => void): void {
    this.cb = cb;
  }

  private emitChangeEvent(y: number): void {
    if (this.cb) this.cb(y);
  }
}


export class Centerline extends Sprite {
  override update(g: GraphicsContext) {
    g.p5.push();
    // drawingContext.setLineDash([10, 16]);
    const canvas = document.getElementById("canvas");
    const ctx = (canvas as HTMLCanvasElement).getContext("2d")!;
    ctx?.setLineDash([2, 16]);
    ctx.lineCap = "square";
    g.p5.stroke(150);
    g.p5.strokeWeight(7);
    super.update(g);
    ctx?.setLineDash([]);
    g.p5.pop();
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
  constructor(x = 0, y = 0, width = 20, height = 100) {
    super(x, y, width, height);
  }
}


export class Score extends Sprite {
  score = 0;

  constructor(x = 0, y = 0, width = 100, height = 100) {
    super(x, y, width, height);
  }

  override update(g: GraphicsContext) {
    super.update(g);
    // g.p5.push();
    // g.p5.textSize(16);
    // g.p5.fill(150);
    // g.p5.text(this.score, 10, 30);
    // g.p5.pop();
  }
}
