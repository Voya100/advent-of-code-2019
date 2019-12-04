// https://adventofcode.com/2019/day/4
import * as fs from "fs";

const input = fs.readFileSync("inputs/day4.txt", "utf8");

const [rangeStart, rangeEnd] = input.split("-").map(value => +value);

function part1() {
  let count = 0;

  // Could be optimised by iterating only values that are valid (e.g. anything starting with '21' can be ignored),
  // but a simpler solution works just as well for these number ranges
  for (let i = rangeStart; i <= rangeEnd; i++) {
    if (meetsCriteria(i)) {
      count++;
    }
  }
  return count;
}

function part2() {
  let count = 0;
  for (let i = rangeStart; i <= rangeEnd; i++) {
    if (meetsCriteria2(i)) {
      count++;
    }
  }
  return count;
}

function meetsCriteria(number: number) {
  const numberString = number.toString();
  let hasAdjacentDigits = false;

  for (let i = 0; i < numberString.length; i++) {
    if (numberString[i - 1] === numberString[i]) {
      hasAdjacentDigits = true;
      if (numberString[i - 2] === numberString[i - 1]) {
      }
    }
    if (numberString[i - 1] > numberString[i]) {
      return false;
    }
  }
  return hasAdjacentDigits;
}

function meetsCriteria2(number: number) {
  const numberString = number.toString();
  let hasAdjacentDigits = false;

  for (let i = 0; i < numberString.length; i++) {
    // Can't have more than 2 adjacent
    if (
      numberString[i - 1] === numberString[i] &&
      numberString[i - 2] !== numberString[i] &&
      numberString[i] !== numberString[i + 1]
    ) {
      hasAdjacentDigits = true;
    }
    if (numberString[i - 1] > numberString[i]) {
      return false;
    }
  }
  return hasAdjacentDigits;
}

console.log("Part 1", part1());
console.log("Part 2", part2());
