export default class Shake {
  constructor(c, rnd, skip = false) {
    this.c = c;
    this.rnd = rnd;
    this.skip = skip;
    this.ttl = 0;
    this.mag = 0;
  }

  start(mag, ttl) {
    this.mag = mag;
    this.ttl = ttl;
    this.l = (window.innerWidth - this.c.style.width) / 2;
    this.startX = parseInt(this.c.style.marginLeft, 10);
    this.startY = parseInt(this.c.style.marginTop, 10);
  }

  update(step) {
    if (this.skip) return;
    let c = this.c,
      m = this.rnd(-this.mag, this.mag),
      x, y;

    this.ttl -= step;

    if (this.ttl === 0) {
      x = this.startX;
      y = this.startY;
    } else if (this.ttl > 0) {
      x = this.startX + m;
      y = this.startY + m;
    }
    c.style.marginLeft = `${x}px`;
    c.style.marginTop = `${y}`;
  }
}
