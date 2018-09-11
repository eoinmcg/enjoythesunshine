import { Sprite } from './sprite';

export class Nest extends Sprite {
  constructor(g, o) {
    o.group = 'nest';
    o.scale = 3;
    o.col = 3;
    o.i = 'nest';
    super(g, o);
    this.collidesWith = ['player'];
    this.items = [];
  }

  receiveDamage(o) {
    if (o.isHolding) {
      let s = o.isHolding === 'phone' ? 100 : 50;
      this.p.score += s;
      this.items.push(o.isHolding);
      o.isHolding = false;
      this.g.audio.play('POWERUP');
      this.g.spawn('Text', {
        x: o.x, y: o.y, text: s, col: 2,
      });
    }
  }
}
