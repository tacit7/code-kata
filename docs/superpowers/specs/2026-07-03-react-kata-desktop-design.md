# react-kata-desktop — Design

**Date:** 2026-07-03
**Status:** Approved (revised after review)

## What it is

A new Tauri v2 desktop app, cloned from `kata-desktop`, dedicated to the
`react-katas` curriculum (`~/projects/react-katas`). It reuses kata-desktop's
editor shell, practice/SR system, and tracking database, and replaces the
in-browser test runners with a Vitest shell runner.

New repo location: `~/projects/react-kata-desktop`.

## Clone and strip

Fork/copy `kata-desktop` into `react-kata-desktop`, then remove:

- In-browser runners: `src/lib/python-runner.ts`, `src/lib/python-test-worker.ts`,
  `src/lib/ruby-runner.ts`, `src/lib/js-test-worker.ts`
- All seed files: `src/lib/sample-katas*.ts`, `src/lib/blind75-additions-part*.ts`,
  `src/lib/neetcode-*.ts`
- `public/algo-viz/` and the viz iframe logic + `VIZ_MAP` in `kata-editor.tsx`
- All language-selection UI and language-specific runner branching. The new app
  has one runner: Vitest for React/TypeScript katas. Sweep for leftover
  references to `language`, `python`, `ruby`, `worker`, `VIZ_MAP`, `algo-viz`,
  and seed-file imports.

Keep:

- Monaco editor shell (vim mode, theme), test-results panel, timer
- Practice system: SR queue, daily, weak, speed, level modes; streaks; best times
- Results page, dashboard, Zustand stores, React Router pages, Tailwind theme
- Database layer (`database.ts`) and schema: `katas`, `sessions`, `attempts`,
  `settings`, `presets`, `user_code`
- `src/lib/levels.ts`, rewritten so levels map to the 7 `react-katas`
  curriculum sections

App identity: new name, window title, and bundle identifier in
`src-tauri/tauri.conf.json` so it never collides with kata-desktop.

## Kata source: the react-katas repo

Kata source files remain on disk in the `react-katas` repo; the app's SQLite
database stores **metadata and tracking only**.

- Settings table stores the repo path (default `~/projects/react-katas`).
- On first launch, and via a manual "Rescan" action, the app scans
  `katas/**` with the Tauri fs plugin and upserts the `katas` table:
  - `name` — derived from the kata folder name (e.g. `01-hello-banner` →
    "Hello Banner")
  - `category` — from the section folder (`01-components` → `components`)
  - `description` — the kata's `README.md` content
  - file paths for starter, test, and solution files
- Rescan upserts keyed by kata path so tracking rows survive re-scans.

### Kata folder contract

Each kata directory under `katas/<section>/<kata>/` must contain (verified
against the actual repo — files sit flat in the kata folder, no `starter/`
subdirectory):

- `README.md`
- exactly one starter file matching `*.tsx` or `*.ts`, excluding test files
- exactly one test file matching `*.test.tsx`, `*.test.ts`, `*.test-d.tsx`,
  or `*.test-d.ts` (the `test-d` form is a Vitest typecheck test, used by
  section `07-typescript`)
- optional `solution/<starter filename>`

The starter file is the only editable kata file. If discovery finds zero or
multiple starter files, the kata is marked invalid, excluded from practice
queues, and shown with a scan warning.

### Rescan stale kata behavior

Rescan never deletes historical tracking rows. If a previously scanned kata
path no longer exists, the kata row is marked inactive. Inactive katas are
hidden from practice queues by default but remain visible in historical
results.

### Repo path validation

The configured repo path must pass validation before scan or test execution:

- path exists and contains `package.json`, `katas/`, and a local Vitest
  install (`node_modules/.bin/vitest`)
- all scanned kata paths must resolve inside the configured repo path

The repo path is changed via a native directory picker (Tauri dialog plugin),
not free-text input. The app only reads and writes inside the configured repo
path (plus its own app-data directory).

## Editor

- Monaco opens the kata's real starter file (e.g. `Banner.tsx`), reading and
  writing through the Tauri fs plugin.
- The test file and README are viewable in-app (read-only tab or toggle).
- Solution peek reads `solution/<starter filename>`.
- Missing-file behavior: no README → show "No README found"; no valid test
  file → disable Run Tests and show a scan warning; no solution file →
  disable Solution Peek for that kata.

### Reset kata

Reset restores only the current starter file, behind a confirm dialog
(destructive overwrite):

- Primary: if the starter file is tracked by git, run
  `git checkout -- <relative-starter-path>` in the react-katas repo.
- Fallback: restore from cached original starter content captured at first
  scan, before any in-app edit. Rescan refreshes the cache only for katas
  with no recorded attempts.

## Test runner

One new module, `src/lib/vitest-runner.ts`, replacing all worker-based runners:

- Invokes the repo-local Vitest binary only — `node_modules/.bin/vitest run
  --typecheck <kata-dir> --reporter=json` with cwd set to the react-katas
  repo. Never `npx` (no network resolution, no package downloads).
  `--typecheck` is required so `*.test-d.tsx` katas execute.
- The kata dir argument comes from scanned metadata and is validated to
  resolve inside the configured repo before execution — never raw user input.
- 30-second timeout.

### Result mapping

Each Vitest test case maps to one `TestResult` (`{ name, passed, error? }`):

- `name`: suite name + test name joined with " › "
- `passed`: true iff the test case state is passed
- `error`: assertion failure message when present

Failure mapping — the runner returns `TestResult[]` in all cases:

- timeout: one failed result named "Vitest timeout"
- spawn failure: one failed result named "Vitest runner" with stderr summary
- JSON parse failure: one failed result named "Vitest reporter" with raw
  stdout/stderr summary
- TypeScript/transform failure: one failed result named after the failing
  file when available, otherwise "Vitest runner"

Tauri capabilities: shell execute scoped to the Vitest binary inside the
configured repo; fs read/write scoped to the repo path (extend
`src-tauri/capabilities/default.json`).

## Tracking

Unchanged from kata-desktop: attempts, sessions, SR scheduling, streaks, best
times, Results page. The app uses its own SQLite database file (e.g.
`react-kata-desktop.db`) and never reads or writes kata-desktop's database.
Presets start empty in the fresh database; no migration needed.

## Out of scope (YAGNI)

- Viz pages
- Multi-language support (this app is React/TypeScript only)
- Multi-file editable katas (revisit only if the curriculum adds them)
- Importing kata code into the database
- Editing test files in-app
- Authoring new katas from the app (katas are authored in the react-katas repo)

## Implementation checklist

- Copy repo; set new app name, window title, bundle identifier.
- Point at a separate SQLite database file.
- Remove old runner files, seed files, viz assets, and their imports.
- Remove language-selection UI and runner branching.
- Add repo path setting (native directory picker) and validation.
- Add kata scanner with folder-contract validation and invalid-kata warnings.
- Add rescan action with inactive-kata handling.
- Add `vitest-runner.ts` with result/failure mapping.
- Scope Tauri shell/fs permissions to the configured repo.
- Rewrite `levels.ts` for the 7 React sections; update dashboard/category labels.
- Add starter-file reset (git primary, cached-content fallback, confirm dialog).
