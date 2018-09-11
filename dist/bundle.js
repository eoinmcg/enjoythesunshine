(function () {
  'use strict';

  function Loader(images) {

    this.images = images;
    this.loaded = [];
    this.loadedImgs = 0;
    this.totalImgs = Object.keys(images).length;

    this.start = function() {
      const loader = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
        this.loadImages(this.images);
      });

      return loader;
    };

    this.loadImages = function(i) {
      const append = 'data:image/gif;base64,';

      for (let n in i) {
        if (i.hasOwnProperty(n)) {
          this.loaded[n] = new Image();
          this.loaded[n].onload = this.checkLoaded();
          this.loaded[n].src = append + i[n];
        }
      }
    };

    this.checkLoaded = function() {
      this.loadedImgs += 1;

      if (this.loadedImgs === this.totalImgs) {
        setTimeout( () => this.resolve(this.loaded), 500 );
      }
    };

    this.makeFonts = function() {
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      })
    };
  }

  function Canvas(w, h) {

    this.w = w;
    this.h = h;

    this.c = document.getElementsByTagName('canvas')[0];
    this.ctx = this.c.getContext('2d');
    this.c.width = w;
    this.c.height = h;
    this.c.style.width = w+'px';
    this.c.style.height = h+'px';

    this.resize = function() {
      let gameArea = document.querySelector('canvas');
      const widthToHeight = this.w / this.h;
      let newWidth = window.innerWidth;
      let newHeight = window.innerHeight;
      const newWidthToHeight = newWidth / newHeight;
      
      if (newWidthToHeight > widthToHeight) {
          newWidth = newHeight * widthToHeight;
          this.c.style.height = newHeight + 'px';
          this.c.style.width = newWidth + 'px';
      } else {
          newHeight = newWidth / widthToHeight;
          this.c.style.width = newWidth + 'px';
          this.c.style.height = newHeight + 'px';
      }
      
      this.c.style.marginTop = (-newHeight/ 2) + 'px';
      this.c.style.marginLeft = (-newWidth / 2) + 'px';
      
    };

    window.addEventListener('resize', () => {
      this.resize();
    });
    window.addEventListener('fullscreenchange', () => {
      this.resize();
    });
    this.resize();

    return {
      c: this.c,
      ctx: this.ctx
    };
  }

  function Draw(c, ctx, pal) {

    this.pal = pal;
    this.c = c; this.ctx = ctx; 
    this.clear = function(colorKey) {
      let raw = this.pal[colorKey];
      this.ctx.fillStyle = `rgb(${raw[0]},${raw[1]},${raw[2]})`;
      this.ctx.fillRect(0, 0, this.c.width, this.c.height);
    };

    this.circle = function(x, y, r, colorKey) {
      let raw = this.pal[colorKey];
      this.ctx.fillStyle = `rgb(${raw[0]},${raw[1]},${raw[2]})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI*2, true); 
      this.ctx.closePath();
      this.ctx.fill();
    };

    this.rect = function(x, y, w, h, colorKey) {
      let raw = this.pal[colorKey];
      this.ctx.fillStyle = `rgb(${raw[0]},${raw[1]},${raw[2]})`;
      this.ctx.fillRect(~~x, ~~y, w, h);
    };

    this.setPixel = function(x, y, colorKey) {
      let raw = this.pal[colorKey];
      this.ctx.fillStyle = `rgb(${raw[0]},${raw[1]},${raw[2]})`;
      this.ctx.fillRect(x, y, 2, 2);
    };

    /*
      Brasenham algorithm; no aliased pixels
      https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
    */
    this.plotLine = function(x0, y0, x1, y1, colorKey, w = 2) {
       var dx = Math.abs(x1-x0);
       var dy = Math.abs(y1-y0);
       var sx = (x0 < x1) ? 1 : -1;
       var sy = (y0 < y1) ? 1 : -1;
       var err = dx-dy;

       while(true){
         this.setPixel(x0, y0, colorKey);

         if ((x0==x1) && (y0==y1)) break;
         var e2 = 2*err;
         if (e2 >-dy){ err -= dy; x0  += sx; }
         if (e2 < dx){ err += dx; y0  += sy; }
       }
    };

    this.img = function(i, x, y, scale = false) {
      if (scale) {
        i = this.resize(i, scale);
      }
      this.ctx.drawImage(i, ~~x, ~~y);
    };

    this.rotate = function(img, angle) {
      let size = Math.max(img.width, img.height) * 2,
          c = this.mkCanvas(size, size),
          ctx = c.getContext('2d');

      c.width = size;
      c.height = size;

      ctx.translate(size/2, size/2);
      ctx.rotate(angle);
      ctx.drawImage(img, -(img.width/2), -(img.height/2));

      let rotated = new Image();
      rotated.src=c.toDataURL();
      return rotated;
    };

    this.flip = function(i, flipH, flipV) {

      let c = this.mkCanvas(i.width, i.height),
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

    },

    this.resize = function(i, factor) {
      if (!i) return;
      let c = this.mkCanvas(i.width * factor, i.height * factor),
        ctx = c.getContext('2d');

      if (c.width) {
        ctx.save();
        ctx.scale(factor, factor);
        ctx.drawImage(i, 0, 0);
        ctx.restore();
      }
      c.scale = factor;
      return c;
    };

    this.color = function(i, col, returnCanvas = false) {
      const c = this.mkCanvas(i.width, i.height),
            ctx = c.getContext('2d');
      let p = 0,
          image = new Image(),
          imageData;

      ctx.drawImage(i, 0, 0);
      imageData = ctx.getImageData(0, 0, i.width, i.height);

      for(p = 0;  p < imageData.data.length; p+=4) {
        imageData.data[p + 0] = col[0];
        imageData.data[p + 1] = col[1];
        imageData.data[p + 2] = col[2];
      }

      ctx.putImageData(imageData, 0, 0);
      image.src = c.toDataURL();
      return returnCanvas ? c : image;
    };

    this.mkCanvas = function(w, h) {

      var c = document.createElement('canvas'),
        ctx = c.getContext('2d');

      c.width = w;
      c.height = h;
      ctx.mozImageSmoothingEnabled = false;
      ctx.imageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      return c;
    };

    this.textWidth = function(s, f) {
      return ( s.length * (3 * f.scale) ) +
        ( s.length * (1 * f.scale) );
    };

    this.text = function(s,f,x,y) {
      let i = 0,
        ctx = this.ctx,
        firstChar = 65,
        offset = 0,
        w = 3 * f.scale,
        h = 5 * f.scale,
        spacing = 1 * f.scale,
        sW =  this.textWidth(s, f),
        charPos = 0;

      const nums = '0123456789'.split('');

      if (typeof(s) === 'number' || s[0] === '0') {
        s += '';
        offset = 43;
      }
      x = x || (this.c.width - sW) / 2;

      for (i = 0; i < s.length; i += 1) {
        if (typeof(s[i]) === 'number' || s[i] === '0' || nums.indexOf(s[i]) !== -1) {
          offset = 43;
        } else {
          offset = 0;
        } 

        charPos = ( ( s.charCodeAt(i) - firstChar ) + offset ) * (w + spacing);
        if (charPos > -1) {
          ctx.drawImage(f, 
            charPos, 0, 
            w, h,
            ~~x, ~~y,
            w, h);
        }
        x += w + spacing;
      }
    };
  }

  function Input(canvas, g) {

    let l = window.addEventListener;

    this.c = canvas;
    this.g = g;
    this.click = 0;
    this.keys = [];

    this.pads = {
      'p1': { 'u': false, 'd': false, 'l': false, 'r': false, 'f': false },
      'p2': { 'u': false, 'd': false, 'l': false, 'r': false, 'f': false }
    };

    l('keydown', (e) => {
      this.keys[e.key] = true;
    });

    l('keyup', (e) => {
      this.keys[e.key] = false;
    });

    this.pollJoypads = function() {
      let devices = navigator.getGamepads();

      if (devices[0]) {
        let buttons = devices[0].buttons;
        this.pads.p1.f = buttons[2].pressed || buttons[0].pressed;
        this.pads.p1.u = buttons[12].pressed;
        this.pads.p1.d = buttons[13].pressed;
        this.pads.p1.l = buttons[14].pressed;
        this.pads.p1.r = buttons[15].pressed;
      }
      if (devices[1]) {
        let buttons = devices[1].buttons;
        this.pads.p2.f = buttons[2].pressed || buttons[0].pressed;
        this.pads.p2.u = buttons[12].pressed;
        this.pads.p2.d = buttons[13].pressed;
        this.pads.p2.l = buttons[14].pressed;
        this.pads.p2.r = buttons[15].pressed;
      }
    };
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
      for (var n = 0, i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", h = "data:audio/wav;base64,"; s > n; n += 3) {
        var f = e[n] << 16 | e[n + 1] << 8 | e[n + 2];
        h += i[f >> 18] + i[f >> 12 & 63] + i[f >> 6 & 63] + i[63 & f];
      }
      return h
    };

  const Audio = {

    init: function(g, sfx) {

      var aCtx = AudioContext || webkitAudioContextx;
      this.ctx = (aCtx) ? new aCtx : false;
      this.g = g;

      if (this.ctx) {
        this.encode(sfx);
      }

    },

    encode: function(sfx) {
      var s = this;
      s.sounds = [];

      var convert = function(data) {
        var len, bytes, i;
        data = jsfxr(data);
        data = atob(data.substr(data.indexOf(',')+1));
        len = data.length;
        bytes = new Uint8Array( len );
        for (i = 0; i < len; i++)        {
          bytes[i] = data.charCodeAt(i);
        }
        return bytes.buffer;
      };

      var decode = function(n) {
        s.ctx.decodeAudioData( convert(sfx[n]), function(b) {
          s.sounds[n] = b;
        });
      };

      for (var n in sfx) {
        decode(n);
      }
    },

    play: function(sfx) {
      if (this.ctx && this.sounds[sfx]) {
        var source = this.ctx.createBufferSource();
        source.buffer = this.sounds[sfx];
        source.connect(this.ctx.destination);
        source.start(0);
      }
    },

    say: function(msg, rate = 1.1) {
      if (this.g.firefox) {
        return;
      }
      var u = new SpeechSynthesisUtterance(msg);
      u.lang = 'en-US';
      u.rate = rate;
      u.pitch = 0.1;
      window.speechSynthesis.speak(u);
    }
  };

  class Shake {

    constructor(c, rnd, skip = false) {
      this.c = c;
      this.rnd = rnd;
      this.skip = skip;
      this.ttl = 0;
      this.mag = 0;
    }

    start(mag, ttl) {
      this.mag = mag;
      this.ttl = ttl;
      this.l = (window.innerWidth - this.c.style.width) / 2;
      this.startX = parseInt(this.c.style.marginLeft, 10);
      this.startY = parseInt(this.c.style.marginTop, 10);
    };

    update(step) {
      let g = this.g,
          c = this.c,
          m = this.rnd(-this.mag, this.mag),
          x, y;

      this.ttl -= step;

      if (this.skip) {
        return;
      } else if (this.ttl === 0) {
          x = this.startX; 
          y = this.startY; 
      } else if (this.ttl > 0) {
          x = this.startX + m;
          y = this.startY + m;
      }
      c.style.marginLeft = x + 'px';
      c.style.marginTop = y + 'px';
    };
  }

  var H = {

    timeStamp: function() {
      return window.performance && window.performance.now ?
        window.performance.now() : new Date().getTime();
    },

    rnd: function (min, max) {
      return Math.floor(Math.random()*(max-min+1)+min);
    },

    rndArray: function(a) {
        return a[~~(Math.random() * a.length)]; 
    },

    mkCanvas: function(w, h) {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      
      c.width = w;
      c.height = h;

  		ctx.mozImageSmoothingEnabled = false;
  		ctx.msImageSmoothingEnabled = false;
  		ctx.imageSmoothingEnabled = false;

      return c;
    },

    mkFont: function(g, size, col) {
      let font = g.draw.color(g.imgs['font_'+size], g.options.pal[col], true);
      font.scale = size;
      return font;
    },

    /*
    http://jsfiddle.net/jessefreeman/FJzcc/1/
    T: current Time
    B: start Value
    C: change in value
    D: duration
    */
    tween: function(t, b, c, d) {
      return c*t/d + b;
    }

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

  function Game(options = {}) {
    let ua = navigator.userAgent.toLowerCase();

    this.mobile = 'createTouch' in document || false;
    this.android = ua.indexOf('android') > -1;
    this.ios = /ipad|iphone|ipod/.test(ua);
    this.firefox = ua.indexOf('firefox') > -1;

    this.options = options;
    this.w = options.w;
    this.h = options.h;
    this.sfx = options.SoundFX;
    this.dt   = 0;
    this.fps  = 60;
    this.frameStep = 1/ this.fps;
    this.frameCurr = 0;
    this.framePrev = H.timeStamp();
    this.stateName = 'title';
    this.H = H;

    this.states = options.states;
    this.availEnts = options.ents;

    this.score = 0;
    this.hiScore = 20;
    this.plays = 0;

    this.ents = [];
    this.imgs = [];
    this.fonts = [];
    this.events = [];
    this.transition = false;
    this.H = H;

    this.init = function() {
      const loader = new Loader(this.options.i);
      document.title = this.options.title;
      window.g = this;

      this.canvas = new Canvas(this.options.w, this.options.h);
      this.draw = new Draw(this.canvas.c, this.canvas.ctx, this.options.pal);
      this.input = new Input(this.canvas.c, this.g);
      this.sfx.add(this.options.sfx);
      this.music = new NT(this.options.instruments, this.options.tracks);
      this.shake = new Shake(this.canvas.c, this.H.rnd, this.ios);
      if ( this.ios) {
        this.audio = { play: function() {}, say: function() {} };
      } else {
        this.audio = Audio;
        this.audio.init(this, this.options.sfx);
      }

      loader.start().then((res) => {
        this.imgs = res;
        this.makeFonts(this.imgs.font);
        document.getElementById('l').style.display = 'none';
        this.changeState(this.stateName);
        this.canvas.c.style.display = 'block';
        this.favIcon(this.draw.resize(this.imgs.head, 8));
        this.loop();
      });
    };

    this.makeFonts = function(f) {
      let i = 12;
      while (i-- > 1) {
        this.imgs['font_'+i] = this.draw.resize(f, i);
      }
    };

    this.favIcon = function(i) {
      let c = document.createElement('canvas'),
          ctx = c.getContext('2d'),
          l = document.createElement('link');
      c.width = c.height = 64;
      ctx.drawImage(i, 0, 0);
      l.type = 'image/x-icon';
      l.rel = 'shortcut icon';
      l.href = c.toDataURL('image/x-icon');
      document.getElementsByTagName('head')[0].appendChild(l);
    };

    this.changeState = function(state) {
      this.ents = [];
      this.events = [];
      this.state = new this.states[state](this);
      this.state.init();
      this.transition = false;
    };

    this.loop = function() {
      this.frameCurr = H.timeStamp();
      this.dt = this.dt + Math.min(1, (this.frameCurr - this.framePrev) / 1000);

      while(this.dt > this.frameStep) {
        this.dt = this.dt - this.frameStep;
        this.update(this.frameStep);
      }

      this.render(this.dt);
      this.framePrev = this.frameCurr;
      requestAnimationFrame(() => this.loop());
    };

    this.update = function(step) {
      this.fader = Math.sin(new Date().getTime() * 0.005);
      this.runEvents(step);
      this.state.update(step);
      this.shake.update(step);

      this.input.pollJoypads(); 

      let i = this.ents.length;
      while (i--) {
        if (this.ents[i].remove) {
          this.ents.splice(i, 1);
        }
      }
      this.input.click = false;
      if (this.transition) {
        this.transition.update();
        if (this.transition.done) {
          if (this.transition.changeTo) {
            this.changeState(this.transition.changeTo);
            this.transition = null;
          }
        }
      }

    };

    this.render = function(step) {
      this.state.render(step);
      if (this.transition) {
        this.transition.render();
      }

    };

    this.spawn = function(ent, opts) {
      const sprite = new this.availEnts[ent](this, opts);
      this.ents.push(sprite);
      return sprite;
    };

    this.boom = function(x, y, col = 6, num = 5) {
      this.audio.play('BOOM' + this.H.rnd(0, 3));
      this.shake.start(4, 1);
      this.spawn('boom', {x, y});
      this.burst(x, y, col, num);
    };

    this.burst = function(x, y, col, num, w = 3) {
      while (num--) {
        this.ents.push(new this.availEnts['particle'](this, {x, y, col, w}));
      }
    };

    this.addEvent = function(e) {
      this.events.push(e);
    };

    this.runEvents = function(step) {
      let i = this.events.length;
      while(i--) {
        let e = this.events[i]; 
        if (!e) {
          break;
        }
        e.time -= step * 100;
        if (e.time < 0) {
          e.cb.call(this);
          this.events.splice(i, 1);
        }
      }
    };
    
    return this;
  }

  var Images = {'b':'R0lGODlhCAAIAIABAKPOJzGi8iH5BAEKAAEALAAAAAAIAAgAAAIPTIBgprcOmWQJ0dXsrLYAADs=','black':'R0lGODlhEAAQAIABABsmMjGi8iH5BAEKAAEALAAAAAAQABAAAAIdjA2px6G/GJzgUIoudLr7D4aix32ZeWpN11gbUwAAOw==','boom':'R0lGODlhHwAQAKEBAL4mM/fia/fia/fiayH5BAEKAAIALAAAAAAfABAAAAJfBIQppnjNkolqyvkWs5p2DIaUSJIBEJxSyhotyp6pCz81jdZzPvfRvTvxhLJYbhMTHos0Gc/iMi6Bx+cv6Vy2lMorF7Yr4Vbfm6dEnnQ5Fbb3lVk05HO5qI7Hg/L8egEAOw==','bot':'R0lGODlhIAAIAKEDABsmMr4mM////zGi8iH5BAEKAAMALAAAAAAgAAgAAAIxnAGmy8jjFJpJ1kNr1gJ1TB0d8EFjuYmeloHTErkxdFnPjFkpHe95U/vRYAnf4zgoAAA7','bullet':'R0lGODlhAgACAIABAP///zGi8iH5BAEKAAEALAAAAAACAAIAAAIChFEAOw==','circle':'R0lGODlhCAAIAIABAP///zGi8iH5BAEKAAEALAAAAAAIAAgAAAIMTIBgl8gNo5wvrWYKADs=','font':'R0lGODlhjwAFAIABAAAAAP///yH5BAEKAAEALAAAAACPAAUAAAJzDGKHcLzOFDRJ0UbXzdJ2lFQbRo5ipJ1TA7XsW2KanNWyZXpuzuNSz5txQDZTChSrsI6kXfOHDNmcl9+LKXxiU7fHBwV2zFxJzwZbGiazq+kyqua2h0I6vEhLh977Dm1fBaW1BvUwYmYY16UiuDN29VhRAAA7','head':'R0lGODlhCAAIAKECAL4mM////76zYr6zYiH5BAEKAAIALAAAAAAIAAgAAAIQlAEmyB2BXoRAtovT0WrxAgA7','o':'R0lGODlhCAAIAIABAKPOJzGi8iH5BAEKAAEALAAAAAAIAAgAAAIPTIBot9BvXIySnSrVvMkVADs=','s':'R0lGODlhCAAIAIABAKPOJzGi8iH5BAEKAAEALAAAAAAIAAgAAAIODH6hoL3eUILT1ciWVAUAOw==','sight':'R0lGODlhAwADAIABAP///zGi8iH5BAEKAAEALAAAAAADAAMAAAIEDAx3BQA7','skull':'R0lGODlhBQAEAKECAL4mM////zGi8jGi8iH5BAEKAAAALAAAAAAFAAQAAAIGjA+RZ+kFADs=','star':'R0lGODlhAwADAIABAP///zGi8iH5BAEKAAEALAAAAAADAAMAAAIEDAx3BQA7','t':'R0lGODlhCAAIAIABAKPOJzGi8iH5BAEKAAEALAAAAAAIAAgAAAIODI6hCuvtWDTw1XVmVgUAOw=='};

  const Sfx = {
    BOOM0: [3,,0.3532,0.6421,0.4668,0.054,,0.2682,,,,,,,,0.5503,0.0564,-0.2946,1,,,,,0.5],
    BOOM1: [3,,0.358,0.4132,0.4598,0.0747,,0.236,,,,,,,,0.511,-0.0031,-0.2441,1,,,,,0.5],
    BOOM2: [3,0.0468,0.3271,0.4367,0.4514,0.1042,0.022,0.1841,-0.0628,0.0289,0.061,0.0583,0.0324,0.0213,-0.0537,0.5361,0.0001,-0.2583,0.9752,,0.0048,,0.0484,0.5],
    BOOM3: [3,,0.3839,0.7164,0.1206,0.1913,,0.0403,,,,-0.6667,0.6912,,,,-0.2906,-0.1444,1,,,,,0.5],
    JUMP: [0,,0.2432,,0.1709,0.3046,,0.1919,,,,,,0.5923,,,,,1,,,,,0.5],
    FLIP: [0,0.001,0.2379,0.1592,0.0225,0.85,,0.0659,0.0917,,-0.6595,-0.2759,0.7809,0.0597,0.0205,0.3604,-0.0083,-0.5261,0.3385,-0.0003,0.0833,,0.6489,0.5],
    POWERUP: [0,,0.0129,0.5211,0.4714,0.4234,,,,,,0.4355,0.5108,,,,,,1,,,,,0.5],
    NOISE: [3,,0.41,0.5861,0.4234,0.67,,0.74,-0.52,,,-0.76,0.24,,,,,,0.18,,,,,0.37],
    COIN: [0,,0.0509,0.3048,0.2229,0.6475,,,,,,0.2917,0.6948,,,,,,1,,,,,0.5],
    SHOOT: [2,,0.1128,,0.178,0.7748,0.0046,-0.4528,,,,,,0.185,0.0994,,,,1,,,,,0.5],
    LEVELUP: [2,0.0506,0.8811,0.0789,0.9412,0.5002,,0.001,0.3829,0.0595,0.4632,-0.812,0.7855,-0.9121,0.1173,0.1088,-0.3698,0.1704,0.8458,-0.2283,,0.1259,-0.0298,0.5],
    DIE: [2,0.1987,0.388,0.4366,0.0335,0.5072,,0.1128,-0.1656,0.1987,,-0.376,0.2686,-0.684,0.1392,-0.6819,-0.8117,-0.1072,0.9846,0.057,,0.004,-0.0045,0.56],
    GLITCH: [0,0.0092,0.667,0.0173,0.5449,0.1575,,-0.0179,-0.0289,0.2259,0.8272,0.9965,0.4172,-0.684,0.4795,0.086,0.0206,,0.9931,0.2268,,0.0015,-0.0268,0.5],
    PHASER: [1,0.1496,0.9191,0.5562,0.7405,0.1923,,,0.4579,,0.842,0.9156,-0.9711,-0.8447,0.0015,0.5609,0.7166,0.001,0.0169,0.5178,,,0.0001,0.5],
    WOOSH: [3,0.7878,0.0997,0.3167,0.7715,0.5,,0.0005,-0.5853,0.0349,,0.0752,,0.3688,0.018,0.689,-0.0282,0.0283,0.362,-0.1203,0.661,,0.0089,0.5],
    WAVE: [3,0.773,0.2667,0.1108,0.7238,0.5004,,,0.2387,-0.3469,0.8255,0.0629,-0.1947,-0.6122,0.2567,,0.3688,0.01,0.9877,-0.0027,0.5053,0.2202,-0.0355,0.5],
    // TAILSPIN: [0,,0.8554,0.1503,0.2788,0.539,,-0.0926,0.0197,0.9647,0.2715,0.7517,,,-0.1005,,-0.0702,0.4188,0.9946,0.8423,,0.0029,-0.0112,0.5],
    // ALIEN: [2,0.147,0.2307,0.0367,0.8728,0.5066,,0.0005,-0.0037,0.493,-0.2696,-0.139,0.8868,-0.753,-0.2885,0.6708,,-0.0691,0.7853,-0.1026,0.5982,0.0102,0.0085,0.5],
    BOMBSAWAY: [0,,0.3548,0.012,0.8368,0.5221,,-0.1077,0.0006,-0.0923,-0.5227,0.4775,,-0.8233,0.0003,,-0.0306,-0.4865,0.7021,0.6458,0.182,0.0348,-0.006,0.5],
    // BUZZ: [0,0.29,0.595,0.2805,0.0999,0.1905,,-0.0477,0.0022,-0.0131,0.9164,0.3911,,0.7873,0.4686,,0.2566,0.0307,0.8693,0.8432,0.7706,0.4253,-0.0044,0.5],
    // GLEE: [0,,0.3412,,0.2339,0.336,,0.2992,,,,,,0.5122,,,,,1,,,,,0.5],
    // ALARM: [1,0.0241,0.9846,0.6067,0.3041,0.1838,,0.0565,0.1439,-0.3068,0.1402,0.0867,0.7339,0.1332,-0.3119,-0.3257,0.2875,-0.0014,0.5866,0.0086,-0.9675,0.3643,,0.5],
    TAP: [1,,0.1953,,0.1186,0.2659,,,,,,,,,,,,,1,,,0.1,,0.5]
  };

  let instruments = {
    VOX: {
      wave: 'square',
      pan: -0.1,
      gain: 0.1
    },
    BSS: {
      wave: 'triangle',
      pan: 0.5,
      gain: 0.7
    }
  };

  let tracks = {
    win: {
      bpm: 180,
      isLooping: false,
      parts: [
        'VOXA41A#41A41A#41G44C54',
      ]
    },
    dead: {
      bpm: 120,
      isLooping: false,
      parts: [
        'VOXF31E31D31B31A#24',
      ]
    },
    title: {
      bpm: 180,
      isLooping: false,
      parts: [
        'BSSC22C22G12G12A#12A#12B12B12G12E12G14',
      ]
    }
  };

  var Data = {
    title: 'BOOM BOTS',
    w: 320,
    h: 240,
    pal: [ // AndroidArts16 - https://androidarts.com/palette/16pal.htm
     [0,0,0], // 0 ash
     [73,60,43], // 1 oldpoop
     [164,100,34], // 2 newpoop
     [190,38,51], // 3 bloodred
     [224,111,139], // 4 pigmeat
     [235,137,49], // 5 blaze
     [255,255,255], // 6 blind
     [247,226,107], // 7 zornskin
     [47,72,78], // 8 shadegreen
     [163,206,39], // 9 slimegreen
     [27,38,50], // 10 nightblue
     [0,87,132], // 11 seablue
     [49,162,242], // 12 skyblue
     [178,220,239], // 13 cloudblue
    ],
    i: Images,
    sfx: Sfx,
    instruments: instruments,
    tracks: tracks
  };

  class Title {

    constructor(g) {
      this.g = g;
      this.title0 = g.H.mkFont(g, 7, 3);
      this.title1 = g.H.mkFont(g, 8, 9);
      this.start = g.H.mkFont(g, 2, 6);
      this.ui = g.H.mkFont(g, 1, 6);
    }

    init() {
      this.goBoom = false;
      this.canStart = false;

      this.g.addEvent({
        time: 150,
        cb: () => { 
          this.g.sfx.play('coin0');
          this.g.spawn('sprite', { x: 110, y: 90, scale: 4, i: 'b' }); 
        }
      });
      this.g.addEvent({
        time: 200,
        cb: () => { 
          this.g.sfx.play('coin1');
          this.g.spawn('sprite', { x: 140, y: 90, scale: 4, i: 'o' }); 
        }
      });
      this.g.addEvent({
        time: 250,
        cb: () => { 
          this.g.sfx.play('coin2');
          this.g.spawn('sprite', { x: 170, y: 90, scale: 4, i: 't' }); 
        }
      });
      this.g.addEvent({
        time: 300,
        cb: () => { 
          this.g.sfx.play('coin3');
          this.g.spawn('sprite', { x: 200, y: 90, scale: 4, i: 's' }); 
        }
      });
      this.g.addEvent({
        time: 350,
        cb: () => { 
          this.goBoom = true;
        }
      });
      this.g.addEvent({
        time: 450,
        cb: () => {
          this.canStart = true;
          this.goBoom = false;
          this.g.sfx.play('coin4');
          this.g.spawn('sprite', { x: 90, y: 10, scale: 5, i: 'boom' });
        }
      });
      this.g.addEvent({
        time: 500,
        cb: () => { 
          this.g.audio.say('WELCOME TO BOOM BOTS', 0.8);
        }
      });
    }

    update(step) {
      const i = this.g.input.keys;
      const pads = this.g.input.pads;
      const rnd = this.g.H.rnd;
      if (this.canStart && (i.x || i[' '] || i.Enter || i.s || i.o || pads.p1.f || pads.p2.f)) {
        if (!this.g.names) {
          this.g.changeState('options');
        } else {
          this.g.changeState('main');
        }
      }
      if (this.goBoom) {
        let x =rnd(100, 250);
        let y =rnd(20, 60);
        this.g.spawn('boom', {x: x, y: y, magnitude: 10, factor: 1});
        if (rnd(0, 100) > 75) this.g.audio.play('BOOM' + rnd(0,3));
        if (rnd(0, 100) > 85) this.g.shake.start(5, 0.5);
        if (rnd(0, 100) > 75) this.g.burst(x, y, 6, 10);
      }
      for (let n of this.g.ents) { n.update(step); }
    }

    render(step) {
      const g = this.g;
      g.draw.clear(0);

      if (g.fader > 0 && this.canStart) {
        g.draw.text('PUSH START', this.start, false, g.h - 30);
      }

      for (let n of this.g.ents) { n.render(step); }

    }

    resetMap() {
    }
  }

  const Map$1 = {
    tile: 8,
    data: [],
    generate: function(w, h, draw) {
      let x = w / Map$1.tile;
      let y = h / Map$1.tile;
      Map$1.data = [];
      Map$1.draw = draw;
      
      for (let yArr = 0; yArr < y; yArr += 1) {
        let tmp = [];
        for (let xArr = 0; xArr < x; xArr += 1) {
          tmp.push(0);
        }
        Map$1.data.push(tmp);
      }
      for (let blocks = 0; blocks < x; blocks += 1) {
        Map$1.addBuilding(blocks, Map$1.data.length, 2, Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 1) + 1 );
      }
    },
    addBuilding: function(x, y, w, h, col) {
      for (let xPos = 0; xPos < w; xPos += 1) {
        for (let yPos = 1; yPos < h; yPos += 1) {
          Map$1.data[y - yPos][xPos + x] = col;
        }
      }
    },
    render: function(dt) {
      let x = Map$1.data[0].length;
      let y = Map$1.data.length;
      for (let yArr = 0; yArr < y; yArr += 1) {
        for (let xArr = 0; xArr < x; xArr += 1) {
          try {
            let tile = Map$1.data[yArr][xArr];
            if (tile) {
              Map$1.draw.rect(xArr * Map$1.tile, yArr * Map$1.tile, Map$1.tile, Map$1.tile, 10);
            }
          } catch (e) {
            console.log(e);
          }
        }
      }
    },
    getPoint: function(x, y) {
      x = Math.floor(x / Map$1.tile);
      y = Math.floor(y / Map$1.tile);
      if (Map$1.data[y] && Map$1.data[y][x]) {
        return Map$1.data[y][x];
      }
    },
    setPoint: function(x, y, val = 0) {
      x = ~~(x / Map$1.tile);
      y = ~~(y / Map$1.tile);
      if (Map$1.data[y]) {
        Map$1.data[y][x] = val;
      }
    }
  };

  class Main {

    constructor(g) {
      this.g = g;
      this.font0 = g.H.mkFont(g, 2, 6);
      this.font1 = g.H.mkFont(g, 6, 6);
    }

    init() {

      let g = this.g;
      this.curtain = g.h;

      this.title = g.H.mkFont(g, 8, 4);
      this.start = g.H.mkFont(g, 2, 6);

      if (!this.g.names) {
        this.g.names = ['1UP', '2UP'];
      }
      this.g.scores = {
        p1: 0,
        p2: 0
      };

      this.map = Map$1;
      window.T = this;
      
      this.reset();
    }

    reset() {
      if (this.g.scores.p1 > 2 || this.g.scores.p2 > 2) {
        this.g.changeState('win');
        return;
      }

      this.resetMap();

      this.bg = this.makeBg();
      this.bgCol = this.newBgCol();

      this.winner = false;
      this.g.audio.say('GET READY!');
      this.bot1 = g.spawn('bot', {
        name: 'p1',
        keys: { left: 'z', right: 'x', fire: 's' },
        p: this,
        map: this.map,
        x: 3 * this.map.tile,
        angle: 0
      });
      this.bot2 = g.spawn('bot', {
        name: 'p2',
        keys: { left: 'k', right: 'l', fire: 'o' },
        x: g.w - (3 * this.map.tile),
        p: this,
        map: this.map,
        angle: -3
      });
      this.g.music.play('title');
    }

    update(step) {
      const g = this.g;

      if (g.input.keys.Escape) {
        this.g.changeState('title');
      }
      if (g.input.keys.b) {
        this.bg = this.makeBg();
        this.bgCol = this.newBgCol();
      }

      if (!this.winner) {
        if (this.bot1.remove) {
          this.winner = this.bot2;
        } else if (this.bot2.remove) {
          this.winner = this.bot1;
        }
        if (this.winner) {
          this.winner.doDance();
        }
      }
      if (this.bot1.remove && !this.winner) {
        this.winner = this.bot2;
      } else if (this.bot2.remove && !this.winner) {
        this.winner = this.bot1;
      }

      for (let n of g.ents) { n.update(step); }
      if (g.input.click && !g.transition) {
        let plays = 0;
        try {
          plays = window.sessionStorage.getItem('plays') || 0;
          plays = parseInt(plays, 10);
        } catch (e) {
          // console.log(e);
        }
        // const nextState = (plays > 0) ? 'main' : 'intro';
        const nextState = 'main';
        this.g.music.stop();
        this.g.music.play('start');
        g.transition = new g.availEnts['fade']({
          g: g,
          col: 0,
          y: 0,
          targetY: g.h,
          changeTo: nextState
        });
      }
    }

    render(step) {
      const g = this.g;

      g.draw.clear(this.bgCol);
      g.canvas.ctx.globalAlpha = 0.25;
      g.draw.img(this.bg, 0, 0);
      g.canvas.ctx.globalAlpha = 1;
      this.map.render();

      for (let n of this.g.ents) { n.render(step); }

      g.draw.text(this.g.names[0], this.font0, 30, 10);
      g.draw.text(this.g.names[1], this.font0, g.w - 40, 10);
      g.draw.text(this.g.scores.p1, this.font1, 33, 25);
      g.draw.text(this.g.scores.p2, this.font1, g.w - 36, 25);

    }

    resetMap() {
      const g = this.g;
      this.map.generate(g.w, g.h, g.draw);
    }

    makeBg() {
      const g = this.g;
      const rnd = g.H.rnd;
      const c = g.H.mkCanvas(this.g.w, this.g.h);
      const ctx = c.getContext('2d');
      const draw = new Draw(c, ctx, g.options.pal);
      const h = g.h / 1.4;
      draw.rect(0, h, g.w, g.h, 10);
      let r = 20;
      let i = 20;
      while (i--) {
        draw.img(g.imgs.black, i * r, h - (rnd(2, 64) / 2), 3);
      }

      i = 27;
      while (i--) {
        
        draw.rect(rnd(0, g.w), rnd(0, g.h / 2.5), 2, 2, 6);
      }

      let img = new Image();
      img.src = c.toDataURL();

      return img;
    }

    newBgCol() {
      return this.g.H.rndArray([2,3,4,5,7,8,9,11,12,13]);
    }

    updateScores(p) {
      this.g.scores[p.name] += 1;
      window.setTimeout(() => {
        this.reset();
      }, 1500);
    }
  }

  class Options {

    constructor(g) {
      this.g = g;
      this.curtain = g.h;
      this.title0 = g.H.mkFont(g, 3, 6);
      this.nameFont = g.H.mkFont(g, 5, 9);
      this.ui = g.H.mkFont(g, 3, 6);
      this.names = [];
      this.cursor = {
        x: 0, y: 0
      };
      this.name = this.getSavedName('p1');
      this.grid = {
        start: {x: 70, y: 100},
        gap: {x: 15, y: 20},
        data: []
      };
      let row1 = 'ABCDEFGHIJKLM'.split('');
      let row2 = 'NOPQRSTUVWXYZ'.split('');
      this.grid.data.push(row1);
      this.grid.data.push(row2);
      this.grid.data.push(['DEL', 'DONE']);
      window.O = this;
      this.isDone = 0;
      this.lastKeyPress = 0;
    }

    init() {

    }

    update(step) {
      const i = this.g.input.keys;
      const pads = this.g.input.pads;

      if (this.lastKeyPress > 0.15) {
        if (i[' '] || i.x || i.Enter || pads.p1.f || pads.p2.f) {
          this.addLetter();
          this.lastKeyPress = 0;
        } else if (i.ArrowUp || pads.p1.u || pads.p2.u) {
          this.cursor.y -= 1; 
          this.lastKeyPress = 0;
        } else if (i.ArrowDown || pads.p1.u || pads.p1.d) {
          this.cursor.y += 1; 
          this.lastKeyPress = 0;
        } else if (i.ArrowLeft || pads.p1.l || pads.p2.l) {
          this.cursor.x -= 1; 
          this.lastKeyPress = 0;
        } else if (i.ArrowRight || pads.p1.r || pads.p2.r) {
          this.cursor.x += 1; 
          this.lastKeyPress = 0;
        } else if (i.Backspace || i.Delete) {
          this.removeLetter();
        }
      }

      let maxX = this.grid.data[0].length - 1;
      if (this.cursor.y < 0) this.cursor.y = 2;
      if (this.cursor.y > 2) this.cursor.y = 0;
      if (this.cursor.x < 0) this.cursor.x = maxX;
      if (this.cursor.x > maxX) this.cursor.x = 0;

      if (this.cursor.y === 2) {
        if (this.cursor.x < 0) this.cursor.x = 1;
        if (this.cursor.x > 1) this.cursor.x = 0;
      }

      this.lastKeyPress += step;
    }

    render(step) {
      const g = this.g;
      g.draw.clear(10);
      g.draw.text(`ENTER P${this.names.length + 1} NAME`, this.title0, false, 10);


      g.draw.text(this.name, this.nameFont, false, 50);

      this.drawCursor();
      this.grid.data.forEach((row, y) => {
        row.forEach((letter, x) => {
          let xPos = (x * this.grid.gap.x) + this.grid.start.x;
          let yPos = (y * this.grid.gap.y) + this.grid.start.y;
          if (y === 2) {
            xPos += ((x + 1) * 50);
          }
          g.draw.text(letter, this.ui, xPos, yPos);
        });
      });

    }

    drawCursor() {
      let yPos = ((this.cursor.y * this.grid.gap.y) + this.grid.start.y) - 2;
      if (this.cursor.y === 2) {
        if (this.cursor.x === 0) {
          this.g.draw.rect(this.grid.start.x + 46,
            yPos, 40, 20, 4);
        } else if (this.cursor.x === 1) {
          this.g.draw.rect(this.grid.start.x + 112,
            yPos, 50, 20, 5);
        }

      } else {
        this.g.draw.rect(
          ((this.cursor.x * this.grid.gap.x) + this.grid.start.x) - 2,
          yPos,
          13, 18, 9);
      }
    }

    addLetter() {
      let letter = this.grid.data[this.cursor.y][this.cursor.x];

      if (letter === 'DEL') {
        this.removeLetter();
        this.isDone = 0;
      } else if (letter === 'DONE') {
        this.isDone = 0;
        this.addName();
      } else if (this.name.length < 3) {
        this.isDone = 0;
        this.g.sfx.play('step0');
        this.name += letter;
      } else if (this.name.length >= 3) {
        this.isDone += 1;
        if (this.isDone >= 2) {
          this.cursor.x = 1;
          this.cursor.y = 2;
        } else {
          this.g.sfx.play('bounce');
        }
      }
    }

    removeLetter() {
      this.name = this.name.substring(0, this.name.length - 1); 
      this.g.audio.play('TAP');
    }

    addName() {
      if (!this.name.length) {
        this.g.sfx.play('bounce');
        return;
      }
      this.g.audio.play('COIN');
      this.cursor.x = 5;
      this.cursor.y = 0;
      this.names.push(this.name);
      if (this.names.length === 2) {
        this.g.names = this.names;
        try {
          window.localStorage.setItem('p1', this.names[0]);
          window.localStorage.setItem('p2', this.names[1]);
        } catch (e) {
        }
        this.g.changeState('main');
      } else {
        this.name = this.getSavedName('p2');
      }
    }

    getSavedName(key = 'p1') {
        let savedName ='';
        try {
          savedName = window.localStorage.getItem(key) || '';
        } catch (e) { 
        }
      console.log(key, savedName);
      return savedName;
    }
  }

  class Win {

    constructor(g) {
      this.g = g;
      this.title0 = g.H.mkFont(g, 7, 3);
      this.title1 = g.H.mkFont(g, 8, 4);
      this.start = g.H.mkFont(g, 2, 6);
      this.ui = g.H.mkFont(g, 1, 6);
    }

    init() {
      this.g.music.play('win');
      const scores = this.g.scores;
      this.canSkip = false;
      this.winner = (scores.p1 > scores.p2) ? 'p1' : 'p2';
      this.winnerName = window.localStorage.getItem(this.winner);
      this.g.addEvent({
        time: 100,
        cb: () => { 
          this.canSkip = true;
          this.g.audio.say('HA HA '+this.winnerName+' WINS', 0.8);
        }
      });
    }

    update(step) {
      const i = this.g.input.keys;
      const pads = this.g.input.pads;
      if (this.canSkip && (i.x || i[' '] || i.Enter || i.s || i.o || pads.p1.f || pads.p2.f)) {
        this.g.changeState('main');
      }
      for (let n of this.g.ents) { n.update(step); }
    }

    render(step) {
      this.g.draw.clear(0);
      this.g.draw.text(this.winnerName + ' WINS', this.g.fader ? this.title0 : this.title1, false, 20);
      for (let n of this.g.ents) { n.render(step); }
    }

  }

  class Sprite {

    constructor(g, o) {
      this.g = g;
      this.o = o;
      this.id = Date.now() + '-' + g.ents.length;
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

    update(step) {
      if (this.collidesWith) {
        this.hitGroup(this.collidesWith);
      }
      this.updateAnim(step);
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
          ( frame * this.w ) - this.w, 0,
          this.w, this.h,
          ~~this.x, ~~this.y + this.offsetY,
          this.w, this.h
        );
      } else {
        this.g.draw.rect(~~this.x, ~~this.y, this.w, this.h, this.col);
      }
    }

    updateAnim(step) {
      if (this.frameNext < 0) {
        this.frameNext = this.anim.rate;
        this.anim.counter += 1;

        if (this.anim.counter >= this.anim.frames.length) {
          if (this.anim.next) {
            this.changeAnim(this.anim.next);
          }
          else {
            this.anim.counter = 0;
          }
        }
        this.frame = this.anim.frames[this.anim.counter];
      }
      this.frameNext -= this.g.dt;
    }

    hitGroup(group) {
      let g = this.g,
        i = g.ents.length;
      while (i--) {
        if (g.ents[i] && g.ents[i].group === group && 
          g.ents[i].id !== this.id && this.hit(g.ents[i]) &&
          g.ents[i].dead === false) {
            this.doDamage(g.ents[i]);
            g.ents[i].receiveDamage(this);
        } 
      }
    }

    hit(o) {
      let p1 = this;
      return !((o.y+o.h<p1.y) || (o.y>p1.y) ||
        (o.x+o.w<p1.x) || (o.x>p1.x+p1.w));
    }

    receiveDamage(o) {
    }

    doDamage(o) {
    }

    kill() {
      this.dead = this.remove = true;
    }

    mkImg(name) {
      if (!this.i) {return; }
      let g = this.g;
      this.i = g.draw.resize(g.imgs[name], this.scale);
      this.w = ( this.i.width / this.frames);
      this.h = this.i.height;
      this.iHurt = g.draw.color(this.i, [190,38,51]);
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

  class Bot extends Sprite {
    constructor(g, o) {
      o.frames = 4;
      o.scale = 1;
      o.i = 'bot';
      super(g, o);
      this.o = o;
      this.x = o.x;
      this.y = o.y || 0;
      this.group = 'bots';
      this.pad = this.g.input.pads[o.name];
      this.anims = { 
        idle: { frames: [1], rate: 0.01 },
        dance: { frames: [1, 2], rate: 0.1 },
        fly: { frames: [3, 4], rate: 0.01 },
      };

      this.reset();
    }

    update(step) {
      super.update(step);
      this.touching = this.map.getPoint(this.x, this.y + this.h);

      if (this.y > this.g.h - this.h) {
        this.receiveDamage();
      }

      if (this.isWinner) {
        if (this.y < -10) {
          if (this.p && this.p.updateScores) {
            this.p.updateScores(this);
          }
          this.remove = true;
        }
        this.y -= step * (this.v / 2);
        if (this.y > 0 && (~~this.y % 27 === 0)) {
          this.g.audio.play('SHOOT');
          this.g.spawn('skull', {x: this.x, y: this.y, map: this.map});
        }
        if (this.anim.name !== 'fly') {
        this.changeAnim('fly');
        }
        return;
      } 

      if (this.isDancing) ; else if (!this.touching) {
        this.y += step * this.v;
        this.y = Math.floor(this.y);
      } else if (this.touching && this.anim.name !== 'idle') {
        this.g.audio.play('TAP');
        this.g.shake.start(1, 0.25);
        this.changeAnim('idle');
      }
      this.handleInput(step);
    }

    reset() {
      this.v = 75;
      this.angle = this.o.angle || 0;
      this.power = 0;
      this.minPower = 3;
      this.maxPower = 25;
      this.isWinner = false;
      this.isDancing = false;
      this.shoot = false;
      this.touching = false;
      this.changeAnim('fly');
    }

    handleInput(step) {
      const input = this.g.input.keys;
      if (this.isWinner || this.isDancing) {
        return;
      }
      if (!this.touching) {
        if (input[this.keys.left] || this.pad.l) {
          this.x -= 10 * step;
        } else if (input[this.keys.right] || this.pad.r) {
          this.x += 10 * step;
        }
        if (this.x < 0) { this.x = 0; }
        if (this.x > (this.g.w - this.w)) { this.x = this.g.w - this.w; }
        return;
      }
      if (input[this.keys.fire] || this.pad.f) {
        this.shoot = true;
        this.power += 0.5;
        if (this.power > this.maxPower) {
          this.power = 0;
        }
      } else if ((!input[this.keys.fire] || !this.pad.f ) && this.shoot) {
        if (this.power > this.minPower) {
          const point = this.getPoint(this.w);
          this.g.spawn('bullet', {
            x: point[0], y: point[1],
            angle: this.angle, power: this.power,
            shooter: this.name,
            map: this.map
          });
          this.g.audio.play('SHOOT');
        } else {
          this.g.audio.play('TAP');
        }
        this.power = 0;
        this.shoot = false;
      }

      if (input[this.keys.left] || this.pad.l) {
        this.angle -= 0.05;
      } else if (input[this.keys.right] || this.pad.r) {
        this.angle += 0.05;
      }
    }

    drawSight() {
      const point = this.getPoint();
      const max = this.getPoint(this.maxPower + this.w);
      const x1 = this.x + (this.w / 2);
      const y1 = this.y + (this.h / 2);

      // this.g.draw.rect(~~point[0], ~~point[1], 3, 3, 10);
      this.g.draw.plotLine(~~x1, ~~y1, ~~point[0], ~~point[1], 10, this.power);

      if (this.shoot) {
        // this.g.draw.rect(~~max[0], ~~max[1], 1, 1, 6);
        this.g.draw.img(this.g.imgs['sight'], max[0]-1, max[1]-1);
      }
    }

    getPoint(r) {
      r = r ? r : Math.floor(this.power) + 5;
      return [
        (this.x + (this.w / 2)) + r * Math.cos(this.angle),
        (this.y + (this.h / 2)) + r * Math.sin(this.angle)
      ];
    }

    render() {
      if (this.anim.name === 'idle') {
        this.drawSight();
      }
      super.render();
    }

    receiveDamage(o) {
      if (this.anim.name !== 'idle') {
        return;
      }
      let i = 5;
      this.g.music.play('dead');
      while(i--) {
        setTimeout(() => {
          this.explode();
        }, i * 100);
      }
      this.remove = true;
    }

    explode() {
      const rnd = this.g.H.rnd;
      this.g.boom(this.x + rnd(-5, 5), this.y + rnd(-5, 5));
    }

    doDance() {
      this.isDancing = true;
      this.changeAnim('dance');
      setTimeout(() => {
        this.isWinner = true;
      }, 1500);
    }
  }

  class Bullet extends Sprite {
    constructor(g, o) {
      o.frames = 1;
      o.scale = 1;
      o.i = 'bullet';
      super(g, o);
      super(g, o);
      this.x = o.x;
      this.y = o.y || 0;
      this.group = 'bullets';
      this.collidesWith = 'bots';

      this.angle = o.angle;
      this.force = o.power * 1.5;
      this.r = 1;
      this.startX = o.x;
      this.startY = o.y;
      this.t = 0;
      this.kill = false;
    }

    update(step) {
      super.update(step);

      this.t -= step;
      this.scale = 0.09;
      this.gravity = 9.8;

      this.dx = this.force * Math.cos( this.angle );
      this.dy = this.force * Math.sin( this.angle ) - this.gravity * this.t;

      this.x += this.dx * this.scale;
      this.y += this.dy * this.scale;

      if (this.shooter === 'p1' ) {
        if (this.x < 0)  {
          this.g.burst(this.x, this.y, 6, 7, 1);
          this.remove = true;
        }
        if (this.x - this.w > this.g.w) {
          this.x = 0;
        }
      } else if (this.shooter === 'p2') {
        if (this.x < 0)  this.x = this.g.w;
        if (this.x - this.w > this.g.w) {
          this.g.burst(this.x, this.y, 6, 7, 1);
          this.remove = true;
        }
      }
      if (this.y > this.g.h) {
        this.remove = true;
      }

      const hit = this.map.getPoint(this.x, this.y);

      if (hit) {
        this.map.setPoint(this.x, this.y, 0);
        this.g.boom(this.x, this.y, 10);
        this.g.shake.start(2, 0.5);
        this.remove = true;
      }
    }

    render() {
      super.render();
    }
  }

  class Skull extends Sprite {
    constructor(g, o) {
      o.frames = 1;
      o.scale = 1;
      o.i = 'skull';
      super(g, o);
      super(g, o);
      this.x = o.x;
      this.y = o.y || 0;
      this.group = 'skulls';

      this.vy = g.H.rnd(0, 300) * -1;
      this.vx = g.H.rnd(10, 100);
      if (this.x > (this.g.w / 2)) {
        this.vx *= -1;
      }
      this.hitPoint = false;

      this.kill = false;
      this.hits = 1;
    }

    update(step) {
      super.update(step);
      
      this.x += step * this.vx;
      this.y += step * this.vy;
      this.vy += 5;
      let tile = this.map.tile;

      const hit = this.map.getPoint(this.x, this.y);

      if (hit && this.hits) {
        this.hitPoint = {x: this.x, y: this.y};
        let x = this.x;
        let y = this.y;
        this.doBoom(x, y);
        this.doBoom(x + tile, y);
        this.doBoom(x - tile, y);
        this.doBoom(x, y + tile);
        this.doBoom(x, y - tile);
        this.hits -= 1;
      }

      if (this.hits < 0 || this.y > this.g.h) {
        this.remove = true;
      }

    }

    doBoom(x, y) {
      let w = this.g.w,
          h = this.g.h;
      if (x > w || x < 0 || y > h) {
        return;
      }
      this.map.setPoint(x, y, 0);
      this.g.boom(x, y, 10);
      this.g.shake.start(2, 0.5);
    }

    render() {
      super.render();
    }
  }

  class Text {

    constructor(g, o) {
      o.group = 'text';
      o.vy = o.vy || -10;
      o.vx = o.vx || 0;
      o.w = 10;
      o.w = 10;
      o.o = 1;
      o.alpha = 1;
      o.scale = o.scale || 4;
      o.col = o.col || 6;
      o.accel = o.accel || 0.5;
      o.fade = o.fade || 0.01;
      for (let n in o) {
        this[n] = o[n];
      }
      this.g = g;
      this.p = g.H.mkFont(g, o.scale, o.col);
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
        d.ctx.globalAlpha = this.alpha;
        d.text(this.text, this.p, this.x, this.y);
        d.ctx.globalAlpha = 1;
      } else if (this.o) {
        d.ctx.drawImage(this.i, this.x, this.y);
      }
    }
  }

  class Boom extends Sprite {

    constructor(g, o){
      o.col = o.col || 6;
      o.i = o.i || 'circle';
      super(g, o);
      this.startX = o.x;
      this.startY = o.y;
      this.group = 'na';
      this.magnitude = o.magnitude || 4;
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

      this.mkImg(this.o.i);
    }

    render() {
      let x = this.startX - (this.w /2),
          y = this.y - (this.h / 2),
          g = this.g;

      if (this.opacity < 1) {
        g.draw.ctx.globalAlpha = this.opacity;
      }
      g.draw.ctx.drawImage(this.i, x, y);

      if (this.opacity < 1) {
        g.draw.ctx.globalAlpha = 1;
      }
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
      this.vy = g.H.rnd(0, 300) * -1;
      this.col = o.col || 6;
      this.r = o.r || 1;
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
      this.g.draw.rect(this.x, this.y, this.w, this.h, this.col);
    }
  }

  class Fade {
    constructor(opts) {
      const g = opts.g;
      this.g = opts.g;
      this.col = g.options.pal[opts.col];
      this.y = opts.y;
      this.startY = opts.y;
      this.targetY = opts.targetY;
      this.done = false;
      this.changeTo = opts.changeTo || false;
    }

    update() {
      const g = this.g;
      let time = 250;
      let dist = this.targetY - this.y;
      this.y = ~~g.H.tween(33, this.y, dist, time);

      if (this.y > this.targetY - 10 || this.y === this.targetY) {
        this.done = true;
      }
    }

    render() {
      const g = this.g;
      g.draw.rect( 0, this.startY, g.w, this.y, this.col);
    }
  }

  // https://github.com/foumart/JS.13kGames by @foumartgames
  const SoundFX = (function() {

    let data = {};
    let ua = navigator.userAgent.toLowerCase();

    let ios = /ipad|iphone|ipod/.test(ua);

    function add(d) {
      data = d;
    }

    function play(id) {
      if (ios) { return; }
      playSound(data[id]);
    }

    function getMasterVolume(){ return 1; }
    const soundContext = new (window.AudioContext || window.webkitAudioContext)();
    // sine is the oscillator's default, but we use square as default
    const oscTypes = ['square', 'sawtooth', 'triangle', 'sine'];

  // https://codereview.stackexchange.com/questions/47889/alternative-to-setinterval-and-settimeout
    function _interval (callback, delay) {
      var now = Date.now,
        rAF = requestAnimationFrame,
        start = now(),
        stop,
        intervalFunc = function(){
          now() - start < delay || (start+=delay,callback());
          stop || rAF(intervalFunc);
        };
      rAF(intervalFunc);
      return {
        clear:function(){stop=1;}
      }
    }


    function playSound (d){

      let [_freq, _incr, _delay, _times, _vol, _type = 0] = d;

      const osc = soundContext.createOscillator(); // instantiate oscillator
      _type = _type === undefined ? 0 : _type;
      osc.frequency.value = _freq;
      osc.type = oscTypes[_type];

      const modulationGain = soundContext.createGain(); // instantiate modulation for sound volume control
      modulationGain.gain.value = 0;

      osc.connect(modulationGain);
      modulationGain.connect(soundContext.destination);
      osc.start();

      let i = 0;
      const interval = _interval(playTune, _delay);

      function playTune(){
        osc.frequency.value = _freq + _incr * i;
        modulationGain.gain.value = (1-(i/_times)) * _vol * getMasterVolume();
        i += 1;
        if (i > _times) {
          interval.clear();
          osc.stop();
        }
      }
    }
    return {
      add: add,
      play: play
    }
  })();

  const options = Data;
  options.states = { title : Title, 
    main: Main, options: Options, win: Win };
  options.ents = {
    bot: Bot, text: Text, boom: Boom, fade: Fade, bullet: Bullet,
    skull: Skull,
    sprite: Sprite,
    particle: Particle
  };
  options.SoundFX = SoundFX;

  new Game(options).init();

}());
