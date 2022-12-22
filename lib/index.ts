import { exclamation } from "./exclamation";

export const hello = (world: string): string => {
  return exclamation(`Hello ${world}`);
};
