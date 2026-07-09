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
| `EXEC_TIMEOUT_MS` | 5 000 ms | `ruby-exec-core.ts` | Max wall time for one test run (all tests combined) |
| `OUTPUT_CAP_BYTES` | 262 144 (256 KB) | `ruby-exec-core.ts` | Per-test stdout byte limit inside Ruby |
| `UI_TRUNCATE_BYTES` | 8 192 | `ruby-exec-core.ts` | String fields (error, output, expected, got) are sliced to this before reaching the UI |
| `WATCHDOG_MS` | 5 000 ms | `test-runner.ts:4` (bare literal) | JS-side watchdog for the JS runner path — **duplicates `EXEC_TIMEOUT_MS` instead of importing it** |

> **Known inconsistency:** `WATCHDOG_MS` at `test-runner.ts:4` is a bare `5000` literal, not an import of `EXEC_TIMEOUT_MS`. These are two independent sources of truth for the same deadline. A native implementation should import `EXEC_TIMEOUT_MS` from `ruby-exec-core.ts` directly and avoid introducing a third definition. Fixing the duplicate is tracked as a separate cleanup item.

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

---

## 7. Tauri Command Interface (if delegating via invoke)

If the native implementation exposes a Tauri command, the expected interface is:

```ts
// Frontend call site (inside ruby-runner.ts or a replacement):
const results: TestResult[] = await invoke<TestResult[]>("run_ruby_tests", {
  userCode,
  testCode,
});
```

The command returns `TestResult[]` directly. Serialization over the Tauri IPC bridge must preserve all optional fields. Fields absent from the result object must not arrive as `null` — either omit them or strip nulls on the frontend.

**Timeout handling:** the native command must enforce the 5 s deadline internally and return the `Timeout` sentinel result rather than hanging. The frontend must not need a `setTimeout` wrapper.

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
- [ ] Tauri invoke call (if applicable) uses `{ userCode, testCode }` keys.

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

The following cannot be reviewed until prototype branches are available:

- **Native-process prototype (TBD branch):** Verify process spawn model, timeout kill signal, and IPC serialization.
- **Wasmtime prototype (TBD branch):** Verify WASM sandbox isolation, memory reclaim after each run, and that the Wasmtime-side prelude matches `buildPrelude()` exactly.
- **Packaging assessment notes (TBD):** Confirm that the native binary or WASM bundle size is within acceptable Tauri app bundle constraints.
- **REPL backend:** The contract above covers the test runner path. REPL (`repl_eval`/`repl_reset` messages, persistent VM) is a separate concern and is not blocked by this contract — but any native runner must not regress REPL functionality.

Update this section with branch names and findings when prototypes land.
