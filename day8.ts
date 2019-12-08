// https://adventofcode.com/2019/day/8
import * as fs from "fs";
import { min } from "./utils";

const input = fs
  .readFileSync("inputs/day8.txt", "utf8")
  .split("")
  .map(str => +str);

const WIDTH = 25;
const HEIGHT = 6;

function part1() {
  const layers = createImageLayers();
  const fewestZeroes = min(
    layers,
    layer => layer.filter(value => value === 0).length
  );
  const ones = fewestZeroes.filter(value => value === 1).length;
  const twos = fewestZeroes.filter(value => value === 2).length;
  return ones * twos;
}

function part2() {
  const layers = createImageLayers();
  const image = combineLayers(layers);
  return renderImage(image);
}

function createImageLayers() {
  const values = [...input];
  const layers = [];
  while (values.length) {
    layers.push(values.splice(0, WIDTH * HEIGHT));
  }
  return layers;
}

const WHITE = 1;
const TRANSPARENT = 2;

function combineLayers(layers: number[][]) {
  const result = [];
  for (let i = 0; i < layers[0].length; i++) {
    let color = TRANSPARENT;
    for (let layer of layers) {
      color = layer[i];
      // Stop at first non-transparent color
      if (color !== TRANSPARENT) {
        break;
      }
    }
    result.push(color);
  }
  return result;
}

function renderImage(imageInput: number[]) {
  // Console log colors
  const image = imageInput.map(c => (c == WHITE ? "\x1b[47m " : "\x1b[40m "));
  const resetColor = "\x1b[0m";
  const rows = [];
  while (image.length) {
    rows.push(image.splice(0, WIDTH).join("") + resetColor);
  }
  return rows.join("\n");
}

console.log("Part 1", part1());
console.log("Part 2", "\n" + part2());
