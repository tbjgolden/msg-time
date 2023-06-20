import { readFile, writeFile, rm, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { checkDirectory, readJSON } from "./lib/utils.js";

checkDirectory();

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

type TSConfig = {
  compilerOptions: { [args: string]: unknown };
  include?: string[];
  exclude?: string[];
  [args: string]: unknown;
};
const tsconfigJson = readJSON<TSConfig>(await readFile("tsconfig.json", "utf8"));
const buildTsconfig: TSConfig = {
  ...tsconfigJson,
  include: (tsconfigJson.include ?? []).filter((path) => !path.startsWith(".")),
  exclude: [...(tsconfigJson.exclude ?? []), "**/*.test.ts"],
  compilerOptions: { ...tsconfigJson.compilerOptions, noEmit: false },
};
await writeFile("tsconfig.tmp.json", JSON.stringify(buildTsconfig));
await new Promise<void>((resolve) => {
  const child = spawn("npx", ["tsc", "--project", "tsconfig.tmp.json"], {
    stdio: "inherit",
  });
  child.on("message", console.log);
  child.on("exit", async (code) => {
    await rm("tsconfig.tmp.json");
    if (code) {
      process.exit(code);
    } else {
      resolve();
    }
  });
});
