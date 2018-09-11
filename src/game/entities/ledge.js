import { Sprite } from './sprite';

export class Ledge extends Sprite {
  constructor(g, o) {
    o.group = 'ledge';
    o.scale = 4;
    o.h = 1;
    o.col = 3;
    super(g, o);
    this.collidesWith = ['player'];
  }

  render() {
    this.g.draw.rect(this.x, this.y + 6, this.w + 16, this.h - 7, 5);
  }
}
