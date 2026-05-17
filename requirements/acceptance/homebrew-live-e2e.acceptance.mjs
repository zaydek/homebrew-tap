#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const receiptDir = join(root, "requirements/acceptance/.artifacts");
const receiptPath = join(receiptDir, "homebrew-live-e2e.json");
const sudoersPath = "/etc/sudoers.d/add-pmset";
const steps = [];
const failures = [];

mkdirSync(receiptDir, { recursive: true });

if (process.env.ADDERALL_LIVE_E2E !== "1") {
  console.error("homebrew-live-e2e.acceptance: set ADDERALL_LIVE_E2E=1 to run live install/uninstall acceptance");
  process.exit(1);
}

if (process.platform !== "darwin" || process.arch !== "arm64") {
  fail(`homebrew-live-e2e.acceptance: Apple Silicon macOS required, got ${process.platform}/${process.arch}`);
}

const startedWithSudoers = existsSync(sudoersPath);
const startedInstalled = commandOk("brew", ["list", "--versions", "adderall"]);

try {
  must("brew", ["tap", "zaydek/tap"]);
  allow("brew", ["uninstall", "adderall"]);

  must("brew", ["install", "zaydek/tap/adderall"]);
  must("brew", ["list", "--versions", "adderall"]);
  must("/opt/homebrew/bin/adderall", ["--help"]);
  if (existsSync(sudoersPath)) {
    must("/opt/homebrew/bin/adderall", ["uninstall"]);
  }
  if (existsSync(sudoersPath)) {
    failures.push(`${sudoersPath} still exists before adderall install`);
  }
  must("/opt/homebrew/bin/adderall", ["install"]);
  must("/opt/homebrew/bin/adderall", ["doctor"]);
  must("/opt/homebrew/bin/add", ["5s"]);
  must("/opt/homebrew/bin/adderall", ["uninstall"]);

  if (existsSync(sudoersPath)) {
    failures.push(`${sudoersPath} still exists after adderall uninstall`);
  }
} catch (error) {
  failures.push(error.message);
} finally {
  if (startedWithSudoers && !existsSync(sudoersPath)) {
    allow("/opt/homebrew/bin/adderall", ["install"]);
  }
  if (!startedInstalled) {
    allow("brew", ["uninstall", "adderall"]);
  }

  writeFileSync(
    receiptPath,
    `${JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        ok: failures.length === 0,
        host: `${process.platform}/${process.arch}`,
        sudoersPath,
        startedWithSudoers,
        startedInstalled,
        steps,
        failures,
      },
      null,
      2,
    )}\n`,
  );
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`PASS homebrew live e2e receipt=${receiptPath}`);

function commandOk(command, args) {
  return spawnSync(command, args, { cwd: root, stdio: "ignore" }).status === 0;
}

function must(command, args) {
  const result = run(command, args);
  if (result.status !== 0) {
    throw new Error(`command failed: ${[command, ...args].join(" ")}`);
  }
  return result;
}

function allow(command, args) {
  return run(command, args);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
  });
  steps.push({
    command: [command, ...args].join(" "),
    status: result.status,
    stdout: result.stdout.slice(0, 4000),
    stderr: result.stderr.slice(0, 4000),
  });
  return result;
}

function fail(message) {
  failures.push(message);
  writeFileSync(
    receiptPath,
    `${JSON.stringify({ checkedAt: new Date().toISOString(), ok: false, steps, failures }, null, 2)}\n`,
  );
  console.error(message);
  process.exit(1);
}
