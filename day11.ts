// https://adventofcode.com/2019/day/11
import * as fs from "fs";
import { min, max } from "./utils";

const input = fs.readFileSync("inputs/day11.txt", "utf8");
const codeInput = input.split(",").map(str => +str);

enum Color {
  BLACK = 0,
  WHITE = 1
}
enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT
}

interface Coordinate {
  x: number;
  y: number;
}

// Clockwise order
const directions = [
  Direction.UP,
  Direction.RIGHT,
  Direction.DOWN,
  Direction.LEFT
];

function part1() {
  const colorMap = runPaintBot();
  return colorMap.size;
}

function part2() {
  const colorMap = runPaintBot(Color.WHITE);
  return renderColorMap(colorMap);
}

function runPaintBot(startColor = Color.BLACK) {
  const colorMap = new Map<string, number>();
  const program = createProgram(codeInput, [startColor]);
  let direction = Direction.UP;
  let coordinate = { x: 0, y: 0 };
  // Program stops at output, so needs to be run twice on each round
  runProgram(program);
  runProgram(program);
  while (!program.hasEnded) {
    // Outputs are taken in reverse order, one being left/right and other the color
    direction = program.outputs.pop()
      ? turnRight(direction)
      : turnLeft(direction);
    colorMap.set(getCoordinateKey(coordinate), program.outputs.pop());
    coordinate = moveForward(coordinate, direction);
    // Default to black
    program.inputs.push(
      colorMap.has(getCoordinateKey(coordinate))
        ? colorMap.get(getCoordinateKey(coordinate))
        : Color.BLACK
    );
    runProgram(program);
    runProgram(program);
  }
  return colorMap;
}

function turnRight(direction: Direction) {
  return directions[(directions.indexOf(direction) + 1) % directions.length];
}

function turnLeft(direction: Direction) {
  return directions[
    (directions.indexOf(direction) + directions.length - 1) % directions.length
  ];
}

function moveForward({ x, y }: Coordinate, direction: Direction) {
  switch (direction) {
    case Direction.UP:
      return { x, y: y + 1 };
    case Direction.RIGHT:
      return { x: x + 1, y };
    case Direction.DOWN:
      return { x, y: y - 1 };
    case Direction.LEFT:
      return { x: x - 1, y };
  }
}

function getCoordinateKey(coordinate: Coordinate) {
  return coordinate.x + "," + coordinate.y;
}

function renderColorMap(colorMap: Map<string, Color>) {
  const coordinates = [...colorMap.keys()].map(key =>
    key.split(",").map(value => +value)
  );
  const minX = min(coordinates, ([x, y]) => x)[0];
  const minY = min(coordinates, ([x, y]) => y)[1];
  const maxX = max(coordinates, ([x, y]) => x)[0];
  const maxY = max(coordinates, ([x, y]) => y)[1];
  // Normalise coordinates
  const normalisedColorMapEntries = [...colorMap.entries()].map(
    ([key, color]) => {
      const x = +key.split(",")[0] - minX;
      const y = +key.split(",")[1] - minY;
      return [getCoordinateKey({ x, y }), color] as [string, Color];
    }
  );
  const normalisedColorMap = new Map<string, Color>(normalisedColorMapEntries);
  return renderNormalisedColorMap(
    normalisedColorMap,
    maxX - minX + 1,
    maxY - minY + 1
  );
}

function renderNormalisedColorMap(
  colorMap: Map<string, Color>,
  maxX: number,
  maxY: number
) {
  const rows = [];
  for (let j = 0; j < maxY; j++) {
    const row = [];
    for (let i = 0; i < maxX; i++) {
      const key = getCoordinateKey({ x: i, y: j });
      row.push(colorMap.has(key) ? colorMap.get(key) : Color.BLACK);
    }
    const resetColor = "\x1b[0m";
    rows.push(
      row.map(c => (c == Color.WHITE ? "\x1b[47m " : "\x1b[40m ")).join("") +
        resetColor
    );
  }
  // Switch y direction
  return rows.reverse().join("\n");
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
console.log("Part 2", "\n" + part2());
