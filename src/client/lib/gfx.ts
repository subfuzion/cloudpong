import P5 from "p5";
import {
  Element,
  Container
} from "../../common/pong/elements";


export class GraphicsContext {
  p5: P5;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(p5: P5, x: number, y: number, width: number, height: number) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}


export interface UIElement extends Element {
  background: string;

  update(g: GraphicsContext): void;

  paint(g: GraphicsContext): void;
}


// A sprite is something that knows how to render an element on the P5 canvas.
export class Sprite extends Element implements UIElement {
  background: string;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    super(x, y, width, height);
    this.background = "white";
  }

  update(g: GraphicsContext): void {
    g.p5.rect(this.x, this.y, this.width, this.height);
  }

  paint(g: GraphicsContext): void {
    g.p5.fill(this.background);
    this.update(g);
  }
}


// A view is a sprite that can also renders child sprites.
export class View extends Container<Sprite> implements UIElement {
  background: string;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    super(x, y, width, height);
    this.background = "white";
  }

  update(g: GraphicsContext): void {
    g.p5.rect(this.x, this.y, this.width, this.height);
  }

  paint(g: GraphicsContext): void {
    g.p5.fill(this.background);
    this.update(g);
    for (const s of this.elements) {
      s.paint(g);
    }
  }
}