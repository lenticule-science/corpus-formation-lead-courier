#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { executeA2aMessage } from "../src/a2a-executor.mjs";
executeA2aMessage(JSON.parse(readFileSync(0, "utf8"))).then((message) => process.stdout.write(`${JSON.stringify(message)}\n`)).catch((error) => { process.stderr.write(`${error.stack ?? error}\n`); process.exitCode = 1; });
