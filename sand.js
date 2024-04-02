const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [2048, 2048],
  animate: true,
};

params = {
  cellSize: 0,
  cols: 0,
  rows: 0,
  arr: null,
  mouseDown: false,
  h: 1,
  s: 1,
  v: 1,
};

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows).fill(new Array(3).fill(0));
  }
  return arr;
}

function ScaleMouse(x, y, rect, canvas) {
  const scaleX = canvas.width / rect.width; // stosunek skalowania X
  const scaleY = canvas.height / rect.height; // stosunek skalowania Y

  const scaledX = (x - rect.left) * scaleX; // przeliczone X
  const scaledY = (y - rect.top) * scaleY; // przeliczone Y

  return [scaledX, scaledY];
}

function hsvToHsl(h, s, v) {
  const l = v - (v * s) / 2;
  const m = Math.min(l, 1 - l);
  s = m ? (v - l) / m : 0;
  return [h, s * 100, l * 100]; // Zwraca HSL jako procenty
}

function get_random(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function setup() {
  params.cellSize = 16;
  params.cols = settings.dimensions[0] / params.cellSize;
  params.rows = settings.dimensions[1] / params.cellSize;
  params.arr = make2DArray(params.cols, params.rows);
}

function draw(context) {
  previousColor = context.fillStyle;

  for (let i = 0; i < params.cols; i++) {
    for (let j = 0; j < params.rows; j++) {
      if (params.arr[i][j][0] != 0) {
        const [hue, saturation, lightness] = hsvToHsl(
          params.arr[i][j][0],
          params.arr[i][j][1],
          params.arr[i][j][2]
        );
        context.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        context.fillRect(
          i * params.cellSize,
          j * params.cellSize,
          params.cellSize,
          params.cellSize
        );
      }
    }
  }
  context.fillStyle = previousColor;
}

function updateSand() {
  previousArr = JSON.parse(JSON.stringify(params.arr));
  for (let i = 0; i < params.cols; i++) {
    for (let j = 0; j < params.rows - 1; j++) {
      if (previousArr[i][j][0] == 0) continue; // jeżeli nie ma piasku to nie updatuj

      let direction = get_random([-1, 1]);

      if (previousArr[i][j + 1][0] == 0) {
        params.arr[i][j] = new Array(3).fill(0);
        params.arr[i][j + 1] = previousArr[i][j];
      } else if (
        i - direction < params.cols &&
        i - direction > 0 &&
        previousArr[i - direction][j + 1][0] == 0
      ) {
        params.arr[i][j] = new Array(3).fill(0);
        params.arr[i - direction][j + 1] = previousArr[i][j];
      } else if (
        i + direction < params.cols &&
        i + direction > 0 &&
        previousArr[i + direction][j + 1][0] == 0
      ) {
        params.arr[i][j] = new Array(3).fill(0);
        params.arr[i + direction][j + 1] = previousArr[i][j];
      }
    }
  }
}

const sketch = () => {
  setup();
  return ({ context, width, height, frame }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    updateSand();

    params.h += 0.01;
    params.s += (Math.random() - 0.5) * 0.01;
    params.v += (Math.random() - 0.5) * 0.01;

    const [hue, saturation, lightness] = hsvToHsl(params.h, params.s, params.v);
    draw(context, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
  };
};

const startSketch = async () => {
  const manager = await canvasSketch(sketch, settings);
  const canvas = manager.props.canvas;

  canvas.addEventListener("mousedown", function (event) {
    const rect = canvas.getBoundingClientRect();
    cords = ScaleMouse(event.clientX, event.clientY, rect, canvas);

    const col = Math.floor(cords[0] / params.cellSize);
    const row = Math.floor(cords[1] / params.cellSize);
    params.mouseDown = true;

    if (
      col >= 0 &&
      col <= params.cols &&
      row >= 0 &&
      row <= params.rows &&
      params.arr[col][row][0] == 0
    )
      params.arr[col][row] = [params.h, params.s, params.v];
  });

  canvas.addEventListener("mouseup", function (event) {
    params.mouseDown = false;
  });

  canvas.addEventListener("mousemove", function (event) {
    if (params.mouseDown == true) {
      const rect = canvas.getBoundingClientRect();
      cords = ScaleMouse(event.clientX, event.clientY, rect, canvas);

      const col = Math.floor(cords[0] / params.cellSize);
      const row = Math.floor(cords[1] / params.cellSize);

      if (
        col >= 0 &&
        col <= params.cols &&
        row >= 0 &&
        row <= params.rows &&
        params.arr[col][row][0] == 0
      )
        params.arr[col][row] = [params.h, params.s, params.v];
    }
  });
};

startSketch();
