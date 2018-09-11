import { Sprite } from './sprite';

export class Worm extends Sprite {
  constructor(g, o) {
    o.group = 'worms';
    o.i = 'worm';
    o.scale = 2;
    o.val = 10;
    super(g, o);
    this.y = o.p.floor - (this.h / 4);
    this.collidesWith = ['player', 'bullets'];
    this.init(1000);
  }

  init(delay = 0) {
    this.x = -30; this.speed = 0;
    this.dir = this.g.H.rnd(0, 1) > 0 ? -1 : 1;
    this.g.addEvent({
      t: delay,
      cb: () => {
        this.x = this.g.H.rnd(50, this.g.w - 50);
      },
    });
  }

  update(dt) {
    if (this.g.H.rnd(0, 100) > 98) this.flip.x = !this.flip.x;
    super.update(dt);
  }

  receiveDamage(o) {
    o.poops = 10;
    this.g.spawn('Text', {
      x: this.x, y: this.y, text: 'YUM', col: 4 });
    this.g.audio.play('POWERUP');
    this.init(1000);
  }
}
