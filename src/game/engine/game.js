import Loader from './loader';
import Canvas from './canvas';
import Draw from './draw';
import Input from './input';
import Audio from './audio';
import { instruments, tracks } from '../data/music';
// import Shake from './shake';
import H from './helpers';

import NT from '../../lib/nanotunes';

export default class Game {
  constructor(o) {
    let ua = navigator.userAgent.toLowerCase();

    this.mobile = 'createTouch' in document || false;
    this.android = ua.indexOf('android') > -1;
    this.ios = /ipad|iphone|ipod/.test(ua);
    this.firefox = ua.indexOf('firefox') > -1;

    this.data = o;
    this.w = o.w;
    this.h = o.h;
    this.dt = 0;
    this.fps = 60;
    this.frameStep = 1 / this.fps;
    this.frameCurr = 0;
    this.framePrev = H.timeStamp();
    this.stateName = o.start;
    this.H = H;

    this.states = o.states;
    this.availEnts = o.ents;

    this.score = 0;
    this.hiScore = 200;
    this.plays = 0;

    this.ents = [];
    this.imgs = [];
    this.fonts = [];
    this.events = [];
    this.init();
  }

  init() {
    const loader = new Loader(this.data.i);
    document.title = this.data.title;

    this.canvas = new Canvas(this.data.w, this.data.h);
    this.draw = new Draw(this.canvas.c, this.canvas.ctx, this.data.pal);
    this.input = new Input(this.canvas.c, this);
    // this.shake = new Shake(this.canvas.c, this.H.rnd, this.ios);
    this.audio = { play() {} };
    this.music = { play() {}, stop() {} };

    loader.start().then((res) => {
      this.imgs = res;
      this.data.scale.forEach((k) => {
        this.scaleUp(k);
      });
      document.getElementById('l').style.display = 'none';
      this.changeState(this.stateName);
      this.canvas.c.style.display = 'block';
      this.favIcon(this.draw.resize(this.imgs.lolly, 12));
      this.loop();
    });
  }

  initAudio() {
    if (!this.ios) {
      this.audio = Audio;
      this.audio.init(this, this.data.sfx);
      this.music = new NT(this.data.instruments, this.data.tracks);
    }
  }

  scaleUp(key) {
    let i = 16;
    while (i--) {
      let cols = this.data.pal.length;
      while (cols--) {
        let img = this.draw.color(this.imgs[key], this.data.pal[cols]);
        this.imgs[`${key}_${i}_${cols}`] = this.draw.resize(img, i);
      }
    }
  }

  favIcon(i) {
    let c = document.createElement('canvas'),
      ctx = c.getContext('2d'),
      l = document.createElement('link');
    c.width = 64;
    c.height = 64;
    ctx.drawImage(i, 0, 0);
    l.type = 'image/x-icon';
    l.rel = 'shortcut icon';
    l.href = c.toDataURL('image/x-icon');
    document.getElementsByTagName('head')[0].appendChild(l);
  }

  changeState(state) {
    this.ents = [];
    this.events = [];
    this.state = new this.states[state](this);
    this.music.stop();
    this.state.init();
  }

  loop() {
    this.frameCurr = H.timeStamp();
    this.dt = this.dt + Math.min(1, (this.frameCurr - this.framePrev) / 1000);

    while (this.dt > this.frameStep) {
      this.dt = this.dt - this.frameStep;
      this.update(this.frameStep);
    }

    this.render(this.dt);
    this.framePrev = this.frameCurr;
    requestAnimationFrame(() => this.loop());
  }

  update(step) {
    this.fader = Math.sin(new Date().getTime() * 0.005);
    this.runEvents(step);
    this.state.update(step);
    // this.shake.update(step);

    let i = this.ents.length;
    while (i--) {
      if (this.ents[i].remove) {
        this.ents.splice(i, 1);
      }
    }
  }

  render(step) {
    this.state.render(step);
  }

  spawn(ent, opts) {
    const sprite = new this.availEnts[ent](this, opts);
    this.ents.push(sprite);
    return sprite;
  }

  boom(x, y, col = 2, num = 1, m = 8) {
    this.audio.play('BOOM');
    if (m) {
      // this.shake.start(m/2, 0.5);
    }
    this.spawn('Boom', { x, y, m, col });
    this.burst(x, y, col, num);
  }

  burst(x, y, col, num, w = 3) {
    while (num--) {
      this.ents.push(new this.availEnts.Particle(this, {
        x, y, col, w,
      }));
    }
  }

  addEvent(e) {
    this.events.push(e);
  }

  runEvents(step) {
    let i = this.events.length;
    while (i--) {
      let e = this.events[i];
      if (!e) {
        break;
      }
      e.t -= step * 100;
      if (e.t < 0) {
        e.cb.call(this);
        this.events.splice(i, 1);
      }
    }
  }
}
