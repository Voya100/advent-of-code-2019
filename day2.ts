// https://adventofcode.com/2019/day/2
import * as fs from "fs";

const input = fs.readFileSync("inputs/day2.txt", "utf8");
const codeInput = input.split(",").map(str => +str);

function part1() {
  return getProgramOutput(12, 2);
}

function part2() {
  const expectedResult = 19690720;
  // Number of combinations is not too large, so brute force is efficient
  // for this solution.
  for (let noun = 0; noun <= 99; noun++) {
    for (let verb = 0; verb <= 99; verb++) {
      const result = getProgramOutput(noun, verb);
      if (result === expectedResult) {
        return 100 * noun + verb;
      }
    }
  }
  throw new Error("No matching result found.");
}

function getProgramOutput(argument1: number, argument2: number) {
  const code = [...codeInput];
  code[1] = argument1;
  code[2] = argument2;
  runProgram(code);
  return code[0];
}

function runProgram(code: number[]) {
  let instructionPointer = 0;
  while (runOperation(code, instructionPointer)) {
    instructionPointer += 4;
  }
}

function runOperation(code: number[], instructionPointer: number) {
  const [command, param1, param2, param3] = code.slice(
    instructionPointer,
    instructionPointer + 4
  );
  switch (command) {
    case 1:
      code[param3] = code[param1] + code[param2];
      break;
    case 2:
      code[param3] = code[param1] * code[param2];
      break;
    case 99:
      return false;
    default:
      throw new Error("Invalid command");
  }
  return true;
}

console.log("Part 1", part1());
console.log("Part 2", part2());
