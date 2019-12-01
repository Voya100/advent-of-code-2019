// https://adventofcode.com/2019/day/1
import * as fs from "fs";

const input = fs.readFileSync("inputs/day1.txt", "utf8");
const masses = input.split("\n").map(str => +str);

function part1(masses: number[]) {
  return masses.reduce((sum, mass) => sum + getFuel(mass), 0);
}

function part2(masses: number[]) {
  return masses.reduce((sum, mass) => sum + getTotalFuel(mass), 0);
}

function getFuel(mass: number) {
  return Math.floor(mass / 3) - 2;
}

function getTotalFuel(mass: number): number {
  const fuel = getFuel(mass);
  if (fuel <= 0) {
    return 0;
  }
  return fuel + getTotalFuel(fuel);
}

console.log("Part 1", part1(masses));
console.log("Part 2", part2(masses));
