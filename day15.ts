// https://adventofcode.com/2019/day/15
import * as fs from "fs";
import { runProgram, createProgram, Program } from "./int-code-computer";

const input = fs.readFileSync("inputs/day15.txt", "utf8");
const codeInput = input.split(",").map(str => +str);

function part1() {
  const program = createProgram(codeInput, []);
  const repairDroid = new RepairDroid(program);
  repairDroid.mapTheArea();
  const oxygen = [...repairDroid.map.values()].find(value => value.isOxygen);
  return oxygen.depth;
}

function part2() {
  const program = createProgram(codeInput, []);
  const repairDroid = new RepairDroid(program);
  repairDroid.mapTheArea();
  const oxygen = [...repairDroid.map.values()].find(value => value.isOxygen);
  return oxygen.spreadOxygen();
}

enum Direction {
  NORTH = 1,
  SOUTH = 2,
  WEST = 3,
  EAST = 4
}

enum StatusCode {
  WALL = 0,
  MOVED = 1,
  FOUND_OXYGEN = 2
}

const directions = [
  Direction.NORTH,
  Direction.SOUTH,
  Direction.WEST,
  Direction.EAST
];

class RepairDroid {
  map = new Map<string, Position>();
  x = 0;
  y = 0;
  depth = 0;

  constructor(public program: Program) {}

  mapTheArea() {
    new Position(this, null, null);
  }

  move(direction: Direction): StatusCode {
    this.program.inputs.push(direction);
    runProgram(this.program);
    const output = this.program.outputs.pop() as StatusCode;
    if (output === StatusCode.MOVED || output === StatusCode.FOUND_OXYGEN) {
      switch (direction) {
        case Direction.NORTH:
          this.y++;
          break;
        case Direction.SOUTH:
          this.y--;
          break;
        case Direction.EAST:
          this.x++;
          break;
        case Direction.WEST:
          this.x--;
          break;
      }
    }
    return output;
  }

  get position() {
    return this.map.get(this.coordinateKey);
  }

  get coordinateKey() {
    return this.x + "," + this.y;
  }
}

class Position {
  adjacentPositions: Position[] = [];
  isOxygen = false;
  rootCounter = 0;

  constructor(
    repairDroid: RepairDroid,
    public parentPosition: Position,
    previousCommand: Direction
  ) {
    if (parentPosition) {
      this.adjacentPositions.push(parentPosition);
    }
    repairDroid.map.set(repairDroid.coordinateKey, this);
    const directionsToCheck = directions.filter(
      dir => dir !== this.oppositeDirection(previousCommand)
    );

    // Populates the entire map with DFS algorithm
    repairDroid.depth++;
    for (let direction of directionsToCheck) {
      this.checkDirection(repairDroid, direction);
    }
    repairDroid.depth--;
  }

  checkDirection(repairDroid: RepairDroid, direction: Direction) {
    const status = repairDroid.move(direction);
    if (status === StatusCode.WALL) {
      return;
    }
    // This recursively goes through all positions in direction
    const positionInDirection =
      repairDroid.position || new Position(repairDroid, this, direction);
    this.adjacentPositions.push(positionInDirection);
    if (status === StatusCode.FOUND_OXYGEN) {
      positionInDirection.isOxygen = true;
    }
    // Update shortest route to origin
    if (positionInDirection.depth > this.depth + 1) {
      positionInDirection.parentPosition = this;
    }
    // Return back to previous position
    repairDroid.move(this.oppositeDirection(direction));
  }

  oppositeDirection(direction: Direction) {
    switch (direction) {
      case Direction.NORTH:
        return Direction.SOUTH;
      case Direction.SOUTH:
        return Direction.NORTH;
      case Direction.EAST:
        return Direction.WEST;
      case Direction.WEST:
        return Direction.EAST;
    }
  }

  get depth(): number {
    if (!this.parentPosition) {
      return 0;
    }
    return this.parentPosition.depth + 1;
  }

  /**
   * Spreads oxygen with BFS algorithm and returns the depth after which all positions
   * have been handled.
   */
  spreadOxygen() {
    // Assumption: only this position has isOxygen in the beginning
    let edges = this.adjacentPositions;
    const nextEdges = [];
    let depth = 0;
    while (edges.length) {
      depth++;
      for (let edge of edges) {
        edge.isOxygen = true;
        nextEdges.push(...edge.adjacentPositions);
      }
      edges = nextEdges.filter(edge => !edge.isOxygen);
    }
    return depth;
  }
}

console.log("Part 1", part1());
console.log("Part 2", part2());
