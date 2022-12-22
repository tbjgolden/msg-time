#!/usr/bin/env node
/* eslint-disable no-console */

import { hello } from "../lib";

const [_cmd, _fileName, ...args] = process.argv;
const arg = args.join(" ");

if (arg !== "") {
  console.log(hello(arg));
}
