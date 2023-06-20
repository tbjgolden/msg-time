const COMMIT_HEADER_REGEX = /^([^!(:]*)((?:\([^)]+\))?)(!?)(:?)(.*)$/;
const NOUN_REGEX = /^(\p{Letter})+([ _'-](\p{Letter})+)*$/u;

export type LintError = {
  message: string;
  line: number;
  colStart: number;
  colEnd: number;
};

const VALID_TYPES = "build,chore,ci,docs,feat,fix,perf,refactor,revert,style,test".split(",");
const VALID_TYPES_SET = new Set(VALID_TYPES);

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

export const checkCommitMessage = (lines: string[]): LintError[] => {
  if ((lines.at(0) ?? "").trim().length === 0) {
    return err({ message: "No commit message" });
  } else {
    const firstLine = lines[0];
    const match = firstLine.match(COMMIT_HEADER_REGEX) as RegExpMatchArray;
    const [full, type, scope, , colon, description] = match;
    if (colon) {
      if (type && (type === "unknown" || VALID_TYPES_SET.has(type))) {
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
        } else if ((lines.at(1)?.length ?? 0) > 0) {
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
