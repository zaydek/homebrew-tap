#!/usr/bin/env node
import { createHash } from "node:crypto";
import { accessSync, constants, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const formula = join(root, "Formula/adderall.rb");
const maxMacOSMinVersion = "13.0";
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
  'url "https://github.com/zaydek/homebrew-tap/releases/download/adderall-v0.1.1/adderall-darwin-arm64.tar.gz"',
  'sha256 "e467b1eafc42e89f29edd337839c1931413ac405e468d5651147156af0847d7a"',
  'version "0.1.1"',
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
      if (process.platform !== "darwin") {
        failures.push("live formula binary minos check requires macOS otool");
      } else {
        const extractRoot = join(temp, "extract");
        const extract = run("mkdir", ["-p", extractRoot]);
        if (extract.status !== 0) {
          failures.push(`mkdir failed for formula extract: ${extract.stderr || extract.stdout}`);
        } else {
          const tar = run("tar", ["-xzf", tarball, "-C", extractRoot]);
          if (tar.status !== 0) {
            failures.push(`tar failed for formula asset: ${tar.stderr || tar.stdout}`);
          } else {
            const binary = join(extractRoot, "adderall-darwin-arm64/bin/adderall");
            const loadCommands = run("otool", ["-l", binary]);
            if (loadCommands.status !== 0) {
              failures.push(`otool failed for formula binary: ${loadCommands.stderr || loadCommands.stdout}`);
            } else {
              const minos = parseMacOSMinVersion(loadCommands.stdout);
              if (!minos) {
                failures.push("formula binary must declare LC_BUILD_VERSION minos");
              } else if (compareVersions(minos, maxMacOSMinVersion) > 0) {
                failures.push(`formula binary LC_BUILD_VERSION minos must be <= ${maxMacOSMinVersion}, got ${minos}`);
              }
            }
          }
        }
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

function parseMacOSMinVersion(loadCommands) {
  const lines = loadCommands.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes("LC_BUILD_VERSION")) continue;
    let sawMacOSPlatform = false;
    for (let cursor = index + 1; cursor < lines.length && !lines[cursor].includes("Load command "); cursor += 1) {
      const line = lines[cursor].trim();
      if (line === "platform MACOS" || line === "platform 1") sawMacOSPlatform = true;
      if (sawMacOSPlatform && line.startsWith("minos ")) return line.slice("minos ".length).trim();
    }
  }
  return null;
}

function compareVersions(left, right) {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10));
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10));
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const a = Number.isFinite(leftParts[index]) ? leftParts[index] : 0;
    const b = Number.isFinite(rightParts[index]) ? rightParts[index] : 0;
    if (a !== b) return a > b ? 1 : -1;
  }
  return 0;
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
  });
}
