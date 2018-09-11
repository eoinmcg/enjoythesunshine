export default {
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
