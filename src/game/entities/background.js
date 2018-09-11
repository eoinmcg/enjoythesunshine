import Draw from '../engine/draw';
import Scenery from './scenery';
import Data from '../data/bgs.js';

export default class Background {
  constructor(p, o) {
    this.p = p;
    this.g = p.g;
    this.init(o);
    this.c = this.g.H.mkCanvas(this.g.w, this.g.h);
    this.ctx = this.c.getContext('2d');
    this.draw = new Draw(this.c, this.ctx, this.g.data.pal);
  }

  init(l) {
    this.bg = [];
    this.fg = [];
    this.level = Data[l - 1];
    let speed = this.level.v.x,
      floor = this.level.floor;
    this.level.bg.forEach((o) => {
      let n = o.num;
      while (n--) {
        let x = this.g.w / 4 * n;
        let name = o.name;
        this.bg.push(new Scenery(this.g, {
          x, name, speed, floor,
        }));
      }
    });
    this.level.fg.forEach((o) => {
      let n = o.num;
      while (n--) {
        let x = this.g.w / 4 * n;
        let name = o.name;
        this.fg.push(new Scenery(this.g, {
          x, name, speed, floor,
        }));
      }
    });
    this.sun = this.bg[0];
  }

  update(dt) {
    this.bg.forEach(el => el.update(dt));
    let y = this.g.h - ~~this.sun.y, c = 15;
    if (y < 120) {
      c = 9;
    } else if (y < 130) {
      c = 3;
    } else if (y < 140) {
      c = 7;
    } else if (y < 150) {
      c = 4;
    } else if (y < 160) {
      c = 8;
    } else if (y < 170) {
      c = 15;
    } 
    this.level.col.bg = c;
  }

  render(step) {
    let g = this.g,
      d = this.draw,
      l = this.level;
    d.clear(l.col.bg);

    this.bg.forEach((e) => {
      if (e.name === 'cloud') {
        d.img(e.i, e.x - e.i.width, e.y);
        d.img(e.i, e.x - e.hw, e.y - e.hw);
      }
      if (e.name === 'star') {
        if (l.col.bg !== 15) d.img(e.i, e.x, e.y);
      } else {
        d.img(e.i, e.x, e.y);
      }
    });
    d.rect(0, g.h - l.floor, g.w, g.h, l.col.ground);
    this.fg.forEach((e) => {
      d.img(e.i, e.x, e.y);
    });
    this.g.draw.img(this.c, 0, 0);
  }
}
