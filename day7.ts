// https://adventofcode.com/2019/day/7
import * as fs from "fs";

const input = fs.readFileSync("inputs/day7.txt", "utf8");
const codeInput = input.split(",").map(str => +str);

function part1() {
  const phasePermutations = getAllPermutations([0, 1, 2, 3, 4]);
  let highestResult = 0;
  for (let phasePermutation of phasePermutations) {
    let output = 0;
    for (let phaseSetting of phasePermutation) {
      const program = createProgram(codeInput, [phaseSetting, output]);
      output = runProgram(program).outputs[0];
    }
    highestResult = Math.max(output, highestResult);
  }
  return highestResult;
}

function part2() {
  const phasePermutations = getAllPermutations([5, 6, 7, 8, 9]);
  let highestResult = 0;
  for (let phasePermutation of phasePermutations) {
    let output = 0;
    const programs = phasePermutation.map((val, index) =>
      createProgram(codeInput, [phasePermutation[index]])
    );

    let iterator = 0;
    while (true) {
      const index = iterator % programs.length;
      const program = programs[index];
      program.inputs.push(output);
      runProgram(program);
      output = program.outputs[program.outputs.length - 1];
      iterator++;
      if (program.hasEnded && index === programs.length - 1) {
        break;
      }
    }
    highestResult = Math.max(output, highestResult);
  }
  return highestResult;
}

function getAllPermutations(numbers: number[]): number[][] {
  if (numbers.length === 1) {
    return [numbers];
  }
  const permutations = [];
  // Get permutations for all values not including first one
  const subPermutations = getAllPermutations(numbers.slice(1));
  // Generate remaining permutations by inserting first value to all
  // possible positions
  for (let subPermutation of subPermutations) {
    for (let i = 0; i <= subPermutation.length; i++) {
      const permutation = [...subPermutation];
      permutation.splice(i, 0, numbers[0]);
      permutations.push(permutation);
    }
  }
  return permutations;
}

interface Program {
  code: number[];
  inputs: number[];
  outputs: number[];
  instructionPointer: number;
  inputPointer: number;
  hasEnded: boolean;
}

interface Command {
  params: ParamInfo[];
  run: (program: Program, ...params: number[]) => boolean | Promise<boolean>;
}

interface ParamInfo {
  alwaysPosition: boolean;
}

const COMMANDS: { [key: string]: Command } = {
  1: {
    params: [
      { alwaysPosition: false },
      { alwaysPosition: false },
      { alwaysPosition: true }
    ],
    run(program: Program, param1: number, param2: number, param3: number) {
      program.code[param3] = param1 + param2;
      return true;
    }
  },
  2: {
    params: [
      { alwaysPosition: false },
      { alwaysPosition: false },
      { alwaysPosition: true }
    ],
    run(program: Program, param1: number, param2: number, param3: number) {
      program.code[param3] = param1 * param2;
      return true;
    }
  },
  3: {
    params: [{ alwaysPosition: true }],
    run(program: Program, param1: number) {
      program.code[param1] = program.inputs[program.inputPointer];
      program.inputPointer++;
      return true;
    }
  },
  4: {
    params: [{ alwaysPosition: false }],
    run(program: Program, param1: number) {
      program.outputs.push(param1);
      return true;
    }
  },
  5: {
    params: [{ alwaysPosition: false }, { alwaysPosition: false }],
    run(program: Program, param1: number, param2: number) {
      if (param1 !== 0) {
        program.instructionPointer = param2;
      }
      return true;
    }
  },
  6: {
    params: [{ alwaysPosition: false }, { alwaysPosition: false }],
    run(program: Program, param1: number, param2: number) {
      if (param1 === 0) {
        program.instructionPointer = param2;
      }
      return true;
    }
  },
  7: {
    params: [
      { alwaysPosition: false },
      { alwaysPosition: false },
      { alwaysPosition: true }
    ],
    run(program: Program, param1: number, param2: number, param3: number) {
      program.code[param3] = param1 < param2 ? 1 : 0;
      return true;
    }
  },
  8: {
    params: [
      { alwaysPosition: false },
      { alwaysPosition: false },
      { alwaysPosition: true }
    ],
    run(program: Program, param1: number, param2: number, param3: number) {
      program.code[param3] = param1 === param2 ? 1 : 0;
      return true;
    }
  },
  99: {
    params: [],
    run() {
      return false;
    }
  }
};

const POSITION_MODE = "0";
const IMMEDIATE_MODE = "1";

function createProgram(codeInput: number[], inputs: number[]): Program {
  return {
    code: [...codeInput],
    instructionPointer: 0,
    inputs,
    inputPointer: 0,
    outputs: [],
    hasEnded: false
  };
}

function runProgram(program: Program) {
  while (!program.hasEnded) {
    // Ensure opCode has modes for all parameters
    const opCodeString = program.code[program.instructionPointer]
      .toString()
      .padStart(5, "0");
    const operation = COMMANDS[+opCodeString.slice(-2)];
    const params = getParams(
      program.code,
      program.instructionPointer,
      opCodeString,
      operation
    );
    let oldPointer = program.instructionPointer;
    const result = operation.run(program, ...params);
    program.hasEnded = result === false;
    if (program.instructionPointer === oldPointer) {
      program.instructionPointer += operation.params.length + 1;
    }
    if (operation === COMMANDS[4]) {
      // Is output
      return program;
    }
  }
  return program;
}

function getParams(
  code: number[],
  instructionPointer: number,
  opCodeString: string,
  operation: Command
) {
  const rawParams = code.slice(
    instructionPointer + 1,
    instructionPointer + 1 + operation.params.length
  );
  const parameterModes = opCodeString
    .slice(0, -2)
    .split("")
    .reverse();
  return rawParams.map((rawParam, index) =>
    parameterModes[index] === IMMEDIATE_MODE ||
    operation.params[index].alwaysPosition
      ? rawParam
      : code[rawParam]
  );
}

console.log("Part 1", part1());
console.log("Part 2", part2());
