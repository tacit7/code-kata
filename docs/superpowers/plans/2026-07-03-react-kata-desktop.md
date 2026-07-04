# react-kata-desktop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A new Tauri desktop app, cloned from kata-desktop, that practices the react-katas curriculum with the existing editor/SR/tracking UX and a Vitest shell runner.

**Architecture:** Kata source files stay on disk in `~/projects/react-katas` (scanned into SQLite as metadata + cached originals). The Monaco editor reads/writes the real starter file via the Tauri fs plugin. Tests run by spawning the repo-local Vitest binary via the Tauri shell plugin and mapping its JSON reporter output to the existing `TestResult[]` shape.

**Tech Stack:** Tauri v2 (shell/fs/sql plugins), React 19, TypeScript, Vite 7, Zustand, Monaco, Vitest (both as the kata runner and as this repo's own unit-test framework).

**Spec:** `docs/superpowers/specs/2026-07-03-react-kata-desktop-design.md` (in the kata-desktop repo).

## Global Constraints

- New repo: `~/projects/react-kata-desktop`. All file paths below are relative to it unless absolute.
- Package manager is **pnpm**. The react-katas repo uses npm; we never run npm there — we invoke its local Vitest binary directly.
- **v1 deviation from spec (approved rationale):** Tauri's shell scope is static (baked into the capability file), so the repo path is pinned to `$HOME/projects/react-katas`. Settings displays it read-only with validation. No directory picker in v1.
- App identity: productName `React Kata`, identifier `com.react-kata.app`, window title `React Kata`, DB file `sqlite:react-kata.db`.
- Runner command (exact): `<repo>/node_modules/.bin/vitest run --typecheck <kata-dir> --reporter=json`, cwd = repo root, 30s timeout. `--typecheck` is mandatory — section 07 katas use `*.test-d.tsx` typecheck tests that otherwise run zero tests.
- Kata folder contract: each `katas/<section>/<kata>/` has `README.md`, exactly one starter (`*.tsx`/`*.ts`, excluding `*.test.*` and `*.test-d.*`), exactly one test file (`*.test.tsx|*.test.ts|*.test-d.tsx|*.test-d.ts`), optional `solution/<starter filename>`. Zero or multiple starters ⇒ kata invalid (excluded from queues, scan warning).
- Rescan never deletes tracking rows; missing katas get `active = 0`.
- Commit messages: clean, no attribution footers (user rule).
- Existing in-memory `Kata` type keeps its `code`/`testCode`/`solution` string fields — the scanner fills them with content captured at scan time (`code` = cached original starter for reset fallback; live starter is always read from disk in the editor).

---

### Task 1: Clone repo and set app identity

**Files:**
- Create: `~/projects/react-kata-desktop` (git clone of kata-desktop)
- Modify: `src-tauri/tauri.conf.json`, `package.json`, `src-tauri/Cargo.toml` (package name stays `app_lib`; only conf identity changes), `CLAUDE.md`

**Interfaces:**
- Produces: a building, running clone with new identity. All later tasks work in this repo.

- [ ] **Step 1: Clone and install**

```bash
git clone /Users/urielmaldonado/projects/kata-desktop /Users/urielmaldonado/projects/react-kata-desktop
cd /Users/urielmaldonado/projects/react-kata-desktop
pnpm install
```

- [ ] **Step 2: Set identity in `src-tauri/tauri.conf.json`**

Change exactly these fields (rest unchanged):

```json
"productName": "React Kata",
"identifier": "com.react-kata.app",
```

and in `app.windows[0]`: `"title": "React Kata"`.

- [ ] **Step 3: Rename npm package**

In `package.json`: `"name": "react-kata"`.

- [ ] **Step 4: Point at a separate SQLite file**

In `src/lib/database.ts` change:

```ts
db = await Database.load("sqlite:kata.db");
```

to:

```ts
db = await Database.load("sqlite:react-kata.db");
```

- [ ] **Step 5: Rewrite `CLAUDE.md` intro**

Replace the "What This Is" section body with:

> React Kata is a Tauri v2 desktop app for timed React kata practice. Kata source files live in `~/projects/react-katas`; this app scans them, edits the real starter files with Monaco, runs Vitest via the shell plugin, and tracks progress in its own SQLite DB. Cloned from kata-desktop.

Delete the "Algo Viz Pages" section entirely.

- [ ] **Step 6: Verify build and commit**

```bash
pnpm build        # expect: tsc + vite build succeed
git add -A && git commit -m "chore: rebrand clone as react-kata-desktop"
```

---

### Task 2: Strip seeds, viz, runners, and language UI

**Files:**
- Delete: `src/lib/sample-katas.ts`, `src/lib/sample-katas-python.ts`, `src/lib/blind75-additions-part1.ts` … `part8.ts`, `src/lib/neetcode-*.ts` (all 10), `src/lib/python-runner.ts`, `src/lib/python-test-worker.ts`, `src/lib/ruby-runner.ts`, `src/lib/js-test-worker.ts`, `src/lib/test-runner.ts`, `src/lib/seed-dashboard.ts`, `public/algo-viz/` (entire dir), `src/routes/kata-form.tsx`
- Modify: `src/lib/database.ts`, `src/components/kata-editor.tsx`, `src/routes/settings.tsx`, `src/routes/library.tsx`, `src/stores/kata-store.ts`, `src/stores/settings-store.ts`, `src/App.tsx`

**Interfaces:**
- Consumes: Task 1's clone.
- Produces: a building app with no seed data, no viz iframe, no `VIZ_MAP`, no language switching, and **temporarily no test runner** (`kata-editor` run button stubbed; Task 7 replaces it). `loadKatas()` takes no language argument.

- [ ] **Step 1: Delete files**

```bash
cd /Users/urielmaldonado/projects/react-kata-desktop
git rm src/lib/sample-katas.ts src/lib/sample-katas-python.ts \
  src/lib/blind75-additions-part*.ts src/lib/neetcode-*.ts \
  src/lib/python-runner.ts src/lib/python-test-worker.ts \
  src/lib/ruby-runner.ts src/lib/js-test-worker.ts src/lib/test-runner.ts \
  src/lib/seed-dashboard.ts src/routes/kata-form.tsx
git rm -r public/algo-viz
```

- [ ] **Step 2: Purge seeding from `src/lib/database.ts`**

Remove all seed imports (lines 2–22), the `blind75Katas` array, `seedKatas`, `seedKatasForce`, `migrateTagsIfEmpty`, `reseedKatas`, and the `seedKatas`/`migrateTagsIfEmpty` calls in `getDb()`. Keep `insertKata`/`updateKata`/`deleteKata` only if `library.tsx` still compiles without kata-form; otherwise delete them and the library "add kata" affordances (katas are authored in the react-katas repo — spec YAGNI).

- [ ] **Step 3: Purge viz + runner from `src/components/kata-editor.tsx`**

Remove: the `VIZ_MAP` constant, `VizKataName` type, `vizFolder` lookup and the viz iframe render block plus its CSS-bridge/postMessage code, the `import { runTests } from "../lib/test-runner"` line. Stub the run handler so it compiles:

```ts
const testResults: TestResult[] = [
  { name: "Runner not wired", passed: false, error: "vitest runner lands in a later task" },
];
```

- [ ] **Step 4: Remove language switching**

- `src/stores/settings-store.ts`: delete the `language` field, `KataLanguage` type and default.
- `src/routes/settings.tsx`: delete the JavaScript/Python toggle block (lines around 67–83) and the `loadKatas(language)` call — call `loadKatas()`.
- `src/stores/kata-store.ts`: change `loadKatas(language?: string)` to `loadKatas()`; SQL becomes `SELECT * FROM katas` (no language filter; same for the stats subqueries). Keep the `language` column mapping hardcoded: `language: "typescript"`.
- `src/App.tsx`: remove the `/kata-form` route(s) and imports.
- Editor Monaco language props: replace `language={kata.language}` with `language="typescript"` (2 sites in kata-editor.tsx).

- [ ] **Step 5: Sweep for leftovers**

```bash
grep -rn "sample-katas\|blind75\|neetcode\|python\|ruby\|VIZ_MAP\|algo-viz\|js-test-worker\|test-runner" src/ && echo "LEFTOVERS" || echo "CLEAN"
```
Expected: `CLEAN` (allow hits that are plain words in comments/strings unrelated to the removed systems — fix any import/identifier hits).

- [ ] **Step 6: Verify build and commit**

```bash
pnpm build   # expect success
git add -A && git commit -m "refactor: strip seeds, viz, workers, and language UI"
```

---

### Task 3: Add Vitest unit-test harness to this repo

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `pnpm test` runs `vitest run` over `src/**/*.test.ts` in a node environment. Later tasks TDD against this.

- [ ] **Step 1: Install and configure**

```bash
pnpm add -D vitest
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 2: Verify and commit**

```bash
pnpm test    # expect: "No test files found" exit 0? vitest exits 1 with no tests — pass --passWithNoTests
```

Set the script to `"test": "vitest run --passWithNoTests"`. Run `pnpm test` — expect exit 0.

```bash
git add -A && git commit -m "chore: add vitest unit-test harness"
```

---

### Task 4: Rewrite levels for the React curriculum

**Files:**
- Modify: `src/lib/levels.ts`
- Test: `src/lib/levels.test.ts`

**Interfaces:**
- Produces: `LEVELS` (7 entries, one per curriculum section) and `CATEGORY_LEVEL` map. Categories are the section folder names minus numeric prefix: `components`, `props-and-events`, `state`, `effects`, `custom-hooks`, `context-reducers`, `typescript`.

- [ ] **Step 1: Write the failing test** (`src/lib/levels.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { LEVELS, CATEGORY_LEVEL } from "./levels";

describe("levels", () => {
  it("has 7 levels matching react-katas sections", () => {
    expect(LEVELS).toHaveLength(7);
    expect(LEVELS[0].categories).toContain("components");
    expect(LEVELS[6].categories).toContain("typescript");
  });

  it("maps every category to its level", () => {
    expect(CATEGORY_LEVEL["components"]).toBe(1);
    expect(CATEGORY_LEVEL["props-and-events"]).toBe(2);
    expect(CATEGORY_LEVEL["state"]).toBe(3);
    expect(CATEGORY_LEVEL["effects"]).toBe(4);
    expect(CATEGORY_LEVEL["custom-hooks"]).toBe(5);
    expect(CATEGORY_LEVEL["context-reducers"]).toBe(6);
    expect(CATEGORY_LEVEL["typescript"]).toBe(7);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/lib/levels.test.ts` — expect FAIL (old algo levels).

- [ ] **Step 3: Rewrite `src/lib/levels.ts`**

```ts
export const LEVELS = [
  { level: 1, label: "Components", categories: ["components"] },
  { level: 2, label: "Props & Events", categories: ["props-and-events"] },
  { level: 3, label: "State", categories: ["state"] },
  { level: 4, label: "Effects", categories: ["effects"] },
  { level: 5, label: "Custom Hooks", categories: ["custom-hooks"] },
  { level: 6, label: "Context & Reducers", categories: ["context-reducers"] },
  { level: 7, label: "TypeScript", categories: ["typescript"] },
] as const;

export const CATEGORY_LEVEL: Record<string, number> = Object.fromEntries(
  LEVELS.flatMap(({ level, categories }) => categories.map((c) => [c, level])),
);
```

- [ ] **Step 4: Run tests + build**

Run: `pnpm test && pnpm build` — expect PASS. (practice.tsx/dashboard.tsx consume `LEVELS`/`CATEGORY_LEVEL` unchanged.)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: levels map to react-katas curriculum sections"
```

---

### Task 5: Schema for scanned katas

**Files:**
- Modify: `src/lib/database.ts`, `src/types/editor.ts`, `src/stores/kata-store.ts`

**Interfaces:**
- Produces: `katas` table gains `dir_path TEXT`, `starter_path TEXT`, `test_path TEXT`, `solution_path TEXT`, `active INTEGER DEFAULT 1`, `valid INTEGER DEFAULT 1`. `Kata` type gains `dirPath: string`, `starterPath: string`, `testPath: string`, `solutionPath: string | null`, `active: boolean`, `valid: boolean`. `loadKatas()` selects only `active = 1 AND valid = 1`.
- Consumes: Task 2's stripped database.ts.

- [ ] **Step 1: Extend `createSchema` in `src/lib/database.ts`**

In the `CREATE TABLE IF NOT EXISTS katas` statement, after the `tags` column add:

```sql
dir_path TEXT NOT NULL DEFAULT '',
starter_path TEXT NOT NULL DEFAULT '',
test_path TEXT NOT NULL DEFAULT '',
solution_path TEXT,
active INTEGER DEFAULT 1,
valid INTEGER DEFAULT 1,
```

(Fresh DB file, so no ALTER migrations needed — delete the old tags/is_custom ALTER blocks and the arrays-and-hashing UPDATE.)

- [ ] **Step 2: Extend the `Kata` type** (`src/types/editor.ts`)

```ts
export interface Kata {
  id: number;
  name: string;
  category: string;
  language: string;
  difficulty: string | null;
  description: string | null;
  code: string;          // cached original starter (reset fallback)
  testCode: string;      // test file content at scan time (display)
  solution: string | null;
  usage: string | null;
  tags: string[];
  isCustom: boolean;
  dirPath: string;
  starterPath: string;
  testPath: string;
  solutionPath: string | null;
  active: boolean;
  valid: boolean;
}
```

- [ ] **Step 3: Update `loadKatas` mapping** (`src/stores/kata-store.ts`)

SQL: `SELECT * FROM katas WHERE active = 1 AND valid = 1`. Row mapping adds:

```ts
dirPath: row.dir_path,
starterPath: row.starter_path,
testPath: row.test_path,
solutionPath: row.solution_path,
active: row.active === 1,
valid: row.valid === 1,
```

- [ ] **Step 4: Build + commit**

```bash
pnpm build && pnpm test
git add -A && git commit -m "feat: kata schema tracks scanned file paths and active/valid flags"
```

---

### Task 6: Kata scanner

**Files:**
- Create: `src/lib/kata-scanner.ts`, `src/lib/repo-path.ts`
- Test: `src/lib/kata-scanner.test.ts`

**Interfaces:**
- Consumes: Task 5 schema; `@tauri-apps/plugin-fs` (`readDir`, `readTextFile`, `exists`), `@tauri-apps/api/path` (`homeDir`, `join`).
- Produces:
  - `repo-path.ts`: `getRepoPath(): Promise<string>` (settings row `repo_path`, default `<home>/projects/react-katas`) and `validateRepo(path: string): Promise<string | null>` (null = valid, else error message).
  - `kata-scanner.ts` pure functions: `kataNameFromFolder(folder: string): string`, `categoryFromSection(section: string): string`, `difficultyForSection(section: string): string`, `classifyKataFiles(fileNames: string[]): { starter: string; test: string } | { invalid: string }`.
  - Orchestrator: `scanKatas(): Promise<{ scanned: number; invalid: string[]; deactivated: number }>` — upserts by `dir_path`, marks vanished katas `active = 0`, refreshes `code` (cached original) **only** for katas with zero attempts.

- [ ] **Step 1: Write failing tests for the pure functions** (`src/lib/kata-scanner.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import {
  kataNameFromFolder,
  categoryFromSection,
  difficultyForSection,
  classifyKataFiles,
} from "./kata-scanner";

describe("kataNameFromFolder", () => {
  it("strips numeric prefix and title-cases", () => {
    expect(kataNameFromFolder("01-hello-banner")).toBe("Hello Banner");
    expect(kataNameFromFolder("03-async-state-union")).toBe("Async State Union");
  });
});

describe("categoryFromSection", () => {
  it("strips the numeric prefix", () => {
    expect(categoryFromSection("01-components")).toBe("components");
    expect(categoryFromSection("06-context-reducers")).toBe("context-reducers");
  });
});

describe("difficultyForSection", () => {
  it("maps sections to difficulty bands", () => {
    expect(difficultyForSection("01-components")).toBe("easy");
    expect(difficultyForSection("02-props-and-events")).toBe("easy");
    expect(difficultyForSection("03-state")).toBe("medium");
    expect(difficultyForSection("05-custom-hooks")).toBe("medium");
    expect(difficultyForSection("06-context-reducers")).toBe("hard");
    expect(difficultyForSection("07-typescript")).toBe("hard");
  });
});

describe("classifyKataFiles", () => {
  it("finds the single starter and test file", () => {
    expect(classifyKataFiles(["Banner.tsx", "Banner.test.tsx", "README.md"]))
      .toEqual({ starter: "Banner.tsx", test: "Banner.test.tsx" });
  });
  it("handles typecheck (test-d) tests", () => {
    expect(classifyKataFiles(["Button.tsx", "Button.test-d.tsx", "README.md"]))
      .toEqual({ starter: "Button.tsx", test: "Button.test-d.tsx" });
  });
  it("rejects zero starters", () => {
    expect(classifyKataFiles(["Banner.test.tsx", "README.md"]))
      .toEqual({ invalid: "no starter file found" });
  });
  it("rejects multiple starters", () => {
    expect(classifyKataFiles(["A.tsx", "B.tsx", "A.test.tsx"]))
      .toEqual({ invalid: "multiple starter files: A.tsx, B.tsx" });
  });
  it("rejects missing test file", () => {
    expect(classifyKataFiles(["Banner.tsx", "README.md"]))
      .toEqual({ invalid: "no test file found" });
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test src/lib/kata-scanner.test.ts` — expect FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/kata-scanner.ts`** (pure functions first)

```ts
const TEST_RE = /\.test(-d)?\.(tsx?|ts)$/;
const SOURCE_RE = /\.(tsx|ts)$/;

export function kataNameFromFolder(folder: string): string {
  return folder
    .replace(/^\d+-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function categoryFromSection(section: string): string {
  return section.replace(/^\d+-/, "");
}

export function difficultyForSection(section: string): string {
  const n = parseInt(section, 10);
  if (n <= 2) return "easy";
  if (n <= 5) return "medium";
  return "hard";
}

export function classifyKataFiles(
  fileNames: string[],
): { starter: string; test: string } | { invalid: string } {
  const tests = fileNames.filter((f) => TEST_RE.test(f));
  const starters = fileNames.filter((f) => SOURCE_RE.test(f) && !TEST_RE.test(f));
  if (starters.length === 0) return { invalid: "no starter file found" };
  if (starters.length > 1)
    return { invalid: `multiple starter files: ${starters.sort().join(", ")}` };
  if (tests.length === 0) return { invalid: "no test file found" };
  return { starter: starters[0], test: tests[0] };
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test src/lib/kata-scanner.test.ts` — expect PASS.

- [ ] **Step 5: Add `src/lib/repo-path.ts`**

```ts
import { homeDir, join } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import { getDb } from "./database";

export async function getRepoPath(): Promise<string> {
  const db = await getDb();
  const rows = await db.select<{ value: string }[]>(
    "SELECT value FROM settings WHERE key = 'repo_path'",
  );
  if (rows.length > 0) return rows[0].value;
  return join(await homeDir(), "projects", "react-katas");
}

/** Returns null when valid, else a human-readable error. */
export async function validateRepo(path: string): Promise<string | null> {
  if (!(await exists(path))) return `Repo path does not exist: ${path}`;
  if (!(await exists(await join(path, "package.json"))))
    return "No package.json in repo path";
  if (!(await exists(await join(path, "katas"))))
    return "No katas/ directory in repo path";
  if (!(await exists(await join(path, "node_modules", ".bin", "vitest"))))
    return "No local vitest binary — run npm install in the react-katas repo";
  return null;
}
```

- [ ] **Step 6: Add the scan orchestrator to `kata-scanner.ts`**

```ts
import { readDir, readTextFile, exists } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { getDb } from "./database";
import { getRepoPath, validateRepo } from "./repo-path";

export interface ScanSummary {
  scanned: number;
  invalid: string[];   // "section/kata: reason"
  deactivated: number;
}

export async function scanKatas(): Promise<ScanSummary> {
  const repo = await getRepoPath();
  const err = await validateRepo(repo);
  if (err) throw new Error(err);

  const db = await getDb();
  const katasRoot = await join(repo, "katas");
  const seenDirs = new Set<string>();
  const invalid: string[] = [];
  let scanned = 0;

  for (const section of await readDir(katasRoot)) {
    if (!section.isDirectory) continue;
    const sectionPath = await join(katasRoot, section.name);
    for (const kataDir of await readDir(sectionPath)) {
      if (!kataDir.isDirectory) continue;
      const dirPath = await join(sectionPath, kataDir.name);
      seenDirs.add(dirPath);

      const entries = await readDir(dirPath);
      const fileNames = entries.filter((e) => e.isFile).map((e) => e.name);
      const classified = classifyKataFiles(fileNames);
      const name = kataNameFromFolder(kataDir.name);
      const category = categoryFromSection(section.name);

      if ("invalid" in classified) {
        invalid.push(`${section.name}/${kataDir.name}: ${classified.invalid}`);
        await db.execute(
          `INSERT INTO katas (name, category, language, difficulty, description, code, test_code, dir_path, valid)
           VALUES ($1, $2, 'typescript', $3, '', '', '', $4, 0)
           ON CONFLICT(dir_path) DO UPDATE SET valid = 0, active = 1`,
          [name, category, difficultyForSection(section.name), dirPath],
        );
        continue;
      }

      const starterPath = await join(dirPath, classified.starter);
      const testPath = await join(dirPath, classified.test);
      const solutionPath = await join(dirPath, "solution", classified.starter);
      const hasSolution = await exists(solutionPath);

      const starter = await readTextFile(starterPath);
      const testCode = await readTextFile(testPath);
      const solution = hasSolution ? await readTextFile(solutionPath) : null;
      const readmePath = await join(dirPath, "README.md");
      const description = (await exists(readmePath))
        ? await readTextFile(readmePath)
        : null;

      await db.execute(
        `INSERT INTO katas (name, category, language, difficulty, description, code, test_code, solution, dir_path, starter_path, test_path, solution_path, active, valid)
         VALUES ($1, $2, 'typescript', $3, $4, $5, $6, $7, $8, $9, $10, $11, 1, 1)
         ON CONFLICT(dir_path) DO UPDATE SET
           name = $1, category = $2, difficulty = $3, description = $4,
           test_code = $6, solution = $7,
           starter_path = $9, test_path = $10, solution_path = $11,
           active = 1, valid = 1,
           code = CASE
             WHEN (SELECT COUNT(*) FROM attempts a WHERE a.kata_id = katas.id) = 0
             THEN $5 ELSE katas.code END`,
        [
          name, category, difficultyForSection(section.name), description,
          starter, testCode, solution, dirPath, starterPath, testPath,
          hasSolution ? solutionPath : null,
        ],
      );
      scanned++;
    }
  }

  const result = await db.execute(
    `UPDATE katas SET active = 0 WHERE dir_path != '' AND dir_path NOT IN (${[...seenDirs].map((_, i) => `$${i + 1}`).join(",")})`,
    [...seenDirs],
  );

  return { scanned, invalid, deactivated: result.rowsAffected ?? 0 };
}
```

Add a UNIQUE index so the upsert's `ON CONFLICT(dir_path)` works — in `createSchema` (database.ts) after the katas table:

```ts
await db.execute(
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_katas_dir_path ON katas(dir_path) WHERE dir_path != ''`,
);
```

Note: SQLite supports `ON CONFLICT` targeting a partial unique index only when the insert satisfies the predicate — all scanner inserts have non-empty `dir_path`, so this holds.

- [ ] **Step 7: Wire first-launch scan + Rescan button**

- In `src/App.tsx` (or wherever `loadKatas` first fires — follow the existing init path): before initial `loadKatas()`, call `scanKatas()` if `SELECT COUNT(*) FROM katas` is 0. Wrap in try/catch; on error show a toast (existing `toast-store`) with the validation message.
- In `src/routes/settings.tsx`: add a "Kata Repo" section showing the resolved repo path (read-only) and a **Rescan** button:

```tsx
<button
  className="btn btn-sm btn-primary"
  onClick={async () => {
    try {
      const s = await scanKatas();
      toast(`Scanned ${s.scanned} katas` +
        (s.invalid.length ? `, ${s.invalid.length} invalid` : "") +
        (s.deactivated ? `, ${s.deactivated} deactivated` : ""));
      if (s.invalid.length) console.warn("Invalid katas:", s.invalid);
      await useKataStore.getState().loadKatas();
    } catch (e) {
      toast(String(e));
    }
  }}
>
  Rescan katas
</button>
```

(Match the file's existing toast helper and store import style.)

- [ ] **Step 8: Test, build, commit**

```bash
pnpm test && pnpm build
git add -A && git commit -m "feat: scan react-katas repo into kata metadata"
```

---

### Task 7: Vitest runner

**Files:**
- Create: `src/lib/vitest-runner.ts`
- Test: `src/lib/vitest-runner.test.ts`

**Interfaces:**
- Consumes: `@tauri-apps/plugin-shell` (`Command.create`), `getRepoPath`/`validateRepo` from Task 6, `TestResult` from `src/types/editor.ts`.
- Produces:
  - Pure: `mapVitestJson(stdout: string): TestResult[]` — parses Vitest JSON reporter output; never throws.
  - `runKataTests(kata: Pick<Kata, "dirPath">): Promise<TestResult[]>` — spawn wrapper, 30s timeout, always resolves to `TestResult[]`.

- [ ] **Step 1: Write failing tests for the mapper** (`src/lib/vitest-runner.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { mapVitestJson } from "./vitest-runner";

const PASS_JSON = JSON.stringify({
  numTotalTests: 2,
  testResults: [
    {
      name: "/repo/katas/01-components/01-hello-banner/Banner.test.tsx",
      status: "passed",
      message: "",
      assertionResults: [
        { ancestorTitles: ["Banner"], title: "renders the text", status: "passed", failureMessages: [] },
        { ancestorTitles: ["Banner"], title: "uses an h1", status: "passed", failureMessages: [] },
      ],
    },
  ],
});

const FAIL_JSON = JSON.stringify({
  numTotalTests: 1,
  testResults: [
    {
      name: "/repo/katas/x/Banner.test.tsx",
      status: "failed",
      message: "",
      assertionResults: [
        {
          ancestorTitles: ["Banner"],
          title: "renders the text",
          status: "failed",
          failureMessages: ["expected 'a' to be 'b'"],
        },
      ],
    },
  ],
});

const COMPILE_FAIL_JSON = JSON.stringify({
  numTotalTests: 0,
  testResults: [
    {
      name: "/repo/katas/x/Banner.test.tsx",
      status: "failed",
      message: "Transform failed: Unexpected token (3:7)",
      assertionResults: [],
    },
  ],
});

describe("mapVitestJson", () => {
  it("maps passing test cases", () => {
    const results = mapVitestJson(PASS_JSON);
    expect(results).toEqual([
      { name: "Banner › renders the text", passed: true },
      { name: "Banner › uses an h1", passed: true },
    ]);
  });

  it("maps failures with the first failure message", () => {
    expect(mapVitestJson(FAIL_JSON)).toEqual([
      { name: "Banner › renders the text", passed: false, error: "expected 'a' to be 'b'" },
    ]);
  });

  it("maps file-level (compile) failure to one result named after the file", () => {
    expect(mapVitestJson(COMPILE_FAIL_JSON)).toEqual([
      { name: "Banner.test.tsx", passed: false, error: "Transform failed: Unexpected token (3:7)" },
    ]);
  });

  it("tolerates noise before the JSON object", () => {
    const results = mapVitestJson("some stderr noise\n" + PASS_JSON);
    expect(results).toHaveLength(2);
  });

  it("returns a Vitest-reporter failure on unparseable output", () => {
    const results = mapVitestJson("total garbage");
    expect(results).toEqual([
      { name: "Vitest reporter", passed: false, error: "Could not parse Vitest JSON output: total garbage" },
    ]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test src/lib/vitest-runner.test.ts` — expect FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/vitest-runner.ts`**

```ts
import { Command } from "@tauri-apps/plugin-shell";
import type { Kata, TestResult } from "../types/editor";
import { getRepoPath, validateRepo } from "./repo-path";

const TIMEOUT_MS = 30_000;

interface VitestAssertion {
  ancestorTitles: string[];
  title: string;
  status: string;
  failureMessages: string[];
}
interface VitestFileResult {
  name: string;
  status: string;
  message: string;
  assertionResults: VitestAssertion[];
}
interface VitestJson {
  testResults: VitestFileResult[];
}

export function mapVitestJson(stdout: string): TestResult[] {
  const start = stdout.indexOf("{");
  let parsed: VitestJson;
  try {
    if (start === -1) throw new Error("no JSON object");
    parsed = JSON.parse(stdout.slice(start));
  } catch {
    return [
      {
        name: "Vitest reporter",
        passed: false,
        error: `Could not parse Vitest JSON output: ${stdout.slice(0, 500)}`,
      },
    ];
  }

  const results: TestResult[] = [];
  for (const file of parsed.testResults ?? []) {
    if (file.assertionResults.length === 0) {
      // File-level failure: compile/transform/typecheck setup error
      results.push({
        name: file.name.split("/").pop() ?? "Vitest runner",
        passed: false,
        error: file.message || "Test file produced no test results",
      });
      continue;
    }
    for (const a of file.assertionResults) {
      const name = [...a.ancestorTitles, a.title].join(" › ");
      if (a.status === "passed") {
        results.push({ name, passed: true });
      } else {
        results.push({ name, passed: false, error: a.failureMessages[0] ?? a.status });
      }
    }
  }
  return results;
}

export async function runKataTests(kata: Pick<Kata, "dirPath">): Promise<TestResult[]> {
  const repo = await getRepoPath();
  const err = await validateRepo(repo);
  if (err) return [{ name: "Vitest runner", passed: false, error: err }];
  if (!kata.dirPath.startsWith(repo)) {
    return [{ name: "Vitest runner", passed: false, error: `Kata path outside repo: ${kata.dirPath}` }];
  }

  const cmd = Command.create(
    "vitest",
    ["run", "--typecheck", kata.dirPath, "--reporter=json"],
    { cwd: repo },
  );

  try {
    const output = await Promise.race([
      cmd.execute(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS),
      ),
    ]);
    return mapVitestJson(output.stdout);
  } catch (e) {
    if (e instanceof Error && e.message === "timeout") {
      return [{ name: "Vitest timeout", passed: false, error: `Execution exceeded ${TIMEOUT_MS / 1000}s` }];
    }
    return [{ name: "Vitest runner", passed: false, error: String(e) }];
  }
}
```

Note: `Command.create("vitest", ...)` refers to the scoped shell command named `vitest` defined in Task 8's capabilities — not a PATH lookup.

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test src/lib/vitest-runner.test.ts` — expect PASS (mapper only; spawn path is exercised in Task 10's manual E2E).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: vitest shell runner with JSON result mapping"
```

---

### Task 8: Tauri capabilities and plugins

**Files:**
- Modify: `src-tauri/capabilities/default.json`, `src-tauri/Cargo.toml` (no new plugins needed — shell/fs/sql already registered)

**Interfaces:**
- Produces: shell scope allowing exactly the react-katas Vitest binary; fs scope allowing read/write under the react-katas repo.

- [ ] **Step 1: Replace `src-tauri/capabilities/default.json` permissions**

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "enables the default permissions",
  "windows": ["main"],
  "permissions": [
    "core:default",
    {
      "identifier": "shell:allow-execute",
      "allow": [
        {
          "name": "vitest",
          "cmd": "/Users/urielmaldonado/projects/react-katas/node_modules/.bin/vitest",
          "args": [
            "run",
            "--typecheck",
            { "validator": "^/Users/urielmaldonado/projects/react-katas/katas/.+" },
            "--reporter=json"
          ]
        }
      ]
    },
    "fs:allow-read-text-file",
    "fs:allow-write-text-file",
    "fs:allow-exists",
    "fs:allow-read-dir",
    {
      "identifier": "fs:scope",
      "allow": [{ "path": "$HOME/projects/react-katas" }, { "path": "$HOME/projects/react-katas/**" }]
    },
    "sql:default",
    "sql:allow-execute"
  ]
}
```

The shell scope requires a literal absolute path (no `$HOME` substitution in shell scopes) — this is the v1 pinned-repo limitation noted in Global Constraints. If `cargo` complains about the args validator schema, consult the tauri-plugin-shell v2 docs for the exact validator syntax and adjust; the invariant to preserve: only that binary, only `run --typecheck <path-under-katas> --reporter=json`.

- [ ] **Step 2: Verify the app builds and the scoped command resolves**

```bash
cd src-tauri && cargo check   # expect success
cd .. && pnpm tauri dev       # app launches; leave open for a smoke check, then close
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: scope shell/fs capabilities to react-katas repo"
```

---

### Task 9: Editor wiring — open/save/run/reset/solution/README

**Files:**
- Modify: `src/components/kata-editor.tsx`

**Interfaces:**
- Consumes: `runKataTests` (Task 7), `readTextFile`/`writeTextFile` from `@tauri-apps/plugin-fs`, `Command.create` scoped `git` is NOT available — reset uses the cached original (`kata.code`) only; see Step 4 note.
- Produces: editor reads/writes the real starter file; Run writes then spawns vitest; Reset restores `kata.code`; solution/README panels read scan-cached content (`kata.solution`, `kata.description`).

- [ ] **Step 1: Load starter from disk instead of user_code**

In the effect that currently calls `loadUserCode(kata.id)` (around line 524), replace with:

```ts
readTextFile(kata.starterPath).then((content) => {
  setSavedCode(content);
}).catch(() => setSavedCode(null));
```

And where `initialCode` is computed (around line 845):

```ts
const initialCode = savedCode ?? kata.code;
```

(Session mode also uses the live file — remove the `isSession ? kata.code :` branch.)

- [ ] **Step 2: Save to disk**

Replace `saveUserCode(kata.id, code)` call sites with:

```ts
await writeTextFile(kata.starterPath, code);
```

Keep the existing debounce/saved-flag UX identical. Remove now-unused `saveUserCode`/`loadUserCode`/`deleteUserCode` imports (and their definitions in database.ts if nothing else uses them).

- [ ] **Step 3: Wire the run handler**

Replace the Task 2 stub in `handleRun`:

```ts
await writeTextFile(kata.starterPath, code);   // persist before running
const testResults = await runKataTests(kata);
```

The rest of the handler (timer, pass detection, onTestComplete) is unchanged — `runKataTests` returns the same `TestResult[]` shape the panel already renders.

- [ ] **Step 4: Reset kata**

Wherever the existing reset action restored `kata.code` into the editor + `deleteUserCode`, make it: confirm dialog (`window.confirm("Reset this kata's starter file? Your edits will be overwritten.")`), then:

```ts
await writeTextFile(kata.starterPath, kata.code);
editorRef.current?.setValue(kata.code);
```

Note: the spec's git-checkout primary path would require adding `git` to the shell scope; the cached-original fallback is equivalent for tracked, unedited-at-scan starters and keeps the shell scope single-purpose. The cached original is refreshed on rescan for katas with no attempts (Task 6 upsert).

- [ ] **Step 5: Solution and README panels**

- Solution panel already renders `kata.solution` — unchanged (populated by the scanner). `{kata.solution && ...}` already handles the missing-solution case (peek hidden).
- README: `kata.description` now holds the kata README; verify the description panel renders it (it renders `kata.description` today — unchanged). Where the panel renders the description, show a fallback when empty: `{kata.description?.trim() ? <DescriptionView /> : <span className="opacity-60">No README found.</span>}` (match the file's existing markup).
- Guard Run for invalid katas: `if (!kata.valid || !kata.testPath) { setResults([{ name: "Invalid kata", passed: false, error: "Scan warning: kata folder does not match the contract" }]); return; }` at the top of `handleRun` (invalid katas are excluded from queues by Task 5's `loadKatas` filter, so this is belt-and-braces for direct navigation).

- [ ] **Step 6: Build, manual smoke, commit**

```bash
pnpm build && pnpm test
pnpm tauri dev
```
Manual check: open a kata → starter file content appears; edit → file on disk changes; Run → results panel shows real vitest output; Reset → file restored.

```bash
git add -A && git commit -m "feat: editor reads/writes kata files and runs vitest"
```

---

### Task 10: Final sweep + end-to-end verification

**Files:**
- Modify: `src/routes/dashboard.tsx`, `src/routes/library.tsx` (labels), anything the sweep finds

**Interfaces:**
- Consumes: everything above.
- Produces: shippable v1.

- [ ] **Step 1: Label sweep**

```bash
grep -rn "algo\|Algo\|LeetCode\|leetcode\|Blind 75\|NeetCode" src/ | grep -v node_modules
```
Fix user-facing labels in dashboard/library to React terms ("Sections" instead of algo level names is already handled by levels.ts labels). Remove dead code the compiler didn't catch (e.g. `code-diff.tsx` if unused, LC link helpers `lcSlug`/`LC_SLUG_OVERRIDES`/`DescriptionWithLink` in kata-editor if they only serve LeetCode descriptions — react-katas READMEs have no LC refs).

- [ ] **Step 2: Full unit + build pass**

```bash
pnpm test && pnpm build && cd src-tauri && cargo clippy && cd ..
```
Expected: all green.

- [ ] **Step 3: Manual E2E checklist** (in `pnpm tauri dev`)

1. Fresh launch: scan runs, ~35 katas appear across 7 categories; invalid-kata toast only if the repo has a broken folder.
2. Open `Hello Banner`: README shows, starter loads, tests run and fail (starter is intentionally incomplete).
3. Paste the solution from `solution/Banner.tsx`: tests pass, attempt recorded.
4. Open a `07-typescript` kata: run works (`--typecheck` path), results appear.
5. Reset the edited kata: starter restored; `git -C ~/projects/react-katas status` shows the file clean or matching the cached original.
6. Settings → Rescan: completes with a summary toast; SR queue/dashboard/results pages render.
7. Kill vitest availability (temporarily rename `node_modules/.bin/vitest`): Run shows the "No local vitest binary" failure result, app doesn't crash. Restore it.

- [ ] **Step 4: Commit and finish**

```bash
git add -A && git commit -m "chore: final label sweep and dead-code removal"
```

Use superpowers:finishing-a-development-branch to decide merge/PR handling.
