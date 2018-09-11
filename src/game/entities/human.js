import { Sprite } from './sprite';

export class Human extends Sprite {
  constructor(g, o) {
    o.group = 'humans';
    o.frames = 4;
    o.scale = 4;
    o.i = `h${g.H.rnd(0, 2)}`;
    super(g, o);
    this.speed = 0.5;
    this.floor = o.p.floor;
    this.y = this.floor - this.h / 2;
    this.collidesWith = ['player', 'poo'];
    this.anims = {
      walk: { frames: [1, 2], rate: 0.05 },
      jump: { frames: [3, 4], rate: 0.05 },
    };
    this.changeAnim('walk');

    this.flip.x = g.H.rnd(0, 1);
    this.x = this.flip.x ? g.w + this.w : -this.w;

    this.speed = this.flip.x ? 0.5 : -0.5;
    this.isHolding = g.H.rndArray(['phone', 'phone', 'lolly', 'melon', 'bun']);
    this.isWearing = g.H.rndArray(['hat0', 'hat1', 'hat2', false, false]);
    if (o.p.constructor.name === 'Title') this.isHolding = 'phone';
    this.hasSwitched = false;
  }

  update(dt) {
    this.x -= (this.speed * this.p.speed) * (dt * 100);
    if (this.x < -this.w || this.x > this.g.h + this.w) {
      this.remove = true;
      this.g.addEvent({
        t: this.g.H.rnd(100, 300),
        cb: () => {
          this.g.spawn('Human', { p: this.p });
        },
      });
    }
    super.update(dt);
  }

  render() {
    super.render();
    let half = this.i.width / 2;
    let q = half / 2;
    let g = this.g;
    if (this.isHolding) {
      let x = this.flip.x ? -q / 2 : q;
      g.draw.img(g.imgs[this.isHolding], this.x + x, this.y + 4 - this.frame, 3);
    }
    if (this.isWearing) {
      let o = this.anim.name === 'jump' ? 10 : 0;
      g.draw.img(g.imgs[this.isWearing], this.x + 2, this.y + o - 12 - this.frame * 4, 4);
    }
  }

  receiveDamage(o) {
    if (o.group === 'poo') {
      this.hurt = true;
      this.speed = 0;
      this.changeAnim('jump');
      this.g.boom(this.x, this.y, 2, 3, 0);
      this.g.addEvent({
        t: 250,
        cb: () => {
          this.hurt = false;
          this.changeAnim('walk');
          this.speed = this.flip.x ? 0.5 : -0.5;
        },
      });
    } else if ((this.isHolding || this.isWearing) && !o.isStanding) {
      if (this.hasSwitched) return;
      let hatSwitch = o.isWearing;
      this.hasSwitched = true;
      o.isHolding = this.isHolding;
      o.isWearing = this.isWearing;
      this.isHolding = false;
      this.isWearing = this.hasSwitched ? hatSwitch : false;
      this.changeAnim('jump');
      this.g.audio.play('TAP');
      this.speed = 0;
      this.g.addEvent({
        t: 500,
        cb: () => {
          this.changeAnim('walk');
          this.speed = this.flip.x ? 0.5 : -0.5;
        },
      });
    }
  }
}
