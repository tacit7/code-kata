#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const refIndex = args.indexOf("--ref");
const ref = refIndex < 0 ? "app-core" : args[refIndex + 1];
const peerIndex = args.indexOf("--peer");
const roots = [process.cwd()];
if (peerIndex >= 0) roots.push(resolve(args[peerIndex + 1]));
const git = (...args) => execFileSync("git", args);
const manifest = JSON.parse(git("show", `${ref}:docs/shared-frontend-files.json`).toString());
const commit = git("rev-parse", ref).toString().trim();
const mismatches = [];

for (const root of roots) {
  try {
    git("-C", root, "merge-base", "--is-ancestor", commit, "HEAD");
  } catch {
    mismatches.push(`${root} has not merged ${ref} (${commit.slice(0, 8)})`);
  }
  for (const file of manifest) {
    try {
      const expected = git("show", `${ref}:${file}`);
      if (!readFileSync(resolve(root, file)).equals(expected)) {
        mismatches.push(`${root}/${file} differs from ${ref}`);
      }
    } catch {
      mismatches.push(`${root}/${file} is missing`);
    }
  }
}
if (mismatches.length) {
  console.error(mismatches.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`${manifest.length} shared files match ${ref} in ${roots.length} checkout(s).`);
}
