// https://adventofcode.com/2019/day/17
import * as fs from "fs";
import { runProgram, createProgram, Program } from "./int-code-computer";
import { sum } from "./utils";

const input = fs.readFileSync("inputs/day17.txt", "utf8");
const codeInput = input.split(",").map(str => +str);

const MEMORY_LIMIT = 20;

function part1() {
  const map = createMap();
  return sum(getIntersections(map), ([x, y]) => x * y);
}

function part2() {
  const map = createMap();
  const bot = new VacuumBot(map);
  const compiledIntCode = bot.getIntCodeCommands();
  const code = [...codeInput];
  code[0] = 2;
  const program = createProgram(code, compiledIntCode);
  program.inputs.push("y".charCodeAt(0), "\n".charCodeAt(0));
  runProgram(program);
  return program.outputs[program.outputs.length - 1];
}

function createMap() {
  const program = createProgram(codeInput, []);
  runProgram(program);
  return program.outputs
    .map(number => String.fromCharCode(number))
    .join("")
    .split("\n")
    .map(row => row.split(""));
}

function getIntersections(map: string[][]) {
  return map.flatMap((row, j) =>
    row.map((char, i) => [i, j]).filter(([x, y]) => isIntersection(map, x, y))
  );
}

function isIntersection(map: string[][], x: number, y: number) {
  return (
    map[y - 1] &&
    map[y + 1] &&
    map[y][x] === "#" &&
    map[y - 1][x] === "#" &&
    map[y + 1][x] === "#" &&
    map[y][x - 1] === "#" &&
    map[y][x + 1] === "#"
  );
}

enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3
}

const directions = [
  Direction.UP,
  Direction.RIGHT,
  Direction.DOWN,
  Direction.LEFT
];

class VacuumBot {
  direction = Direction.UP;
  commands: string = "";
  x: number;
  y: number;

  constructor(private map: string[][]) {
    const startingPosition = map
      .flatMap((row, j) =>
        row.map((char, i) => [char, i, j] as [string, number, number])
      )
      .find(([char]) => char === "^");
    this.x = startingPosition[1];
    this.y = startingPosition[2];
  }

  getIntCodeCommands() {
    const [functions, routine] = this.getFunctionsAndRoutine();
    const combinedString = [routine, ...functions]
      .map(this.toAsciiCodeLine)
      .join("");
    return this.convertAsciiToIntCode(combinedString);
  }

  private getFunctionsAndRoutine(): [string[], string] {
    this.calculateRoute();
    const possibleFunctions = this.findPossibleFunctions();
    const functionCombinations = this.creteCombinationsOfThreeGenerator(
      possibleFunctions
    );

    for (let functions of functionCombinations) {
      const routine = this.solveRoutine(this.commands, functions, [
        "A",
        "B",
        "C"
      ]);
      if (routine.length && routine.length <= MEMORY_LIMIT) {
        return [functions, routine];
      }
    }
    throw new Error("Routine not found.");
  }

  private calculateRoute() {
    let foundDeadend = false;
    while (!foundDeadend) {
      this.moveForwardUntilEdge();
      foundDeadend = !this.rotateTowardsScaffold();
    }
  }

  /**
   * Generates arrays of function combinations (3 functions)
   * Applies some filtering for performance.
   * Generators used to reduce memory usage
   * @param possibleFunctions
   */
  *creteCombinationsOfThreeGenerator(
    possibleFunctions: string[]
  ): Generator<string[]> {
    // Takes commas into account
    const minLength = this.commands.length / MEMORY_LIMIT / 2;
    for (let i = 0; i < possibleFunctions.length; i++) {
      for (let j = i + 1; j < possibleFunctions.length; j++) {
        for (let k = j + 1; k < possibleFunctions.length; k++) {
          const functions = [
            possibleFunctions[i],
            possibleFunctions[j],
            possibleFunctions[k]
          ];
          // Start and end must be in functions
          if (!functions.some(func => this.commands.startsWith(func))) {
            continue;
          }
          if (!functions.some(func => this.commands.endsWith(func))) {
            continue;
          }
          if (functions.every(func => func.length < minLength)) {
            // If all functions are small, it is not possible to create the program with them
            continue;
          }
          yield [
            possibleFunctions[i],
            possibleFunctions[j],
            possibleFunctions[k]
          ];
        }
      }
    }
  }

  fitsInMemory(functionCommand: string) {
    return this.toAsciiCodeLine(functionCommand).length - 1 <= MEMORY_LIMIT;
  }

  convertAsciiToIntCode(commandStr: string) {
    return commandStr.split("").map(char => char.charCodeAt(0));
  }

  private toAsciiCodeLine(commandStr: string) {
    let ascii = "";
    let previousChar: string;
    for (let char of commandStr) {
      if (isNaN(+char) || isNaN(+previousChar)) {
        // Only add comma when both are not numbers, since
        // digits same number (e.g. 10) should not be separad by commas
        ascii += ",";
      }
      ascii += char;
      previousChar = char;
    }
    // Remove first comma
    return ascii.slice(1) + "\n";
  }

  solveRoutine(
    commandString: string,
    functions: string[],
    functionNames: string[]
  ): string {
    let bestRoutine = "";
    for (let i = 0; i < functions.length; i++) {
      const functionStr = functions[i];
      if (functionStr === commandString) {
        return functionNames[i];
      }
      if (commandString.startsWith(functionStr)) {
        const routine = this.solveRoutine(
          commandString.slice(functionStr.length),
          functions,
          functionNames
        );
        if (routine.length < bestRoutine.length || (!bestRoutine && routine)) {
          bestRoutine = functionNames[i] + routine;
        }
      }
    }
    return bestRoutine;
  }

  findPossibleFunctions() {
    const maxFunctionLength = MEMORY_LIMIT;
    const functions = new Set<string>();

    // Go through all possible options.
    // Not too slow because max length is limited
    for (let i = 0; i < this.commands.length; i++) {
      for (let j = 1; j < maxFunctionLength; j++) {
        const func = this.commands.slice(i, i + j);
        if (!this.fitsInMemory(func)) {
          continue;
        }
        functions.add(func);
      }
    }
    return [...functions.values()];
  }

  private moveForwardUntilEdge() {
    let counter = 0;
    while (this.nextTile() === "#") {
      this.moveForward();
      counter++;
    }
    if (counter) {
      this.commands += counter.toString();
    }
  }

  private rotateTowardsScaffold() {
    if (this.rightTile() === "#") {
      this.direction = this.turnRight();
      this.commands += "R";
      return true;
    } else if (this.leftTile() === "#") {
      this.direction = this.turnLeft();
      this.commands += "L";
      return true;
    } else {
      return false;
    }
  }

  private moveForward() {
    switch (this.direction) {
      case Direction.UP:
        this.y--;
        break;
      case Direction.DOWN:
        this.y++;
        break;
      case Direction.RIGHT:
        this.x++;
        break;
      case Direction.LEFT:
        this.x--;
        break;
    }
  }

  nextTile(direction = this.direction) {
    switch (direction) {
      case Direction.UP:
        return this.map[this.y - 1] && this.map[this.y - 1][this.x];
      case Direction.DOWN:
        return this.map[this.y + 1] && this.map[this.y + 1][this.x];
      case Direction.RIGHT:
        return this.map[this.y][this.x + 1];
      case Direction.LEFT:
        return this.map[this.y][this.x - 1];
    }
  }

  leftTile() {
    return this.nextTile(this.turnLeft());
  }

  rightTile() {
    return this.nextTile(this.turnRight());
  }

  turnRight() {
    return directions[
      (directions.indexOf(this.direction) + 1) % directions.length
    ];
  }

  turnLeft() {
    return directions[
      (directions.indexOf(this.direction) + directions.length - 1) %
        directions.length
    ];
  }
}

console.log("Part 1", part1());
console.log("Part 2", part2());
