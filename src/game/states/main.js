import Draw from '../engine/draw';
import Background from '../entities/background';

export default class Main {
  constructor(g) {
    this.g = g;
    this.f = g.imgs.font_6_3;
    this.ui = g.imgs.font_5_2;
    this.ui2 = g.imgs.font_5_0;
  }

  init() {
    let g = this.g;
    this.score = 0;
    this.floor = 20;
    this.speed = 2;
    this.angle = 0;
    this.gameOver = false;
    this.level = 1;

    g.plays += 1;

    g.audio.play('TIP');

    this.bg = new Background(this, this.level);
    this.floor = g.h - this.bg.level.floor;

    this.ctrl = {};
    this.ctrl.l = g.spawn('Control', {i: 'lr', x: 20, y: g.h - 60 });
    this.ctrl.r = g.spawn('Control', {i: 'lr', x: 100, y: g.h - 60, flip: true });
    this.ctrl.u = g.spawn('Control', {i: 'ud', x: 250, y: g.h - 60 });

    let b = this.bg.level.bird;
    this.setUpTree();
    this.p1 = g.spawn('Bird', { p: this, x: b[0], y: b[1] });
    g.spawn('Human', { p: this });
    g.spawn('Worm', { p: this, x: 200, y: this.floor });
    this.setUpEvents();

  }

  update(dt) {
    this.bg.update(dt);

    this.g.ents.forEach((e, i) => {
      e.update(dt);
      if (e.remove) this.g.ents.splice(i, 1);
    });

    if (this.p1.lives < 0 && !this.gameOver) {
      this.gameOver = true;
      this.g.music.play('dead');
      this.ctrl.r.remove = true;
      this.ctrl.l.remove = true;
      this.ctrl.u.remove = true;
        this.g.spawn('Drop', {x: this.p1.x, y: this.p1.y, i: 'ded', floor: this.floor, scale: 4});

      this.g.addEvent({
        t: 1000,
        cb:() => {
          this.g.changeState('Title');
        }
      });

      this.g.addEvent({
        t: 150,
        cb: () => {
          this.g.spawn('Control', {
            y: this.g.h - 200,
            x: 30,
            text: 'RETRY',
            cb: () => {
              this.g.changeState('Main');
            }
          });
          this.g.spawn('Control', {
            y: this.g.h - 200,
            x: 180,
            text: 'RETRY',
            text: 'TWEET',
            col: 14,
            clickCol: 12,
            cb: () => {
              location = "https://twitter.com/intent/tweet?&text=I+scored+" + this.score + "+in+Enjoy+The+Sunshine&via=eoinmcg&url=" + encodeURI(location.href)
            }
          });
        }
      })
      this.p1.remove = true;
      if (this.score > this.g.hiScore) {
        this.g.hiScore = this.score;
        this.g.spawn('Text', {y: 102, text: 'NEW HISCORE', fade: 0.001, col: 2, scale: 4});
        this.g.spawn('Text', {y: 100, text: 'NEW HISCORE', fade: 0.001, scale: 4});
      }
    }

    if (this.gameOver && this.g.input.keys['Enter']) {
      this.g.changeState('Main');
    }
  }

  render() {
    const g = this.g;
    this.g.canvas.ctx.clearRect(0, 0, g.w, g.h);
    this.bg.render();
    g.draw.img(this.tree, 5, 15);

    this.g.ents.forEach(e => e.render());

    if (this.gameOver) {
      if (g.fader > 0) {
        g.draw.text('U DED', this.f, false, g.h / 2.2);
      }
    } else {
      g.draw.text(this.score, this.ui2, 160, 14);
      g.draw.text(this.score, this.ui, 160, 10);
    }

    let i = this.p1.lives + 1;
    while(i--) {
      g.draw.img(g.imgs.heart, g.w - (25 * i), 20, 4);
    }
  }

  setUpEvents() {
    let l = this.bg.level.events,
        g = this.g;
    l.forEach((e) => {
      if (e.d) {
        let data = e.d;
        e.d.p = this;
        this.g.addEvent({
          t: e.t,
          cb: () => {
            g.spawn(e.n, data);
          }
        });
      }
      if (e.bg) {
        this.g.addEvent({
          t: e.t,
          cb:() => {
            this.bg.level.col.bg = e.bg.col;
          }
        });
      }
    });
  }

  setUpTree() {
    let l = this.bg.level,
        t = l.tree;
    this.tree = this.mkTree(t[0], t[1], t[2]);
    this.nest = this.g.spawn('Nest', { x: l.nest[0], y: l.nest[1], p: this });
    l.ledges.forEach((ledge) => {
      this.g.spawn('Ledge', ledge);
    });
  }

  mkTree(x, y, h) {
    let g = this.g,
        c = g.H.mkCanvas(100, h),
        ctx = c.getContext('2d'),
        d = new Draw(c, ctx, g.data.pal),
        i = 12,
        r = g.H.rnd;

    while(i--) {
      d.img(this.g.imgs.circle_8_11, x - 26, i * 25);
    }
    d.img(this.g.imgs.circle_2_5, x, y - 10);
    d.rect(x, y, 16, h, 5);
    d.rect(x, y, 4, h, 6);

    return c;
  }
}
