# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Code Kata is a Tauri v2 desktop app for timed coding kata practice sessions with progress tracking. It combines algo katas (Python) and React katas (TypeScript) into a single tool with a Monaco editor, test runner, and analytics dashboard. See `PRD_kata_desktop.md` for the full product spec.

For remaining LeetCode problems that should receive multiple solution variants, see `docs/multi-solution-candidates.md`. Keep that tracker updated when adding or deferring variants.

When changing kata content, apply the change across all maintained language
apps where appropriate: Python and JavaScript in this repo, plus Ruby in
`~/projects/ruby-kata`. If a matching kata is missing in one language and the
problem is language-agnostic, add the missing kata instead of only updating the
languages that already have it. Keep LeetCode number mappings and
`solutionVariants` in sync across languages; Ruby variants also require the
Ruby app's `kind` field.

For efficient cross-language kata updates, prefer shared structure over repeated
manual edits: use small local `variant(...)` helpers plus metadata maps keyed by
variant label/problem name, then run the TypeScript build in both this repo and
`~/projects/ruby-kata`. Every displayed solution variant should include
`complexity` and `explanation`; if variants are generated first and enriched in
a later normalization pass, keep the enrichment map next to the generator.

For DP curriculum/content work, read the course notes first: `dp_course.md`,
`dp_course-2.md`, `dp_course-3.md`, `dp_course-4.md`, and `dp_course-5.md`.
Treat these files as the source notes for module ordering, problem selection,
and teaching intent before editing DP seed data or `dp-patterns.ts`.

## Commands

### Development
```bash
pnpm tauri dev          # Start the full app (Rust backend + Vite frontend with HMR)
pnpm dev                # Frontend only (Vite dev server on port 1420)
pnpm build              # TypeScript check + Vite production build (frontend only)
pnpm tauri build        # Full production build (frontend + Rust, generates installer)
```

### Rust Backend
```bash
cd src-tauri && cargo build       # Build Rust backend
cd src-tauri && cargo check       # Type check Rust without building
cd src-tauri && cargo clippy      # Lint Rust code
```

## Branch Model (read before changing anything)

This repo ships **per-language app variants as long-lived branches**. There is
no single releasable trunk; each variant branch is its own app.

| Branch | What it is | Dev port |
|--------|-----------|----------|
| `app-core` | Shared base: styling, chrome, editor, REPL panel, generic features. Not a runnable product on its own terms — it exists to be merged outward. | 1420 |
| `main` | **JS + Python** variant (product name "Code Kata Python", id `com.code-kata.app`). Python runs via Pyodide in a Web Worker (`public/pyodide/`). | 1420 |

> **The Ruby variant was retired from this repo (2026-07).** The former
> `js-ruby-version` branch was **deleted** — its Tauri WKWebView crashes running
> `ruby.wasm`, so the Ruby app now lives as a **separate Electron project at
> `~/projects/ruby-kata`** (Chromium runs `ruby.wasm` fine). The LeetCode
> feature and the Ruby runner infra were ported there. Don't recreate a Ruby
> variant here. `main` (Python via Pyodide, which WKWebView runs) is the only
> product variant that remains in this Tauri repo.

### Flow rules

- **Shared work** (UI, styling, settings, editor behavior, REPL panel, viz
  pages, anything language-agnostic): commit on `app-core`, then `git merge
  app-core` into `main`.
- **Language/content work** (runners, workers, kata content, seed data): commit
  directly on `main`.
- Flow is one-way: `app-core` → `main`. **Never** merge `main` into `app-core`.
- Note: `app-core` and `main` have historically **lagged** the (now-retired)
  Ruby variant's refactors — e.g. `main` has no `src/lib/seed-katas.ts` and uses
  inline INSERTs in `database.ts` where the Electron app has the extracted
  helpers. Don't assume "shared" files are identical to the Electron app.

### app-core-owned / merge-conflict-prone files

- `src/stores/settings-store.ts` — `KataLanguage` union / persisted-language validation.
- `src/routes/settings.tsx` / `src/routes/kata-form.tsx` — language options.
- `src/lib/repl-backends.ts` — `main` registers the python REPL backend;
  `app-core` ships a stub and must never change it again.
- `src/lib/database.ts` seed imports and the `src/lib/*kata*.ts` content files.
- `vite.config.ts` / `src-tauri/tauri.conf.json` — dev port.

### Gotchas

- `main`'s app identifier is `com.code-kata.app`; DB at
  `~/Library/Application Support/com.code-kata.app/kata.db`. The Electron Ruby
  app uses `com.code-kata.ruby` — separate DB, no progress transfer.
- **`@types/node` is a required devDependency** — `tsconfig` compiles `src/**`
  including a test file that imports `node:fs`/`node:path`, so a clean install
  fails `pnpm build` without it.
- Worktrees for cross-branch work live in `.claude/worktrees/` (`app-core`, `main-variant`).

## Architecture

### Two-Layer Structure

| Layer | Path | Language | Purpose |
|-------|------|----------|---------|
| Frontend | `src/` | TypeScript + React 19 | UI, editor, state |
| Backend | `src-tauri/` | Rust | Native APIs, process spawning, SQLite |

### Frontend Stack
- **React 19** with TypeScript, bundled by **Vite 7**
- **Tailwind CSS v4** (imported via `@import "tailwindcss"` in `index.css`, uses `@tailwindcss/vite` plugin)
- **Zustand** for state management
- **Monaco Editor** (`@monaco-editor/react`) with vim mode support (`monaco-vim`)
- **React Router v7** for navigation
- **Recharts** for analytics charts

### Backend (Tauri v2) Plugins
Registered in `src-tauri/src/lib.rs`:
- `tauri-plugin-shell` — opens external links (test runners no longer spawn processes; see Test Execution Model)
- `tauri-plugin-sql` — SQLite database access (kata metadata, sessions, attempts, settings)
- `tauri-plugin-fs` — read/write kata files from the local filesystem
- `tauri-plugin-log` — logging (debug builds only)

### Tauri Capabilities
Defined in `src-tauri/capabilities/default.json`. The frontend is granted permissions for:
- Shell execution (`shell:allow-execute`, `shell:allow-open`)
- File system read/write (`fs:allow-read-text-file`, `fs:allow-write-text-file`, `fs:allow-exists`, `fs:allow-read-dir`)

When adding new Tauri plugin features, you may need to add permissions here.

### Data Layer
SQLite via `@tauri-apps/plugin-sql` on the frontend side. Schema in
`src/lib/database.ts` (`createSchema`) — tables: `katas`, `sessions`,
`attempts`, `settings`, `presets`, `user_code`, `kata_notes`. Migrations are
additive `ALTER TABLE ... ADD COLUMN` wrapped in `try/catch`; new content
reaches already-seeded DBs via inline reseed guards + per-column backfills
(`seedKatas()` only fires on an empty table).

**LeetCode numbers** are structured data, not parsed from prose.
`src/lib/leetcode-numbers.ts` holds `LEETCODE_NUMBERS` (per-kata number, keyed
`` `${language} ${name}` ``) and `LEETCODE_SLUGS` (number → canonical
titleSlug); resolve via `leetcodeNumberFor()` / `leetcodeUrlFor()`.
`Kata.leetcodeNumber` maps to the `leetcode_number` column, populated at seed
time and backfilled for existing DBs. The Problems list shows the dark LeetCode
icon plus a `#.` prefix for LeetCode-backed rows, a "LeetCode #" sort (nulls
last), number search, and additive filter buttons:
- `LeetCode` (`libraryLeetcodeOnly` → `leetcodeNumber != null`)
- `Blind 75` (`libraryBlind75Only` → `tags.includes("blind75")`)
- `NeetCode` (`libraryNeetcodeOnly` → `tags.includes("neetcode")`)

The editor problem page renders a title above the tabs, including `#N` for
LeetCode-backed katas, and has an "Open on LeetCode" button. Results drill-down
titles link to `/editor/:kataId`.
Add a number to the map when adding a LeetCode-based seed kata.

For LeetCode API usage, including public problem-list retrieval, custom/favorite
lists such as `https://leetcode.com/problem-list/plakya4j/`, pagination, problem
metadata, and statement-fetching limits, see `docs/leetcode_api.md`.

**Fetching LeetCode descriptions (reference only).** Given a slug from
`LEETCODE_SLUGS`, pull the statement + metadata from LeetCode's GraphQL API
(`POST https://leetcode.com/graphql`, `question(titleSlug:){content difficulty
isPaidOnly topicTags hints codeSnippets}`) or the MIT-licensed wrapper
`https://leetcode-api-pied.vercel.app/problem/<slug>` (returns `content` +
`codeSnippets` + `hints`, no auth). Throttle bulk pulls or self-host. Premium
problems (`isPaidOnly`) return no content; non-LeetCode katas (the backtracking
intros, etc.) have no slug. **Copyright:** LeetCode statements are LeetCode's
copyrighted content (the wrapper's MIT license covers only its code). Kata
descriptions here are deliberately ORIGINAL/paraphrased — do NOT bundle verbatim
LeetCode text into this distributed app. Fetch to a scratch file as reference,
then write descriptions in our own words.

**Gotcha — `seedKey`:** `seedKey(name, language)` in `src/lib/seed-katas.ts`
joins with a **NUL byte** (renders like a space). It's the DB-identity key;
never reuse it to key a map written with a literal space — the lookup silently
matches nothing. `leetcode-numbers.ts` uses its own space-separated key.

### Test Execution Model
All kata tests run **in-app in Web Workers** — no child processes, no system
runtimes, works offline:
- JavaScript katas: evaluated in a plain worker (`src/lib/js-test-worker.ts`)
  with `test_*` functions and `assertEqual(actual, expected)` helpers.
- Python katas: Pyodide in its own worker (`python-test-worker.ts`). Pyodide
  runs in WKWebView, which is why the Python variant stays viable as a Tauri app.
- The REPL panel uses separate workers with persistent sessions
  (`repl-runner.ts` + `repl-backends.ts`).

### Practice session navigation

Running practice sessions are resumable application state. If a user leaves a
session to visit Settings or another page, returning through the top-bar
Practice item or `/practice` must route back to the unfinished `/session/:id`
instead of showing a fresh queue launcher. Keep `src/lib/session-resume.ts` as
the shared resolver for this behavior, and mirror the same rule in
`~/projects/ruby-kata` when changing shared navigation/session behavior.

### Solution variants
DP LeetCode problems should expose multiple acceptable approaches through
`solutionVariants` instead of a single generic "Solution" where practical. Use
clear labels such as "Memoized recursion", "2D tabulation", "Rolling row", or
"Optimized"; keep code snippets executable against the kata's existing tests.
For DP families, prefer the progression recursion/memoization → tabulation →
space optimization when it applies. Avoid leaving placeholder labels such as
"Canonical DP solution". `Burst Balloons` (`[1,1,1]`) should expect `3`, not `4`.

When mirroring content to `~/projects/ruby-kata`, convert variants to Ruby
syntax and include the Ruby app's required `kind` field
(`recursive | memoized | tabulation | optimized | standard`).

## Key Conventions

- Package manager is **pnpm** (v10.29.1, specified in `packageManager` field)
- TypeScript strict mode is on (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- Target is ES2021
- Vite dev server runs on port 1420 (strict port); Tauri dev URL points to it
- The Rust crate is named `app_lib` (see `src-tauri/Cargo.toml`)
- App icons follow the current Code Kata family style: white square background,
  large CK mark, and a language badge in the bottom-left. Keep `app-icon.png`,
  `public/app-icon.png`, and generated `src-tauri/icons/*` in sync when changing
  the icon.

## Algo Viz Pages (`public/algo-viz/`)

Each viz lives in `public/algo-viz/<slug>/index.html`. They are loaded in an iframe by `kata-editor.tsx`, which injects a CSS bridge that **hides** any element with these classes/IDs:

```
.controls, .input-row, .step-nav, .nav-bar, .nav-row, .nav-strip, .nav-box,
.nav-panel, .bottom-bar, .ctrl-row, .controls-row, #nav-bar, #nav-controls,
.control-group
```

It also does a DOM walk from `#prevBtn` to hide the ancestor element that contains `#playBtn`.

### `.viz-inputs` pattern (required for all viz pages)

User-facing inputs (presets, text/number inputs, Run button, 🎲 Random button) **must** go in a `<div class="viz-inputs">` — this class is NOT in the hidden list and will be visible in the iframe.

The `.controls` div should remain empty (or contain only nav buttons that get hidden):

```html
<!-- CORRECT: user inputs are visible -->
<div class="viz-inputs" style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;padding:10px 0 14px;">
  <div style="display:flex;flex-direction:column;gap:4px;">
    <label style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-dim);">Preset</label>
    <select id="presetSel" onchange="loadPreset()" style="background:var(--bg-card);color:var(--text-main);border:1px solid var(--border);border-radius:6px;padding:6px 10px;font-size:0.85rem;">
      <option value="">— pick a preset —</option>
      <!-- 5-8 presets appropriate to the algorithm -->
    </select>
  </div>
  <!-- input fields for the algorithm's parameters -->
  <button onclick="buildAndRun()" style="padding:7px 18px;background:var(--accent);color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Run</button>
  <button onclick="randomExample()" style="padding:7px 14px;background:var(--bg-card);color:var(--text-main);border:1px solid var(--border);border-radius:6px;cursor:pointer;">🎲 Random</button>
</div>
<div class="controls"></div>  <!-- empty; nav buttons hidden by bridge -->
```

Every viz must include `loadPreset()` and `randomExample()` JS functions. Reference `public/algo-viz/two-sum/index.html` and `public/algo-viz/valid-anagram/index.html` as canonical examples.

### VizNav bridge

The playback controls (prev/step/play/reset/speed) are driven by `postMessage` from the parent app — the iframe listens for `'prev'`, `'play'`, `'step'`, `'reset'`, and `{type:'speed', value}`. Button IDs must be `prevBtn`, `stepBtn`, `playBtn`, `resetBtn`, `speedSel` for the bridge to work.

### Writing viz files from sub-agents

The EITS `PreToolUse` hook blocks the `Write` tool in spawned sub-agents. Use Python/Bash to write files:

```bash
python3 -c "
content = '''...html...'''
with open('/path/to/index.html', 'w') as f:
    f.write(content)
"
```
