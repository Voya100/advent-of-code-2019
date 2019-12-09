// https://adventofcode.com/2019/day/9
import * as fs from "fs";

const input = fs.readFileSync("inputs/day9.txt", "utf8");
const codeInput = input.split(",").map(str => +str);

function part1() {
  const program = createProgram(codeInput, [1]);
  while (!program.hasEnded) {
    runProgram(program);
  }
  return program.outputs;
}

function part2() {
  const program = createProgram(codeInput, [2]);
  while (!program.hasEnded) {
    runProgram(program);
  }
  return program.outputs;
}

interface Program {
  code: number[];
  inputs: number[];
  outputs: number[];
  instructionPointer: number;
  inputPointer: number;
  hasEnded: boolean;
  relativeBase: number;
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
  9: {
    params: [{ alwaysPosition: false }],
    run(program: Program, param1: number) {
      program.relativeBase += param1;
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
const RELATIVE_MODE = "2";

function createProgram(codeInput: number[], inputs: number[]): Program {
  return {
    code: [...codeInput],
    instructionPointer: 0,
    inputs,
    inputPointer: 0,
    outputs: [],
    hasEnded: false,
    relativeBase: 0
  };
}

function runProgram(program: Program) {
  while (!program.hasEnded) {
    // Ensure opCode has modes for all parameters
    //console.console.log(program);
    const opCodeString = program.code[program.instructionPointer]
      .toString()
      .padStart(5, "0");
    const operation = COMMANDS[+opCodeString.slice(-2)];
    const params = getParams(
      program,
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
  program: Program,
  instructionPointer: number,
  opCodeString: string,
  operation: Command
) {
  const rawParams = program.code
    .slice(
      instructionPointer + 1,
      instructionPointer + 1 + operation.params.length
    )
    .map(value => value || 0);

  while (rawParams.length < operation.params.length) {
    rawParams.push(0);
  }

  const parameterModes = opCodeString
    .slice(0, -2)
    .split("")
    .reverse();
  return rawParams.map((rawParam, index) =>
    getParam(program, parameterModes[index], rawParam, operation.params[index])
  );
}

function getParam(
  program: Program,
  parameterMode: string,
  rawParam: number,
  paramInfo: ParamInfo
) {
  if (parameterMode === IMMEDIATE_MODE) {
    return rawParam;
  }
  if (parameterMode === RELATIVE_MODE && paramInfo.alwaysPosition) {
    return program.relativeBase + rawParam;
  }
  if (parameterMode === RELATIVE_MODE) {
    return program.code[program.relativeBase + rawParam] || 0;
  }
  if (parameterMode === POSITION_MODE && paramInfo.alwaysPosition) {
    return rawParam;
  }
  return program.code[rawParam] || 0;
}

console.log("Part 1", part1());
console.log("Part 2", part2());
