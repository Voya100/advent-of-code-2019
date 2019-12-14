// https://adventofcode.com/2019/day/13
import * as fs from "fs";
import readline from "readline";

const input = fs.readFileSync("inputs/day13.txt", "utf8");
const codeInput = input.split(",").map(str => +str);

function part1() {
  const program = createProgram(codeInput, []);
  const grid: TileId[][] = [];
  updateGrid(program, grid);
  return grid.flatMap(row => row.filter(tile => tile === TileId.BLOCK)).length;
}

async function part2() {
  return await playGameWithCheating();
}

async function playGameWithCheating() {
  const code = [...codeInput];
  code[0] = 2;
  const program = createProgram(code, []);
  const grid: TileId[][] = [];
  updateGrid(program, grid);
  let score = 0;

  while (!program.hasEnded) {
    const scoreOutput = updateGrid(program, grid);
    if (scoreOutput) {
      score = scoreOutput;
    }

    let ballXPosition = grid
      .flatMap(row =>
        row.map((value, index) => (value === TileId.BALL ? index : -1))
      )
      .find(index => index !== -1);
    let paddleXPosition = grid
      .flatMap(row =>
        row.map((value, index) => (value === TileId.PADDLE ? index : -1))
      )
      .find(index => index !== -1);
    if (paddleXPosition < ballXPosition) {
      program.inputs.push(1);
    } else if (paddleXPosition > ballXPosition) {
      program.inputs.push(-1);
    } else {
      program.inputs.push(0);
    }
  }
  return score;
}

/**
 * Option to play the game yourself.
 * Rendres the game frames and asks for user input.
 */
async function playGameWithoutCheating() {
  const code = [...codeInput];
  code[0] = 2;
  const program = createProgram(code, []);
  const grid: TileId[][] = [];

  while (!program.hasEnded) {
    const scoreOutput = updateGrid(program, grid);
    renderGrid(grid);
    if (scoreOutput) {
      console.log("Score:", scoreOutput);
    }
    let userInput;
    while (!["a", "s", "d"].includes(userInput)) {
      userInput = await readInput();
    }
    switch (userInput) {
      case "s":
        program.inputs.push(0);
        break;
      case "a":
        program.inputs.push(-1);
        break;
      case "d":
        program.inputs.push(1);
        break;
    }
    updateGrid(program, grid);
    renderGrid(grid);
  }
}

function readInput(): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(
      "Make your move (a = left, s = nothing, d = right): ",
      answer => {
        rl.close();
        resolve(answer);
      }
    );
  });
}

function updateGrid(program: Program, grid: TileId[][]): number {
  let score;
  runProgram(program);
  while (program.outputs.length) {
    const [xPosition, yPosition, tileId] = program.outputs.splice(0, 3);
    if (xPosition === -1 && yPosition === 0) {
      // Return current score
      score = tileId;
      continue;
    }
    if (!grid[yPosition]) {
      grid[yPosition] = [];
    }
    grid[yPosition][xPosition] = tileId;
  }
  return score;
}

function renderGrid(grid: TileId[][]) {
  const renderOutput = grid.map(row => row.map(renderTile).join("")).join("\n");
  console.log("Game status: \n" + renderOutput);
}

function renderTile(tile: TileId) {
  switch (tile) {
    case TileId.EMPTY:
      return " ";
    case TileId.WALL:
      return "*";
    case TileId.BLOCK:
      return "#";
    case TileId.PADDLE:
      return "_";
    case TileId.BALL:
      return "O";
    default:
      throw new Error(`Tile type ${tile} not defined.`);
  }
}

enum TileId {
  EMPTY = 0,
  WALL = 1,
  BLOCK = 2,
  PADDLE = 3,
  BALL = 4
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
    const opCodeString = program.code[program.instructionPointer]
      .toString()
      .padStart(5, "0");
    const operation = COMMANDS[+opCodeString.slice(-2)];
    if (
      operation === COMMANDS[3] &&
      program.inputs[program.inputPointer] === undefined
    ) {
      // Is input, pause the program
      return program;
    }
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

(async () => {
  console.log("Part 1", part1());
  console.log("Part 2", await part2());
})();
