// https://adventofcode.com/2019/day/3
import * as fs from "fs";

const input = fs.readFileSync("inputs/day3.txt", "utf8");

const [wire1, wire2] = input.split("\n").map(operations =>
  operations.split(",").map(operation => ({
    direction: operation[0],
    amount: +operation.slice(1)
  }))
);

function part1() {
  const wireCoordinates1 = getWireCoordinates(wire1);
  const wireCoordinates2 = getWireCoordinates(wire2);
  const intersections = getIntersection(wireCoordinates1, wireCoordinates2);
  const distances = intersections.map(getDistance);
  return Math.min(...distances);
}

function part2() {
  const wireCoordinates1 = getWireCoordinates(wire1);
  const wireCoordinates2 = getWireCoordinates(wire2);
  const intersections = getIntersection(wireCoordinates1, wireCoordinates2);
  const distances = intersections.map(
    key => wireCoordinates1.get(key) + wireCoordinates2.get(key)
  );
  return Math.min(...distances);
}

interface Operation {
  direction: string;
  amount: number;
}

function getWireCoordinates(operations: Operation[]) {
  // Map consists of coordinate <-> distanceOnWire pairs
  const coordinates = new Map();
  let coordinateX = 0;
  let coordinateY = 0;
  let totalDistance = 0;
  // Iterate all coordinates
  // Not most performant solution, but simple and suitable for this case
  for (let { direction, amount } of operations) {
    while (amount > 0) {
      switch (direction) {
        case "U":
          coordinateY += 1;
          break;
        case "R":
          coordinateX += 1;
          break;
        case "D":
          coordinateY -= 1;
          break;
        case "L":
          coordinateX -= 1;
          break;
        default:
          throw new Error("Unknown direction: " + direction + ":" + amount);
      }
      totalDistance++;
      amount--;
      const coordinate = coordinateX + "," + coordinateY;
      if (!coordinates.has(coordinate)) {
        coordinates.set(coordinate, totalDistance);
      }
    }
  }
  return coordinates;
}

/**
 * Returns keys (= coordinates) shared by both maps
 */
function getIntersection<K, V>(map1: Map<K, V>, map2: Map<K, V>) {
  return [...map1.keys()].filter(value => map2.has(value));
}

/**
 * Manhattan distance to origin
 */
function getDistance(coordinateString: string) {
  const coordinate = coordinateString.split(",");
  return Math.abs(+coordinate[0]) + Math.abs(+coordinate[1]);
}

console.log("Part 1", part1());
console.log("Part 2", part2());
