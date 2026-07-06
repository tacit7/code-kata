# js-ruby-version — Design Spec

**Date:** 2026-07-06
**Branch:** `js-ruby-version`
**Status:** Approved

## Goal

Turn this branch into a JavaScript + Ruby variant of kata-desktop that runs with
**nothing installed on the user's machine** — no Node, no Ruby, no Python. Python
support is removed; its 181 katas are ported to Ruby.

## Background

Adding Ruby as a third language to the main app was scrapped because bundling
more runtimes inflates the download. Instead, this branch is a separate app
variant scoped to JS + Ruby. The user explicitly requires the app to work
without Ruby installed, which rules out the existing child-process runner.

## Current state (relevant)

- `src/lib/test-runner.ts` dispatches by language: JS → Web Worker
  (`js-test-worker.ts`, 5s watchdog), Python → `python-runner.ts` (spawns
  pytest via shell plugin), Ruby → `ruby-runner.ts` (spawns system `ruby -e`).
- JS execution is already install-free (webview Worker). ✔
- `ruby-runner.ts` already defines the test protocol: `test_*` methods,
  `assert_equal(expected, actual, msg)` / `assert_true` / `assert_false`
  helpers, `PASS:`/`FAIL:` stdout lines, per-test result mapping. The only
  problem is that it shells out to system Ruby.
- Kata content: 234 seed katas in `src/lib/` — 181 `language: "python"`,
  53 `language: "javascript"`.
- `KataLanguage` in `src/stores/settings-store.ts` is
  `"javascript" | "python"`; toggle lives in `src/routes/settings.tsx`;
  `kata-form.tsx` has a vestigial `"ruby"` in a local type union.

## Design

### 1. Ruby execution: ruby.wasm in a Web Worker

- Add `@ruby/wasm-wasi` (official CRuby WebAssembly build, ~25 MB).
  **Bundled in the app** — works fully offline; the download-size tradeoff was
  explicitly accepted.
- New `ruby-test-worker.ts` mirroring `js-test-worker.ts`: receives
  `{ userCode, testCode }`, instantiates the Ruby VM, evaluates
  helpers + userCode + testCode + runner script, posts `TestResult[]` back.
- Rewrite `runRubyTests` in `ruby-runner.ts` to drive that worker with the
  same 5s watchdog pattern `runJsTests` uses. Reuse the existing helper
  source, test-name extraction (`/def\s+(test_\w+)/g`), runner script, and
  `PASS:`/`FAIL:` parsing nearly verbatim — output flows over `postMessage`
  instead of stdout.
- **VM caching:** keep the initialized VM/module in the worker and keep the
  worker alive between runs, so only the first Ruby run pays WASM init
  (~1–2s). Each test run evaluates in a fresh binding/context so state does
  not leak between runs.
- Remove the shell-plugin dependency for Ruby (no `Command.create("ruby", …)`).

### 2. Remove Python

- Delete `src/lib/python-runner.ts` and the python branch in `test-runner.ts`.
- `KataLanguage` becomes `"javascript" | "ruby"`; update the settings toggle
  and `kata-form.tsx` options (drop python, make ruby a real option).
- Remove python seed katas from the seed pipeline (superseded by the Ruby
  ports below).
- Shell permissions in `src-tauri/capabilities/default.json` can drop the
  runner-related entries if nothing else uses them (verify `shell:allow-open`
  usage before removing).

### 3. Port 181 Python katas to Ruby

- Same `name`, `category`, `difficulty`, `description`, `usage`, `tags`, and
  viz mappings — only `code`, `testCode`, and `solution` are translated.
- Ruby conventions: snake_case method names, `def test_x` tests calling
  `assert_equal(expected, actual, "msg")` matching the existing helper
  signatures (expected first).
- `language: "ruby"` on every ported kata.
- **Verification requirement:** each ported kata's `solution` must pass its
  own `testCode` through the real WASM runner before it counts as done.
  Porting is mechanical and parallelizable (agent fan-out at implementation
  time), but verification is per-kata and non-negotiable.

### 4. Seed data / DB

- Ported Ruby katas replace the Python entries in the seed data.
- This branch is a separate app variant; local DBs reseed. No migration.

### 5. Untouched

- The 53 JS katas and the JS worker runner.
- Algo-viz pages, VizNav bridge, editor, analytics, session tracking.

## Risks / accepted tradeoffs

- **Installer size:** +~25 MB from bundled ruby.wasm. Accepted.
- **Infinite loops kill the VM:** the watchdog terminates the worker, so the
  next Ruby run pays WASM init again. Accepted (JS runner behaves the same,
  minus the init cost).
- **ruby.wasm fidelity:** CRuby-on-WASM stdlib coverage is broad but not
  total; algo katas use core types only, so exposure is minimal. The per-kata
  verification step catches any gaps.

## Success criteria

1. Fresh machine with no Ruby/Node/Python: app installs, JS and Ruby katas
   both run and report per-test pass/fail.
2. All 181 ported Ruby katas: solution passes its tests in the WASM runner.
3. Python is gone from UI, types, runners, and seed data.
4. First Ruby run initializes in a few seconds; subsequent runs are fast.
