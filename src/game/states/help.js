import Background from '../entities/background';

export default class Help {
  constructor(g) {
    this.g = g;
  }

  init() {
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
    this.g.draw.clear(9);
    for (let n of this.g.ents) { n.render(); }
  }
}

