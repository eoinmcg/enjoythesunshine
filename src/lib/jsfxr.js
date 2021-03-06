function SfxrParams() {
  this.set = function(r) {
    for (var a = 0; 24 > a; a++) this[String.fromCharCode(97 + a)] = r[a] || 0;
    this.c < .01 && (this.c = .01);
    var e = this.b + this.c + this.e;
    if (.18 > e) {
      var s = .18 / e;
      this.b *= s, this.c *= s, this.e *= s
    }
  }
}

function SfxrSynth() {
  var r = this;
  this._params = new SfxrParams;
  var a, e, s, t, n, i, h, f, c, v, o, u;
  r.r = function() {
    var a = r._params;
    t = 100 / (a.f * a.f + .001), n = 100 / (a.g * a.g + .001), i = 1 - a.h * a.h * a.h * .01, h = -a.i * a.i * a.i * 1e-6, a.a || (o = .5 - a.n / 2, u = 5e-5 * -a.o), f = 1 + a.l * a.l * (a.l > 0 ? -.9 : 10), c = 0, v = 1 == a.m ? 0 : (1 - a.m) * (1 - a.m) * 2e4 + 32
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
          z = s
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
          R = 0, N = !0
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
            K = ar[Math.abs(32 * X / H | 0)]
        }
        y && (G = W, g *= x, 0 > g ? g = 0 : g > .1 && (g = .1), S ? (V += (K - W) * g, V *= F) : (W = K, V = 0), W += V, T += W - G, T *= 1 - k, K = T), A && (rr[Y % 1024] = K, K += rr[(Y - I + 1024) % 1024], Y++), L += K
      }
      L *= .125 * R * d, b[er] = L >= 1 ? 32767 : -1 >= L ? -32768 : 32767 * L | 0
    }
    return m
  }
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
      h += i[f >> 18] + i[f >> 12 & 63] + i[f >> 6 & 63] + i[63 & f]
    }
    return h
  };

export default jsfxr;
