// https://adventofcode.com/2019/day/14
import * as fs from "fs";
import { sum } from "./utils";

const input = fs.readFileSync("inputs/day14.txt", "utf8");
const reactions = input.split("\n").map(parseReaction);

const reactionMap = createReactionMap();

function part1() {
  return findRequiredOre("FUEL", 1);
}

function part2() {
  return fuelForOre(1000000000000);
}

function fuelForOre(ore: number) {
  const oreForOne = findRequiredOre("FUEL", 1);
  // Ores for single fuel is most inefficient because there are extra materials
  // Upperlimit for fuel is number of ore, since fuel always needs at least one new ore
  // Better average could be obtained by getting ore for higher number of fuel, but using it would have
  // greater risk of getting the lower estimate range for especially if ore input is small
  let estimateRange = [ore / oreForOne, ore];
  // Binary search
  while (estimateRange[1] - estimateRange[0] > 1) {
    const newEstimate = Math.round((estimateRange[1] + estimateRange[0]) / 2);
    const oreSpent = findRequiredOre("FUEL", newEstimate);
    if (oreSpent > ore) {
      estimateRange[1] = newEstimate;
    } else {
      estimateRange[0] = newEstimate;
    }
  }
  return estimateRange[0];
}

function findRequiredOre(
  chemical: string,
  amount: number,
  extras: { [chemical: string]: number } = {}
): number {
  if (extras[chemical]) {
    if (extras[chemical] > amount) {
      extras[chemical] -= amount;
      return 0;
    }
    amount -= extras[chemical];
    extras[chemical] = 0;
  }
  if (chemical === "ORE") {
    return amount;
  }
  const reaction = reactionMap[chemical];
  const numberOfReactions = Math.ceil(amount / reaction.output.amount);
  if (extras[chemical] === undefined) {
    extras[chemical] = 0;
  }
  extras[chemical] += numberOfReactions * reaction.output.amount - amount;
  const s = sum(reaction.inputs, input =>
    findRequiredOre(input.chemical, input.amount * numberOfReactions, extras)
  );
  return s;
}

function createReactionMap() {
  const reactionMap: { [chemical: string]: ChemicalReaction } = {};
  for (let reaction of reactions) {
    reactionMap[reaction.output.chemical] = reaction;
  }
  return reactionMap;
}

interface ChemicalReaction {
  inputs: {
    amount: number;
    chemical: string;
  }[];
  output: {
    amount: number;
    chemical: string;
  };
}

function parseReaction(str: string): ChemicalReaction {
  const [inputs, output] = str.split(" => ");
  return {
    inputs: inputs.split(", ").map(parseChemicalAndAmount),
    output: parseChemicalAndAmount(output)
  };
}

function parseChemicalAndAmount(str: string) {
  const [amount, chemical] = str.split(" ");
  return {
    amount: +amount,
    chemical
  };
}

console.log("Part 1", part1());
console.log("Part 2", part2());
