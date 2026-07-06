# js-ruby-version Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make this branch a JavaScript + Ruby variant of kata-desktop that runs with nothing installed — Ruby executes via bundled ruby.wasm in a Web Worker; Python and Pyodide are removed; the 181 Python katas are ported to Ruby.

**Architecture:** Clone the proven Pyodide pattern (`python-runner.ts` + `python-test-worker.ts`): a warm Web Worker caches the compiled `WebAssembly.Module` and creates a **fresh Ruby VM per run** (VM reuse rejected — Ruby globals/constants/core-class patches can't be reset). Script-building and result-parsing live in a pure shared core (`ruby-exec-core.ts`) used by both the worker and the Node verifier, so `scripts/verify-ruby-katas.ts` exercises the same code path.

**Tech Stack:** Tauri v2, React 19, Vite 7, TypeScript strict, `@ruby/wasm-wasi` + `@ruby/3.3-wasm-wasi` (exact-pinned), vitest (new devDep) for unit tests.

**Spec:** `docs/superpowers/specs/2026-07-06-js-ruby-version-design.md` — read it before starting. Note one correction to its "Current state" section discovered during planning: Python already runs via Pyodide in a worker (`src/lib/python-test-worker.ts`, assets in `public/pyodide/`, ~12 MB), NOT via pytest child processes. This is good: removal also deletes the Pyodide bundle, and the worker pattern is the template for Ruby.

## Global Constraints

- Package manager is **pnpm**. TypeScript strict mode; `noUnusedLocals`, `noUnusedParameters` are on — unused imports fail `pnpm build`.
- Ruby WASM packages are **exact-pinned** (no `^`) in `package.json`.
- Fresh Ruby VM per test run; the worker caches only the compiled module.
- Timeouts: `INIT_TIMEOUT_MS = 15_000` (cold module compile), `EXEC_TIMEOUT_MS = 5_000` (per run: VM creation + helpers + user code + tests).
- Output caps: 256 KB captured per run (enforced in Ruby), 8 KB per field surfaced to UI (enforced in TS).
- Ruby test convention: top-level `def test_name` only; assertion helpers are **expected-first**: `assert_equal(expected, actual, msg)`.
- Synthetic failure names: `load_error` (code failed to eval before tests), `runner_error` (no `test_*` methods found).
- Ruby katas use core language + core collection/string APIs only — no time, randomness, file IO, networking, threads, or gems.
- Porting (Task 8) MUST NOT start until the spike gate (Task 5) passes.
- Commit after each task. No Anthropic attribution in commit messages.

## File Structure

```
src/lib/ruby-exec-core.ts      # NEW: pure core — script builder, test extraction, result parsing (shared worker/Node)
src/lib/ruby-test-worker.ts    # NEW: Web Worker — module cache, fresh VM per run, ready/run protocol
src/lib/ruby-runner.ts         # REWRITE: main-thread lifecycle — warm worker, two timeouts, recovery
src/lib/ruby-exec-core.test.ts # NEW: vitest unit tests for the pure core
scripts/verify-ruby-katas.ts   # NEW: Node verifier over all Ruby katas, JSON report
src/lib/test-runner.ts         # MODIFY: drop python branch (Task 9)
src/stores/settings-store.ts   # MODIFY: KataLanguage, python→ruby coercion (Task 9)
src/routes/settings.tsx        # MODIFY: toggle Ruby instead of Python (Task 9)
src/routes/kata-form.tsx       # MODIFY: language options (Task 9)
src/lib/sample-katas-ruby.ts   # RENAMED from sample-katas-python.ts, content ported (Task 8)
src/lib/database.ts            # MODIFY: import rename only (Task 8)
src/lib/{neetcode-*,blind75-additions-*}.ts  # MODIFY: 18 files, python katas ported in place (Task 8)
DELETED: src/lib/python-runner.ts, src/lib/python-test-worker.ts, public/pyodide/ (Task 9)
```

---

### Task 1: Dependencies and Vite config

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: importable `@ruby/wasm-wasi` (JS API) and `@ruby/3.3-wasm-wasi` (CRuby binary); `vitest` + `pnpm test` script.

- [ ] **Step 1: Install the Ruby WASM package pair and vitest**

```bash
pnpm add @ruby/wasm-wasi @ruby/3.3-wasm-wasi
pnpm add -D vitest
```

- [ ] **Step 2: Exact-pin the Ruby packages**

Edit `package.json`: remove the `^` from both `@ruby/wasm-wasi` and `@ruby/3.3-wasm-wasi` entries so they are exact versions (e.g. `"2.7.1"`, whatever pnpm installed). Leave vitest's default range. Add the test script to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Verify the binary asset exists**

Run: `ls -la node_modules/@ruby/3.3-wasm-wasi/dist/`
Expected: a `ruby+stdlib.wasm` (or `ruby.wasm`) file of ~20-40 MB. Note the exact filename — Tasks 3 and 7 import it. If the filename differs from `ruby+stdlib.wasm`, use the actual name everywhere this plan references it.

- [ ] **Step 4: Exclude the WASM package from Vite pre-bundling**

In `vite.config.ts`, extend the existing `optimizeDeps.exclude` (it already excludes `pyodide`):

```ts
optimizeDeps: {
  exclude: ["pyodide", "@ruby/wasm-wasi"],
},
```

- [ ] **Step 5: Verify the app still builds**

Run: `pnpm build`
Expected: tsc + vite build succeed with no new errors.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts
git commit -m "feat(ruby): add exact-pinned ruby.wasm packages and vitest"
```

---

### Task 2: Ruby execution core (pure, shared)

**Files:**
- Create: `src/lib/ruby-exec-core.ts`
- Test: `src/lib/ruby-exec-core.test.ts`

**Interfaces:**
- Consumes: `TestResult` from `src/types/editor.ts` (`{ name, passed, error?, output?, expected?, got? }`).
- Produces:
  - `extractTestNames(testCode: string): string[]` — regex `/def\s+(test_\w+)/g`, source order.
  - `buildPrelude(): string` — Ruby helpers (JSON/StringIO requires + `KataAssertions`).
  - `buildRunnerScript(testNames: string[]): string` — Ruby loop that runs tests, captures per-test stdout, returns a JSON string as its final expression.
  - `parseRunResults(json: string, testNames: string[]): TestResult[]` — parse + 8 KB UI truncation.
  - `loadErrorResult(message: string): TestResult[]`, `runnerErrorResult(): TestResult[]`.
  - Constants: `INIT_TIMEOUT_MS = 15_000`, `EXEC_TIMEOUT_MS = 5_000`, `OUTPUT_CAP_BYTES = 262_144`, `UI_TRUNCATE_BYTES = 8_192`.

Design note: results return through `vm.eval`'s **return value** (the runner script's final expression is a JSON string), not through WASI stdout hooks. User `puts` output is captured *inside Ruby* by swapping `$stdout` for a `StringIO` per test. This is simpler and more testable than WASI fd plumbing and satisfies the spec's capture requirements; the 256 KB cap is applied to the StringIO content in Ruby.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/ruby-exec-core.test.ts
import { describe, it, expect } from "vitest";
import {
  extractTestNames,
  buildRunnerScript,
  parseRunResults,
  loadErrorResult,
  runnerErrorResult,
  UI_TRUNCATE_BYTES,
} from "./ruby-exec-core";

describe("extractTestNames", () => {
  it("extracts top-level def test_* in source order", () => {
    const code = `def test_b\nend\ndef helper\nend\ndef test_a\nend`;
    expect(extractTestNames(code)).toEqual(["test_b", "test_a"]);
  });
  it("returns empty for no tests", () => {
    expect(extractTestNames("def helper\nend")).toEqual([]);
  });
});

describe("buildRunnerScript", () => {
  it("embeds each test name as a symbol", () => {
    const script = buildRunnerScript(["test_a", "test_b"]);
    expect(script).toContain(":test_a");
    expect(script).toContain(":test_b");
  });
});

describe("parseRunResults", () => {
  it("maps pass and structured assert failure", () => {
    const json = JSON.stringify([
      { name: "test_a", passed: true, output: "" },
      { name: "test_b", passed: false, error: "boom", expected: "1", got: "2", output: "hi\n" },
    ]);
    const results = parseRunResults(json, ["test_a", "test_b"]);
    expect(results[0]).toEqual({ name: "test_a", passed: true });
    expect(results[1]).toMatchObject({ name: "test_b", passed: false, error: "boom", expected: "1", got: "2", output: "hi" });
  });
  it("fills missing tests as did-not-run", () => {
    const results = parseRunResults("[]", ["test_a"]);
    expect(results[0]).toMatchObject({ name: "test_a", passed: false, error: "Test did not run" });
  });
  it("truncates long fields to UI cap", () => {
    const long = "x".repeat(UI_TRUNCATE_BYTES + 100);
    const json = JSON.stringify([{ name: "test_a", passed: false, error: long, output: long }]);
    const [r] = parseRunResults(json, ["test_a"]);
    expect(r.error!.length).toBeLessThanOrEqual(UI_TRUNCATE_BYTES + 12); // + "…[truncated]"
    expect(r.output!.length).toBeLessThanOrEqual(UI_TRUNCATE_BYTES + 12);
  });
  it("returns load_error on unparseable json", () => {
    const results = parseRunResults("not json", ["test_a"]);
    expect(results[0].name).toBe("load_error");
  });
});

describe("synthetic results", () => {
  it("loadErrorResult", () => {
    expect(loadErrorResult("syntax error")[0]).toMatchObject({ name: "load_error", passed: false, error: "syntax error" });
  });
  it("runnerErrorResult", () => {
    expect(runnerErrorResult()[0]).toMatchObject({ name: "runner_error", passed: false });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/lib/ruby-exec-core.test.ts`
Expected: FAIL — module `./ruby-exec-core` not found.

- [ ] **Step 3: Implement the core**

```ts
// src/lib/ruby-exec-core.ts
import type { TestResult } from "../types/editor";

export const INIT_TIMEOUT_MS = 15_000;
export const EXEC_TIMEOUT_MS = 5_000;
export const OUTPUT_CAP_BYTES = 262_144;
export const UI_TRUNCATE_BYTES = 8_192;

export function extractTestNames(testCode: string): string[] {
  return [...testCode.matchAll(/def\s+(test_\w+)/g)].map((m) => m[1]);
}

// Helpers loaded BEFORE user code. Expected-first, matching Minitest.
// Assertion failures carry structured data via an __ASSERT__ JSON payload,
// mirroring the JS/Python workers' protocol.
export function buildPrelude(): string {
  return `
require "json"
require "stringio"

module KataAssertions
  def assert_equal(expected, actual, msg = nil)
    return if expected == actual
    raise "__ASSERT__" + JSON.generate({
      "expected" => expected.inspect,
      "got" => actual.inspect,
      "msg" => msg,
    })
  end

  def assert_true(condition, msg = nil)
    raise(msg || "Expected truthy, got #{condition.inspect}") unless condition
  end

  def assert_false(condition, msg = nil)
    raise(msg || "Expected falsy, got #{condition.inspect}") if condition
  end
end
include KataAssertions
`;
}

// Runs each test in source order in the same VM, capturing per-test stdout
// via a StringIO swap (capped at OUTPUT_CAP_BYTES). Rescues Exception (not
// just StandardError) so SystemExit from user "exit" fails the test instead
// of killing the VM. Final expression is the JSON results string, returned
// by vm.eval.
export function buildRunnerScript(testNames: string[]): string {
  const list = testNames.map((n) => `:${n}`).join(", ");
  return `
__kata_results = []
[${list}].each do |__kata_name|
  __kata_buf = StringIO.new
  __kata_orig = $stdout
  $stdout = __kata_buf
  begin
    send(__kata_name)
    __kata_results << { "name" => __kata_name.to_s, "passed" => true, "output" => __kata_buf.string[0, ${OUTPUT_CAP_BYTES}] }
  rescue Exception => __kata_e
    __kata_entry = { "name" => __kata_name.to_s, "passed" => false, "output" => __kata_buf.string[0, ${OUTPUT_CAP_BYTES}] }
    __kata_msg = __kata_e.message.to_s
    __kata_idx = __kata_msg.index("__ASSERT__")
    if __kata_idx
      begin
        __kata_data = JSON.parse(__kata_msg[(__kata_idx + 10)..])
        __kata_entry["error"] = __kata_data["msg"] || "Expected #{__kata_data["expected"]}, got #{__kata_data["got"]}"
        __kata_entry["expected"] = __kata_data["expected"]
        __kata_entry["got"] = __kata_data["got"]
      rescue
        __kata_entry["error"] = __kata_msg
      end
    else
      __kata_entry["error"] = "#{__kata_e.class}: #{__kata_msg}"
    end
    __kata_results << __kata_entry
  ensure
    $stdout = __kata_orig
  end
end
JSON.generate(__kata_results)
`;
}

interface RawResult {
  name: string;
  passed: boolean;
  error?: string;
  expected?: string;
  got?: string;
  output?: string;
}

function truncate(s: string | undefined): string | undefined {
  if (!s) return undefined;
  const trimmed = s.trim();
  if (!trimmed) return undefined;
  return trimmed.length > UI_TRUNCATE_BYTES
    ? trimmed.slice(0, UI_TRUNCATE_BYTES) + "…[truncated]"
    : trimmed;
}

export function parseRunResults(json: string, testNames: string[]): TestResult[] {
  let raw: RawResult[];
  try {
    raw = JSON.parse(json) as RawResult[];
    if (!Array.isArray(raw)) throw new Error("not an array");
  } catch {
    return loadErrorResult(`Runner returned unparseable output: ${json.slice(0, 200)}`);
  }
  const byName = new Map(raw.map((r) => [r.name, r]));
  return testNames.map((name) => {
    const r = byName.get(name);
    if (!r) return { name, passed: false, error: "Test did not run" };
    if (r.passed) {
      const output = truncate(r.output);
      return output ? { name, passed: true, output } : { name, passed: true };
    }
    return {
      name,
      passed: false,
      error: truncate(r.error) ?? "Test failed",
      expected: r.expected,
      got: r.got,
      output: truncate(r.output),
    };
  });
}

export function loadErrorResult(message: string): TestResult[] {
  return [{ name: "load_error", passed: false, error: truncate(message) ?? "Load error" }];
}

export function runnerErrorResult(): TestResult[] {
  return [{ name: "runner_error", passed: false, error: "No test_* methods in test code" }];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/lib/ruby-exec-core.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ruby-exec-core.ts src/lib/ruby-exec-core.test.ts
git commit -m "feat(ruby): pure execution core — script builder and result parser"
```

---

### Task 3: Ruby test worker

**Files:**
- Create: `src/lib/ruby-test-worker.ts`

**Interfaces:**
- Consumes: `buildPrelude`, `buildRunnerScript`, `extractTestNames`, `parseRunResults`, `loadErrorResult`, `runnerErrorResult` from `./ruby-exec-core`; `DefaultRubyVM` from `@ruby/wasm-wasi/dist/browser`; the wasm binary via Vite `?url` import.
- Produces (postMessage protocol, consumed by Task 4):
  - Worker → main on startup after module compile: `{ type: "ready" }`; on compile failure: `{ type: "init_error", error: string }`.
  - Main → worker: `{ userCode: string, testCode: string }`.
  - Worker → main per run: `{ type: "results", results: TestResult[] }`.

- [ ] **Step 1: Write the worker**

```ts
// src/lib/ruby-test-worker.ts
import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/browser";
import wasmUrl from "@ruby/3.3-wasm-wasi/dist/ruby+stdlib.wasm?url";
import {
  buildPrelude,
  buildRunnerScript,
  extractTestNames,
  parseRunResults,
  loadErrorResult,
  runnerErrorResult,
} from "./ruby-exec-core";

// The compiled module is cached for the worker's lifetime. A FRESH Ruby VM
// is created per run — Ruby global/class state cannot be reset reliably, so
// VM reuse is rejected by design (see spec §1).
const modulePromise: Promise<WebAssembly.Module> = WebAssembly.compileStreaming(fetch(wasmUrl));

modulePromise.then(
  () => self.postMessage({ type: "ready" }),
  (err) => self.postMessage({ type: "init_error", error: `ruby.wasm compile failed: ${String(err)} (url: ${wasmUrl})` }),
);

self.onmessage = async (e: MessageEvent<{ userCode: string; testCode: string }>) => {
  const { userCode, testCode } = e.data;

  const testNames = extractTestNames(testCode);
  if (testNames.length === 0) {
    self.postMessage({ type: "results", results: runnerErrorResult() });
    return;
  }

  const module = await modulePromise;
  const { vm } = await DefaultRubyVM(module);

  // Load order: helpers → user code → test code → runner (spec §1).
  // A raise in user/test code before the runner is a load_error.
  try {
    vm.eval(buildPrelude());
    vm.eval(userCode);
    vm.eval(testCode);
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: "results", results: loadErrorResult(raw) });
    return;
  }

  try {
    const json = vm.eval(buildRunnerScript(testNames)).toString();
    self.postMessage({ type: "results", results: parseRunResults(json, testNames) });
  } catch (err) {
    // Uncontained exit/abort or VM-level crash during the runner loop.
    const raw = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: "results", results: loadErrorResult(`Runner crashed: ${raw}`) });
  }
};
```

- [ ] **Step 2: Handle the `?url` wasm import type**

TypeScript won't know the `?url` import. Check `src/vite-env.d.ts` — if `/// <reference types="vite/client" />` is present, `?url` imports are already typed. If not, add that reference line.

- [ ] **Step 3: Verify it compiles**

Run: `pnpm build`
Expected: success. If `@ruby/wasm-wasi/dist/browser` has no types under the current `moduleResolution`, check `node_modules/@ruby/wasm-wasi/package.json` `exports` for the correct browser entry point and adjust the import specifier to match (use the actual exported path; add a `.d.ts` shim only as a last resort).

- [ ] **Step 4: Commit**

```bash
git add src/lib/ruby-test-worker.ts src/vite-env.d.ts
git commit -m "feat(ruby): wasm test worker — cached module, fresh VM per run"
```

---

### Task 4: Rewrite ruby-runner.ts (lifecycle + timeouts)

**Files:**
- Modify: `src/lib/ruby-runner.ts` (full rewrite — currently spawns system `ruby -e` via the shell plugin)

**Interfaces:**
- Consumes: worker protocol from Task 3; `INIT_TIMEOUT_MS`, `EXEC_TIMEOUT_MS` from `./ruby-exec-core`.
- Produces: `runRubyTests(userCode: string, testCode: string): Promise<TestResult[]>` — same signature `test-runner.ts:52` already calls. No change needed in `test-runner.ts` for this task.

- [ ] **Step 1: Rewrite the runner**

Replace the entire contents of `src/lib/ruby-runner.ts`:

```ts
import type { TestResult } from "../types/editor";
import { INIT_TIMEOUT_MS, EXEC_TIMEOUT_MS } from "./ruby-exec-core";

// Warm worker: reused across runs so the compiled wasm module is cached.
// Discarded (null) after any timeout or fatal error; the next run pays the
// cold init cost again. Fresh Ruby VM per run happens INSIDE the worker.
let workerInstance: Worker | null = null;
let readyPromise: Promise<void> | null = null;

function timeoutResult(seconds: number): TestResult[] {
  return [
    {
      name: "Timeout",
      passed: false,
      error: `Execution exceeded ${seconds}s — possible infinite loop`,
    },
  ];
}

function discardWorker() {
  workerInstance?.terminate();
  workerInstance = null;
  readyPromise = null;
}

function getWorker(): { worker: Worker; ready: Promise<void> } {
  if (workerInstance && readyPromise) {
    return { worker: workerInstance, ready: readyPromise };
  }
  const worker = new Worker(new URL("./ruby-test-worker.ts", import.meta.url), {
    type: "module",
  });
  const ready = new Promise<void>((resolve, reject) => {
    const initTimer = setTimeout(() => {
      reject(new Error(`ruby.wasm init exceeded ${INIT_TIMEOUT_MS / 1000}s`));
    }, INIT_TIMEOUT_MS);
    const onMessage = (e: MessageEvent<{ type: string; error?: string }>) => {
      if (e.data.type === "ready") {
        clearTimeout(initTimer);
        worker.removeEventListener("message", onMessage);
        resolve();
      } else if (e.data.type === "init_error") {
        clearTimeout(initTimer);
        worker.removeEventListener("message", onMessage);
        reject(new Error(e.data.error));
      }
    };
    worker.addEventListener("message", onMessage);
  });
  workerInstance = worker;
  readyPromise = ready;
  return { worker, ready };
}

export async function runRubyTests(
  userCode: string,
  testCode: string,
): Promise<TestResult[]> {
  const { worker, ready } = getWorker();

  try {
    await ready;
  } catch (err) {
    discardWorker();
    return [
      {
        name: "Ruby runtime error",
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      },
    ];
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      discardWorker();
      resolve(timeoutResult(EXEC_TIMEOUT_MS / 1000));
    }, EXEC_TIMEOUT_MS);

    const onMessage = (e: MessageEvent<{ type: string; results?: TestResult[] }>) => {
      if (e.data.type !== "results") return;
      clearTimeout(timer);
      worker.removeEventListener("message", onMessage);
      resolve(e.data.results ?? []);
    };
    worker.addEventListener("message", onMessage);

    worker.onerror = (e) => {
      clearTimeout(timer);
      discardWorker();
      resolve([{ name: "Worker error", passed: false, error: e.message }]);
    };

    worker.postMessage({ userCode, testCode });
  });
}
```

- [ ] **Step 2: Verify build and unit tests**

Run: `pnpm build && pnpm test`
Expected: both pass. `test-runner.ts` already routes `language === "ruby"` to `runRubyTests` — no dispatch change needed.

- [ ] **Step 3: Smoke-test in dev**

Run `pnpm tauri dev`. In the app, create a custom kata (Katas → New) with language Ruby is not yet in the form — instead use the browser devtools console:

```js
const { runRubyTests } = await import("/src/lib/ruby-runner.ts");
await runRubyTests(
  "def add(a, b)\n  a + b\nend",
  "def test_add\n  assert_equal(3, add(1, 2))\nend\ndef test_fail\n  assert_equal(4, add(1, 2))\nend"
);
```

Expected: `[{name:"test_add",passed:true},{name:"test_fail",passed:false,error:"Expected 4, got 3",expected:"4",got:"3"}]` (field order aside). First call takes seconds (cold), second call is fast (warm).

- [ ] **Step 4: Commit**

```bash
git add src/lib/ruby-runner.ts
git commit -m "feat(ruby): wasm-backed runner with init/exec timeouts and recovery"
```

---

### Task 5: Compatibility spike gate

**Files:**
- Create: `src/lib/ruby-stress.ts` (dev-only helper)
- Modify: `src/App.tsx` (register the helper in dev)

Porting (Task 8) is BLOCKED until every step here passes. Findings go in a commit-message summary and, if anything needed adjusting (timeout split, asset fallback), in a spec addendum.

- [ ] **Step 1: Add the stress helper**

```ts
// src/lib/ruby-stress.ts
// Dev-only: window.__rubyStress(50) — repeated warm runs for the spike's
// memory check (spec §1.5). Watch memory in Activity Monitor / devtools.
import { runRubyTests } from "./ruby-runner";

export async function rubyStress(runs = 50): Promise<string> {
  const user = "def add(a, b)\n  a + b\nend";
  const tests = "def test_add\n  assert_equal(3, add(1, 2))\nend";
  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    const results = await runRubyTests(user, tests);
    if (!results[0]?.passed) return `run ${i} failed: ${JSON.stringify(results)}`;
  }
  const ms = Math.round(performance.now() - start);
  return `${runs} runs OK in ${ms}ms (${Math.round(ms / runs)}ms/run avg)`;
}
```

In `src/App.tsx`, register it (following the existing `window.__seedDashboard` pattern — see `src/lib/seed-dashboard.ts:3`):

```ts
if (import.meta.env.DEV) {
  import("./lib/ruby-stress").then((m) => {
    (window as unknown as { __rubyStress: typeof m.rubyStress }).__rubyStress = m.rubyStress;
  });
}
```

- [ ] **Step 2: Representative kata matrix in dev**

In `pnpm tauri dev` devtools, run these five through `runRubyTests` (same import pattern as Task 4 Step 3) and record pass/fail:

1. Arrays/hashes: `def group(words)\n  words.group_by { |w| w.chars.sort.join }.values\nend` with a test asserting grouped anagrams.
2. Strings: reverse/palindrome check with non-ASCII input (`"résumé"`).
3. Recursion: fibonacci to n=20.
4. Deliberate infinite loop: `def test_loop\n  loop { }\nend` — expect the Timeout result in ~5s, and the NEXT run succeeds (cold re-init).
5. `exit` in a test: `def test_exit\n  exit\nend` — expect a failed test (SystemExit rescued) or, if uncontained, `load_error` + recovery on next run. Record which.

- [ ] **Step 3: 50-run memory check**

In devtools: `await window.__rubyStress(50)`. Watch the app's memory (Activity Monitor). Expected: memory returns near baseline between runs; unbounded growth (e.g. +50 MB per run sustained) is a BLOCKER — stop and investigate VM disposal before proceeding.

- [ ] **Step 4: Packaged offline build**

```bash
pnpm tauri build
```

Open the built app from `src-tauri/target/release/bundle/` **with Wi-Fi off**. Run the Task 4 Step 3 snippet is unavailable in a packaged webview without devtools — instead verify via the UI once Ruby katas exist, OR temporarily enable devtools (`"devtools": true` under the window config in `tauri.conf.json` or build with `--debug`). Confirm: Ruby test run completes offline. If the wasm asset 404s in the packaged build, apply the spec's fallback: copy the binary into `public/ruby-wasm/ruby+stdlib.wasm` at build time and change the worker's `wasmUrl` to `"/ruby-wasm/ruby+stdlib.wasm"`.

- [ ] **Step 5: Commit spike artifacts and findings**

```bash
git add src/lib/ruby-stress.ts src/App.tsx
git commit -m "feat(ruby): spike gate passed — stress helper, matrix + packaged offline verified

<one line per spike finding: 5-kata matrix result, exit behavior, 50-run
memory numbers, packaged-build asset resolution>"
```

---

### Task 6: Node verifier script

**Files:**
- Create: `scripts/verify-ruby-katas.ts`
- Modify: `package.json` (script entry)

**Interfaces:**
- Consumes: the SAME `ruby-exec-core.ts` functions the worker uses (spec Option B: shared runner core, same wasm package, same parser); `DefaultRubyVM` from `@ruby/wasm-wasi/dist/node`; kata seed arrays from `src/lib/*.ts`.
- Produces: `pnpm verify-katas` → JSON report to stdout matching the spec schema; exit code 0 iff `failed === 0`.

- [ ] **Step 1: Write the verifier**

```ts
// scripts/verify-ruby-katas.ts
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
// Task 8 adds: sampleKatasRuby plus the blind75/neetcode imports — copy the
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
    // Task 8 appends: ...sampleKatasRuby and the blind75/neetcode spreads,
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
```

- [ ] **Step 2: Add the script entry**

In `package.json` scripts:

```json
"verify-katas": "npx tsx scripts/verify-ruby-katas.ts"
```

Add `tsx` as a devDependency: `pnpm add -D tsx`.

- [ ] **Step 3: Run against a hand-written Ruby kata**

Temporarily add one Ruby kata to `sample-katas.ts` (or run with a small inline array) to prove the pipeline:

Run: `pnpm verify-katas`
Expected: `{"rubyVersion":"3.3.x","runner":"ruby-wasm","total":1,"passed":1,"failed":0,"failures":[]}` and exit 0. Then break the solution deliberately, rerun, confirm exit 1 with a populated `failures` entry. Revert the temporary kata.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-ruby-katas.ts package.json pnpm-lock.yaml
git commit -m "feat(ruby): verify-ruby-katas script with JSON report"
```

---

### Task 7: Language plumbing — settings, forms, editor

**Files:**
- Modify: `src/stores/settings-store.ts:22,52` (KataLanguage type, default, coercion)
- Modify: `src/routes/settings.tsx:76-83` (toggle buttons)
- Modify: `src/routes/kata-form.tsx:19,38,146-148` (language options)

**Interfaces:**
- Produces: `KataLanguage = "javascript" | "ruby"`; persisted `"python"` coerced to `"ruby"` on settings load.

- [ ] **Step 1: Update the type and add coercion**

In `src/stores/settings-store.ts`:

```ts
export type KataLanguage = "javascript" | "ruby";
```

Find where settings are loaded from the DB (the store's load/init function reading the `settings` table). Where the persisted language value is read, coerce:

```ts
// Persisted settings can outlive this variant's language set — old installs
// may still carry "python".
const language: KataLanguage = stored === "ruby" ? "ruby" : stored === "python" ? "ruby" : "javascript";
```

- [ ] **Step 2: Update the settings toggle**

In `src/routes/settings.tsx:76-83`, change the second button from python to ruby:

```tsx
onClick={() => setSetting("language", "ruby")}
className={`btn btn-sm join-item ${language === "ruby" ? "btn-primary" : "btn-ghost"}`}
```

Button label text: `Ruby`.

- [ ] **Step 3: Update the kata form**

In `src/routes/kata-form.tsx`: type union becomes `"javascript" | "ruby"` (line 19 and the two casts at 38 and 146), and the options become:

```tsx
<option value="javascript">JavaScript</option>
<option value="ruby">Ruby</option>
```

- [ ] **Step 4: Check Monaco highlighting**

`kata-editor.tsx:888,942` passes `language={kata.language}` straight to Monaco — `"ruby"` is in monaco-editor's standard basic-languages set, so no code change is expected. Verify in dev: create a custom Ruby kata via the form, confirm syntax highlighting. If it renders as plaintext, note it and move on (spec-sanctioned fallback with TODO).

- [ ] **Step 5: Build, test in dev, commit**

Run: `pnpm build`, then in `pnpm tauri dev`: switch language toggle to Ruby (kata list will be empty until Task 8 — expected), create a custom Ruby kata, run its tests through the UI, confirm results render.

```bash
git add src/stores/settings-store.ts src/routes/settings.tsx src/routes/kata-form.tsx
git commit -m "feat(ruby): ruby replaces python in language settings and kata form"
```

---

### Task 8: Port 181 Python katas to Ruby

**Files:**
- Rename: `src/lib/sample-katas-python.ts` → `src/lib/sample-katas-ruby.ts` (export `sampleKatasRuby`), 50 katas
- Modify in place (18 files, same export names): `blind75-additions-part1.ts` (15), `part2` (11), `part3` (8), `part4` (8), `part5` (4), `part6` (9), `part7` (12), `part8` (2), `neetcode-stack.ts` (6), `neetcode-binary-search.ts` (4), `neetcode-trees.ts` (5), `neetcode-heap.ts` (6), `neetcode-backtracking.ts` (7), `neetcode-graphs.ts` (7), `neetcode-advanced-graphs.ts` (5), `neetcode-2d-dp.ts` (9), `neetcode-greedy.ts` (7), `neetcode-math-bit.ts` (6)
- Modify: `src/lib/database.ts:4` (import rename), `scripts/verify-ruby-katas.ts` (enable all imports)

**Interfaces:**
- Consumes: `SeedKata` shape; the verifier from Task 6.
- Produces: 181 katas with `language: "ruby"`; `pnpm verify-katas` reports 181/181.

This task is designed for **agent fan-out**: one agent per file, each verified independently. Sub-agents cannot use the Write tool (EITS hook) — they must write files via Python/Bash heredoc.

**Translation rules (give these to every porting agent verbatim):**

1. Only `code`, `testCode`, `solution` change, plus `language: "python"` → `language: "ruby"`. `name`, `category`, `difficulty`, `description`, `usage`, `tags` stay byte-identical.
2. Python `def solve(nums):` → Ruby `def solve(nums)` ... `end`. snake_case is already the convention; keep function names identical (viz mappings key off kata names, not code, but identical names keep descriptions accurate).
3. Starter `code` keeps the same shape: method signature + `# your code here`.
4. Tests: `def test_x():` → `def test_x` ... `end`. **Argument order flips**: Python helpers are `assert_equal(actual, expected, msg)`; Ruby helpers are `assert_equal(expected, actual, msg)` (expected FIRST, Minitest convention). Every call site must swap the first two arguments.
5. `assert_true(cond, msg)` keeps its order. Python `msg="..."` keyword args become plain third positional arg.
6. Data literals: Python `[1, 2]` → `[1, 2]`; `{"a": 1}` → `{ "a" => 1 }`; `(1, 2)` tuples → `[1, 2]` arrays; `None` → `nil`; `True/False` → `true/false`; sets → arrays sorted before comparison (add `.sort` in the test if needed).
7. No time, randomness, file IO, networking, threads, or gems. Core language + collections + strings only. If a Python kata uses `collections.deque` → Ruby Array with `push`/`shift`; `heapq` → implement a small helper inside the solution or restructure (Ruby has no core heap); `collections.Counter` → `tally`.
8. Order-insensitive expected values (e.g. "return in any order" problems): sort both sides in the test, matching what the Python test did.
9. Escaping: the kata fields are TS template literals — backticks and `${` inside Ruby code must be escaped (`\``, `\${`). Ruby's own `#{}` interpolation is fine unescaped.

**Per-file agent workflow:**

- [ ] **Step 1: Rename and port `sample-katas-python.ts` first (pilot file)**

```bash
git mv src/lib/sample-katas-python.ts src/lib/sample-katas-ruby.ts
```

Port its 50 katas per the rules. Rename the export `sampleKatasPython` → `sampleKatasRuby`. Update `src/lib/database.ts` lines 4, 189, 235 to the new import/name. Update the import in `scripts/verify-ruby-katas.ts`.

- [ ] **Step 2: Verify the pilot**

Run: `pnpm verify-katas`
Expected: `total: 50, passed: 50` (only this file's katas are Ruby so far). Fix failures before fanning out — pilot failures are usually rule gaps, and every agent inherits them.

- [ ] **Step 3: Commit the pilot**

```bash
git add src/lib/sample-katas-ruby.ts src/lib/database.ts scripts/verify-ruby-katas.ts
git commit -m "feat(ruby): port sample katas (50) to ruby"
```

- [ ] **Step 4: Fan out the remaining 18 files**

Dispatch one agent per file (batch by EITS reliability limits — past sessions saw 422s at scale; batches of 4-6 are safer). Each agent gets: the translation rules above, its file path, and the instruction to leave every non-code field untouched. After each batch: enable those files' imports in `verify-ruby-katas.ts` (they're already imported via the database.ts copy — just confirm the spread list matches), run `pnpm verify-katas`, fix failures, commit per batch:

```bash
git add src/lib/<files> scripts/verify-ruby-katas.ts
git commit -m "feat(ruby): port <category> katas (<n>) to ruby"
```

- [ ] **Step 5: Full verification**

Run: `pnpm verify-katas`
Expected: `"total": 181, "passed": 181, "failed": 0`. This exact report is the port's completion evidence — paste the summary line into the final commit message.

- [ ] **Step 6: In-app check**

`pnpm tauri dev` → Settings → Reseed katas (button already exists, `settings.tsx:190`) → switch language to Ruby → open a kata → run tests via UI. Confirm results render with pass/fail and diffs.

- [ ] **Step 7: Commit**

```bash
git add -A src/lib scripts
git commit -m "feat(ruby): all 181 katas ported and verified (181/181 passing)"
```

---

### Task 9: Remove Python

**Files:**
- Delete: `src/lib/python-runner.ts`, `src/lib/python-test-worker.ts`, `public/pyodide/`
- Modify: `src/lib/test-runner.ts:2,48-50`, `package.json` (drop `pyodide`), `vite.config.ts` (drop `"pyodide"` from exclude)
- Check: `src-tauri/capabilities/default.json`

- [ ] **Step 1: Remove the runner and worker**

```bash
git rm src/lib/python-runner.ts src/lib/python-test-worker.ts
git rm -r public/pyodide
```

In `src/lib/test-runner.ts`, delete line 2 (`import { runPythonTests }...`) and the `if (language === "python")` branch (lines 48-50).

- [ ] **Step 2: Drop the dependency**

```bash
pnpm remove pyodide
```

In `vite.config.ts`, change `exclude: ["pyodide", "@ruby/wasm-wasi"]` → `exclude: ["@ruby/wasm-wasi"]`.

- [ ] **Step 3: Capabilities check**

Open `src-tauri/capabilities/default.json`. The Ruby runner no longer uses the shell plugin. Check what still needs `shell:allow-execute` — if nothing does (search `src/` for `Command.create` and `@tauri-apps/plugin-shell` imports), remove `shell:allow-execute` but KEEP `shell:allow-open` if anything opens external links (search for `open(` from the shell plugin). Only remove what is provably unused.

- [ ] **Step 4: Run the removal checklist**

```bash
grep -rn -i "python\|pytest\|pyodide" src/ scripts/ --include="*.ts" --include="*.tsx"
grep -rn "\.py\b" src/
```

Expected: zero hits (the settings-store coercion comment from Task 7 mentioning "python" is the one allowed exception — or reword it to "the removed language"). Fix every other hit: analytics filters, route params, docs strings, Monaco references.

- [ ] **Step 5: Full verification**

Run: `pnpm build && pnpm test && pnpm verify-katas`
Expected: all pass, verify reports 181/181. Then `pnpm tauri dev`: JS katas run, Ruby katas run, language toggle shows JavaScript/Ruby only.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: remove python — runner, pyodide bundle, types, UI"
```

---

### Task 10: Final acceptance pass

**Files:** none new — verification only.

- [ ] **Step 1: Packaged offline acceptance**

```bash
pnpm tauri build
```

Launch the bundle with Wi-Fi off. Success criteria from the spec, checked one by one:

1. JS kata runs and reports per-test pass/fail. ✔/✘
2. Ruby kata runs offline in the packaged build. ✔/✘
3. First Ruby run within 15s budget; warm runs within 5s. ✔/✘
4. Force a timeout (infinite-loop kata), confirm next run recovers. ✔/✘

- [ ] **Step 2: Settings coercion check**

With a DB whose settings row has `language = "python"` (set via sqlite or by checking out main, running, switching to python, then back): app loads with Ruby selected, no crash.

- [ ] **Step 3: Verifier as merge gate**

Run: `pnpm verify-katas`
Expected: 181/181. (CI wiring is out of scope until this repo has CI; the pre-merge requirement is this local run.)

- [ ] **Step 4: Commit any fixes and record acceptance**

```bash
git commit -am "chore: js-ruby-version acceptance pass"
```

Record results per criterion in the commit body.
