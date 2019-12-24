// https://adventofcode.com/2019/day/18
import * as fs from "fs";

const input = fs.readFileSync("inputs/day18.txt", "utf8");

const mapInput = input.split("\n").map(str => str.split(""));

function part1() {
  const map = initialiseMap(mapInput);
  const depth = findShortestRouteToKeys(map);
  return depth;
}

function part2() {
  const mapInput2 = [...mapInput];
  const entranceCoordinate = mapInput
    .flatMap((row, j) =>
      row.map((cell, i) => [cell, i, j] as [MapIcon, number, number])
    )
    .find(([cell]) => cell === MapIcon.ENTRANCE);
  const [_, x, y] = entranceCoordinate;

  mapInput[y][x] = MapIcon.WALL;
  mapInput[y][x - 1] = MapIcon.WALL;
  mapInput[y][x + 1] = MapIcon.WALL;
  mapInput[y - 1][x] = MapIcon.WALL;
  mapInput[y + 1][x] = MapIcon.WALL;
  mapInput[y - 1][x - 1] = MapIcon.ENTRANCE;
  mapInput[y - 1][x + 1] = MapIcon.ENTRANCE;
  mapInput[y + 1][x - 1] = MapIcon.ENTRANCE;
  mapInput[y + 1][x + 1] = MapIcon.ENTRANCE;

  const map = initialiseMap(mapInput2);
  const depth = findShortestRouteToKeys(map);
  return depth;
}

function initialiseMap(mapInput: string[][]) {
  const map = mapInput.map((row, j) =>
    row.map((cell, i) => new MapCell(i, j, cell))
  );
  for (let j = 0; j < map.length; j++) {
    for (let i = 0; i < map[0].length; i++) {
      const cell = map[j][i];
      if (cell.mapIcon === MapIcon.WALL) {
        continue;
      }
      // Each cells checks left/up side and adds connection to both directions.
      if (map[j - 1] && map[j - 1][i].mapIcon !== MapIcon.WALL) {
        cell.addAdjacentCell(map[j - 1][i]);
      }
      if (map[j][i - 1] && map[j][i - 1].mapIcon !== MapIcon.WALL) {
        cell.addAdjacentCell(map[j][i - 1]);
      }
    }
  }
  return map;
}

function findShortestRouteToKeys(map: MapCell[][]) {
  // Note: the implementation may take some minutes to run especially with multiple entrances
  const keysCount = map.flat().filter(cell => cell.key).length;
  const entrances = map
    .flat()
    .filter(cell => cell.mapIcon === MapIcon.ENTRANCE);
  const checkedStates = new Set<string>();
  let depth = 0;
  let cellsToCheck: [string, MapCell[]][] = getNextCellsToCheckForState(
    "",
    entrances
  );
  let newCellsToCheck: [string, MapCell[]][] = [];

  // Modified BFS algorithm which checks all unique states
  while (cellsToCheck.length) {
    depth++;
    for (let [keys, cells] of cellsToCheck) {
      if (keys.length === keysCount) {
        return depth;
      }
      const stateIdentifier = getStateIdentifier(keys, cells);
      if (checkedStates.has(stateIdentifier)) {
        continue;
      }
      checkedStates.add(stateIdentifier);
      for (let cell of cells) {
        cell.addCheckedState(keys);
      }
      const adjacent = getNextCellsToCheckForState(keys, cells);
      newCellsToCheck.push(...adjacent);
    }
    cellsToCheck = newCellsToCheck;
    newCellsToCheck = [];
  }
  throw new Error("Route not found.");
}

function getNextCellsToCheckForState(keys: string, cells: MapCell[]) {
  // Next cells for each bot
  const nextCells: [string, MapCell[]][] = [];

  for (let i = 0; i < cells.length; i++) {
    const adjacent = cells[i].getAdjacentUnchecked(keys);
    for (let [state, cell] of adjacent) {
      const positions = [...cells];
      positions[i] = cell;
      nextCells.push([state, positions]);
    }
  }
  return nextCells;
}

function getStateIdentifier(keys: string, cells: MapCell[]) {
  return keys + ":" + cells.map(cell => cell.toString()).join(":");
}

enum MapIcon {
  ENTRANCE = "@",
  WALL = "#",
  EMPTY = ".",
  KEY = "KEY",
  DOOR = "DOOR"
}

class MapCell {
  key: string;
  door: string;
  mapIcon: MapIcon;
  adjecentCells: MapCell[] = [];
  checkedStates = new Set<string>();

  constructor(public x: number, public y: number, mapIconInput: string) {
    if (
      MapIcon.ENTRANCE === mapIconInput ||
      MapIcon.EMPTY === mapIconInput ||
      MapIcon.WALL === mapIconInput
    ) {
      this.mapIcon = mapIconInput;
    } else if (isLowerCase(mapIconInput)) {
      this.key = mapIconInput;
      this.mapIcon = MapIcon.KEY;
    } else {
      this.door = mapIconInput;
      this.mapIcon = MapIcon.DOOR;
    }
  }

  addAdjacentCell(cell: MapCell) {
    this.adjecentCells.push(cell);
    cell.adjecentCells.push(this);
  }

  getAdjacentUnchecked(state: string): [string, MapCell][] {
    return this.adjecentCells
      .filter(cell => !cell.checkedStates.has(state))
      .filter(cell => cell.mapIcon !== MapIcon.DOOR || cell.canOpen(state))
      .map(cell => {
        if (cell.key && !state.includes(cell.key)) {
          const sortedNewState = [...state.split(""), cell.key].sort().join("");
          return [sortedNewState, cell];
        }
        return [state, cell];
      });
  }

  canEnter(state: string[]) {
    return this.mapIcon !== MapIcon.DOOR || this.canOpen(state);
  }

  getState(givenState: string) {
    if (this.key && !givenState.includes(this.key)) {
      const sortedNewState = [...givenState.split(""), this.key]
        .sort()
        .join("");
      return sortedNewState;
    }
    return givenState;
  }

  canOpen(state: string | string[]) {
    return state.includes(this.door.toLowerCase());
  }

  addCheckedState(state: string) {
    this.checkedStates.add(state);
    // Include the key as well in state
    this.checkedStates.add(this.getState(state));
  }

  toString() {
    return this.x + "," + this.y;
  }
}

function isLowerCase(str: string) {
  return str.toLocaleLowerCase() === str;
}

console.log("Part 1", part1());
console.log("Part 2", part2());
