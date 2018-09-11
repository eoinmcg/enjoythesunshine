import jsfxr from '../../lib/jsfxr';

const Audio = {

  init(g, sfx) {
    let w = window,
      ACtx = w.AudioContext || w.webkitAudioContextx;
    this.ctx = (ACtx) ? new ACtx() : false;
    this.g = g;

    if (this.ctx) {
      this.encode(sfx);
    }
  },

  encode(sfx) {
    let s = this;
    s.sounds = [];

    const convert = (data) => {
      let len, bytes, i;
      data = jsfxr(data);
      data = atob(data.substr(data.indexOf(',') + 1));
      len = data.length;
      bytes = new Uint8Array(len);
      for (i = 0; i < len; i++) {
        bytes[i] = data.charCodeAt(i);
      }
      return bytes.buffer;
    };

    const decode = (n) => {
      s.ctx.decodeAudioData(convert(sfx[n]), (b) => {
        s.sounds[n] = b;
      });
    };

    Object.keys(sfx).forEach((n) => {
      decode(n);
    });
  },

  play(sfx) {
    if (this.ctx && this.sounds[sfx]) {
      let source = this.ctx.createBufferSource();
      source.buffer = this.sounds[sfx];
      source.connect(this.ctx.destination);
      source.start(0);
    }
  },
};

export default Audio;
