import { Sprite } from './sprite';

export class Control extends Sprite {
  constructor(g, o) {
    o.scale = 5;
    if (!o.i) {
      o.size = o.size || 4;
      o.w = o.w || 110;
      o.h = o.h || 40;
      o.col = o.col || 7;
    }
    super(g, o);
    this.flip.x = !!o.flip;
    if (!o.i) {
      this.x = o.x || g.w / 2 - (o.w / 2);
      this.p = g.imgs[`font_${o.size}_2`];
      this.pHover = g.imgs[`font_${o.size}_2`];
      this.clicked = false;
      this.clickCol = o.clickCol || 3;
      this.currentCol = this.col;
      this.clicked = false;
      this.tX = o.x ? o.x + 20 : g.w / 2 - (g.draw.textWidth(this.text, this.p) / 2);
    }
    this.origX = this.x;
    this.origY = o.y;
  }

  update(dt) {
    let hit = this.checkTouch() || this.checkClick();
    this.hover = this.intersects(this.g.input.m);
    this.currentCol = (this.hover)
      ? this.clickCol : this.col;
    if (hit && this.cb) {
      this.cb.call(this);
    } else if (hit) {
      this.hurt = true;
      this.x = this.origX + 3;
      this.y = this.origY + 3;
    } else {
      this.hurt = false;
      this.x = this.origX;
      this.y = this.origY;
    }
  }

  render() {
    if (this.i) {
      super.render();
    } else {
      let font = (this.hover)
        ? this.pHover : this.p;

      this.g.draw.rect(this.x, this.y, this.w, this.h,
        this.currentCol);

      this.g.draw.text(this.text, font, this.tX, this.y + 5);
    }
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
      if (touches[i].x >= this.x && touches[i].x <= this.x + this.w) {
        return true;
      }
    }
    return false;
  }
}
