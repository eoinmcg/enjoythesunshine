import { Sprite } from './sprite';

export class Baddie extends Sprite {
  constructor(g, o) {
    o.group = 'baddies';
    o.frames = 1;
    o.scale = 3;
    o.vx = 2;
    o.vy = 0;
    o.val = 20;
    if (o.i === 'gull') {
      o.scale = 5;
      o.vx = 3;
      o.vy = 2;
      o.val = 50;
    }
    super(g, o);
    this.val = 20;
    this.floor = o.p.floor;
    this.collidesWith = ['player', 'poo'];
    this.init();
  }

  init(delay = 0) {
    this.x = -40; 
    this.vx = 0;
    this.vy = 0;
    this.dir = this.g.H.rnd(0, 1) > 0 ? -1 : 1;
    this.g.addEvent({
      t: delay,
      cb: () => {
        this.y = this.g.H.rnd(this.yRange - 20, this.yRange + 20);
        this.x = this.dir === 1 ? -40 : this.g.w + this.w;
        this.vx = this.o.vx * this.dir;
        this.vy = this.o.vy;
        this.flip.x = this.dir === -1;
      },
    });
  }

  update(dt) {
    if (this.remove) return;
    super.update(dt);
    this.x += this.vx;
    this.y += this.vy;
    if (this.x > this.g.w + this.w || this.x < -50) {
      this.init(this.g.H.rnd(100,200));
    }
  }

  render() {
    if (this.remove) return;
    super.render();
    let g = this.g;
    if (this.isHolding) {
      g.draw.img(g.imgs.phone, this.x - this.w / 2, this.y + 4 - this.frame, 3);
    }
    if (this.isWearing) {
      g.draw.img(g.imgs[this.isWearing], this.x + 2, this.y - 7 - this.frame, 3);
    }
  }

  receiveDamage(o) {
    if (!o.hurt) o.hitBaddie(this);
  }
}
