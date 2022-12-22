import { getPackageRoot } from "./package";

export const checkDirectory = async () => {
  const projectRoot = await getPackageRoot();
  if (projectRoot !== process.cwd()) {
    console.log("must be run from package root");
    process.exit(1);
  }
};
