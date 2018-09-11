export default class Canvas {
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
