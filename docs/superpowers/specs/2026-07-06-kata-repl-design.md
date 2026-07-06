# Per-Kata REPL — Design Spec

**Date:** 2026-07-06
**Branch:** `js-ruby-version`
**Status:** Approved

## Goal

A REPL panel in the kata editor for interactive exploration: evaluate Ruby or
JavaScript expressions against a persistent session, and load the editor's
current code into it to poke at your own solution.

## Behavior

- REPL icon in the editor toolbar (next to VIM/run) toggles a bottom panel:
  scrollback + single input line.
- **Scope: per kata.** Opening the REPL starts a fresh session; switching
  katas or closing the panel discards it. No state survives navigation.
- **Load code** button evals the current editor buffer into the session
  (re-click to reload; Ruby/JS redefinition semantics apply naturally).
- Ruby sessions preload the same assertion helpers as the test runner.
- Each input echoes `=> <result.inspect>` (Ruby) / `=> <formatted value>`
  (JS), plus captured stdout above it. Errors print class + message and the
  session continues.
- 5s watchdog per eval. A hung eval kills the worker; the panel prints a
  "session reset" line and the next input starts a fresh session.
- History: up/down arrows recall prior inputs (in-memory, per session).

## Implementation

- `ruby-test-worker.ts`: new `{type:"repl_eval", code}` /
  `{type:"repl_reset"}` messages backed by a module-level **persistent VM**
  (created on first repl_eval, discarded on repl_reset). The fresh-VM-per-run
  test path is untouched — test isolation is unaffected. Reply:
  `{type:"repl_result", ok, value?, error?, output?}` with the same StringIO
  stdout capture and 8 KB UI truncation as tests.
- New `src/lib/repl-runner.ts`: main-thread lifecycle mirroring
  `ruby-runner.ts` (same warm worker reuse + 15s init / 5s eval timeouts,
  single-flight queue), exposing `replEval(language, code)` and
  `resetRepl()`. JS sessions eval inside a persistent dedicated worker scope
  (indirect eval; declarations persist via successive `new Function` over a
  shared context object is NOT enough — use `self.eval` in a plain worker so
  `function`/`var` declarations persist).
- New `src/components/repl-panel.tsx` + toolbar icon in `kata-editor.tsx`;
  kata switch calls `resetRepl()` and clears scrollback.

## Out of scope

Multiline input editing, persistence across app restarts, REPL for the test
code, autocomplete.

## Success criteria

1. Ruby: `x = 5` then `x * 2` → `=> 10` (state persists across inputs).
2. Load code on Two Sum, then `two_sum([2,7,11,15], 9)` → `=> [0, 1]`.
3. `loop { }` → session reset line within ~5s; next input works.
4. Switching katas resets the session (`x` undefined afterwards).
5. JS kata REPL: `const f = (n) => n + 1` then `f(1)` → `=> 2`.
6. `pnpm build`, `pnpm test`, `pnpm verify-katas` all stay green.
