export class Particle {
  constructor(g, o) {
    this.g = g;
    this.x = o.x;
    this.y = o.y;
    this.w = o.w || 3;
    this.h = this.w;
    this.vx = g.H.rnd(-100, 100);
    this.vy = g.H.rnd(0, 150) * -1;
    this.col = o.col || 6;
    this.r = o.r || 1;
    this.i = g.imgs[`dot_${this.w}_${this.col}`];
  }

  update(step) {
    this.x += this.vx * step;
    this.y += this.vy * step;
    this.vy += 5;
    if (this.y > this.g.h) {
      this.remove = true;
    }
  }

  render(dt) {
    // this.g.draw.rect(this.x, this.y, this.w, this.h, this.col);
    this.g.draw.ctx.drawImage(this.i, this.x, this.y);
  }
}
