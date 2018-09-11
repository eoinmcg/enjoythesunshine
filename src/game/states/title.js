import Background from '../entities/background';

export default class Title {
  constructor(g) {
    this.g = g;
    this.title = g.imgs.font_4_0;
    this.shadow = g.imgs.font_4_8;
    this.hi = g.imgs.font_4_2;
    g.initAudio();
  }

  init() {
    this.canStart = false;
    this.g.music.play('win');
    this.g.spawn('Control', {
      y: this.g.h - 200,
      x: 30,
      text: 'START',
      cb: () => {
        this.g.changeState('Main');
      }
    });
    this.g.spawn('Control', {
      y: this.g.h - 200,
      x: 180,
      col: 14,
      clickCol: 10,
      text: 'HELP',
      cb: () => {
        this.g.changeState('Help');
      }
    });
    this.g.addEvent({
      t: 100,
      cb: () => { this.canStart = true; },
    });
    this.bg = new Background(this, 1);
    this.floor = this.g.h - this.bg.level.floor;
    this.speed = 2;
    this.h = this.g.spawn('Human', {p: this});
    this.h.isHolding = 'phone';
    this.h.isWearing = false;
  }

  update(dt) {
    let g = this.g,
      i = g.input.keys

    if (this.canStart && (i.x || i['Enter'])) {
      this.g.changeState(Main);
    }
    this.bg.update(dt);
    this.bg.bg[0].y = 100;
    for (let n of this.g.ents) { n.update(dt); }
  }

  render() {
    const g = this.g;
    this.bg.render();
    g.draw.text(g.data.title, this.shadow, false, 34);
    g.draw.text(g.data.title, this.title, false, 30);
    g.draw.text('GET OFFLINE', g.imgs.font_3_0, false, 72);
    g.draw.text('GET OFFLINE', g.imgs.font_3_4, false, 70);

    g.draw.text('HI ' + this.g.hiScore, this.hi, false, g.h-30);

    for (let n of this.g.ents) n.render();
  }
}
