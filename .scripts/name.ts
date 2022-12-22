import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { validate } from "./lib/npmName";
import { getPackageRoot } from "./lib/package";
import { deleteFolder, readInput } from "easier-node";
import { checkDirectory } from "./lib/checkDirectory";

const escapeRegExp = (str: string): string => {
  return str.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&"); // $& means the whole matched string
};

const currentName = "msg-time";

const main = async () => {
  await checkDirectory();

  const projectRoot = await getPackageRoot();

  const directoryName = projectRoot.slice(path.dirname(projectRoot).length + 1);
  const initial: string | undefined = validate(directoryName).valid ? directoryName : undefined;
  let result: string | undefined;
  let validateResult: ReturnType<typeof validate> | undefined;

  do {
    if (validateResult !== undefined) {
      for (const error of validateResult.errors) {
        console.log("  - " + error);
      }
    }

    const input = await readInput(`npm package name? [${initial}]`);
    let value = input.trim();
    if (value === "" && initial) {
      value = initial;
    }

    result = value.trim();
    validateResult = validate(result);
  } while (!validateResult.valid || result.includes("/"));

  const stdout = execSync(
    `git status --short | grep '^?' | cut -d\\  -f2- && git ls-files`
  ).toString();

  const files = stdout.split("\n").filter((p: string) => {
    if (p === "") return false;
    try {
      return fs.statSync(p).isFile();
    } catch {
      return false;
    }
  });

  const re = new RegExp(escapeRegExp("msg-time"), "g");
  for (const filePath of files) {
    fs.writeFileSync(filePath, fs.readFileSync(filePath, "utf8").replace(re, result));
  }

  try {
    // should only run on first name
    if (currentName === `npm${"-"}lib${"-"}name`) {
      await deleteFolder(path.join(projectRoot, ".git"));
      execSync("git init && git add . && git commit -m 'Initial commit from msg-time'", {
        cwd: projectRoot,
      });
      console.log("New git repo created");
      execSync("npx simple-git-hooks", {
        cwd: projectRoot,
      });
      console.log("git hooks installed");
    }
  } catch {
    //
  }
};

main().catch((error) => {
  throw error;
});
