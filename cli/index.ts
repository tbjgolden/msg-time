#!/usr/bin/env node
/* eslint-disable no-console */

import { readFile } from "node:fs/promises";
import { checkCommitMessage } from "../lib/index.js";

const isColour = !process.env.NO_COLOR;

const dim = isColour ? "\u001B[2m" : "";
const reset = isColour ? "\u001B[0m" : "";
const redFg = isColour ? "\u001B[31m" : "";
const greyBg = isColour ? "\u001B[100m" : "";

const run = async () => {
  let commitMessage: string;
  try {
    commitMessage = `${await readFile(".git/COMMIT_EDITMSG", "utf8")}\n`;
  } catch {
    process.exit(0);
  }

  const lines = commitMessage.split(/\r?\n/g);
  const lintErrors = checkCommitMessage(lines);
  if (lintErrors.length > 0) {
    console.log("msg-time blocked your commit due to an invalid commit message");
    for (const { message, line, colStart, colEnd } of lintErrors) {
      console.log("\n  " + message + "\n");
      console.log(
        `  ${dim}${lines[line].slice(0, colStart)}${reset}${redFg}${lines[line].slice(
          colStart,
          colEnd
        )}${reset}${dim}${lines[line].slice(colEnd)}${reset}`
      );
      const colEndIsLastChar = lines[line].length === colEnd;
      console.log(
        `  ${redFg}${greyBg}${new Array(colStart).fill(" ").join("")}${new Array(colEnd - colStart)
          .fill("█")
          .join("")}${colEndIsLastChar ? `${reset}${redFg}` : ""}▎${new Array(
          Math.max(0, lines[line].length - colEnd - 1)
        )
          .fill(" ")
          .join("")}${reset}`
      );
    }
    process.exit(1);
  }
};

run();
