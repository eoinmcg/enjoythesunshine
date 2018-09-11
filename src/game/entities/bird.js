import { Sprite } from './sprite';

export class Bird extends Sprite {
  constructor(g, o) {
    o.group = 'player';
    o.i = 'b';
    o.scale = 4;
    o.frames = 5;
    super(g, o);
    this.g = g;
    this.o = o;
    this.angle = 0;
    this.anims = {
      glide: { frames: [3], rate: 0.025 },
      flap: { frames: [1, 2, 3], rate: 0.025 },
      stand: { frames: [4, 4, 4, 5], rate: 0.2 },
    };
    this.changeAnim('glide');
    this.gravity = 9.8;
    this.vx = 2.5;
    this.vy = 0;
    this.maxVy = 4.5;
    this.floor = o.p.floor - this.h / 2;
    this.lives = 2;
    this.poops = 50;
    this.isHolding = false;
    this.isStanding = false;
    this.wasStanding = this.isStanding;
  }

  update(dt) {
    super.update(dt);
    this.isStanding = false;
    let g = this.g,
      keys = g.input.keys,
      left = keys.ArrowLeft || this.p.ctrl.l.hurt,
      right = keys.ArrowRight || this.p.ctrl.r.hurt,
      boost = keys.z || this.p.ctrl.u.hurt;

    this.vy += (this.gravity / 4) * dt;
    if (this.vy > this.maxVy) this.vy = this.maxVy;
    if (this.vy < -this.maxVy) this.vy = -this.maxVy;
    this.y = ~~(this.y + this.vy);

    this.checkStanding();
    this.bindToScreen();
    this.handleInput(boost, left, right);

    if (this.isStanding) {
      this.changeAnim('stand');
    } else if (boost) {
      this.changeAnim('flap');
    } else {
      this.changeAnim('glide');
    }
    this.lastBoost = boost;
    this.wasStanding = this.isStanding && this.y === this.floor;
  }

  render() {
    super.render();
    let g = this.g;
    let half = this.w / 2;
    let q = half / 2;
    if (this.isHolding) {
      g.draw.img(g.imgs[this.isHolding], this.x + q, this.y + half + q, 3);
    }
    if (this.isWearing) {
      g.draw.img(g.imgs[this.isWearing], this.x - 2, this.y - half - 4 + (this.flip.x ? 1 : 0), 4);
    }
  }

  handleInput(boost, left, right) {
    let g = this.g;
    if (boost) {
      this.vy -= 0.15;
    }
    if (this.poops && boost && !this.wasStanding && !this.lastBoost) {
      this.poops -= 1;
      g.audio.play('SHOOT');
      g.spawn('Poo', {
        x: this.x, y: this.y + this.h / 2, a: 1.6, p: this.p, floor: this.floor,
      });
    }
    if (left) {
      this.x -= this.vx * !this.isStanding;
      this.flip.x = 1;
    } else if (right) {
      this.x += this.vx * !this.isStanding;
      this.flip.x = 0;
    }
  }

  bindToScreen() {
    let g = this.g;
    if (this.y >= this.floor) {
      if (this.vy === this.maxVy) {
        this.vy = this.maxVy / -2.5;
        g.burst(this.x, this.floor, 11, 3);
        g.spawn('Boom', { x: this.x, y: this.y + this.h / 2 });
        g.audio.play('JUMP');
      } else {
        this.isStanding = true;
        this.vy = 0;
      }
      this.y = this.floor;
    }
    if (this.x < 0) this.x = 0;
    if (this.x > g.w - this.w) this.x = g.w - this.w;
    if (this.y < 0) {
      this.y = 0;
      this.vy = this.maxVy / 1.5;
    }
  }

  checkStanding() {
    if (!this.isStanding) {
      this.g.ents.forEach((e) => {
        if (e.constructor.name === 'Ledge') {
          if (this.hit(e) && this.vy > 0) {
            this.vy = 0;
            this.y = e.y - this.h;
            this.isStanding = true;
          }
        }
      });
    }
  }

  hitBaddie(o) {
    this.g.audio.play('JUMP');
    this.hurt = true;
    this.y -= -10;
    this.flip.x = !this.flip.x;
    this.x += 5;
    if (this.isHolding) {
      this.g.spawn('Drop', {
        x: this.x, y: this.y, i: this.isHolding, floor: this.floor,
      });
      this.isHolding = false;
    }
    this.lives -= 1;
    this.g.addEvent({
      t: 100,
      cb: () => {
        this.hurt = false;
      },
    });
  }
}
