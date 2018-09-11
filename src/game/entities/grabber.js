import { Sprite } from './sprite';

export class Grabber extends Sprite {
  constructor(g, o) {
    o.i = 'grabber';
    o.group = 'baddies';
    o.frames = 2;
    // o.scale = g.H.rnd(1,4);
    o.scale = 2;
    super(g, o);
    this.speed = 1;
    this.y = o.y || g.h - this.p.floor - this.h - (g.H.rnd(0, 100));
    this.x = o.x || g.w + this.w;
    this.collidesWith = ['bullets'];
    this.anims = {
      fly: { frames: [1, 2], rate: 0.1 },
    };
    this.changeAnim('fly');
  }

  update(dt) {
    this.touching = false;
    this.x -= (this.speed * this.p.speed) * (dt * 100);
    if (this.x < -this.w) this.remove = true;
    super.update(dt);
  }

  receiveDamage(o) {
    let c = this.g.H.rndArray([3, 7]), p = this.p;
    this.g.boom(this.x, this.y, c, 5, this.scale * 2);
    this.remove = true;
    if (p.waves[this.wId]) {
      p.waves[this.wId] -= 1;
      if (p.waves[this.wId] === 0) {
        console.log('BONUS');
        this.g.audio.play('POWERUP');
      }
    }
  }

  render(step) {
    super.render(step);
  }
}
