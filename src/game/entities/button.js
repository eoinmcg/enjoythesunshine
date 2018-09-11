export default class Button {
  constructor(g, o = {}) {
    o.size = o.size || 2;
    o.w = o.w || 70;
    o.h = o.h || 20;
    o.delay = o.delay || 100;
    o.col = o.col || 2;
    o.triggerOnEnter = o.triggerOnEnter || false;
    o.fadeIn = o.fadeIn || 0;
    for (let n in o) {
      this[n] = o[n];
    }
    this.x = o.x || g.w / 2 - (o.w / 2);
    this.g = g;
    this.p = g.imgs[`font_${o.size}_0`];
    this.pHover = g.imgs[`font_${o.size}_2`];
    this.clicked = false;
    this.clickCol = o.clickCol || 11;
    this.currentCol = this.col;
    this.clicked = false;
    this.fontCol = 'p';
    this.tX = g.w / 2 - (g.draw.textWidth(this.text, this.p) / 2);
  }

  update(dt) {
    let click = this.g.input.m.click;

    this.fontCol = 'p';
    this.fadeIn -= 1;
    this.hover = this.intersects(this.g.input.m);

    if (this.hover) {
      this.fontCol = 'pHover';
    }

    this.currentCol = (this.hover || (this.hover && click))
      ? this.clickCol : this.col;

    if ((!this.clicked && this.hover && click)
        || (!this.clicked && this.triggerOnEnter && this.g.input.keys.enter)) {
      this.g.audio.play('tap');
      this.clicked = true;
      setTimeout(() => { this.cb.call(); }, this.delay);
    }
  }

  render() {
    let font = (this.hover)
      ? this.pHover : this.p;

    this.g.draw.rect(this.x, this.y, this.w, this.h,
      this.currentCol);

    this.g.draw.text(this.text, font, this.tX, this.y + 5);
  }

  intersects(m) {
    return (m.x > this.x && m.x < this.x + this.w
      && m.y > this.y && m.y < this.y + this.h);
  }

  checkClick() {
    let m = this.g.input.m;
    return m.click && this.hit(m);
  }

  checkTouch() {
    let touches = this.g.input.m.touches,
      i = touches.length;

    while (i--) {
      if (touches[i].x >= this.x && touches[i].x <= this.x + this.w
        && touches[i].y >= this.y && touches[i].y <= this.y + this.h) {
        return true;
      }
    }
    return false;
  }
}
