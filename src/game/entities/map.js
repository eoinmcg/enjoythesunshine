const Map = {
  tile: 8,
  data: [],
  generate(w, h, draw) {
    let x = w / Map.tile;
    let y = h / Map.tile;
    Map.data = [];
    Map.draw = draw;

    for (let yArr = 0; yArr < y; yArr += 1) {
      let tmp = [];
      for (let xArr = 0; xArr < x; xArr += 1) {
        tmp.push(0);
      }
      Map.data.push(tmp);
    }
    for (let blocks = 0; blocks < x; blocks += 1) {
      Map.addBuilding(blocks, Map.data.length, 2, Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 1) + 1);
    }
  },
  addBuilding(x, y, w, h, col) {
    for (let xPos = 0; xPos < w; xPos += 1) {
      for (let yPos = 1; yPos < h; yPos += 1) {
        Map.data[y - yPos][xPos + x] = col;
      }
    }
  },
  render(dt) {
    let x = Map.data[0].length;
    let y = Map.data.length;
    for (let yArr = 0; yArr < y; yArr += 1) {
      for (let xArr = 0; xArr < x; xArr += 1) {
        try {
          let tile = Map.data[yArr][xArr];
          if (tile) {
            Map.draw.rect(xArr * Map.tile, yArr * Map.tile, Map.tile, Map.tile, 10);
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  },
  getPoint(x, y) {
    x = Math.floor(x / Map.tile);
    y = Math.floor(y / Map.tile);
    if (Map.data[y] && Map.data[y][x]) {
      return Map.data[y][x];
    }
  },
  setPoint(x, y, val = 0) {
    x = ~~(x / Map.tile);
    y = ~~(y / Map.tile);
    if (Map.data[y]) {
      Map.data[y][x] = val;
    }
  },
};

export { Map };
