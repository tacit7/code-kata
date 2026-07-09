# Ruby Runner Integration Contract

**Team:** ruby-runtime-migration (team_id: 623)  
**Status:** Authoritative — do not merge a native runner prototype without sign-off against this document.  
**Source of truth for:** `src/lib/test-runner.ts`, `src/lib/ruby-runner.ts`, `src/lib/ruby-exec-core.ts`

---

## 1. Frontend API (locked — must not change)

```ts
// src/lib/test-runner.ts
runTests(userCode: string, testCode: string, language: string): Promise<TestResult[]>
```

Callers pass `language = "ruby"` and receive `TestResult[]`. The implementation detail (browser WASM worker vs. Tauri command) is invisible to callers. Do not change this signature or move it.

```ts
// Also exported and must stay:
prewarmRunner(language: string): void
```

---

## 2. TestResult Shape (locked — must not change)

```ts
// src/types/editor.ts
interface TestResult {
  name: string;      // test method name or sentinel ("load_error", "runner_error", "Timeout")
  passed: boolean;
  error?: string;    // trimmed, UI-truncated to UI_TRUNCATE_BYTES (8192 chars) + "…[truncated]"
  expected?: string; // only on assert_equal failures
  got?: string;      // only on assert_equal failures
  output?: string;   // per-test stdout, trimmed, UI-truncated
}
```

**Rules for optional fields:**
- Omit (not `null`, not `""`) when blank. `parseRunResults` trims then drops empty strings.
- On a passing test with no stdout, return `{ name, passed: true }` — no extra keys.
- `expected`/`got` are only present on structured `__ASSERT__` failures, never on other errors.

---

## 3. Sentinel Results (must be reproduced exactly)

| Sentinel name | When emitted | Shape |
|---|---|---|
| `"load_error"` | Prelude, user code, or test code raises before runner executes | `{ name: "load_error", passed: false, error: "<msg>" }` |
| `"runner_error"` | No `def test_*` methods found in `testCode` | `{ name: "runner_error", passed: false, error: "No test_* methods in test code" }` |
| `"Timeout"` | Execution time exceeds `EXEC_TIMEOUT_MS` | `{ name: "Timeout", passed: false, error: "Execution exceeded 5s — possible infinite loop" }` |

The `"Timeout"` error string is template-interpolated at `test-runner.ts:10` and `ruby-runner.ts:29` — it is not read back by any UI component. The compat rule still applies: do not alter the exact wording, because any native runner must produce the same string for the two existing JS definitions to remain consistent.

---

## 4. Execution Constants

| Constant | Value | Source | Meaning |
|---|---|---|---|
| `INIT_TIMEOUT_MS` | 15 000 ms | `ruby-exec-core.ts` | Max time to boot the Ruby runtime before giving up |
| `EXEC_TIMEOUT_MS` | 5 000 ms | `ruby-exec-core.ts` | Max wall-clock time for the entire `run_ruby_tests` command to return — not just Ruby execution. Post-execution work (pipe drain, process cleanup) is within the same budget. |
| `OUTPUT_CAP_BYTES` | 262 144 (256 KB) | `ruby-exec-core.ts` | Per-test stdout byte limit inside Ruby |
| `UI_TRUNCATE_BYTES` | 8 192 | `ruby-exec-core.ts` | String fields (error, output, expected, got) are sliced to this before reaching the UI |
| `WATCHDOG_MS` | 5 000 ms | `test-runner.ts:4` (bare literal) | JS-side watchdog for the JS runner path — **duplicates `EXEC_TIMEOUT_MS` instead of importing it** |

> **Known inconsistency:** `WATCHDOG_MS` at `test-runner.ts:4` is a bare `5000` literal, not an import of `EXEC_TIMEOUT_MS`. These are two independent sources of truth for the same deadline. A native implementation should import `EXEC_TIMEOUT_MS` from `ruby-exec-core.ts` directly and avoid introducing a third definition. Fixing the duplicate is tracked as task **#8513**.

A native runner owns `EXEC_TIMEOUT_MS` enforcement. A JS-side `setTimeout` wrapping an `invoke()` call is **not acceptable** — a blocked native thread will not respond to JS-level cancellation.

---

## 5. Ruby Execution Semantics

### 5.1 Load Order

```
1. buildPrelude()      → KataAssertions module + StringIO helpers
2. userCode            → solution under test
3. testCode            → test method definitions
4. buildRunnerScript() → discovery loop + JSON result serialization
```

A raise at step 1–3 produces `load_error`. A raise inside an individual test at step 4 produces a per-test failure (not a `load_error`).

### 5.2 Test Discovery

Tests are discovered with `extractTestNames`:
```
/def\s+(test_\w+)/g   applied to testCode, in source order
```

The runner executes them in discovery order. Order must be preserved.

### 5.3 Assertion Helpers (defined in `buildPrelude()`)

```ruby
assert_equal(expected, actual, msg = nil)
assert_true(condition, msg = nil)
assert_false(condition, msg = nil)
```

`assert_equal` failures raise a structured `__ASSERT__` exception carrying JSON:
```json
{ "expected": "<inspected>", "got": "<inspected>", "msg": null }
```

This is the only mechanism that populates `expected`/`got` on a `TestResult`. The runner script parses this JSON and maps it. A native runner must replicate this parsing.

### 5.4 Per-Test stdout Capture

Each test redirects `$stdout` to a `StringIO` buffer before calling the method and restores it in `ensure`. Captured output:
- Capped at `OUTPUT_CAP_BYTES` inside Ruby — exceeding the cap fails the test with `"Output limit exceeded (256 KB)"`.
- Trimmed and UI-truncated to `UI_TRUNCATE_BYTES` before being returned to the frontend.

### 5.5 Exception Handling

The runner rescues `Exception` (not `StandardError`) so `SystemExit` from a user `exit` call fails the test instead of killing the VM.

Non-`__ASSERT__` errors are formatted as `"ClassName: message"`.

### 5.6 VM Isolation

Each test run gets a fresh Ruby VM. There is no cross-run state. The current browser WASM implementation creates a new VM per run because `RubyVM` has no `dispose` API. A native runner must provide equivalent isolation — either a fresh process or a fully-reset interpreter per run.

---

## 6. Hard Requirements for Native Runner

| # | Requirement |
|---|---|
| R1 | Ruby execution must not run inside `WebKit.WebContent`. |
| R2 | `EXEC_TIMEOUT_MS` must be enforced by the native side. A JS timer is not sufficient. |
| R3 | A runaway Ruby process or runtime must be killable without killing the Tauri renderer. |
| R4 | The native runner must release all child/runtime resources after each test run. |
| R5 | The frontend API (`runTests` signature and `TestResult` shape) must remain unchanged. |
| R6 | All sentinel names (`load_error`, `runner_error`, `Timeout`) and their exact error strings must be reproduced. |
| R7 | The browser WASM worker code must not be deleted by any prototype branch. |
| R8 | A WASM-based native runner must load the **WASI-standalone** ruby.wasm (from the ruby.wasm GitHub releases), NOT the npm `@ruby/3.3-wasm-wasi` artifact. The npm artifact imports `rb-js-abi-host` (58 browser-only JS ABI imports) and cannot be loaded by Wasmtime or wasmi. |

---

## 7. Tauri Command Interface (if delegating via invoke)

The native implementation exposes a single Tauri command that accepts a fully-assembled Ruby script string. **The frontend is responsible for all Ruby source construction using the `ruby-exec-core` builders. Rust must not construct Ruby source.**

```ts
// Frontend assembles the full script before invoking:
const testNames = extractTestNames(testCode);
if (testNames.length === 0) return runnerErrorResult();

const script = [
  buildPrelude(),
  userCode,
  testCode,
  buildRunnerScript(testNames),
].join("\n");

const raw = await invoke<{ status: string; output?: string; message?: string }>(
  "run_ruby_tests",
  { script },
);
```

> **Serialization:** `run_ruby_tests` must return a `#[derive(Serialize)]` struct so Tauri serializes it to an object over the IPC bridge. Do **not** return a `String` produced by hand-rolled `format!("{{\"status\":...}}")` — that produces a JSON string, not an object; `invoke<{ status: string }>` would then receive a string and type-mismatch at runtime. The prototype originally had this bug on all paths; it was fixed in `d71c833c5` via `#[derive(serde::Serialize)]` on `RubyRunOutcome`. The TypeScript generic above types the already-decoded struct fields directly.

**Rust return shape** — the command returns one of three status variants:

| `status` | Fields present | Meaning |
|---|---|---|
| `"ok"` | `output: string` | Runner completed; `output` is the JSON produced by `buildRunnerScript` — pass to `parseRunResults` |
| `"timeout"` | — | Wall-clock deadline exceeded; frontend returns the `Timeout` sentinel |
| `"error"` | `message: string` | Process failed to start or crashed before producing output; frontend returns `loadErrorResult(message)` |

**Rationale:** keeping `buildPrelude` / `buildRunnerScript` / `parseRunResults` in `ruby-exec-core.ts` as the single source of Ruby codegen prevents drift between the browser WASM path and the native path. Rust is a dumb executor.

**Timeout handling:** the native command enforces the wall-clock deadline and returns `status: "timeout"` — the frontend must not wrap `invoke` in a `setTimeout`.

---

## 8. Verification Gates

Before a native runner prototype is considered mergeable, all of the following must pass:

- [ ] `pnpm test` — full suite passes (19 test files, ~163 tests as of js-ruby-version HEAD). `ruby-exec-core.test.ts` has 5 `describe` blocks covering `extractTestNames`, `buildRunnerScript`, `parseRunResults`, synthetic results, and REPL helpers.
- [ ] `pnpm build` — TypeScript strict-mode build succeeds with no type errors.
- [ ] `cargo check && cargo clippy` — Rust backend lints clean for any touched Rust code.
- [ ] Manual: run the "Frequency Count" kata in the Tauri app while monitoring Activity Monitor — WebKit.WebContent CPU must not spike during Ruby execution.
- [ ] Manual: submit an infinite loop in the Ruby editor — must return the `Timeout` sentinel within ~6 s, app remains responsive.
- [ ] Manual: monitor processes — no zombie Ruby child processes after multiple runs.

---

## 9. Contract Review Checklist (for prototype review)

When a prototype branch is ready, review against this document:

### 9.1 Command Signature
- [ ] `runTests(userCode, testCode, language)` unchanged in `test-runner.ts`.
- [ ] Ruby dispatch still goes through `runTests` — no alternative call sites bypassing it.
- [ ] Tauri invoke call uses `{ script }` — a single pre-assembled string, not `{ userCode, testCode }`.
- [ ] `script` is built exclusively from `ruby-exec-core` exports (`buildPrelude`, `buildRunnerScript`) — Rust contains no Ruby source construction.
- [ ] Rust returns `{ status: "ok", output }` / `{ status: "timeout" }` / `{ status: "error", message }` — no other shapes.
- [ ] Frontend maps `"ok"` → `parseRunResults`, `"timeout"` → `timeoutResult`, `"error"` → `loadErrorResult`.

### 9.1a Constant Sourcing
- [ ] The native side must not introduce **any** execution-timing constant (timeout, drain limit, duration value) that is not sourced from `ruby-exec-core.ts` or passed as an explicit invoke parameter. This includes pipe-drain timeouts, cleanup delays, and any duration besides those already enumerated in §4. Hardcoded literals on the Rust side are forbidden — `pipe_drain` is an example of a constant that would slip through a gate naming only `EXEC_TIMEOUT_MS` and `OUTPUT_CAP_BYTES`.

### 9.2 TestResult Compatibility
- [ ] `name`, `passed` always present.
- [ ] `error`, `output`, `expected`, `got` are omitted (not `null`) when absent.
- [ ] Output is trimmed — leading/trailing whitespace stripped.
- [ ] Fields over `UI_TRUNCATE_BYTES` are sliced and appended with `"…[truncated]"`.

### 9.3 Timeout Semantics
- [ ] No JS-side `setTimeout` wrapping the native invocation as the primary timeout.
- [ ] `EXEC_TIMEOUT_MS` (5 000 ms) is the enforced wall-clock limit.
- [ ] Timeout returns exactly `[{ name: "Timeout", passed: false, error: "Execution exceeded 5s — possible infinite loop" }]`.

### 9.4 Sentinel Names
- [ ] `load_error` emitted on prelude/user/test-code failures.
- [ ] `runner_error` emitted when no `test_*` methods found.
- [ ] Neither sentinel is renamed or pluralized.

### 9.5 stdout/error Mapping
- [ ] Per-test stdout captured and available as `output` on result.
- [ ] `__ASSERT__` JSON parsed — `expected`/`got` populated on `assert_equal` failures.
- [ ] Non-assert errors formatted as `"ClassName: message"`.
- [ ] `Exception` (not just `StandardError`) caught so `exit` fails the test.

### 9.6 Load Order
- [ ] Prelude loads before user code.
- [ ] User code loads before test code.
- [ ] Test discovery runs after all three load phases.

### 9.7 Isolation & Cleanup
- [ ] Each run gets a fresh Ruby VM / process (no cross-run state leakage).
- [ ] Resources released after each run (no process accumulation).
- [ ] Browser WASM worker files still present in `src/lib/ruby-test-worker.ts`.

### 9.8 Rust/Native Requirements
- [ ] Ruby process not running in WebKit.WebContent (confirm via process tree).
- [ ] Runaway process killable without affecting renderer (tested with infinite loop).
- [ ] `cargo clippy` passes on touched Rust files.

---

## 10. Open Review Items (pending prototype delivery)

Status of items pending prototype delivery:

- **Native-process prototype (task #8505):** `fd0bd87fa` on `worktree-ruby-native-runner-prototype` (PR #710). Clippy clean. Previously fixed: Ok branch kills process group before draining (~55 ms on `spawn("sleep 8")`); `.process_group(0)` + negative-PID kill reaches descendants; `wait-timeout` crate keeps `Child` on the main thread so `Ok(None)` proves the child is alive before `Child::kill()` (reaped-PID race eliminated); `timeout_ms` passed as milliseconds; Ruby discovery globs versioned dirs. New in `f35f29b09`/`fd0bd87fa`: **zombie fixed** — Err branch (`lib.rs:298-302`) now calls `child.wait()` after `kill_process_group`; **pgid guard fixed** — `kill_process_group` now uses `libc::killpg` with a `pgid > 1` check. **Still NOT merge-ready — three open issues.** §9.1a caught a real violation in its generalized form (`PIPE_DRAIN_TIMEOUT` is a Rust-only constant, not sourced from `ruby-exec-core`); fixing issue 1 correctly — one shared deadline taken at function entry, budget spent by `wait_timeout` then drain — dissolves issue 2 (no separate drain constant needed).
  1. **Ok-branch worst-case wall time exceeds §4** — `PIPE_DRAIN_TIMEOUT = Duration::from_millis(2_000)` added per `f35f29b09`; worst case is now 5 s Ruby + 2 s drain = 7 s total, still exceeding the 5 s `EXEC_TIMEOUT_MS` ceiling §4 defines for the **entire command**. Fix: take one shared deadline at function entry and spend the remaining budget on drain (drain gets whatever is left of 5 s after Ruby finishes, not a fresh 2 s window).
  2. **`PIPE_DRAIN_TIMEOUT` is a Rust-only constant** — promoted to `const PIPE_DRAIN_TIMEOUT: Duration = Duration::from_millis(2_000)` in `f35f29b09`, but still declared on the Rust side only, not sourced from `ruby-exec-core.ts` or passed as an invoke parameter. Violates §9.1a. Resolved automatically if issue 1 is fixed correctly (drain gets remaining budget of the shared deadline; a separate drain constant is no longer needed).
  3. **Sandboxing unsolved** (unchanged) — the native path cannot contain a kata that spawns subprocesses.
- **Wasmtime prototype (task #8506, Done):** `ba19e91ee` on `worktree-ruby-wasmtime-runner-prototype`. Standalone POC under `wasmtime-poc/` — NOT wired into the Tauri app; no `src-tauri` changes. Satisfies R8 (loads the WASI-standalone `ruby-3.3-wasm32-unknown-wasip1-full`; the npm artifact is documented in-source as unusable due to `rb-js-abi-host`). Uses `epoch_interruption` with a ticker thread, satisfying §4/§9.3 wall-clock enforcement. Fresh `Store` per run, satisfying §5.6. Unreviewed against §7 and §9.2 — the POC does not yet expose a Tauri command or produce `TestResult[]`; integration is the remaining work, not correctness of the runner core. Note: `src/wasmi_bench.rs` (103 lines) and `src/compile_bench.rs` exist on the branch with a modified `Cargo.toml`, but `wasmi_bench.rs` was never declared as a `[[bin]]` and was never built — wasmi could not be benchmarked (no bundled WASI host in wasmi 0.41).
- **Packaging assessment:** `e57e3afec` on `worktree-ruby-runtime-packaging-assessment`. Benchmarked; recommendation **reversed to Wasmtime Cranelift**, consistent with §9.3. Independently verified. Key findings: **(a) npm artifact incompatible** — `@ruby/3.3-wasm-wasi` imports `rb-js-abi-host` (58 browser-only JS ABI imports) and cannot be loaded by Wasmtime or wasmi; the native path must use the WASI-standalone build from the ruby.wasm GitHub releases (a different artifact from the one in the pnpm lockfile) — now codified as R8. **(b) Wasmtime epoch interruption** is genuine wall-clock enforcement and satisfies §4/§9.3 directly; the earlier wasmi/fuel proposal is withdrawn. **(c) Per-run cost** 0.26–0.35 s (fresh `Store`+`Instance` per run, satisfying §5.6; `bench.rs` release numbers: compile 26.1 s, per-run 0.313/0.259/0.255 s). **(d) wasmi eliminated**: the 5–20× interpreter factor cited in the assessment is an estimate, not a measurement — `wasmi_bench.rs` was never built (not declared as a `[[bin]]`; wasmi 0.41 has no bundled WASI host). At the estimated factor, per-run becomes 1.3–6.2 s against a 5 s `EXEC_TIMEOUT`. The recommendation stands regardless: Wasmtime wins on epoch/wall-clock grounds under §9.3 independent of wasmi's actual throughput. **Open:** embedded Cranelift compile is 26–31 s vs 4.3 s for the v46 CLI — compile-at-launch would exceed `INIT_TIMEOUT_MS` (15 s); either the embedded compile must be re-measured on current Wasmtime or a prebuilt `.cwasm` must ship per arch. Also unresolved: `.cwasm` is locked to Wasmtime version and target CPU, and `Module::deserialize_file` is unsafe against a user-writable cache path.
- **REPL backend:** The contract above covers the test runner path. REPL (`repl_eval`/`repl_reset` messages, persistent VM) is a separate concern and is not blocked by this contract — but any native runner must not regress REPL functionality.

Update prototype bullets when #8505 and #8506 commit their work.
