// https://adventofcode.com/2019/day/12
import * as fs from "fs";
import { sum, multiply } from "./utils";

const input = fs.readFileSync("inputs/day12.txt", "utf8");

// Coordinates are in format <x=-7, y=17, z=-11>
const coordinates = input.split("\n").map(coordinate =>
  coordinate
    .slice(1, -1) // Remove < and >
    .split(",")
    .map(value => +value.split("=")[1])
);

console.log(coordinates);
function part1() {
  const moons = coordinates.map(([x, y, z]) => new Moon(x, y, z));
  for (let i = 0; i < 1000; i++) {
    runMoonPhase(moons);
  }
  return sum(moons, moon => moon.totalEnergy);
}

function part2() {
  // All coordinate axes are completely independent
  // If axis can return to its earlier state, it must have a loop which repeats itself.
  // Loop always starts and ends when velocity value is back to 0 and it has the original coordinate value
  // for each moon at the same time.
  // By finding individual loops for all axes, it can be determined when they intersect.
  // These individual loops are assumed to be much smaller than the bigger loop formed by them.
  const moons = coordinates.map(([x, y, z]) => new Moon(x, y, z));
  let xLoopLength, yLoopLength, zLoopLength;
  let i = 0;
  while (!xLoopLength || !yLoopLength || !zLoopLength) {
    i++;
    runMoonPhase(moons);
    if (
      !xLoopLength &&
      moons.every(moon => moon.xVelocity === 0 && moon.x === moon.xOriginal)
    ) {
      xLoopLength = i;
    }
    if (
      !yLoopLength &&
      moons.every(moon => moon.yVelocity === 0 && moon.y === moon.yOriginal)
    ) {
      yLoopLength = i;
    }
    if (
      !zLoopLength &&
      moons.every(moon => moon.zVelocity === 0 && moon.z === moon.zOriginal)
    ) {
      zLoopLength = i;
    }
  }
  // Find all factors and combine them to find smallest number divisible by all of them
  const factors = combineFactors([
    findFactors(xLoopLength),
    findFactors(yLoopLength),
    findFactors(zLoopLength)
  ]);
  return multiply(factors, factor => factor);
}

function runMoonPhase(moons: Moon[]) {
  moons.forEach(moon => moon.applyGravity(moons));
  moons.forEach(moon => moon.move());
}

function findFactors(number: number) {
  const factors = [];
  let numberToFactor = number;
  // Handle special case of being divisable by 2, which is the only even factor
  while (numberToFactor % 2 === 0) {
    factors.push(2);
    numberToFactor /= 2;
  }
  // Other cases
  let possibleFactor = 3;
  while (numberToFactor > 1) {
    if (numberToFactor % possibleFactor === 0) {
      factors.push(possibleFactor);
      numberToFactor /= possibleFactor;
      continue;
    }
    possibleFactor += 2;
  }
  return factors;
}

function combineFactors(factorsToCombine: number[][]) {
  const uniqueFactors = new Set(factorsToCombine.flat());
  const combinedFactors = [];
  for (let uniqueFactor of uniqueFactors) {
    const maxNumber = Math.max(
      ...factorsToCombine.map(
        factors => factors.filter(factor => factor === uniqueFactor).length
      )
    );
    combinedFactors.push(
      ...Array.from({ length: maxNumber }, () => uniqueFactor)
    );
  }
  return combinedFactors;
}

class Moon {
  public xVelocity = 0;
  public yVelocity = 0;
  public zVelocity = 0;

  public xOriginal: number;
  public yOriginal: number;
  public zOriginal: number;

  constructor(public x: number, public y: number, public z: number) {
    this.xOriginal = x;
    this.yOriginal = y;
    this.zOriginal = z;
  }

  applyGravity(moons: Moon[]) {
    for (let moon of moons) {
      if (this.x !== moon.x) {
        this.xVelocity += this.x < moon.x ? 1 : -1;
      }
      if (this.y !== moon.y) {
        this.yVelocity += this.y < moon.y ? 1 : -1;
      }
      if (this.z !== moon.z) {
        this.zVelocity += this.z < moon.z ? 1 : -1;
      }
    }
  }

  move() {
    this.x += this.xVelocity;
    this.y += this.yVelocity;
    this.z += this.zVelocity;
  }

  get totalEnergy() {
    return this.kineticEnergy * this.potentialEnergy;
  }

  get kineticEnergy() {
    return (
      Math.abs(this.xVelocity) +
      Math.abs(this.yVelocity) +
      Math.abs(this.zVelocity)
    );
  }

  get potentialEnergy() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
}

console.log("Part 1", part1());
console.log("Part 2", part2());
