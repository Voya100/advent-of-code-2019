// https://adventofcode.com/2019/day/10
import * as fs from "fs";
import { max } from "./utils";

const input = fs.readFileSync("inputs/day10.txt", "utf8");
const map = input.split("\n").map(str => str.split("")) as MapValue[][];

// Note: Current part 1 solution does not currently scale to larger inputs
// It should be refactored to use angles similarly to part 2 (TODO)

enum MapValue {
  EMPTY = ".",
  ASTEROID = "#"
}

interface Coordinate {
  x: number;
  y: number;
}

function part1() {
  const distanceMap: [Coordinate, number][][] = map.map((row, y) =>
    row.map((column, x) => [
      { x, y },
      calculateDetectedAsteroids(map, { x, y })
    ])
  );
  const distanceCoordinates = distanceMap.flat();
  const mostDetected = max(
    distanceCoordinates,
    ([coordinate, detected]) => detected
  );
  return mostDetected[1];
}

function part2() {
  const distanceMap: [Coordinate, number][][] = map.map((row, y) =>
    row.map((column, x) => [
      { x, y },
      calculateDetectedAsteroids(map, { x, y })
    ])
  );
  const distanceCoordinates = distanceMap.flat();
  const mostDetected = max(
    distanceCoordinates,
    ([coordinate, detected]) => detected
  );
  const laserCoordinate = mostDetected[0];
  const asteroids = map
    .flatMap((row, y) =>
      row.map((value, x) => ({
        coordinate: { x, y },
        value
      }))
    )
    .filter(({ value }) => value === MapValue.ASTEROID)
    .filter(
      ({ coordinate }) =>
        coordinate.x !== laserCoordinate.x || coordinate.y !== laserCoordinate.y
    );
  const asteroidsWithDirections = asteroids.map(({ coordinate }) => ({
    coordinate,
    angle: getDirectionAngle(laserCoordinate, coordinate),
    distance: getDistance(laserCoordinate, coordinate),
    isDestroyed: false
  }));
  asteroidsWithDirections.sort((asteroid1, asteroid2) => {
    if (asteroid1.angle !== asteroid2.angle) {
      return asteroid1.angle < asteroid2.angle ? -1 : 1;
    }
    return asteroid1.distance < asteroid2.distance ? -1 : 1;
  });
  let i = 0;
  let previousAngle;
  let previousIndex;
  let asteroidToDelete;
  for (let j = 0; j < 200; j++) {
    // Find next suitable asteroid
    while (
      asteroidsWithDirections[i].isDestroyed ||
      asteroidsWithDirections[i].angle === previousAngle
    ) {
      i = (i + 1) % asteroidsWithDirections.length;
      if (i === previousIndex) {
        // There is a full 360 rotation, reset the angle
        previousAngle = undefined;
      }
    }
    asteroidToDelete = asteroidsWithDirections[i];
    asteroidToDelete.isDestroyed = true;
    previousAngle = asteroidToDelete.angle;
    previousIndex = i;
    i = (i + 1) % asteroidsWithDirections.length;
  }
  return asteroidToDelete.coordinate.x * 100 + asteroidToDelete.coordinate.y;
}

function calculateDetectedAsteroids(map: MapValue[][], { x, y }: Coordinate) {
  if (map[y][x] === MapValue.EMPTY) {
    return 0;
  }
  let counter = 0;
  for (let jStep = -y; jStep < map.length - y; jStep++) {
    for (let iStep = -x; iStep < map[0].length - x; iStep++) {
      if (hasCommonFactors(iStep, jStep)) {
        // Duplicate since can be replicated with smaller steps
        // (e.g. step [2,2] = 2*[1,1])
        continue;
      }
      let i = x + iStep;
      let j = y + jStep;
      // Look to all directions by going all allowed step sizes
      while (0 <= i && i < map[0].length && 0 <= j && j < map.length) {
        if (map[j][i] === MapValue.ASTEROID) {
          counter++;
          break;
        }
        i += iStep;
        j += jStep;
      }
    }
  }
  return counter;
}

function getDirectionAngle(coordinate1: Coordinate, coordinate2: Coordinate) {
  const angleToX = Math.atan2(
    coordinate2.y - coordinate1.y,
    coordinate2.x - coordinate1.x
  );
  const angleToUp = angleToX + Math.PI / 2;
  return angleToUp < 0 ? angleToUp + 2 * Math.PI : angleToUp;
}

function getDistance(coordinate1: Coordinate, coordinate2: Coordinate) {
  return Math.sqrt(
    (coordinate1.x - coordinate2.x) ** 2 + (coordinate1.y - coordinate2.y) ** 2
  );
}

function hasCommonFactors(number1: number, number2: number) {
  // Note: does not scale!
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
  return primes.some(prime => number1 % prime === 0 && number2 % prime === 0);
}

console.log("Part 1", part1());
console.log("Part 2", part2());
