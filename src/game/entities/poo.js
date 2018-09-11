import { Sprite } from './sprite';

export class Poo extends Sprite {
  constructor(g, o) {
    o.group = 'poo';
    o.i = 'poo';
    o.scale = 3;
    super(g, o);
    this.g = g;
    this.o = o;
    this.speed = 2;
    this.col = 7;
    this.floor = o.p.floor;
    this.vx = this.speed * Math.cos(this.a);
    this.vy = this.speed * Math.sin(this.a);
  }

  update(dt) {
    this.x += this.vx * this.speed;
    this.y += this.vy * this.speed;

    if (this.y > this.floor) {
      this.g.burst(this.x, this.y, 6, 3);
      this.remove = true;
      this.g.audio.play('TIP');
    }
    if (this.isOffScreen()) {
      this.remove = true;
    }
  }

  doDamage(o) {
    this.remove = true;
  }

  hitBaddie(o) {
    let g = this.g;
    g.boom(this.x, this.y);
    g.audio.play('TIP');
    g.spawn('Text', {
      x: o.x, y: o.y, text: o.val, col: 2,
    });
    this.p.score += o.val;
    o.init(g.H.rnd(500,700));
  }
}
