// https://adventofcode.com/2019/day/16
import * as fs from "fs";
import { sum } from "./utils";

const input = fs.readFileSync("inputs/day16.txt", "utf8");

const numberInput = input.split("").map(value => +value);

function part1() {
  return fft(numberInput, 100)
    .slice(0, 8)
    .join("");
}

function part2() {
  const repeatedInput = input
    .repeat(10000)
    .split("")
    .map(value => +value);
  const offset = +input.slice(0, 7);
  if (offset < repeatedInput.length / 2) {
    // Implementation relies on the fact that pattern after the number always
    // consists of 1s, which is true for indexes after midway.
    // This is not a fully generalised solution, so only works for 50 % of possible cases
    throw new Error("Not supported");
  }
  // Solve values only for numbers after offset
  for (let phase = 0; phase < 100; phase++) {
    for (let i = repeatedInput.length - 2; i >= offset; i--) {
      // If index is greater than midway, number is only based on numbers after it
      // Pattern looks like 0,0,0,0,0,0,...,1 [index here], 1, 1, 1, 1...
      // So output[index] = input[index] + input[index+1] + input[index+2] + ...
      //                  = input[index] + input[index+1] + output[index+2]
      //                  = input[index] + output[index+1]
      // This calculation is optimised by counting sums from the end towards the offset index
      repeatedInput[i] = (repeatedInput[i] + repeatedInput[i + 1]) % 10;
    }
  }
  return repeatedInput.slice(offset, offset + 8).join("");
}

// Slightly naive implementation that could be improved by using similar approach as in part 2,
// except it would also need to handle negative multipliers
function fft(startInput: number[], phases: number) {
  let input = startInput;
  for (let phase = 0; phase < phases; phase++) {
    let output = [];
    for (let i = 0; i < input.length; i++) {
      output[i] = calculateValue(input, i);
    }
    input = output;
  }
  return input;
}

function calculateValue(input: number[], index: number) {
  const inputSum = sum(
    input,
    (inputNumber, i) => inputNumber * getPatternValue(i, index + 1)
  );
  return Math.abs(inputSum) % 10;
}

function getPatternValue(index: number, size: number) {
  const patternSize = 4 * size;
  const trueIndex = (index + 1) % patternSize;
  const numberIndex = Math.floor(trueIndex / size);
  if (numberIndex === 0 || numberIndex === 2) {
    return 0;
  } else if (numberIndex === 1) {
    return 1;
  } else if (numberIndex === 3) {
    return -1;
  }
  throw new Error("Invalid number index");
}

console.log("Part 1", part1());
console.log("Part 2", part2());
