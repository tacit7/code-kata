# react-kata-desktop — Design

**Date:** 2026-07-03
**Status:** Approved

## What it is

A new Tauri v2 desktop app, cloned from `kata-desktop`, dedicated to the
`react-katas` curriculum (`~/projects/react-katas`). It reuses kata-desktop's
editor shell, practice/SR system, and tracking database, and replaces the
in-browser test runners with a vitest shell runner.

New repo location: `~/projects/react-kata-desktop`.

## Clone and strip

Start from a copy of kata-desktop. Remove:

- In-browser runners: `src/lib/python-runner.ts`, `src/lib/python-test-worker.ts`,
  `src/lib/ruby-runner.ts`, `src/lib/js-test-worker.ts`
- All seed files: `src/lib/sample-katas*.ts`, `src/lib/blind75-additions-part*.ts`,
  `src/lib/neetcode-*.ts`
- `public/algo-viz/` and the viz iframe logic + `VIZ_MAP` in `kata-editor.tsx`

Keep:

- Monaco editor shell (vim mode, theme), test-results panel, timer
- Practice system: SR queue, daily, weak, speed, level modes; streaks; best times
- Results page, dashboard, Zustand stores, React Router pages, Tailwind theme
- Database layer (`database.ts`) and schema: `katas`, `sessions`, `attempts`,
  `settings`, `presets`
- `src/lib/levels.ts`, recut so levels map to the 7 react-katas sections

## Kata source: the react-katas repo

Kata **code lives on disk** in the react-katas repo; the app's SQLite database
stores **metadata and tracking only**.

- Settings table stores the repo path (default `~/projects/react-katas`).
- On first launch, and via a manual "Rescan" action, the app scans
  `katas/**` with the Tauri fs plugin and upserts the `katas` table:
  - `name` — derived from the kata folder name (e.g. `01-hello-banner` →
    "Hello Banner")
  - `category` — from the section folder (`01-components` → `components`)
  - `description` — the kata's `README.md` content
  - file paths for starter, test, and solution files
- Rescan upserts by kata path so tracking rows survive re-scans.

## Editor

- Monaco opens the kata's real starter file (e.g. `Banner.tsx`), reading and
  writing through the Tauri fs plugin.
- The test file and README are viewable in-app (read-only tab or toggle).
- Solution peek reads `solution/<same filename>`.
- Reset kata restores the starter via `git checkout -- <file>` in the
  react-katas repo (fallback: cached original content).

## Test runner

One new module, `src/lib/vitest-runner.ts`, replacing all worker-based runners:

- Spawns `npx vitest run <kata-dir> --reporter=json` in the react-katas repo
  via the Tauri shell plugin.
- Parses vitest's JSON reporter output into the existing `TestResult[]` shape
  (`{ name, passed, error? }`) consumed by the results panel.
- 30-second timeout; timeout and spawn failures surface as a failed
  `TestResult` like today's watchdog behavior.

Tauri capabilities: shell execute + fs read/write scoped for the react-katas
repo path (extend `src-tauri/capabilities/default.json` as needed).

## Tracking

Unchanged from kata-desktop: attempts, sessions, SR scheduling, streaks, best
times, Results page — all pointed at the new app's own SQLite database file
(separate from kata-desktop's).

## Out of scope (YAGNI)

- Viz pages
- Multi-language support (this app is React/TypeScript only)
- Importing kata code into the database
- Editing test files in-app
- Authoring new katas from the app (katas are authored in the react-katas repo)
