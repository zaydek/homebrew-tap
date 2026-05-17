#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));

const checks = [
  ["architecture:adderall-formula", ["node", ["requirements/architecture/adderall-formula.check.mjs"]]],
];

if (process.env.BREW_LIVE === "1") {
  checks.push(["brew:test", ["brew", ["test", "zaydek/tap/adderall"]]]);
}

for (const [name, [cmd, args]] of checks) {
  console.log(`\n== ${name} ==`);
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nPASS requirements");
