export class Text {
  constructor(g, o) {
    o.group = 'text';
    o.vy = o.vy || -2.5;
    o.vx = o.vx || 0;
    o.w = 10;
    o.w = 10;
    o.alpha = 1;
    o.scale = o.scale || 3;
    o.col = o.col || 4;
    o.accel = o.accel || 0.5;
    o.fade = o.fade || 0.01;
    for (let n in o) {
      this[n] = o[n];
    }
    this.g = g;
    this.p = g.imgs[`font_${o.scale}_${o.col}`];
  }

  update(step) {
    if (this.y < 0 || this.alpha < 0.1) {
      this.remove = true;
    }

    this.vy -= this.accel;
    this.alpha -= this.fade;

    if (this.vx) {
      this.x += this.vx * step;
    }
    this.y += this.vy * step;
  }

  render() {
    let d = this.g.draw;
    if (this.text) {
      d.text(this.text, this.p, this.x, this.y);
    } else if (this.o) {
      d.ctx.drawImage(this.i, this.x, this.y);
    }
  }
}
