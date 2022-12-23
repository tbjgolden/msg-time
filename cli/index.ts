#!/usr/bin/env node
/* eslint-disable no-console */

import { readFile } from "node:fs/promises";

const COMMIT_HEADER_REGEX = /^([^(:]*)((?:\([^)]+\))?)(!?)(:?)(.*)$/;
const NOUN_REGEX = /^(\p{Letter})+([ _'-](\p{Letter})+)*$/u;
const NEWLINE_REGEX = /\r?\n/g;

type LintError = {
  message: string;
  line: number;
  colStart: number;
  colEnd: number;
};

const VALID_TYPES = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
];

const err = ({
  message,
  line,
  colStart,
  colEnd,
}: Partial<LintError> & Pick<LintError, "message">): LintError[] => {
  return [
    {
      message,
      line: line ?? 0,
      colStart: colStart ?? 0,
      colEnd: colEnd ?? colStart ?? 0,
    },
  ];
};

const checkCommitMessage = (lines: string[]): LintError[] => {
  if (lines[0].trim().length === 0) {
    return err({ message: "No commit message" });
  } else {
    const firstLine = lines[0];
    const match = firstLine.match(COMMIT_HEADER_REGEX);
    if (match === null) {
      throw new Error("Conventional commit regex should always match");
    }
    const [full, type, scope, , colon, description] = match;
    if (colon) {
      if (type && (type === "unknown" || VALID_TYPES.includes(type))) {
        if (scope && !NOUN_REGEX.test(scope.slice(1, -1))) {
          return err({
            message: `commit message (scope) is not a valid noun`,
            colStart: type.length + 1,
            colEnd: type.length + scope.length - 1,
          });
        }
        if (description.length === 0) {
          return err({
            message: `commit message needs a description after the colon`,
            colStart: full.length,
          });
        } else if (description[0] !== " ") {
          return err({
            message: `commit message needs a space after the colon`,
            colStart: full.length - description.length,
          });
        } else if (description[1] === " ") {
          let numberOfSpaces = 2;
          while (description[numberOfSpaces] === " ") numberOfSpaces += 1;
          return err({
            message: `commit message needs only 1 space after the colon`,
            colStart: full.length - description.length + 1,
            colEnd: full.length - description.length + numberOfSpaces,
          });
        } else if (lines[1].length > 0) {
          return err({
            message: `line after commit header must be empty`,
            line: 1,
            colEnd: lines[1].length,
          });
        }
      } else {
        return err({
          message: `commit should start with a valid commit type\n  valid ones:\n    ${VALID_TYPES.join(
            " "
          )}`,
          colEnd: type.length,
        });
      }
    } else {
      return err({
        message: "commit does not follow the Conventional Commits standard",
        colEnd: firstLine.length,
      });
    }
  }

  return [];
};

const run = async () => {
  let commitMessage: string;
  try {
    commitMessage = `${await readFile(".git/COMMIT_EDITMSG", "utf8")}\n`;
  } catch {
    process.exit(0);
  }
  const lines = commitMessage.split(NEWLINE_REGEX);
  const lintErrors = checkCommitMessage(lines);
  if (lintErrors.length > 0) {
    console.log("msg-time blocked your commit due to an invalid commit message");
    for (const { message, line, colStart, colEnd } of lintErrors) {
      console.log("\n  " + message + "\n");
      console.log(
        `  \u001B[2m${lines[line].slice(0, colStart)}\u001B[0m\u001B[31m${lines[line].slice(
          colStart,
          colEnd
        )}\u001B[0m\u001B[2m${lines[line].slice(colEnd)}\u001B[0m`
      );
      const colEndIsLastChar = lines[line].length === colEnd;
      console.log(
        `  \u001B[31m\u001B[100m${new Array(colStart).fill(" ").join("")}${new Array(
          colEnd - colStart
        )
          .fill("█")
          .join("")}${colEndIsLastChar ? "\u001B[0m\u001B[31m" : ""}▎${new Array(
          Math.max(0, lines[line].length - colEnd - 1)
        )
          .fill(" ")
          .join("")}\u001B[0m`
      );
    }
    process.exit(1);
  }
};

run();
