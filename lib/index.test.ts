import { checkCommitMessage } from "./index.js";

test("checkCommitMessage", () => {
  expect(checkCommitMessage([""])).toEqual([
    { colEnd: 0, colStart: 0, line: 0, message: "No commit message" },
  ]);
  expect(checkCommitMessage(["#"])).toEqual([
    {
      line: 0,
      colStart: 0,
      colEnd: 1,
      message: "commit does not follow the Conventional Commits standard",
    },
  ]);
  expect(checkCommitMessage([":"])).toEqual([
    {
      line: 0,
      colStart: 0,
      colEnd: 0,
      message:
        "commit should start with a valid commit type\n  valid ones:\n    build chore ci docs feat fix perf refactor revert style test",
    },
  ]);
  expect(checkCommitMessage(["abc"])).toEqual([
    {
      line: 0,
      colStart: 0,
      colEnd: 3,
      message: "commit does not follow the Conventional Commits standard",
    },
  ]);
  expect(checkCommitMessage(["abc:"])).toEqual([
    {
      line: 0,
      colStart: 0,
      colEnd: 3,
      message:
        "commit should start with a valid commit type\n  valid ones:\n    build chore ci docs feat fix perf refactor revert style test",
    },
  ]);
  expect(checkCommitMessage(["test:"])).toEqual([
    {
      line: 0,
      colStart: 5,
      colEnd: 5,
      message: "commit message needs a description after the colon",
    },
  ]);
  expect(checkCommitMessage([": description"])).toEqual([
    {
      line: 0,
      colStart: 0,
      colEnd: 0,
      message:
        "commit should start with a valid commit type\n  valid ones:\n    build chore ci docs feat fix perf refactor revert style test",
    },
  ]);
  expect(checkCommitMessage(["abc description"])).toEqual([
    {
      line: 0,
      colStart: 0,
      colEnd: 15,
      message: "commit does not follow the Conventional Commits standard",
    },
  ]);
  expect(checkCommitMessage(["abc: description"])).toEqual([
    {
      line: 0,
      colStart: 0,
      colEnd: 3,
      message:
        "commit should start with a valid commit type\n  valid ones:\n    build chore ci docs feat fix perf refactor revert style test",
    },
  ]);
  expect(checkCommitMessage(["test: description"])).toEqual([]);
  expect(checkCommitMessage(["test: description", "aaa", ""])).toEqual([
    {
      line: 1,
      colStart: 0,
      colEnd: 3,
      message: "line after commit header must be empty",
    },
  ]);
  expect(checkCommitMessage(["test: description", "", "aaa"])).toEqual([]);
  expect(checkCommitMessage(["test!: description", "", "aaa"])).toEqual([]);
  expect(checkCommitMessage(["test(scope)!: description", "", "aaa"])).toEqual([]);
  expect(checkCommitMessage(["test(scope): description"])).toEqual([]);
  expect(checkCommitMessage(["test(-)!: description", "", "aaa"])).toEqual([
    {
      line: 0,
      colStart: 5,
      colEnd: 6,
      message: "commit message (scope) is not a valid noun",
    },
  ]);
  expect(checkCommitMessage(["test:description"])).toEqual([
    {
      line: 0,
      colStart: 5,
      colEnd: 5,
      message: "commit message needs a space after the colon",
    },
  ]);
  expect(checkCommitMessage(["test:   description"])).toEqual([
    {
      line: 0,
      colStart: 6,
      colEnd: 8,
      message: "commit message needs only 1 space after the colon",
    },
  ]);
});
