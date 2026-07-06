// Runs every Ruby kata's solution against its testCode through the SAME
// execution core the app worker uses (spec §4: shared core, same wasm
// package, same script builder and parser). Node host, browser worker —
// only the WebAssembly embedding differs.
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/node";
import {
  buildPrelude,
  buildRunnerScript,
  extractTestNames,
  parseRunResults,
} from "../src/lib/ruby-exec-core";
import type { SeedKata } from "../src/types/editor";
import { sampleKatas } from "../src/lib/sample-katas";
import { sampleKatasRuby } from "../src/lib/sample-katas-ruby";
// Task 8 adds: the blind75/neetcode imports — copy the
// exact import block from src/lib/database.ts lines 4-27 as those files are
// ported (paths become ../src/lib/...). At Task 6 time only sampleKatas
// exists, so total will be 0 until the temporary kata in Step 3.

const require = createRequire(import.meta.url);
const wasmPath = require.resolve("@ruby/3.3-wasm-wasi/dist/ruby+stdlib.wasm");

interface Failure {
  kataId: string;
  error: string;
  stderr: string;
  durationMs: number;
}

async function main() {
  const allKatas: SeedKata[] = [
    ...sampleKatas,
    ...sampleKatasRuby,
    // Task 8 appends: the blind75/neetcode spreads,
    // same order as database.ts seedKatas().
  ];
  const rubyKatas = allKatas.filter((k) => k.language === "ruby");

  const binary = await readFile(wasmPath);
  const module = await WebAssembly.compile(binary);

  const failures: Failure[] = [];
  let passed = 0;

  for (const kata of rubyKatas) {
    const start = Date.now();
    const testNames = extractTestNames(kata.testCode);
    try {
      if (testNames.length === 0) throw new Error("no test_* methods");
      if (!kata.solution) throw new Error("kata has no solution");
      const { vm } = await DefaultRubyVM(module); // fresh VM per kata, like the app
      vm.eval(buildPrelude());
      vm.eval(kata.solution);
      vm.eval(kata.testCode);
      const json = vm.eval(buildRunnerScript(testNames)).toString();
      const results = parseRunResults(json, testNames);
      const failed = results.filter((r) => !r.passed);
      if (failed.length > 0) {
        throw new Error(failed.map((f) => `${f.name}: ${f.error}`).join("; "));
      }
      passed++;
    } catch (err) {
      failures.push({
        kataId: kata.name,
        error: err instanceof Error ? err.message : String(err),
        stderr: "",
        durationMs: Date.now() - start,
      });
    }
  }

  const rubyVersionVm = await DefaultRubyVM(module);
  const rubyVersion = rubyVersionVm.vm.eval("RUBY_VERSION").toString();

  const report = {
    rubyVersion,
    runner: "ruby-wasm",
    total: rubyKatas.length,
    passed,
    failed: failures.length,
    failures,
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(failures.length === 0 ? 0 : 1);
}

main();
