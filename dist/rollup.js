(function () {
  'use strict';

  class Loader {
    constructor(images) {
      this.images = images;
      this.loaded = [];
      this.loadedImgs = 0;
      this.totalImgs = Object.keys(images).length;
    }

    start() {
      const loader = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
        this.loadImages(this.images);
      });
      return loader;
    }

    loadImages(i) {
      const append = 'data:image/gif;base64,R0lGODlh';
      Object.keys(i).forEach((n) => {
        this.loaded[n] = new Image();
        this.loaded[n].onload = this.checkLoaded();
        this.loaded[n].src = append + i[n];
      });
    }

    checkLoaded() {
      this.loadedImgs += 1;
      if (this.loadedImgs === this.totalImgs) {
        setTimeout(() => this.resolve(this.loaded), 25);
      }
    }
  }

  class Canvas {
    constructor(w, h) {
      this.w = w;
      this.h = h;

      this.c = document.getElementsByTagName('canvas')[0];
      this.ctx = this.c.getContext('2d', { alpha: false });
      this.c.width = w;
      this.c.height = h;
      this.c.style.width = `${w}px`;
      this.c.style.height = `${h}px`;

      window.addEventListener('resize', () => {
        this.resize();
      });
      window.addEventListener('fullscreenchange', () => {
        this.resize();
      });
      this.resize();

      return {
        c: this.c,
        ctx: this.ctx,
      };
    }

    resize() {
      const widthToHeight = this.w / this.h;
      const style = this.c.style;
      let newWidth = window.innerWidth;
      let newHeight = window.innerHeight;
      const newWidthToHeight = newWidth / newHeight;

      if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        style.height = `${newHeight}px`;
        style.width = `${newWidth}px`;
      } else {
        newHeight = newWidth / widthToHeight;
        style.width = `${newWidth}px`;
        style.height = `${newHeight}px`;
      }

      style.marginTop = `${-newHeight / 2}px`;
      style.marginLeft = `${-newWidth / 2}px`;

      style.transformOrigin = '0 0';
      style.transform = 'scale(1)';
    }
  }

  var H = {
    timeStamp() {
      return window.performance.now();
    },

    rnd(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },

    rndArray(a) {
      return a[~~(Math.random() * a.length)];
    },

    mkCanvas(w, h) {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');

      c.width = w;
      c.height = h;

      ctx.mozImageSmoothingEnabled = false;
      ctx.imageSmoothingEnabled = false;

      return c;
    },
  };

  class Draw {
    constructor(c, ctx, pal) {
      this.pal = pal;
      this.c = c;
      this.ctx = ctx;
    }

    clear(colorKey) {
      let raw = this.pal[colorKey];
      this.ctx.fillStyle = `rgb(${raw[0]},${raw[1]},${raw[2]})`;
      this.ctx.fillRect(0, 0, this.c.width, this.c.height);
    }

    rect(x, y, w, h, colorKey) {
      let raw = this.pal[colorKey];
      this.ctx.fillStyle = `rgb(${raw[0]},${raw[1]},${raw[2]})`;
      this.ctx.fillRect(~~x, ~~y, w, h);
    }

    img(i, x, y, scale = false) {
      if (scale) {
        i = this.resize(i, scale);
      }
      this.ctx.drawImage(i, ~~x, ~~y);
    }

    flip(i, flipH, flipV) {
      let c = H.mkCanvas(i.width, i.height),
        ctx = c.getContext('2d'),
        scaleH = flipH ? -1 : 1,
        scaleV = flipV ? -1 : 1,
        posX = flipH ? i.width * -1 : 0,
        posY = flipV ? i.height * -1 : 0;

      c.width = i.width;
      c.height = i.height;

      ctx.save();
      ctx.scale(scaleH, scaleV);
      ctx.drawImage(i, posX, posY, i.width, i.height);
      ctx.restore();

      return c;
    }

    resize(i, factor) {
      let c = H.mkCanvas(i.width * factor, i.height * factor),
        ctx = c.getContext('2d');

      if (c.width) {
        ctx.save();
        ctx.scale(factor, factor);
        ctx.drawImage(i, 0, 0);
        ctx.restore();
      }
      c.scale = factor;
      return c;
    }

    color(i, col) {
      const c = H.mkCanvas(i.width, i.height),
        ctx = c.getContext('2d');
      let p = 0,
        imageData;

      ctx.drawImage(i, 0, 0);
      imageData = ctx.getImageData(0, 0, i.width, i.height);

      for (p = 0; p < imageData.data.length; p += 4) {
        imageData.data[p + 0] = col[0];
        imageData.data[p + 1] = col[1];
        imageData.data[p + 2] = col[2];
      }

      ctx.putImageData(imageData, 0, 0);
      return c;
    }

    textWidth(s, f) {
      return (s.length * (3 * f.scale))
        + (s.length * (1 * f.scale));
    }

    text(s, f, x, y) {
      let i = 0,
        ctx = this.ctx,
        firstChar = 65,
        offset = 0,
        w = 3 * f.scale,
        h = 5 * f.scale,
        spacing = 1 * f.scale,
        sW = this.textWidth(s, f),
        charPos = 0;

      const nums = '0123456789'.split('');

      if (typeof (s) === 'number' || s[0] === '0') {
        s += '';
        offset = 43;
      }
      x = x || (this.c.width - sW) / 2;

      for (i = 0; i < s.length; i += 1) {
        if (typeof (s[i]) === 'number' || s[i] === '0' || nums.indexOf(s[i]) !== -1) {
          offset = 43;
        } else {
          offset = 0;
        }

        charPos = ((s.charCodeAt(i) - firstChar) + offset) * (w + spacing);
        if (charPos > -1) {
          ctx.drawImage(f,
            charPos, 0,
            w, h,
            ~~x, ~~y,
            w, h);
        }
        x += w + spacing;
      }
    }
  }

  class Input {
    constructor(canvas, g) {
      let l = window.addEventListener;
      let s = this;

      this.c = canvas;
      this.g = g;
      this.keys = [];

      this.m = {
        x: g.w / 2, y: g.h / 2, click: 0,
        touches: [],
        w: 1, h: 1
      };

      l('keydown', (e) => {
        this.keys[e.key] = true;
      });

      l('keyup', (e) => {
        this.keys[e.key] = false;
      });

      l('mousemove', (e) => {
        this.trackMove(e);
      });

      l('mousedown', () => {
        this.m.click = 1;
      });

      l('mouseup', () => {
        this.m.click = 0;
      });

  		l('touchstart', function(e) {
        s.touching = 1;
        s.trackTouch(e.touches);
  		});

  		l('touchmove', function(e) {
        e.preventDefault();
        s.trackTouch(e.touches);
  		});

  		l('touchend', function(e) {
        e.preventDefault();
        s.trackTouch(e.touches);
        s.touching = 0;
  		});

      // l('touchstart',
      //   (e) => { this.trackTouch(e.touches); });
      //
      // l('touchend',
      //   (e) => { this.trackTouch(e.touches); });
      //
      // l('touchmove',
      //   (e) => { this.trackTouch(e.touches); });
    }

    trackMove(e) {
      let g = this.g,
        c = g.canvas.c,
        offsetY = c.offsetTop,
        offsetX = c.offsetLeft,
        scale = parseInt(c.style.width, 10) / c.width,
        x = ~~((e.pageX - offsetX) / scale),
        y = ~~((e.pageY - offsetY) / scale);

      x = x > g.w ? g.w : x;
      x = x < 0 ? 0 : x;

      y = y > g.h ? g.h : y;
      y = y < 0 ? 0 : y;

      this.m.x = ~~x;
      this.m.y = ~~y;
    }

    trackTouch(touches) {
      let g = this.g,
        c = g.canvas.c,
        offsetY = c.offsetTop,
        offsetX = c.offsetLeft,
        scale = parseInt(c.style.width, 10) / c.width,
        x, y, i;

      this.m.touches = [];

      for (i = 0; i < touches.length; i += 1) {
        if (i > 2) { break; }
        x = ~~((touches[i].pageX - offsetX) / scale);
        y = ~~((touches[i].pageY - offsetY) / scale);
        this.m.touches.push({x:x, y:y, w:1, h:1});
      }

    }

    // pollJoypads() {
    //   let devices = navigator.getGamepads();
    //
    //   if (devices[0]) {
    //     let buttons = devices[0].buttons;
    //     this.pads.p1.x = buttons[2].pressed;
    //     this.pads.p1.y = buttons[3].pressed;
    //     this.pads.p1.u = buttons[12].pressed;
    //     this.pads.p1.d = buttons[13].pressed;
    //     this.pads.p1.l = buttons[14].pressed;
    //     this.pads.p1.r = buttons[15].pressed;
    //   }
    // }
  }

  function SfxrParams() {
    this.set = function(r) {
      for (var a = 0; 24 > a; a++) this[String.fromCharCode(97 + a)] = r[a] || 0;
      this.c < .01 && (this.c = .01);
      var e = this.b + this.c + this.e;
      if (.18 > e) {
        var s = .18 / e;
        this.b *= s, this.c *= s, this.e *= s;
      }
    };
  }

  function SfxrSynth() {
    var r = this;
    this._params = new SfxrParams;
    var a, e, s, t, n, i, h, f, c, v, o, u;
    r.r = function() {
      var a = r._params;
      t = 100 / (a.f * a.f + .001), n = 100 / (a.g * a.g + .001), i = 1 - a.h * a.h * a.h * .01, h = -a.i * a.i * a.i * 1e-6, a.a || (o = .5 - a.n / 2, u = 5e-5 * -a.o), f = 1 + a.l * a.l * (a.l > 0 ? -.9 : 10), c = 0, v = 1 == a.m ? 0 : (1 - a.m) * (1 - a.m) * 2e4 + 32;
    }, r.tr = function() {
      r.r();
      var t = r._params;
      return a = t.b * t.b * 1e5, e = t.c * t.c * 1e5, s = t.e * t.e * 1e5 + 12, 3 * ((a + e + s) / 3 | 0)
    }, r.s = function(b, m) {
      var w = r._params,
        y = 1 != w.s || w.v,
        k = w.v * w.v * .1,
        p = 1 + 3e-4 * w.w,
        g = w.s * w.s * w.s * .1,
        x = 1 + 1e-4 * w.t,
        S = 1 != w.s,
        d = w.x * w.x,
        l = w.g,
        A = w.q || w.r,
        q = w.r * w.r * w.r * .2,
        M = w.q * w.q * (w.q < 0 ? -1020 : 1020),
        _ = w.p ? ((1 - w.p) * (1 - w.p) * 2e4 | 0) + 32 : 0,
        U = w.d,
        j = w.j / 2,
        C = w.k * w.k * .01,
        P = w.a,
        z = a,
        B = 1 / a,
        D = 1 / e,
        E = 1 / s,
        F = 5 / (1 + w.u * w.u * 20) * (.01 + g);
      F > .8 && (F = .8), F = 1 - F;
      for (var G, H, I, J, K, L, N = !1, O = 0, Q = 0, R = 0, T = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, $ = 0, rr = new Array(1024), ar = new Array(32), er = rr.length; er--;) rr[er] = 0;
      for (var er = ar.length; er--;) ar[er] = 2 * Math.random() - 1;
      for (var er = 0; m > er; er++) {
        if (N) return er;
        if (_ && ++Z >= _ && (Z = 0, r.r()), v && ++c >= v && (v = 0, t *= f), i += h, t *= i, t > n && (t = n, l > 0 && (N = !0)), H = t, j > 0 && ($ += C, H *= 1 + Math.sin($) * j), H |= 0, 8 > H && (H = 8), P || (o += u, 0 > o ? o = 0 : o > .5 && (o = .5)), ++Q > z) switch (Q = 0, ++O) {
          case 1:
            z = e;
            break;
          case 2:
            z = s;
        }
        switch (O) {
          case 0:
            R = Q * B;
            break;
          case 1:
            R = 1 + 2 * (1 - Q * D) * U;
            break;
          case 2:
            R = 1 - Q * E;
            break;
          case 3:
            R = 0, N = !0;
        }
        A && (M += q, I = 0 | M, 0 > I ? I = -I : I > 1023 && (I = 1023)), y && p && (k *= p, 1e-5 > k ? k = 1e-5 : k > .1 && (k = .1)), L = 0;
        for (var sr = 8; sr--;) {
          if (X++, X >= H && (X %= H, 3 == P))
            for (var tr = ar.length; tr--;) ar[tr] = 2 * Math.random() - 1;
          switch (P) {
            case 0:
              K = o > X / H ? .5 : -.5;
              break;
            case 1:
              K = 1 - X / H * 2;
              break;
            case 2:
              J = X / H, J = 6.28318531 * (J > .5 ? J - 1 : J), K = 1.27323954 * J + .405284735 * J * J * (0 > J ? 1 : -1), K = .225 * ((0 > K ? -1 : 1) * K * K - K) + K;
              break;
            case 3:
              K = ar[Math.abs(32 * X / H | 0)];
          }
          y && (G = W, g *= x, 0 > g ? g = 0 : g > .1 && (g = .1), S ? (V += (K - W) * g, V *= F) : (W = K, V = 0), W += V, T += W - G, T *= 1 - k, K = T), A && (rr[Y % 1024] = K, K += rr[(Y - I + 1024) % 1024], Y++), L += K;
        }
        L *= .125 * R * d, b[er] = L >= 1 ? 32767 : -1 >= L ? -32768 : 32767 * L | 0;
      }
      return m
    };
  }
  var synth = new SfxrSynth,
    jsfxr = function(r) {
      synth._params.set(r);
      var a = synth.tr(),
        e = new Uint8Array(4 * ((a + 1) / 2 | 0) + 44),
        s = 2 * synth.s(new Uint16Array(e.buffer, 44), a),
        t = new Uint32Array(e.buffer, 0, 44);
      t[0] = 1179011410, t[1] = s + 36, t[2] = 1163280727, t[3] = 544501094, t[4] = 16, t[5] = 65537, t[6] = 44100, t[7] = 88200, t[8] = 1048578, t[9] = 1635017060, t[10] = s, s += 44;
      for (var n = 0, i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', h = 'data:audio/wav;base64,'; s > n; n += 3) {
        var f = e[n] << 16 | e[n + 1] << 8 | e[n + 2];
        h += i[f >> 18] + i[f >> 12 & 63] + i[f >> 6 & 63] + i[63 & f];
      }
      return h
    };

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

  const instruments = {
    VOX: {
      wave: 'square',
      pan: -0.1,
      gain: 0.1,
    },
    BSS: {
      wave: 'triangle',
      pan: 0.5,
      gain: 0.7,
    },
  };

  const tracks = {
    win: {
      bpm: 120,
      isLooping: false,
      parts: [
        'VOXA41A#41A41A#41G44C54',
        'BSSA41A#41A41A#41G44C54',
      ],
    },
    dead: {
      bpm: 120,
      isLooping: false,
      parts: [
        'VOXF31E31D31B31A#24',
        'BSSF31E31D31B31A#24',
      ],
    },
    help: {
      bpm: 180,
      isLooping: false,
      parts: [
        'VOXC22C22G12G12A#12A#12B12B12G12E12G14',
        'BSSC22C22G12G12A#12A#12B12B12G12E12G14',
      ],
    },
  };

  var HEADER_STRUCTURE = /^([A-Z]{3})/;
  var NOTE_STRUCTURE = /([A-GX]#?)([1-8])([1-9]{1,2})/g;
  var TWELTH_ROOT_OF_TWO = 1.059463094359;
  var SEMITONES_PER_OCTAVE = 12;
  var CROTCHETS_PER_BAR = 4;

  var zeroNotes = new Map([['C', 16.35], ['C#', 17.32], ['D', 18.35], ['D#', 19.45], ['E', 20.6], ['F', 21.83], ['F#', 23.12], ['G', 24.5], ['G#', 25.96], ['A', 27.5], ['A#', 29.14], ['B', 30.87], ['X', 0]]);

  function NT(instruments, tracks, audioContext) {
    this.audioContext = audioContext || new (window.AudioContext || webkitAudioContext)();
    this.instruments = instruments;
    this.tracks = tracks;
    this.oscillators = [];
  }


  NT.prototype.play = function play(trackName) {
    this.stop();

    var track = this.tracks[trackName];
    var oscillators = new Array(track.parts.length);

    for (var i = 0; i < track.parts.length; i++) {
      var instrument = this.instruments[this._parseInstrument(track.parts[i])];
      var frequencies = this._parseFreqs(track.parts[i], track.bpm);
      oscillators[i] = this._createOscillator(instrument);
      this._enqueueFreqs(oscillators[i], frequencies, track.isLooping);
    }

    this.oscillators = oscillators;
  };

  NT.prototype.stop = function stop() {
    for (var i = 0; i < this.oscillators.length; i++) {
      this.oscillators[i].stop();
    }
  };

  NT.prototype._parseInstrument = function _parseInstrument(trackPart) {
    var header = trackPart.match(HEADER_STRUCTURE);
    return header[1];
  };

  NT.prototype._parseFreqs = function _parseFreqs(trackPart, bpm) {
    var frequencies = [];
    var note = void 0;

    while (note = NOTE_STRUCTURE.exec(trackPart)) {
      var name = note[1];
      var octave = note[2];
      var length = note[3];

      frequencies.push({
        length: this._getFreqLength(length, bpm),
        hz: this._convertToFrequency(name, octave, length)
      });
    }

    return frequencies;
  };

  NT.prototype._getFreqLength = function _getFreqLength(length, bpm) {
    var crotchetsPerSecond = bpm / 60;
    return parseInt(length) / crotchetsPerSecond / CROTCHETS_PER_BAR;
  };

  NT.prototype._convertToFrequency = function _convertToFrequency(name, octave, length) {
    var baseFrequency = zeroNotes.get(name);
    return baseFrequency * Math.pow(TWELTH_ROOT_OF_TWO, SEMITONES_PER_OCTAVE * octave);
  };

  NT.prototype._createOscillator = function _createOscillator(instrument) {
    var oscillator = this.audioContext.createOscillator();

    oscillator.type = instrument.wave;
    oscillator.frequency.value = 0;

    var nextNode = this._applyGain(oscillator, instrument.gain);
    nextNode = this._applyPan(nextNode, instrument.pan);
    nextNode.connect(this.audioContext.destination);

    oscillator.start();

    return oscillator;
  };

  NT.prototype._enqueueFreqs = function _enqueueFreqs(oscillator, frequencies, isLooping) {
    var _this = this;

    var nextTime = 0;

    for (var i = 0; i < frequencies.length; i++) {
      var frequency = frequencies[i];
      oscillator.frequency.setValueAtTime(frequencies[i].hz, this.audioContext.currentTime + nextTime);
      nextTime += frequency.length;
    }

    setTimeout(function () {
      if (!isLooping) {
        _this.stop();
        _this.onStop && _this.onStop();
        return;
      }

      _this._enqueueFreqs(oscillator, frequencies, isLooping);
    }, Math.round(nextTime) * 1000);
  };

  NT.prototype._applyGain = function _applyGain(node, gain) {
    return this._applyEffect(node, gain, 'createGain', 'gain');
  };

  NT.prototype._applyPan = function _applyPan(node, pan) {
    return this._applyEffect(node, pan, 'createStereoPanner', 'pan');
  };

  NT.prototype._applyEffect = function _applyEffect(node, val, method, prop) {
    if (!val || !this.audioContext[method]) {
      return node;
    }

    var nextNode = this.audioContext[method]();
    nextNode[prop].value = val;
    node.connect(nextNode);

    return nextNode;
  };

  class Game {
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

  var Images = {'b':'HgAGAKEDABsmMuuJMf///zGi8iH5BAEKAAMALAAAAAAeAAYAAAImnI+pywpgXkNA1GgFvqPyJ4EBJIJPcJxQB4zRO0UmC8YTihr4UAAAOw==','bun':'BgAGAMIEAL4mM+Bvi+uJMffiazGi8jGi8jGi8jGi8iH5BAEKAAQALAAAAAAGAAYAAAMNSASgFDC8SCkZAiusEwA7','cat':'EAAIAKECAC9ITr4mMzGi8jGi8iH5BAEKAAIALAAAAAAQAAgAAAIdlI8Gsrh9gEzyxQCCw7pW5k3gp3iRo5xMsq4QaxQAOw==','circle':'CAAIAIABAP///zGi8iH5BAEKAAEALAAAAAAIAAgAAAIMTIBgl8gNo5wvrWYKADs=','ded':'BgAGAKECABsmMuuJMTGi8jGi8iH5BAEKAAIALAAAAAAGAAYAAAILlI8YsuBuXADxiQIAOw==','dir':'BwAHAIABAP///zGi8iH5BAEKAAEALAAAAAAHAAcAAAIMjA1wmcj6WoiLHVcAADs=','dot':'AQABAIABAP///zGi8iH5BAEKAAEALAAAAAABAAEAAAICRAEAOw==','font':'jwAFAIABAAAAADGi8iH5BAEKAAEALAAAAACPAAUAAAJwhGOAd6sZFpowPhrxhZz5x2ji5pRTyVEf+pGXhcFyrGSuvd56du47/KrNbjOgpjNUgVwNoWqYUx6XMl3TcqVha7kVsDWyxU7hXnkq2krEZq46mHSTk0YhCSvtUO2hfR81EoKD1pNFxOWFSPW1mGdQAAA7','gull':'BgADAKEDAL4mM+uJMf///zGi8iH5BAEKAAMALAAAAAAGAAMAAAIIlDaWIJAWUAEAOw==','h0':'GAAIAMIGABsmMkk8K74mM+Bvi/3//P///zGi8jGi8iH5BAEKAAcALAAAAAAYAAgAAAM7eLoawfA4NtW4Y9WDM8cWcRHfpRRXEY6lhw5qZ3ZnYWeDILj2Yt8HgBDA+XmGiyGRqGAim8FkNAJlRhIAOw==','h1':'GAAIAMIGAAUDC74mM6RkIuBvi/3//P///zGi8jGi8iH5BAEKAAcALAAAAAAYAAgAAAM6eLrc/grI6Sa14AAiBMFS0RUT52mdoIkCOaTCgHbKYNuHEATqcS83XNA3JMpqv0wEedQ4l8pHJtpIAAA7','h2':'GAAIAMIFAEk8K74mM+Bvi/fia////zGi8jGi8jGi8iH5BAEKAAcALAAAAAAYAAgAAAM+eLpHTow92J4iIl93s6CY1gAZEH5jeZEC0Hhpe3if8GrOoNdBABG6AShoCw5mQUpwYTwYj04dcxmFRhTUawIAOw==','hat0':'BgAGAKECAKRkIuuJMTGi8jGi8iH5BAEKAAIALAAAAAAGAAYAAAILlG8RqLyyAICqhgIAOw==','hat1':'BgAGAKECAL4mM+BvizGi8jGi8iH5BAEKAAIALAAAAAAGAAYAAAIKlI+JwGABg2itAAA7','hat2':'BgAGAIABAOuJMTGi8iH5BAEKAAEALAAAAAAGAAYAAAIIjI+ZAMcc3isAOw==','heart':'BQAFAIABAL4mMzGi8iH5BAEKAAEALAAAAAAFAAUAAAIIDGygu3mBQgEAOw==','hornet':'CAAEAKEDAAAAALLc7/fiazGi8iH5BAEKAAMALAAAAAAIAAQAAAIMnBdnICEwgHwPRgoLADs=','lolly':'BgAGAKEDAOBvi+uJMf///zGi8iH5BAEKAAMALAAAAAAGAAYAAAIMHDB5p9s8hBRphDoKADs=','lr':'BwAHAIABAP///zGi8iH5BAEKAAEALAAAAAAHAAcAAAIMjA1wmcj6WoiLHVcAADs=','melon':'BgAGAMIEAAAAAL4mM0SJGv///zGi8jGi8jGi8jGi8iH5BAEKAAQALAAAAAAGAAYAAAMOGLoToKMxIYeg0ZJ7SQIAOw==','nest':'CAAGAKECAEk8K6RkIjGi8jGi8iH5BAEKAAIALAAAAAAIAAYAAAINDI5gecueBASihhtqAQA7','phone':'BAAGAKECAAAAAC9ITjGi8jGi8iH5BAEKAAIALAAAAAAEAAYAAAIHhB2BCrlnCgA7','poo':'AwAHAKECAKRkIv///zGi8jGi8iH5BAEKAAIALAAAAAADAAcAAAIJVIR4JhABYhMFADs=','star':'AwADAIABAP///zGi8iH5BAEKAAEALAAAAAADAAMAAAIEDAx3BQA7','ud':'BwAHAIABAP///zGi8iH5BAEKAAEALAAAAAAHAAcAAAILjI+AAX0NDXSz1gIAOw==','worm':'BQAIAKEDAAAAAOBvi////zGi8iH5BAEKAAMALAAAAAAFAAgAAAIPFGYiocoyghxx1kAlvqMAADs='};

  const Sfx = {
    BOOM: [3,, 0.3532, 0.6421, 0.4668, 0.054,, 0.2682,,,,,,,, 0.5503, 0.0564, -0.2946, 1,,,,, 0.5],
    JUMP: [0,,0.2432,,0.1709,0.3046,,0.1919,,,,,,0.5923,,,,,1,,,,,0.5],
    POWERUP: [0,, 0.0129, 0.5211, 0.4714, 0.4234,,,,,, 0.4355, 0.5108,,,,,, 1,,,,, 0.5],
    SHOOT: [2,, 0.1128,, 0.178, 0.7748, 0.0046, -0.4528,,,,,, 0.185, 0.0994,,,, 1,,,,, 0.5],
    TIP: [3,, 0.026,, 0.1909, 0.605,, -0.4942,,,,,,,,,,, 1,,, 0.1405,, 0.5],
    TAP: [1,, 0.1953,, 0.1186, 0.2659,,,,,,,,,,,,, 1,,, 0.1,, 0.5],
  };

  var Data = {
    title: 'ENJOY THE SUNSHINE',
    start: 'Title',
    w: 320,
    h: 480,
    pal: [ // AndroidArts16 - https://androidarts.com/palette/16pal.htm
      [0, 0, 0], // 0 void
      [157, 157, 157], // 1 ash
      [255, 255, 255], // 2 white
      [190, 38, 51], // 3 bloodred
      [224, 111, 139], // 4 pigmeat
      [73, 60, 43], // 5 oldpoop
      [164, 100, 34], // 6 newpoop
      [235, 137, 49], // 7 orange
      [247, 226, 107], // 8 yellow
      [42, 72, 78], // 9 darkgreen
      [68, 137, 26], // 10 green
      [163, 206, 39], // 11 slimegreen
      [27, 38, 50], // 12 nightblue
      [0, 87, 132], // 13 seablue
      [49, 162, 242], // 14 skyblue
      [178, 220, 239], // 15 cloudblue
    ],
    i: Images,
    scale: ['circle', 'star', 'dot', 'font'],
    sfx: Sfx,
    instruments,
    tracks,
  };

  class Scenery {
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

  var Data$1 = [
    {
      title: 'The Park',
      col: { bg: 15, ground: 11 },
      floor: 100,
      v: { x: 2, y: 0 },
      bg: [
        { num: 1, name: 'sun' },
        { num: 3, name: 'bush' },
        { num: 4, name: 'cloud' },
        { num: 8, name: 'star' },
      ],
      fg: [
        { num: 8, name: 'flower' },
      ],
      tree: [16,15,370],
      nest: [38,40],
      bird: [38,200],
      ledges: [
        {w: 15, x: 32, y: 58},
        {w: 20, x: 32, y: 200},
        {w: 30, x: 32, y: 300},
      ],
      events: [
        {t: 1000, n: 'Baddie', d: { i: 'hornet', yRange: 200} },
        {t: 2000, n: 'Baddie', d: { i: 'hornet', yRange: 300} },
        {t: 3000, n: 'Baddie', d: { i: 'hornet', yRange: 100} },
        {t: 5000, n: 'Cat', d: {} },
        {t: 7000, n: 'Baddie', d: { i: 'gull', yRange: 100} },
        {t: 8000, n: 'Baddie', d: { i: 'hornet', yRange: 50} }
      ]
    }
  ];

  class Background {
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
      this.level = Data$1[l - 1];
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

  class Title {
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
        i = g.input.keys;

      if (this.canStart && (i.x || i['Enter'])) {
        this.g.changeState('Main');
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

  class Main {
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
                location = "https://twitter.com/intent/tweet?&text=I+scored+" + this.score + "+in+Enjoy+The+Sunshine&via=eoinmcg&url=" + encodeURI(location.href);
              }
            });
          }
        });
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

  class Help {
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
        i = g.input.keys;

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

  class Sprite {
    constructor(g, o) {
      this.g = g;
      this.o = o;
      this.id = `id-${Math.random().toString(36).substr(2, 16)}`;
      this.dead = false;
      this.remove = false;
      this.offsetY = 0;
      this.name = o.i;

      for (let n in o) {
        this[n] = o[n];
      }

      this.lastPos = { x: this.x, y: this.y };
      this.flip = { x: 0, y: 0 };

      this.scale = o.scale || 1;
      this.frame = o.frame || 1;
      this.frames = o.frames || 1;
      this.frameRate = o.frameRate || 80;
      this.frameNext = o.frameNext || 0;
      this.mkImg(o.i);
      this.hurt = false;

      this.anims = { idle: { frames: [1], rate: 80 } };
      this.changeAnim('idle');
    }

    update(dt) {
      if (this.collidesWith) {
        this.collidesWith.forEach((group) => {
          this.hitGroup(group);
        });
      }
      this.updateAnim(dt);
    }

    render() {
      let g = this.g,
        i = (this.hurt) ? this.iHurt : this.i,
        frame = this.frame;

      if (i) {
        if (this.flip.y) {
          i = g.draw.flip(i, 0, 1);
        }
        if (this.flip.x) {
          i = g.draw.flip(i, 1, 0);
          frame = this.frames - this.frame + 1;
        }
        g.draw.ctx.drawImage(i,
          (frame * this.w) - this.w, 0,
          this.w, this.h,
          ~~this.x, ~~this.y + this.offsetY,
          this.w, this.h);
      } else {
        g.draw.rect(this.x, this.y, this.w, this.h, this.col);
      }
    }

    updateAnim(step) {
      if (this.frameNext < 0) {
        this.frameNext = this.anim.rate;
        this.anim.counter += 1;

        if (this.anim.counter >= this.anim.frames.length) {
          if (this.anim.next) {
            this.changeAnim(this.anim.next);
          } else {
            this.anim.counter = 0;
          }
        }
        this.frame = this.anim.frames[this.anim.counter];
      }
      this.frameNext -= this.g.dt;
    }

    hitGroup(group) {
      this.g.ents.forEach((e) => {
        if (e && e.group === group && e.id !== this.id && this.hit(e)) {
          this.receiveDamage(e);
          e.doDamage(this);
        }
      });
    }

    hit(o) {
      return !((o.y + o.h < this.y) || (o.y > this.y + this.h)
        || (o.x + o.w < this.x) || (o.x > this.x + this.w));
    }

    receiveDamage(o) { }

    doDamage(o) { }

    isOffScreen() {
      let g = this.g;
      return this.x < -this.w || this.x > g.w + this.w
        || this.y < -this.h || this.y > g.h + this.h;
    }

    kill() {
      this.dead = this.remove = true;
    }

    mkImg(name) {
      if (!this.i) { return; }
      let g = this.g;
      this.i = g.draw.resize(g.imgs[name], this.scale);
      this.w = (this.i.width / this.frames);
      this.h = this.i.height;
      this.iHurt = g.draw.color(this.i, g.data.pal[3]);
    }

    changeAnim(name) {
      if (this.anim && this.anim.name && this.anim.name === name) {
        return;
      }
      this.anim = this.anims[name];
      this.anim.name = name;
      this.anim.counter = 0;
      this.frame = this.anim.frames[0];
      this.frameNext = this.anim.rate;
    }
  }

  class Bird extends Sprite {
    constructor(g, o) {
      o.group = 'player';
      o.i = 'b';
      o.scale = 4;
      o.frames = 5;
      super(g, o);
      this.g = g;
      this.o = o;
      this.angle = 0;
      this.anims = {
        glide: { frames: [3], rate: 0.025 },
        flap: { frames: [1, 2, 3], rate: 0.025 },
        stand: { frames: [4, 4, 4, 5], rate: 0.2 },
      };
      this.changeAnim('glide');
      this.gravity = 9.8;
      this.vx = 2.5;
      this.vy = 0;
      this.maxVy = 4.5;
      this.floor = o.p.floor - this.h / 2;
      this.lives = 2;
      this.poops = 50;
      this.isHolding = false;
      this.isStanding = false;
      this.wasStanding = this.isStanding;
    }

    update(dt) {
      super.update(dt);
      this.isStanding = false;
      let g = this.g,
        keys = g.input.keys,
        left = keys.ArrowLeft || this.p.ctrl.l.hurt,
        right = keys.ArrowRight || this.p.ctrl.r.hurt,
        boost = keys.z || this.p.ctrl.u.hurt;

      this.vy += (this.gravity / 4) * dt;
      if (this.vy > this.maxVy) this.vy = this.maxVy;
      if (this.vy < -this.maxVy) this.vy = -this.maxVy;
      this.y = ~~(this.y + this.vy);

      this.checkStanding();
      this.bindToScreen();
      this.handleInput(boost, left, right);

      if (this.isStanding) {
        this.changeAnim('stand');
      } else if (boost) {
        this.changeAnim('flap');
      } else {
        this.changeAnim('glide');
      }
      this.lastBoost = boost;
      this.wasStanding = this.isStanding && this.y === this.floor;
    }

    render() {
      super.render();
      let g = this.g;
      let half = this.w / 2;
      let q = half / 2;
      if (this.isHolding) {
        g.draw.img(g.imgs[this.isHolding], this.x + q, this.y + half + q, 3);
      }
      if (this.isWearing) {
        g.draw.img(g.imgs[this.isWearing], this.x - 2, this.y - half - 4 + (this.flip.x ? 1 : 0), 4);
      }
    }

    handleInput(boost, left, right) {
      let g = this.g;
      if (boost) {
        this.vy -= 0.15;
      }
      if (this.poops && boost && !this.wasStanding && !this.lastBoost) {
        this.poops -= 1;
        g.audio.play('SHOOT');
        g.spawn('Poo', {
          x: this.x, y: this.y + this.h / 2, a: 1.6, p: this.p, floor: this.floor,
        });
      }
      if (left) {
        this.x -= this.vx * !this.isStanding;
        this.flip.x = 1;
      } else if (right) {
        this.x += this.vx * !this.isStanding;
        this.flip.x = 0;
      }
    }

    bindToScreen() {
      let g = this.g;
      if (this.y >= this.floor) {
        if (this.vy === this.maxVy) {
          this.vy = this.maxVy / -2.5;
          g.burst(this.x, this.floor, 11, 3);
          g.spawn('Boom', { x: this.x, y: this.y + this.h / 2 });
          g.audio.play('JUMP');
        } else {
          this.isStanding = true;
          this.vy = 0;
        }
        this.y = this.floor;
      }
      if (this.x < 0) this.x = 0;
      if (this.x > g.w - this.w) this.x = g.w - this.w;
      if (this.y < 0) {
        this.y = 0;
        this.vy = this.maxVy / 1.5;
      }
    }

    checkStanding() {
      if (!this.isStanding) {
        this.g.ents.forEach((e) => {
          if (e.constructor.name === 'Ledge') {
            if (this.hit(e) && this.vy > 0) {
              this.vy = 0;
              this.y = e.y - this.h;
              this.isStanding = true;
            }
          }
        });
      }
    }

    hitBaddie(o) {
      this.g.audio.play('JUMP');
      this.hurt = true;
      this.y -= -10;
      this.flip.x = !this.flip.x;
      this.x += 5;
      if (this.isHolding) {
        this.g.spawn('Drop', {
          x: this.x, y: this.y, i: this.isHolding, floor: this.floor,
        });
        this.isHolding = false;
      }
      this.lives -= 1;
      this.g.addEvent({
        t: 100,
        cb: () => {
          this.hurt = false;
        },
      });
    }
  }

  class Ledge extends Sprite {
    constructor(g, o) {
      o.group = 'ledge';
      o.scale = 4;
      o.h = 1;
      o.col = 3;
      super(g, o);
      this.collidesWith = ['player'];
    }

    render() {
      this.g.draw.rect(this.x, this.y + 6, this.w + 16, this.h - 7, 5);
    }
  }

  class Nest extends Sprite {
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

  class Poo extends Sprite {
    constructor(g, o) {
      o.group = 'poo';
      o.i = 'poo';
      o.scale = 3;
      super(g, o);
      this.g = g;
      this.o = o;
      this.speed = 2;
      this.col = 7;
      this.floor = o.p.floor;
      this.vx = this.speed * Math.cos(this.a);
      this.vy = this.speed * Math.sin(this.a);
    }

    update(dt) {
      this.x += this.vx * this.speed;
      this.y += this.vy * this.speed;

      if (this.y > this.floor) {
        this.g.burst(this.x, this.y, 6, 3);
        this.remove = true;
        this.g.audio.play('TIP');
      }
      if (this.isOffScreen()) {
        this.remove = true;
      }
    }

    doDamage(o) {
      this.remove = true;
    }

    hitBaddie(o) {
      let g = this.g;
      g.boom(this.x, this.y);
      g.audio.play('TIP');
      g.spawn('Text', {
        x: o.x, y: o.y, text: o.val, col: 2,
      });
      this.p.score += o.val;
      o.init(g.H.rnd(500,700));
    }
  }

  class Human extends Sprite {
    constructor(g, o) {
      o.group = 'humans';
      o.frames = 4;
      o.scale = 4;
      o.i = `h${g.H.rnd(0, 2)}`;
      super(g, o);
      this.speed = 0.5;
      this.floor = o.p.floor;
      this.y = this.floor - this.h / 2;
      this.collidesWith = ['player', 'poo'];
      this.anims = {
        walk: { frames: [1, 2], rate: 0.05 },
        jump: { frames: [3, 4], rate: 0.05 },
      };
      this.changeAnim('walk');

      this.flip.x = g.H.rnd(0, 1);
      this.x = this.flip.x ? g.w + this.w : -this.w;

      this.speed = this.flip.x ? 0.5 : -0.5;
      this.isHolding = g.H.rndArray(['phone', 'phone', 'lolly', 'melon', 'bun']);
      this.isWearing = g.H.rndArray(['hat0', 'hat1', 'hat2', false, false]);
      if (o.p.constructor.name === 'Title') this.isHolding = 'phone';
      this.hasSwitched = false;
    }

    update(dt) {
      this.x -= (this.speed * this.p.speed) * (dt * 100);
      if (this.x < -this.w || this.x > this.g.h + this.w) {
        this.remove = true;
        this.g.addEvent({
          t: this.g.H.rnd(100, 300),
          cb: () => {
            this.g.spawn('Human', { p: this.p });
          },
        });
      }
      super.update(dt);
    }

    render() {
      super.render();
      let half = this.i.width / 2;
      let q = half / 2;
      let g = this.g;
      if (this.isHolding) {
        let x = this.flip.x ? -q / 2 : q;
        g.draw.img(g.imgs[this.isHolding], this.x + x, this.y + 4 - this.frame, 3);
      }
      if (this.isWearing) {
        let o = this.anim.name === 'jump' ? 10 : 0;
        g.draw.img(g.imgs[this.isWearing], this.x + 2, this.y + o - 12 - this.frame * 4, 4);
      }
    }

    receiveDamage(o) {
      if (o.group === 'poo') {
        this.hurt = true;
        this.speed = 0;
        this.changeAnim('jump');
        this.g.boom(this.x, this.y, 2, 3, 0);
        this.g.addEvent({
          t: 250,
          cb: () => {
            this.hurt = false;
            this.changeAnim('walk');
            this.speed = this.flip.x ? 0.5 : -0.5;
          },
        });
      } else if ((this.isHolding || this.isWearing) && !o.isStanding) {
        if (this.hasSwitched) return;
        let hatSwitch = o.isWearing;
        this.hasSwitched = true;
        o.isHolding = this.isHolding;
        o.isWearing = this.isWearing;
        this.isHolding = false;
        this.isWearing = this.hasSwitched ? hatSwitch : false;
        this.changeAnim('jump');
        this.g.audio.play('TAP');
        this.speed = 0;
        this.g.addEvent({
          t: 500,
          cb: () => {
            this.changeAnim('walk');
            this.speed = this.flip.x ? 0.5 : -0.5;
          },
        });
      }
    }
  }

  class Baddie extends Sprite {
    constructor(g, o) {
      o.group = 'baddies';
      o.frames = 1;
      o.scale = 3;
      o.vx = 2;
      o.vy = 0;
      o.val = 20;
      if (o.i === 'gull') {
        o.scale = 5;
        o.vx = 3;
        o.vy = 2;
        o.val = 50;
      }
      super(g, o);
      this.val = 20;
      this.floor = o.p.floor;
      this.collidesWith = ['player', 'poo'];
      this.init();
    }

    init(delay = 0) {
      this.x = -40; 
      this.vx = 0;
      this.vy = 0;
      this.dir = this.g.H.rnd(0, 1) > 0 ? -1 : 1;
      this.g.addEvent({
        t: delay,
        cb: () => {
          this.y = this.g.H.rnd(this.yRange - 20, this.yRange + 20);
          this.x = this.dir === 1 ? -40 : this.g.w + this.w;
          this.vx = this.o.vx * this.dir;
          this.vy = this.o.vy;
          this.flip.x = this.dir === -1;
        },
      });
    }

    update(dt) {
      if (this.remove) return;
      super.update(dt);
      this.x += this.vx;
      this.y += this.vy;
      if (this.x > this.g.w + this.w || this.x < -50) {
        this.init(this.g.H.rnd(100,200));
      }
    }

    render() {
      if (this.remove) return;
      super.render();
      let g = this.g;
      if (this.isHolding) {
        g.draw.img(g.imgs.phone, this.x - this.w / 2, this.y + 4 - this.frame, 3);
      }
      if (this.isWearing) {
        g.draw.img(g.imgs[this.isWearing], this.x + 2, this.y - 7 - this.frame, 3);
      }
    }

    receiveDamage(o) {
      if (!o.hurt) o.hitBaddie(this);
    }
  }

  class Cat extends Sprite {
    constructor(g, o) {
      o.group = 'baddies';
      o.i = 'cat';
      o.scale = 3;
      o.frames = 2;
      super(g, o);
      this.val = 100;
      this.y = o.p.floor - this.h / 2;
      this.collidesWith = ['player', 'poo'];
      this.anims = {
        run: { frames: [1, 2], rate: 0.025 },
      };
      this.changeAnim('run');
      this.init(220);
    }

    init(delay = 0) {
      this.x = -40; this.speed = 0;
      this.g.addEvent({
        t: delay,
        cb: () => {
          this.x = this.g.H.rnd(0, 1) ? -30 : this.g.w + 30;
          this.speed = 2.5 * (this.x === -30 ? 1 : -1);
          this.flip.x = this.speed < 0;
        },
      });
    }

    update(dt) {
      this.x += this.speed;
      let offscreen = (this.x >= this.g.w + 50 || this.x <= -50);
      if (offscreen) {
        this.speed = 0;
        if (this.p.p1.wasStanding) {
          this.init(this.g.H.rnd(100, 300));
        }
      }
      super.update(dt);
    }

    receiveDamage(o) {
      if (o.group === 'poo') {
        o.hitBaddie(this);
        this.x = -50;
      } else if (o.group === 'player' && !o.hurt) {
        o.hitBaddie(this);
      }
    }
  }

  class Worm extends Sprite {
    constructor(g, o) {
      o.group = 'worms';
      o.i = 'worm';
      o.scale = 2;
      o.val = 10;
      super(g, o);
      this.y = o.p.floor - (this.h / 4);
      this.collidesWith = ['player', 'bullets'];
      this.init(1000);
    }

    init(delay = 0) {
      this.x = -30; this.speed = 0;
      this.dir = this.g.H.rnd(0, 1) > 0 ? -1 : 1;
      this.g.addEvent({
        t: delay,
        cb: () => {
          this.x = this.g.H.rnd(50, this.g.w - 50);
        },
      });
    }

    update(dt) {
      if (this.g.H.rnd(0, 100) > 98) this.flip.x = !this.flip.x;
      super.update(dt);
    }

    receiveDamage(o) {
      o.poops = 10;
      this.g.spawn('Text', {
        x: this.x, y: this.y, text: 'YUM', col: 4 });
      this.g.audio.play('POWERUP');
      this.init(1000);
    }
  }

  class Drop extends Sprite {
    constructor(g, o) {
      o.scale = o.scale || 3;
      super(g, o);
      this.gravity = 9.8;
      this.vy = 1;
      this.maxVy = 4.5;
    }


    update(dt) {
      this.vy += (this.gravity / 4) * dt;
      this.y = ~~(this.y + this.vy);

      if (this.vy > this.maxVy) this.vy = this.maxVy;
      if (this.vy < -this.maxVy) this.vy = -this.maxVy;

      if (this.y > this.floor + this.h) {
        this.g.boom(this.x, this.y, 3, 4);
        this.remove = true;
      }
      super.update(dt);
    }
  }

  class Text {
    constructor(g, o) {
      o.group = 'text';
      o.vy = o.vy || -2.5;
      o.vx = o.vx || 0;
      o.w = 10;
      o.w = 10;
      o.alpha = 1;
      o.scale = o.scale || 3;
      o.col = o.col || 4;
      o.accel = o.accel || 0.5;
      o.fade = o.fade || 0.01;
      for (let n in o) {
        this[n] = o[n];
      }
      this.g = g;
      this.p = g.imgs[`font_${o.scale}_${o.col}`];
    }

    update(step) {
      if (this.y < 0 || this.alpha < 0.1) {
        this.remove = true;
      }

      this.vy -= this.accel;
      this.alpha -= this.fade;

      if (this.vx) {
        this.x += this.vx * step;
      }
      this.y += this.vy * step;
    }

    render() {
      let d = this.g.draw;
      if (this.text) {
        d.text(this.text, this.p, this.x, this.y);
      } else if (this.o) {
        d.ctx.drawImage(this.i, this.x, this.y);
      }
    }
  }

  // import {Sprite} from './sprite';

  class Boom {
    constructor(g, o) {
      o.col = o.col || 2;
      this.g = g;
      this.i = g.draw.color(g.imgs.circle, g.data.pal[o.col]);
      this.startX = o.x;
      this.startY = o.y;
      this.magnitude = o.m || 4;
      this.scale = 1;
      this.factor = o.factor || 0.5;
    }

    update(step) {
      let g = this.g;

      this.scale += this.factor;
      if (this.scale > this.magnitude && this.factor > 0) {
        this.factor *= -1;
      }
      if (this.scale <= 1) {
        this.remove = true;
      }
    }

    render() {
      let s = this.i.width * this.scale / 2,
        x = this.startX - s,
        y = this.startY - s,
        g = this.g;

      g.draw.img(this.i, x, y, this.scale);
    }
  }

  class Particle {
    constructor(g, o) {
      this.g = g;
      this.x = o.x;
      this.y = o.y;
      this.w = o.w || 3;
      this.h = this.w;
      this.vx = g.H.rnd(-100, 100);
      this.vy = g.H.rnd(0, 150) * -1;
      this.col = o.col || 6;
      this.r = o.r || 1;
      this.i = g.imgs[`dot_${this.w}_${this.col}`];
    }

    update(step) {
      this.x += this.vx * step;
      this.y += this.vy * step;
      this.vy += 5;
      if (this.y > this.g.h) {
        this.remove = true;
      }
    }

    render(dt) {
      // this.g.draw.rect(this.x, this.y, this.w, this.h, this.col);
      this.g.draw.ctx.drawImage(this.i, this.x, this.y);
    }
  }

  class Control extends Sprite {
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

  const o = Data;
  o.states = { 
    Title, 
    Help, 
    Main
    };
  o.ents = {
    Sprite,
    Bird, 
    Ledge, 
    Nest, 
    Poo, 
    Human, 
    Baddie, 
    Cat, 
    Worm, 
    Drop, 
    Text, 
    Boom, 
    Particle,
    Control,
  };

  new Game(o);

}());
