export default class Scenery {
  constructor(g, o) {
    this.g = g;
    this.bgSpeed = o.speed;
    this.bgFloor = o.floor;
    this.name = o.name;
    this.generate(o.x);

    this.bg = [];
    this.fg = [];
  }

  update(dt) {
    if (this.name === 'sun') {
      this.y += this.vy;
      if (this.y > this.g.h * 1.6 || this.y < 0) {
        this.vy *= -1;
      }
    } else {
      this.x -= this.speed * this.bgSpeed * (dt * 100);
      if (this.x < -this.i.width * this.scale) {
        this.generate();
      }
    }
  }

  generate(x = false) {
    if (this.name === 'flower') {
      this.flower(x);
    } else if (this.name === 'bush') {
      this.bush(x);
    } else if (this.name === 'cloud') {
      this.cloud(x);
    } else if (this.name === 'sun') {
      this.sun(x);
    } else if (this.name === 'star') {
      this.star(x);
    }
  }

  cloud(x) {
    let g = this.g;
    this.scale = g.H.rnd(2, 4);
    this.i = g.imgs[`circle_${this.scale}_2`];
    this.speed = 0.05 * this.scale;
    this.x = x || this.g.w + g.H.rnd(1, this.i.width * this.scale * 3);
    this.y = g.H.rnd(this.i.height * this.scale, g.h / 2);
    this.hw = this.i.width / 2;
  }

  bush(x) {
    let g = this.g;
    this.scale = g.H.rnd(5, 9);
    this.i = g.imgs[`circle_${this.scale}_10`];
    this.speed = 0;
    this.x = x || g.w + g.H.rnd(1, this.i.width * this.scale * 3);
    this.y = g.h - 120;
  }

  sun() {
    let g = this.g;
    this.i = g.imgs.circle_12_8;
    this.speed = 0;
    this.x = g.w / 2.5;
    this.y = 0;
    this.vy = 0.1;
  }

  flower(x) {
    let g = this.g;
    this.scale = g.H.rnd(1, 3);
    this.i = g.imgs[`star_${this.scale}_10`];
    this.x = g.H.rnd(10, g.w - 10);
    this.y = g.h - this.bgFloor + (this.i.height * this.scale * 1.2);
  }

  star(x) {
    let g = this.g;
    this.scale = g.H.rnd(1, 3);
    this.i = g.imgs[`star_${this.scale}_2`];
    this.x = g.H.rnd(40, g.w - 40);
    this.y = g.H.rnd(0, g.h/2);
    this.speed = 0;
  }
}
