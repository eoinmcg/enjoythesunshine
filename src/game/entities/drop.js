import { Sprite } from './sprite';

export class Drop extends Sprite {
  constructor(g, o) {
    o.scale = o.scale || 3;
    super(g, o);
    this.gravity = 9.8;
    this.vy = 1;
    this.maxVy = 4.5;
  }


  update(dt) {
    this.vy += (this.gravity / 4) * dt;
    this.y = ~~(this.y + this.vy);

    if (this.vy > this.maxVy) this.vy = this.maxVy;
    if (this.vy < -this.maxVy) this.vy = -this.maxVy;

    if (this.y > this.floor + this.h) {
      this.g.boom(this.x, this.y, 3, 4);
      this.remove = true;
    }
    super.update(dt);
  }
}
