import H from './helpers';

export default class Draw {
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
