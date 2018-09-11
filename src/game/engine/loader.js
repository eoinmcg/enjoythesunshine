export default class Loader {
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
