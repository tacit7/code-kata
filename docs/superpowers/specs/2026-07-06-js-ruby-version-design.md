# js-ruby-version — Design Spec

**Date:** 2026-07-06 (revised same day after Codex review)
**Branch:** `js-ruby-version`
**Status:** Revised — pending re-review

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

**Dependencies (exact-pinned pair — the JS API and the binary are separate
packages):**

- `@ruby/wasm-wasi` — the JS API layer.
- `@ruby/3.3-wasm-wasi` (or the version validated during the compatibility
  spike, see §1.5) — the actual CRuby WASM binary, ~25 MB. **Bundled in the
  app**; works fully offline. The selected Ruby version is frozen for this
  branch, exact-pinned in `package.json`, and exposed by the runner in
  diagnostics so failure reports say which CRuby WASM build ran.

**Worker lifecycle — cache the module, never reuse a VM:**

- New `ruby-test-worker.ts`. The main thread keeps a single warm worker. The
  worker caches the fetched/compiled `WebAssembly.Module`, but creates a
  **fresh Ruby VM/WASI instance per test run**. VM reuse is explicitly
  rejected: Ruby user code can mutate globals, constants, core classes, and
  `ENV`, and none of that is undone by a fresh binding.
- Load order inside each run: helpers → user code → test code → runner
  script. User code can technically redefine helpers; accepted for this
  educational, offline context and covered by runner edge-case tests (§1.6).
- Test extraction stays regex-based (`/def\s+(test_\w+)/g`) with an explicit
  convention: **Ruby kata tests are top-level `def test_name` methods** — no
  class-based tests, no `def self.test_x`, no `!`/`?` suffixes. Tests run in
  source order as extracted from `testCode`.

**Timeouts (two, not one):**

- `initTimeoutMs = 15_000` — cold worker startup + WASM compile + VM boot.
- `executionTimeoutMs = 5_000` — user code + tests (matches the JS runner).
- Warm runs only pay the execution timeout.

**Output capture:**

- Ruby stdout/stderr are captured through the WASI output hooks exposed by
  `@ruby/wasm-wasi` (not real process stdio). The existing `PASS:`/`FAIL:`
  parser consumes captured stdout after execution; stderr is attached to
  failed results as truncated diagnostic output.
- Captured output is capped at **256 KB per run**; exceeding the cap fails
  the run with an output-limit error.

**Failure recovery:**

- On execution timeout or fatal worker error, the main thread terminates and
  discards the worker; the next run creates a new cold worker (pays init
  again). Accepted cost.
- If WASM initialization itself fails, the runner returns a runner-level
  error including package/version diagnostics and Ruby runs stay disabled
  until the runner is recreated (app reload).
- Shell-plugin usage for Ruby is removed entirely (no `Command.create`).

### 1.5 Compatibility spike (before any porting)

Before porting katas at scale, a small spike must prove the stack end to end:

1. Bundle the pinned packages, run ~5 representative katas (arrays, hashes,
   strings, recursion, a deliberate infinite loop) through the WASM runner.
2. Verify in **both** `pnpm tauri dev` and a **packaged Tauri build**,
   offline.
3. Confirm timeout/recovery behavior (worker dies, next run recovers cold).

Porting does not start until the spike passes.

### 1.6 Runner edge-case tests

The runner ships with tests covering: syntax error in user code, exception
before test definitions, exception inside a test, missing expected method,
user redefining `assert_equal`, user calling `exit`, infinite loop, huge
output (cap trigger), and non-ASCII strings.

### 2. WASM asset packaging (Vite + Tauri)

- The Ruby WASM binary is bundled as a Vite asset and loaded by URL inside
  `ruby-test-worker.ts`. If the package's default dynamic resolution fails
  under Tauri, fall back to copying the `.wasm` into `public/ruby-wasm/` at
  build time and passing its resolved URL to the VM loader explicitly.
- Tauri CSP / config (`tauri.conf.json`) must permit Web Workers and
  WebAssembly instantiation in the webview (`worker-src`, and
  `wasm-unsafe-eval` in `script-src` if required by the webview).
- Both dev and packaged builds are verified as part of the spike (§1.5).

### 3. Remove Python

- Delete `src/lib/python-runner.ts` and the python branch in `test-runner.ts`.
- `KataLanguage` becomes `"javascript" | "ruby"`; update the settings toggle
  and `kata-form.tsx` options (drop python, make ruby a real option).
- Remove python seed katas from the seed pipeline (superseded by the ports).
- **Settings coercion:** persisted settings can outlive the DB — if the
  stored `KataLanguage` is `"python"`, coerce it to `"ruby"` on load.
- **Editor mapping:** Ruby katas map to Monaco language `"ruby"`. If the
  current Monaco setup doesn't bundle Ruby highlighting, register it or fall
  back to plaintext with an explicit TODO.
- **Removal checklist (grep before calling it done):** `python`, `Python`,
  `.py`, `pytest`, `python-runner`, `language: "python"`, plus a pass over
  Monaco language mapping, DB seed language values, analytics filters, route
  params, docs/screenshots, and shell permissions in
  `src-tauri/capabilities/default.json` (drop runner-related entries if
  nothing else uses them; verify `shell:allow-open` usage before removing).

### 4. Port 181 Python katas to Ruby

- Same `name`, `category`, `difficulty`, `description`, `usage`, `tags`, and
  viz mappings — only `code`, `testCode`, and `solution` are translated.
- Ruby conventions: snake_case method names, top-level `def test_x` tests
  calling `assert_equal(expected, actual, "msg")` (expected first, matching
  both the existing helpers and Minitest convention).
- `language: "ruby"` on every ported kata.
- **Automated verification:** `scripts/verify-ruby-katas.ts` runs every Ruby
  kata's `solution` against its `testCode` through the same WASM runner the
  app uses and emits a machine-readable report (total / passed / failed with
  kata ids and Ruby version). A kata counts as ported only when it passes in
  this report — no manual "it passes" claims.
- Porting is mechanical and parallelizable (agent fan-out at implementation
  time); verification is per-kata and non-negotiable.

### 5. Seed data / DB

- Ported Ruby katas **replace** the Python seed entries (new seed records;
  no attempt to preserve Python kata ids). Python kata progress/history is
  not migrated.
- This branch is a separate app variant; local DBs reseed. The dev workflow
  gets an explicit reset path (command or documented step) to drop/reseed
  the kata DB; if none exists yet, add one as part of implementation.

### 6. Untouched

- The 53 JS katas and the JS worker runner.
- Algo-viz pages, VizNav bridge, editor layout, analytics, session tracking.

## Risks / accepted tradeoffs

- **Installer size:** +~25 MB from bundled ruby.wasm. Accepted.
- **Cold-start after failure:** watchdog kills the worker and its module
  cache; next run pays full init. Accepted.
- **Helper redefinition:** user code can overwrite `assert_equal` etc.;
  accepted for an offline educational tool, covered by edge-case tests.
- **ruby.wasm fidelity:** CRuby-on-WASM stdlib coverage is broad but not
  total; algo katas use core types only. The spike (§1.5) and per-kata
  verification catch gaps before they multiply across 181 ports.

## Success criteria

1. Fresh machine with no Ruby/Node/Python: app installs, JS and Ruby katas
   both run and report per-test pass/fail.
2. **Packaged** Tauri build loads ruby.wasm and runs Ruby katas **offline**.
3. `scripts/verify-ruby-katas` reports **181/181 passing**.
4. Python is gone from UI, types, runners, and seed data (checklist in §3
   comes up empty).
5. Persisted `"python"` language setting is coerced to `"ruby"` on load.
6. A timed-out or fatally-errored Ruby run recovers on the next run (new
   cold worker).
7. First Ruby run initializes within the 15s init budget; warm runs are
   bounded by the 5s execution budget.
