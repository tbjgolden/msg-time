import { exec } from "node:child_process";
import { writeFile } from "node:fs/promises";

import { getPackageJson, checkDirectory, isFile, isDirectory } from "./lib/utils.js";

checkDirectory();

const packageJson = await getPackageJson();

if (await isDirectory("cli")) {
  console.log("validating cli...");
  for (const [cliName, cliFilePath] of Object.entries(packageJson.bin ?? {})) {
    if (cliFilePath) {
      let isCliPathAFile = false;
      try {
        isCliPathAFile = await isFile(cliFilePath);
      } catch {}
      if (!isCliPathAFile) {
        console.log(`"${cliName}": "${cliFilePath}" is not an executable file`);
        process.exit(1);
      }
      await writeFile(".git/COMMIT_EDITMSG", "bug: should use fix instead of bug\n");
      const command = `NO_COLOR=1 node ${cliFilePath}`;
      const stdout = await new Promise<string>((resolve) => {
        exec(command, (_, stdout) => {
          resolve(stdout);
        });
      });
      const expected =
        "msg-time blocked your commit due to an invalid commit message\n\n  commit should start with a valid commit type\n  valid ones:\n    build chore ci docs feat fix perf refactor revert style test\n\n  bug: should use fix instead of bug\n  ███▎                              \n";

      if (stdout !== expected) {
        console.log(`unexpected response when running: ${command}\n`);
        console.log("expected:");
        console.log(JSON.stringify(expected));
        console.log("actual:");
        console.log(JSON.stringify(stdout));
        process.exit(1);
      }
    }
  }
}
