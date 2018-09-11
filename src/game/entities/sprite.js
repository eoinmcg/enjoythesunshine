export class Sprite {
  constructor(g, o) {
    this.g = g;
    this.o = o;
    this.id = `id-${Math.random().toString(36).substr(2, 16)}`;
    this.dead = false;
    this.remove = false;
    this.offsetY = 0;
    this.name = o.i;

    for (let n in o) {
      this[n] = o[n];
    }

    this.lastPos = { x: this.x, y: this.y };
    this.flip = { x: 0, y: 0 };

    this.scale = o.scale || 1;
    this.frame = o.frame || 1;
    this.frames = o.frames || 1;
    this.frameRate = o.frameRate || 80;
    this.frameNext = o.frameNext || 0;
    this.mkImg(o.i);
    this.hurt = false;

    this.anims = { idle: { frames: [1], rate: 80 } };
    this.changeAnim('idle');
  }

  update(dt) {
    if (this.collidesWith) {
      this.collidesWith.forEach((group) => {
        this.hitGroup(group);
      });
    }
    this.updateAnim(dt);
  }

  render() {
    let g = this.g,
      i = (this.hurt) ? this.iHurt : this.i,
      frame = this.frame;

    if (i) {
      if (this.flip.y) {
        i = g.draw.flip(i, 0, 1);
      }
      if (this.flip.x) {
        i = g.draw.flip(i, 1, 0);
        frame = this.frames - this.frame + 1;
      }
      g.draw.ctx.drawImage(i,
        (frame * this.w) - this.w, 0,
        this.w, this.h,
        ~~this.x, ~~this.y + this.offsetY,
        this.w, this.h);
    } else {
      g.draw.rect(this.x, this.y, this.w, this.h, this.col);
    }
  }

  updateAnim(step) {
    if (this.frameNext < 0) {
      this.frameNext = this.anim.rate;
      this.anim.counter += 1;

      if (this.anim.counter >= this.anim.frames.length) {
        if (this.anim.next) {
          this.changeAnim(this.anim.next);
        } else {
          this.anim.counter = 0;
        }
      }
      this.frame = this.anim.frames[this.anim.counter];
    }
    this.frameNext -= this.g.dt;
  }

  hitGroup(group) {
    this.g.ents.forEach((e) => {
      if (e && e.group === group && e.id !== this.id && this.hit(e)) {
        this.receiveDamage(e);
        e.doDamage(this);
      }
    });
  }

  hit(o) {
    return !((o.y + o.h < this.y) || (o.y > this.y + this.h)
      || (o.x + o.w < this.x) || (o.x > this.x + this.w));
  }

  receiveDamage(o) { }

  doDamage(o) { }

  isOffScreen() {
    let g = this.g;
    return this.x < -this.w || this.x > g.w + this.w
      || this.y < -this.h || this.y > g.h + this.h;
  }

  kill() {
    this.dead = this.remove = true;
  }

  mkImg(name) {
    if (!this.i) { return; }
    let g = this.g;
    this.i = g.draw.resize(g.imgs[name], this.scale);
    this.w = (this.i.width / this.frames);
    this.h = this.i.height;
    this.iHurt = g.draw.color(this.i, g.data.pal[3]);
  }

  changeAnim(name) {
    if (this.anim && this.anim.name && this.anim.name === name) {
      return;
    }
    this.anim = this.anims[name];
    this.anim.name = name;
    this.anim.counter = 0;
    this.frame = this.anim.frames[0];
    this.frameNext = this.anim.rate;
  }
}
