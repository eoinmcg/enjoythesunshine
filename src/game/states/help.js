import Background from '../entities/background';

export default class Help {
  constructor(g) {
    this.g = g;
    this.h = g.imgs.font_4_2;
    this.p = g.imgs.font_2_2;
  }

  init() {
    this.g.music.play('help');
    this.g.spawn('Control', {
      y: this.g.h - 60,
      col: 11,
      clickCol: 14,
      text: 'DONE',
      cb: () => {
        this.g.changeState('Main');
      }
    });
  }

  update(dt) {
    let g = this.g,
      i = g.input.keys

    if (this.canStart && (i.x || i['Enter'])) {
      g.changeState('Main');
    }
    for (let n of this.g.ents) { n.update(dt); }
  }

  render() {
    let g = this.g,
        i = g.imgs;
    g.draw.clear(12);
    g.draw.text('CONTROLS', this.h, false, 10);
    g.draw.text(g.mobile ? 'TAP ON SCREEN BUTTONS' : 'L R CURSORS', this.p, false, 50);
    g.draw.text(g.mobile ? '' : 'X TO FLY', this.p, false, 70);

    g.draw.text('YOUR PURPOSE', this.h, false, 130);
    g.draw.text('SWOOP DOWN TO STEAL ITEMS', this.p, false, 170);
    g.draw.img(i.phone, 100, 190, 4);
    g.draw.img(i.bun, 130, 190, 4);
    g.draw.img(i.melon, 170, 190, 4);
    g.draw.img(i.lolly, 210, 190, 4);
    g.draw.text('THEN DROP IN NEST', this.p, false, 240);
    g.draw.img(i.nest, 150, 260, 4);


    g.draw.text('AVOID', this.h, false, 320);
    g.draw.img(i.hornet, 100, 360, 4);
    g.draw.img(i.gull, 150, 360, 4);
    g.draw.ctx.drawImage(
      i.cat,
      0, 0,
      8, 8,
      200, 360,
      24, 24);

    for (let n of g.ents) { n.render(); }
  }
}

