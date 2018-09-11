import { Sprite } from './sprite';

export class Cat extends Sprite {
  constructor(g, o) {
    o.group = 'baddies';
    o.i = 'cat';
    o.scale = 3;
    o.frames = 2;
    super(g, o);
    this.val = 100;
    this.y = o.p.floor - this.h / 2;
    this.collidesWith = ['player', 'poo'];
    this.anims = {
      run: { frames: [1, 2], rate: 0.025 },
    };
    this.changeAnim('run');
    this.init(220);
  }

  init(delay = 0) {
    this.x = -40; this.speed = 0;
    this.g.addEvent({
      t: delay,
      cb: () => {
        this.x = this.g.H.rnd(0, 1) ? -30 : this.g.w + 30;
        this.speed = 2.5 * (this.x === -30 ? 1 : -1);
        this.flip.x = this.speed < 0;
      },
    });
  }

  update(dt) {
    this.x += this.speed;
    let offscreen = (this.x >= this.g.w + 50 || this.x <= -50);
    if (offscreen) {
      this.speed = 0;
      if (this.p.p1.wasStanding) {
        this.init(this.g.H.rnd(100, 300));
      }
    }
    super.update(dt);
  }

  receiveDamage(o) {
    if (o.group === 'poo') {
      o.hitBaddie(this);
      this.x = -50;
    } else if (o.group === 'player' && !o.hurt) {
      o.hitBaddie(this);
    }
  }
}
