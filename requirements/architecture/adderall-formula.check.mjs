#!/usr/bin/env node
import { createHash } from "node:crypto";
import { accessSync, constants, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const formula = join(root, "Formula/adderall.rb");
const failures = [];

for (const rel of ["Formula/adderall.rb", "README.md", "COPYRIGHT", "Makefile"]) {
  try {
    accessSync(join(root, rel), constants.R_OK);
  } catch {
    failures.push(`missing readable ${rel}`);
  }
}

const formulaText = readFileSync(formula, "utf8");
const required = [
  'url "https://github.com/zaydek/homebrew-tap/releases/download/adderall-v0.1.0/adderall-darwin-arm64.tar.gz"',
  'sha256 "ee5233a5ee6b4fbe22ecf289cfa6046f53633e127fe272682f2a8556b3e8afb8"',
  'version "0.1.0"',
  "license :cannot_represent",
  "depends_on :macos",
  "depends_on macos: :ventura",
  "depends_on arch: :arm64",
  'bin.install "bin/adderall"',
  'bin.install_symlink "adderall" => "add"',
  "quiet_system \"xattr\", \"-d\", \"com.apple.quarantine\", bin/\"adderall\"",
  "adderall install",
  "adderall doctor",
  "adderall --help",
];

for (const needle of required) {
  if (!formulaText.includes(needle)) failures.push(`Formula/adderall.rb missing ${needle}`);
}

if (/system\s+["'].*adderall["'],\s*["']install["']/.test(formulaText)) {
  failures.push("formula must not run adderall install");
}

const url = match(/url "([^"]+)"/);
const expectedSha = match(/sha256 "([a-f0-9]{64})"/);
if (url && expectedSha && process.env.SKIP_NETWORK !== "1") {
  const temp = mkdtempSync(join(tmpdir(), "adderall-formula-"));
  try {
    const tarball = join(temp, "adderall-darwin-arm64.tar.gz");
    const curl = run("curl", ["-fsSL", "-o", tarball, url]);
    if (curl.status !== 0) {
      failures.push(`curl failed for formula url: ${curl.stderr || curl.stdout}`);
    } else {
      const actualSha = createHash("sha256").update(readFileSync(tarball)).digest("hex");
      if (actualSha !== expectedSha) {
        failures.push(`formula sha256 mismatch: expected ${expectedSha}, got ${actualSha}`);
      }
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

const syntax = run("ruby", ["-c", formula]);
if (syntax.status !== 0) {
  failures.push(`formula ruby syntax failed: ${syntax.stderr || syntax.stdout}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("PASS adderall formula");

function match(regex) {
  const found = formulaText.match(regex);
  return found ? found[1] : null;
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
  });
}
