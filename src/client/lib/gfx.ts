import P5 from "p5";


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


// A sprite is something that knows how to draw itself.
export class Sprite {
  x: number;
  y: number;
  width: number;
  height: number;
  vx = 0;
  vy = 0;
  background: string;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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


// A container is a sprite that contains other sprites within its boundaries.
export class Container extends Sprite {
  sprites: Set<Sprite>;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    super(x, y, width, height);
    this.sprites = new Set<Sprite>();
  }

  add(...sprites: Array<Sprite>): void {
    for (const s of sprites) {
      this.sprites.add(s);
    }
  }

  override paint(g: GraphicsContext): void {
    super.paint(g);
    for (const s of this.sprites) {
      s.paint(g);
    }
  }
}