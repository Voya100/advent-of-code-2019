// https://adventofcode.com/2019/day/6
import * as fs from "fs";
import { sum } from "./utils";

const input = fs.readFileSync("inputs/day6.txt", "utf8");

const orbits = input.split("\n").map(str => str.split(")"));

interface OrbitObject {
  name: string;
  parentOrbit?: OrbitObject;
  childOrbits: OrbitObject[];
}

function part1() {
  const orbitObjects = generateObjectMap();
  const root = orbitObjects.COM;
  const orbitsCount = countOrbits(root);
  return orbitsCount;
}

function part2() {
  const orbitObjects = generateObjectMap();
  const shortestDistance = getShortestRouteDistance(orbitObjects, "YOU", "SAN");
  return shortestDistance;
}

function generateObjectMap() {
  const objects: { [key: string]: OrbitObject } = {};

  // Create tree of the objects
  for (let [objectName1, objectName2] of orbits) {
    if (!objects[objectName1]) {
      objects[objectName1] = {
        name: objectName1,
        childOrbits: []
      };
    }
    if (!objects[objectName2]) {
      objects[objectName2] = {
        name: objectName2,
        childOrbits: []
      };
    }

    objects[objectName1].childOrbits.push(objects[objectName2]);
    objects[objectName2].parentOrbit = objects[objectName1];
  }
  return objects;
}

function countOrbits(root: OrbitObject, depth = 0): number {
  return (
    depth +
    (root.childOrbits
      ? sum(root.childOrbits, child => countOrbits(child, depth + 1))
      : 0)
  );
}

function getShortestRouteDistance(
  orbitObjects: { [key: string]: OrbitObject },
  startId: string,
  endId: string
) {
  const startObject = orbitObjects[startId];
  const endObject = orbitObjects[endId];

  // BFS search
  let visittedObjects = new Set<OrbitObject>();
  let closeObjects = getCloseObjects([startObject], visittedObjects);
  let depth = 1;
  while (!visittedObjects.has(endObject)) {
    closeObjects = getCloseObjects(closeObjects, visittedObjects);
    depth++;
  }
  // Start/end objects not counted
  return depth - 2;
}

/**
 * Get all direct child/parent relations for given objects which have not been visited yet
 */
function getCloseObjects(
  objects: OrbitObject[],
  visitedObjects: Set<OrbitObject>
) {
  let closeObjects = [];
  for (let { parentOrbit, childOrbits } of objects) {
    const unvisitedObjects = [parentOrbit, ...childOrbits].filter(
      object => !visitedObjects.has(object) && !!object
    );
    unvisitedObjects.forEach(object => visitedObjects.add(object));
    closeObjects.push(...unvisitedObjects);
  }
  return closeObjects;
}

console.log("Part 1", part1());
console.log("Part 2", part2());
