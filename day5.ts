// https://adventofcode.com/2019/day/5
import * as fs from "fs";
import readline from "readline";

const input = fs.readFileSync("inputs/day5.txt", "utf8");
const codeInput = input.split(",").map(str => +str);

interface Program {
  code: number[];
  instructionPointer: number;
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
    async run(program: Program, param1: number) {
      program.code[param1] = await readInput();
      return true;
    }
  },
  4: {
    params: [{ alwaysPosition: false }],
    run(program: Program, param1: number) {
      console.log(param1);
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

function readInput(): Promise<number> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("Input: ", answer => {
      rl.close();
      resolve(+answer);
    });
  });
}

async function runProgram(code: number[]) {
  const program = {
    code,
    instructionPointer: 0
  };
  let programEnded;
  do {
    // Ensure opCode has modes for all parameters
    const opCodeString = code[program.instructionPointer]
      .toString()
      .padStart(5, "0");
    const operation = COMMANDS[+opCodeString.slice(-2)];
    const params = getParams(
      code,
      program.instructionPointer,
      opCodeString,
      operation
    );
    let oldPointer = program.instructionPointer;
    const result = await operation.run(program, ...params);
    programEnded = result === false;
    if (program.instructionPointer === oldPointer) {
      program.instructionPointer += operation.params.length + 1;
    }
  } while (!programEnded);
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

(async () => {
  console.log("Part 1");
  await runProgram([...codeInput]); // Give 1 as input
  console.log("Part 2");
  await runProgram([...codeInput]); // Give 5 as input
})();
