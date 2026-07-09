# Kata Navigation Shortcuts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make next/prev kata shortcuts work wherever a kata editor is open — including while the cursor is in Monaco, where `Cmd+Left`/`Cmd+Right` never reached them — and stop them from finishing sessions.

**Architecture:** A pure `resolveKataNavigation()` decides what "next" means; a thin `useKataNavigation()` hook adapts it to the router and stores; `KataEditor` registers the shortcuts, so "the editor is mounted" and "navigation is live" are the same statement. Two latent defects the feature exposes — autosave dropping its last edit on kata change, and a persisted shortcuts map that makes a default change invisible — are fixed in the same pass.

**Tech Stack:** React 19, TypeScript (strict, `noUnusedLocals`), Zustand, React Router v7, Monaco, Vitest (no DOM environment), Tailwind v4.

## Global Constraints

- Work on branch `app-core`. This is language-agnostic. Do **not** commit it on a variant branch.
- Flow is one-way: after `app-core` is green, merge into `main` and `js-ruby-version`, then `git fetch core app-core && git merge core/app-core` in `~/projects/ruby-kata`.
- New default bindings, exact strings: `nextKata: "Meta+Alt+ArrowRight"`, `prevKata: "Meta+Alt+ArrowLeft"`.
- Old default bindings, exact strings (only these migrate): `"Meta+ArrowRight"`, `"Meta+ArrowLeft"`.
- Vitest runs in a **Node** environment. There is no `jsdom` and no `@testing-library/react`, and this plan adds neither. Every new test must be DOM-free.
- Any module a test imports must not pull in `src/lib/database.ts` at load time (it imports the SQL driver). This is why pure logic goes in `src/lib/`.
- `useKeyboardShortcuts` builds its combo as `Meta+Ctrl+Alt+Shift+<key>` in that order
  (`src/hooks/use-keyboard-shortcuts.ts:13-21`), so ⌘⌥→ produces exactly
  `"Meta+Alt+ArrowRight"`. Verified — the new default strings match.
- Navigation never finishes a session, never wraps, never prompts.
- **Do not add a focus guard to `useKeyboardShortcuts`.** Next/prev are meant to fire
  while Monaco has focus — that is the spec's focus policy, not an oversight. The new
  binding does not collide with Monaco, so no guard is needed, and adding one would
  make the shortcut unreachable in a session (the editor is almost always focused).
- `pnpm exec tsc --noEmit -p tsconfig.json` and `pnpm vitest run` must both pass before every commit.

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/shortcut-keys.ts` | **new.** `ShortcutAction`, `DEFAULT_SHORTCUTS`, `migrateShortcuts()`. Pure. |
| `src/lib/shortcut-keys.test.ts` | **new.** |
| `src/lib/kata-navigation.ts` | **new.** `resolveKataNavigation()`. Pure. No React, no stores, no router. |
| `src/lib/kata-navigation.test.ts` | **new.** |
| `src/lib/autosave.ts` | **new.** `createAutosave()`. Pure, timer-driven. |
| `src/lib/autosave.test.ts` | **new.** |
| `src/hooks/use-kata-navigation.ts` | **new.** React adapter. Owns route/store mutation only. |
| `src/stores/kata-store.ts` | add `browseOrder: number[]` + `setBrowseOrder()`. |
| `src/stores/session-store.ts` | add `setCurrentIndex(index)`. |
| `src/stores/settings-store.ts` | re-export from `shortcut-keys.ts`; apply `migrateShortcuts` on load. |
| `src/routes/library.tsx` | publish `browseOrder` from `searchedKatas`. |
| `src/routes/session.tsx` | remove `nextKata`/`prevKata` registration. |
| `src/components/kata-editor.tsx` | register shortcuts; use `createAutosave`; nudge on no-op. |
| `src/index.css` | add `@keyframes nudge`. |

Tasks 1–3 are independent pure modules and can be done in any order. Tasks 4–7 depend on them.

---

### Task 1: `shortcut-keys.ts` — defaults and migration

**Files:**
- Create: `src/lib/shortcut-keys.ts`
- Create: `src/lib/shortcut-keys.test.ts`
- Modify: `src/stores/settings-store.ts` (lines 6–21 define `ShortcutAction` and `DEFAULT_SHORTCUTS`; line ~177 loads `shortcuts`)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type ShortcutAction = "runTests" | "nextKata" | "prevKata" | "toggleSolution" | "openSettings" | "closePanel"`
  - `type ShortcutMap = Record<ShortcutAction, string>`
  - `const DEFAULT_SHORTCUTS: ShortcutMap`
  - `function migrateShortcuts(stored: unknown): ShortcutMap`

`src/routes/settings.tsx` and `src/hooks/use-keyboard-shortcuts.ts` both import `DEFAULT_SHORTCUTS` / `ShortcutAction` **from `../stores/settings-store`**. Do not change those files. `settings-store.ts` must re-export both names.

- [ ] **Step 1: Write the failing test**

Create `src/lib/shortcut-keys.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { DEFAULT_SHORTCUTS, migrateShortcuts } from "./shortcut-keys";

describe("DEFAULT_SHORTCUTS", () => {
  it("binds next/prev off Monaco's line-start/line-end keys", () => {
    expect(DEFAULT_SHORTCUTS.nextKata).toBe("Meta+Alt+ArrowRight");
    expect(DEFAULT_SHORTCUTS.prevKata).toBe("Meta+Alt+ArrowLeft");
  });
});

describe("migrateShortcuts", () => {
  // Settings persist the whole map as one row, so changing DEFAULT_SHORTCUTS
  // alone never reaches an existing install. This function is the only thing
  // that does.
  it("rewrites a binding still sitting at the old default", () => {
    const out = migrateShortcuts({
      ...DEFAULT_SHORTCUTS,
      nextKata: "Meta+ArrowRight",
      prevKata: "Meta+ArrowLeft",
    });
    expect(out.nextKata).toBe("Meta+Alt+ArrowRight");
    expect(out.prevKata).toBe("Meta+Alt+ArrowLeft");
  });

  it("never overwrites a binding the user chose", () => {
    const out = migrateShortcuts({ ...DEFAULT_SHORTCUTS, nextKata: "Ctrl+Shift+N" });
    expect(out.nextKata).toBe("Ctrl+Shift+N");
  });

  it("fills a missing action from its own default, not the whole map", () => {
    const out = migrateShortcuts({ runTests: "Meta+K" });
    expect(out.runTests).toBe("Meta+K");
    expect(out.closePanel).toBe(DEFAULT_SHORTCUTS.closePanel);
  });

  it("drops an action it does not know", () => {
    const out = migrateShortcuts({ ...DEFAULT_SHORTCUTS, launchMissiles: "Meta+M" });
    expect(out).not.toHaveProperty("launchMissiles");
  });

  it("ignores a non-string value", () => {
    const out = migrateShortcuts({ runTests: 42 });
    expect(out.runTests).toBe(DEFAULT_SHORTCUTS.runTests);
  });

  it("returns full defaults for null, a non-object, or an array", () => {
    expect(migrateShortcuts(null)).toEqual(DEFAULT_SHORTCUTS);
    expect(migrateShortcuts("nope")).toEqual(DEFAULT_SHORTCUTS);
    expect(migrateShortcuts([])).toEqual(DEFAULT_SHORTCUTS);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/lib/shortcut-keys.test.ts`
Expected: FAIL — `Failed to resolve import "./shortcut-keys"`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/shortcut-keys.ts`:

```ts
// Pure so it can be tested: settings-store.ts imports getDb at module load and
// cannot be loaded under vitest. Same rationale as lib/nav-items.ts.

export type ShortcutAction =
  | "runTests"
  | "nextKata"
  | "prevKata"
  | "toggleSolution"
  | "openSettings"
  | "closePanel";

export type ShortcutMap = Record<ShortcutAction, string>;

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  runTests: "Meta+Enter",
  // Meta+Alt+Arrow, not Meta+Arrow: on macOS Cmd+Left/Right are Monaco's
  // line-start/line-end. This matches VS Code's previous/next editor tab.
  nextKata: "Meta+Alt+ArrowRight",
  prevKata: "Meta+Alt+ArrowLeft",
  toggleSolution: "Meta+Shift+S",
  openSettings: "Meta+,",
  closePanel: "Escape",
};

// The bindings nextKata/prevKata shipped with before 2026-07-09. Hardcoded here
// because this is the only place that needs to recognise them: a stored value
// still equal to one of these was never customised, so the user gets the fix.
const SUPERSEDED: Partial<Record<ShortcutAction, string>> = {
  nextKata: "Meta+ArrowRight",
  prevKata: "Meta+ArrowLeft",
};

/**
 * Settings persist the entire shortcuts map as one row and the loader replaces
 * the defaults wholesale, so changing DEFAULT_SHORTCUTS has no effect on an
 * existing install. This runs once on load and writes back.
 *
 * The result is built from the keys of DEFAULT_SHORTCUTS and never by spreading
 * `stored`, which is what makes "an unknown action is dropped" true by
 * construction rather than by a separate filtering pass.
 */
export function migrateShortcuts(stored: unknown): ShortcutMap {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return { ...DEFAULT_SHORTCUTS };
  }

  const input = stored as Record<string, unknown>;
  const actions = Object.keys(DEFAULT_SHORTCUTS) as ShortcutAction[];

  return Object.fromEntries(
    actions.map((action) => {
      const value = input[action];

      if (typeof value !== "string") return [action, DEFAULT_SHORTCUTS[action]];
      if (value === SUPERSEDED[action]) return [action, DEFAULT_SHORTCUTS[action]];

      return [action, value];
    }),
  ) as ShortcutMap;
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `pnpm vitest run src/lib/shortcut-keys.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Point `settings-store.ts` at the new module**

In `src/stores/settings-store.ts`, delete the `ShortcutAction` type (lines 6–12) and the `DEFAULT_SHORTCUTS` const (lines 14–21). Replace them with:

```ts
import { DEFAULT_SHORTCUTS, migrateShortcuts, type ShortcutAction, type ShortcutMap } from "../lib/shortcut-keys";

// settings.tsx and use-keyboard-shortcuts.ts import these from here.
export { DEFAULT_SHORTCUTS };
export type { ShortcutAction, ShortcutMap };
```

Then in `loadSettings`, replace:

```ts
      shortcuts:
        (patch.shortcuts as Record<ShortcutAction, string>) ??
        DEFAULTS.shortcuts,
```

with:

```ts
      shortcuts: migrateShortcuts(patch.shortcuts),
```

- [ ] **Step 6: Persist the migrated map**

Still in `loadSettings`, immediately after the `set({...})` call that ends with `loaded: true`, add:

```ts
    // Write the migrated map back, so the rebinding survives the next load and
    // the Settings screen shows what is actually bound.
    const migrated = migrateShortcuts(patch.shortcuts);
    if (JSON.stringify(migrated) !== JSON.stringify(patch.shortcuts)) {
      await get().setSetting("shortcuts", migrated);
    }
```

`src/stores/settings-store.ts:112` already reads `create<SettingsState>((set, get) => ({`, so `get()` is in scope. No signature change needed.

- [ ] **Step 7: Typecheck and run the whole suite**

Run: `pnpm exec tsc --noEmit -p tsconfig.json && pnpm vitest run`
Expected: tsc silent (exit 0); all tests pass.

- [ ] **Step 8: Mutation-test the migration**

Temporarily change `if (value === SUPERSEDED[action])` to `if (false)`.
Run: `pnpm vitest run src/lib/shortcut-keys.test.ts`
Expected: FAIL on "rewrites a binding still sitting at the old default".
Revert the change with your editor (**not** `git checkout` — you have uncommitted work).
Run again. Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/lib/shortcut-keys.ts src/lib/shortcut-keys.test.ts src/stores/settings-store.ts
git commit -m "feat(shortcuts): rebind next/prev off Monaco's cursor keys

Cmd+Left/Right are line-start/line-end on macOS. Next/prev move to
Meta+Alt+Arrow, matching VS Code's previous/next editor tab.

Settings persist the whole shortcuts map, so a default change alone never
reaches an existing install. migrateShortcuts rewrites only bindings still
sitting at the old default and leaves deliberate remaps alone."
```

---

### Task 2: `kata-navigation.ts` — the pure resolver

**Files:**
- Create: `src/lib/kata-navigation.ts`
- Create: `src/lib/kata-navigation.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:

```ts
interface NavigationInput {
  mode: "session" | "browse";
  currentKataId: number;
  currentIndex: number;
  sessionKataIds: number[];
  browseOrder: number[];
  availableKataIds: ReadonlySet<number>;
}
interface NavigationTargets {
  prevId?: number;
  nextId?: number;
  prevIndex?: number;
  nextIndex?: number;
  hasPrev: boolean;
  hasNext: boolean;
}
function resolveKataNavigation(input: NavigationInput): NavigationTargets
```

`prevIndex`/`nextIndex` are set in `"session"` mode only. `prevId`/`nextId` are set in `"browse"` mode only.

- [ ] **Step 1: Write the failing test**

Create `src/lib/kata-navigation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveKataNavigation } from "./kata-navigation";

const ALL = new Set([1, 2, 3, 4]);

function browse(currentKataId: number, browseOrder: number[], available = ALL) {
  return resolveKataNavigation({
    mode: "browse",
    currentKataId,
    currentIndex: 0,
    sessionKataIds: [],
    browseOrder,
    availableKataIds: available,
  });
}

function session(currentIndex: number, sessionKataIds: number[]) {
  return resolveKataNavigation({
    mode: "session",
    currentKataId: sessionKataIds[currentIndex] ?? -1,
    currentIndex,
    sessionKataIds,
    browseOrder: [],
    availableKataIds: ALL,
  });
}

describe("browse mode", () => {
  it("steps the list in both directions", () => {
    const r = browse(2, [1, 2, 3]);
    expect(r).toMatchObject({ prevId: 1, nextId: 3, hasPrev: true, hasNext: true });
  });

  it("clamps at the first item", () => {
    const r = browse(1, [1, 2, 3]);
    expect(r.hasPrev).toBe(false);
    expect(r.prevId).toBeUndefined();
    expect(r.nextId).toBe(2);
  });

  it("clamps at the last item", () => {
    const r = browse(3, [1, 2, 3]);
    expect(r.hasNext).toBe(false);
    expect(r.nextId).toBeUndefined();
  });

  it("has no neighbours in a single-item list", () => {
    expect(browse(1, [1])).toMatchObject({ hasPrev: false, hasNext: false });
  });

  it("has no neighbours when the list is empty (cold open)", () => {
    expect(browse(1, [])).toMatchObject({ hasPrev: false, hasNext: false });
  });

  // The indexOf === -1 case: the kata was opened without visiting the list.
  it("does not throw when the current kata is absent from the order", () => {
    expect(browse(99, [1, 2, 3])).toMatchObject({ hasPrev: false, hasNext: false });
  });

  // loadKatas(language) replaces the store list wholesale; deleteKata removes
  // custom katas. browseOrder is a snapshot and goes stale.
  it("skips ids that no longer exist rather than returning them", () => {
    const available = new Set([1, 4]);
    const r = browse(1, [1, 2, 3, 4], available);
    expect(r.nextId).toBe(4);
  });

  it("has no neighbours when every other id is stale", () => {
    const available = new Set([2]);
    expect(browse(2, [1, 2, 3], available)).toMatchObject({ hasPrev: false, hasNext: false });
  });

  it("is unreachable when the current kata itself is stale", () => {
    const available = new Set([1, 3]);
    expect(browse(2, [1, 2, 3], available)).toMatchObject({ hasPrev: false, hasNext: false });
  });
});

describe("session mode", () => {
  it("steps the queue by index", () => {
    const r = session(1, [10, 20, 30]);
    expect(r).toMatchObject({ prevIndex: 0, nextIndex: 2, hasPrev: true, hasNext: true });
  });

  it("clamps at the first kata", () => {
    expect(session(0, [10, 20])).toMatchObject({ hasPrev: false, hasNext: true });
  });

  // The old behaviour finished the session here. It must now be a no-op.
  it("clamps at the last kata instead of finishing the session", () => {
    const r = session(1, [10, 20]);
    expect(r.hasNext).toBe(false);
    expect(r.nextIndex).toBeUndefined();
  });

  it("never resolves an index outside the queue", () => {
    expect(session(5, [10, 20])).toMatchObject({ hasPrev: false, hasNext: false });
    expect(session(-1, [10, 20])).toMatchObject({ hasPrev: false, hasNext: false });
  });

  it("ignores browseOrder and availability entirely", () => {
    const r = resolveKataNavigation({
      mode: "session",
      currentKataId: 20,
      currentIndex: 1,
      sessionKataIds: [10, 20, 30],
      browseOrder: [99],
      availableKataIds: new Set<number>(),
    });
    expect(r).toMatchObject({ prevIndex: 0, nextIndex: 2 });
  });

  it("returns no ids in session mode", () => {
    const r = session(1, [10, 20, 30]);
    expect(r.nextId).toBeUndefined();
    expect(r.prevId).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/lib/kata-navigation.test.ts`
Expected: FAIL — `Failed to resolve import "./kata-navigation"`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/kata-navigation.ts`:

```ts
// Every next/prev decision lives here, as a pure function: no React, no stores,
// no router. The hook that wraps this owns mutation only.

export interface NavigationInput {
  mode: "session" | "browse";
  currentKataId: number;
  /** Session mode only. Ignored in browse mode. */
  currentIndex: number;
  sessionKataIds: number[];
  /** The Problems list as last rendered. A snapshot; may contain stale ids. */
  browseOrder: number[];
  /** Ids currently in the kata store. browseOrder is filtered against this. */
  availableKataIds: ReadonlySet<number>;
}

export interface NavigationTargets {
  /** Browse mode only. */
  prevId?: number;
  /** Browse mode only. */
  nextId?: number;
  /** Session mode only. */
  prevIndex?: number;
  /** Session mode only. */
  nextIndex?: number;
  hasPrev: boolean;
  hasNext: boolean;
}

const NOWHERE: NavigationTargets = { hasPrev: false, hasNext: false };

export function resolveKataNavigation(input: NavigationInput): NavigationTargets {
  return input.mode === "session" ? resolveSession(input) : resolveBrowse(input);
}

// The queue governs, not the route. Position comes from currentIndex, never from
// currentKataId, so route/store drift cannot move the session.
function resolveSession({ currentIndex, sessionKataIds }: NavigationInput): NavigationTargets {
  if (currentIndex < 0 || currentIndex >= sessionKataIds.length) return NOWHERE;

  const prevIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;
  const hasPrev = prevIndex >= 0;
  const hasNext = nextIndex < sessionKataIds.length;

  return {
    hasPrev,
    hasNext,
    ...(hasPrev ? { prevIndex } : {}),
    ...(hasNext ? { nextIndex } : {}),
  };
}

function resolveBrowse({ currentKataId, browseOrder, availableKataIds }: NavigationInput): NavigationTargets {
  // Stale ids are dropped before neighbours are computed, so we never hand back
  // an id that would 404 into <Navigate to="/problems">.
  const live = browseOrder.filter((id) => availableKataIds.has(id));
  const at = live.indexOf(currentKataId);
  if (at === -1) return NOWHERE;

  const prevId = at > 0 ? live[at - 1] : undefined;
  const nextId = at < live.length - 1 ? live[at + 1] : undefined;

  return {
    hasPrev: prevId !== undefined,
    hasNext: nextId !== undefined,
    ...(prevId !== undefined ? { prevId } : {}),
    ...(nextId !== undefined ? { nextId } : {}),
  };
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `pnpm vitest run src/lib/kata-navigation.test.ts`
Expected: PASS, 15 tests.

- [ ] **Step 5: Mutation-test the two rules that matter**

First, delete the staleness filter: change `const live = browseOrder.filter((id) => availableKataIds.has(id));` to `const live = browseOrder;`.
Run: `pnpm vitest run src/lib/kata-navigation.test.ts`
Expected: FAIL on "skips ids that no longer exist" and "is unreachable when the current kata itself is stale".
Restore it.

Second, unclamp next: change `const hasNext = nextIndex < sessionKataIds.length;` to `const hasNext = true;`.
Run again. Expected: FAIL on "clamps at the last kata instead of finishing the session".
Restore it. Run again. Expected: PASS, 15 tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/kata-navigation.ts src/lib/kata-navigation.test.ts
git commit -m "feat(nav): pure resolver for next/prev kata

Session mode is governed by the queue index, never by the route's kata id.
Browse mode filters browseOrder against the live kata store first:
loadKatas(language) replaces the list wholesale and deleteKata removes custom
katas, so the snapshot goes stale and must never resolve to a dead id."
```

---

### Task 3: `autosave.ts` — flush instead of drop

**Files:**
- Create: `src/lib/autosave.ts`
- Create: `src/lib/autosave.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:

```ts
interface AutosaveOptions<Id> {
  delayMs: number;
  save: (id: Id, value: string) => void;
}
interface Autosave<Id> {
  schedule(id: Id, readValue: () => string | undefined): void;
  flush(): void;
  cancel(): void;
}
function createAutosave<Id>(options: AutosaveOptions<Id>): Autosave<Id>
```

`readValue` is named for when it runs: at flush time, not at schedule time.

- [ ] **Step 1: Write the failing test**

Create `src/lib/autosave.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAutosave } from "./autosave";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("createAutosave", () => {
  it("writes once after the delay, with the value read at flush time", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1500, save });

    let current = "one";
    auto.schedule(7, () => current);
    current = "two"; // typed again before the timer fired

    vi.advanceTimersByTime(1499);
    expect(save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledExactlyOnceWith(7, "two");
  });

  // The debounce is the whole point: onChange fires per keystroke. Re-scheduling
  // the same id must not write, or every character costs an IPC + SQLite write.
  it("re-scheduling the same id resets the timer and writes nothing", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });

    auto.schedule(7, () => "a");
    vi.advanceTimersByTime(900);
    auto.schedule(7, () => "ab");
    vi.advanceTimersByTime(900);
    expect(save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(save).toHaveBeenCalledExactlyOnceWith(7, "ab");
  });

  // The cross-kata write: the outgoing kata's code must never land under the
  // incoming kata's id.
  it("re-scheduling a different id flushes the old id first", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });

    auto.schedule(7, () => "seven's code");
    vi.advanceTimersByTime(500);
    auto.schedule(8, () => "eight's code");

    expect(save).toHaveBeenCalledExactlyOnceWith(7, "seven's code");
    expect(save).not.toHaveBeenCalledWith(8, "seven's code");

    vi.advanceTimersByTime(1000);
    expect(save).toHaveBeenCalledWith(8, "eight's code");
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("flush() writes the pending save under its own id", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });

    auto.schedule(7, () => "code");
    auto.flush();
    expect(save).toHaveBeenCalledExactlyOnceWith(7, "code");

    vi.advanceTimersByTime(5000);
    expect(save).toHaveBeenCalledTimes(1); // the timer was cleared
  });

  it("flush() with nothing pending is a no-op", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });
    auto.flush();
    auto.flush();
    expect(save).not.toHaveBeenCalled();
  });

  it("does not write when readValue returns undefined", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });
    auto.schedule(7, () => undefined);
    auto.flush();
    expect(save).not.toHaveBeenCalled();
  });

  it("cancel() drops the pending save without writing", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });
    auto.schedule(7, () => "code");
    auto.cancel();
    vi.advanceTimersByTime(5000);
    expect(save).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/lib/autosave.test.ts`
Expected: FAIL — `Failed to resolve import "./autosave"`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/autosave.ts`:

```ts
// A debounced save that flushes rather than drops when the thing being saved
// changes identity.
//
// kata-editor.tsx used to clearTimeout() the pending save on kata change, which
// silently discarded the last 1500ms of typing. Flushing naively would be worse:
// by cleanup time the component's `kata` already points at the NEXT kata, so the
// outgoing code would be written under the incoming id. The pending id is
// therefore captured at schedule time and never re-read.

export interface AutosaveOptions<Id> {
  delayMs: number;
  save: (id: Id, value: string) => void;
}

export interface Autosave<Id> {
  /** `readValue` runs at flush time, so the save always writes the latest text. */
  schedule(id: Id, readValue: () => string | undefined): void;
  flush(): void;
  cancel(): void;
}

interface Pending<Id> {
  id: Id;
  readValue: () => string | undefined;
}

export function createAutosave<Id>({ delayMs, save }: AutosaveOptions<Id>): Autosave<Id> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Pending<Id> | null = null;

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function flush() {
    clearTimer();
    if (pending === null) return;

    const { id, readValue } = pending;
    pending = null;

    const value = readValue();
    if (value !== undefined) save(id, value);
  }

  function schedule(id: Id, readValue: () => string | undefined) {
    // Same id: a plain debounce. onChange fires per keystroke, so flushing here
    // would mean one write per character.
    // Different id: the outgoing kata is about to lose its only chance to save.
    if (pending !== null && pending.id !== id) flush();

    pending = { id, readValue };
    clearTimer();
    timer = setTimeout(flush, delayMs);
  }

  function cancel() {
    clearTimer();
    pending = null;
  }

  return { schedule, flush, cancel };
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `pnpm vitest run src/lib/autosave.test.ts`
Expected: PASS, 7 tests.

`toHaveBeenCalledExactlyOnceWith` is available (verified on vitest 4.1.10, the version this repo pins).

- [ ] **Step 5: Mutation-test both halves of the id rule**

First, reproduce the original bug: change `if (pending !== null && pending.id !== id) flush();` to `// no flush`.
Run: `pnpm vitest run src/lib/autosave.test.ts`
Expected: FAIL on "re-scheduling a different id flushes the old id first".

Second, reproduce the reviewer's over-correction: change that line to `if (pending !== null) flush();`.
Run again. Expected: FAIL on "re-scheduling the same id resets the timer and writes nothing".

Restore the original line. Run again. Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/autosave.ts src/lib/autosave.test.ts
git commit -m "feat(autosave): flush the pending save when the id changes

Debounced saves were dropped on kata change, losing the last 1500ms of typing.
Flush on id change and on cancel; keep the plain debounce when the id is
unchanged, since onChange fires per keystroke and flushing there would cost one
SQLite write per character.

The pending id is captured at schedule time: reading it at flush time would
write the outgoing kata's code under the incoming kata's id."
```

---

### Task 4: Store support — `browseOrder` and `setCurrentIndex`

**Files:**
- Modify: `src/stores/kata-store.ts` (interface near line 51, factory at line 62)
- Modify: `src/stores/session-store.ts` (interface near line 9, `nextKata` at line 289)
- Modify: `src/routes/library.tsx` (`searchedKatas` at line 42)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `useKataStore` gains `browseOrder: number[]` and `setBrowseOrder(ids: number[]): void`
  - `useSessionStore` gains `setCurrentIndex(index: number): void`

- [ ] **Step 1: Add `browseOrder` to the kata store**

In `src/stores/kata-store.ts`, add to the `KataState` interface (beside `katas: Kata[];`):

```ts
  /**
   * The Problems list as last rendered — filter, sort, and search applied.
   * Published by library.tsx and read by the navigation hook. Deliberately not
   * persisted: a cold-opened editor has no neighbours, which is the honest
   * answer rather than a stale ordering from a filter that is no longer set.
   */
  browseOrder: number[];
  setBrowseOrder: (ids: number[]) => void;
```

And in the `create<KataState>((set) => ({` body, beside `katas: [],`:

```ts
  browseOrder: [],
  setBrowseOrder: (ids) => set({ browseOrder: ids }),
```

- [ ] **Step 2: Add `setCurrentIndex` to the session store**

In `src/stores/session-store.ts`, add to the state interface beside `currentIndex: number;`:

```ts
  setCurrentIndex: (index: number) => void;
```

And in the store body, directly above the existing `nextKata:` action (line ~289):

```ts
  // The navigation resolver has already bounds-checked the index. Guarded anyway:
  // this is the only unclamped write to currentIndex in the app.
  setCurrentIndex: (index) => {
    const { sessionKatas } = get();
    if (index >= 0 && index < sessionKatas.length) set({ currentIndex: index });
  },
```

Leave the existing `nextKata`/`prevKata` store actions in place — `session.tsx` still uses them for its on-screen buttons.

- [ ] **Step 3: Publish `browseOrder` from the Problems list**

`src/routes/library.tsx:1` already reads `import { useEffect, useMemo, useRef, useState } from "react";` — no import change needed.

Read the setter near the other store reads:

```ts
  const setBrowseOrder = useKataStore((s) => s.setBrowseOrder);
```

Then immediately after the `searchedKatas` `useMemo` block closes, add:

```ts
  // Publish the RENDERED order — filter, then sort, then search. Publishing the
  // raw store list would look like an optimization and would silently break
  // next/prev in the editor.
  useEffect(() => {
    setBrowseOrder(searchedKatas.map((k) => k.id));
  }, [searchedKatas, setBrowseOrder]);
```

- [ ] **Step 4: Typecheck and run the suite**

Run: `pnpm exec tsc --noEmit -p tsconfig.json && pnpm vitest run`
Expected: tsc silent; all existing tests pass. No new tests here — these are store wiring, covered end-to-end by Task 5.

- [ ] **Step 5: Commit**

```bash
git add src/stores/kata-store.ts src/stores/session-store.ts src/routes/library.tsx
git commit -m "feat(nav): publish the rendered Problems order; add setCurrentIndex

browseOrder is the list as rendered (filter, sort, search), not the raw store
order. It is not persisted: a cold-opened editor genuinely has no neighbours."
```

---

### Task 5: `useKataNavigation()` — the React adapter

**Files:**
- Create: `src/hooks/use-kata-navigation.ts`

**Interfaces:**
- Consumes: `resolveKataNavigation` (Task 2); `browseOrder`, `setBrowseOrder` (Task 4); `setCurrentIndex` (Task 4).
- Produces: `useKataNavigation(currentKataId: number): { next: () => void; prev: () => void; hasNext: boolean; hasPrev: boolean }`

`next` and `prev` are `useCallback`-stable. Without that, `KataEditor`'s `useMemo` over its handlers is decorative and the global keydown listener rebinds on every keystroke.

- [ ] **Step 1: Write the hook**

Create `src/hooks/use-kata-navigation.ts`:

```ts
import { useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { useKataStore } from "../stores/kata-store";
import { useSessionStore } from "../stores/session-store";
import { resolveKataNavigation } from "../lib/kata-navigation";

/**
 * Answers "where does next/prev go?" for whichever kata is on screen.
 *
 * All the decisions live in resolveKataNavigation. This hook only reads the
 * route to pick a mode, feeds the resolver, and performs the mutation.
 */
export function useKataNavigation(currentKataId: number) {
  const navigate = useNavigate();
  const location = useLocation();

  const katas = useKataStore((s) => s.katas);
  const browseOrder = useKataStore((s) => s.browseOrder);
  const sessionKatas = useSessionStore((s) => s.sessionKatas);
  const currentIndex = useSessionStore((s) => s.currentIndex);
  const setCurrentIndex = useSessionStore((s) => s.setCurrentIndex);

  // A running session lives under /session/:id. /session/:id/results renders no
  // editor, so it never reaches this hook.
  const mode = location.pathname.startsWith("/session/") ? "session" : "browse";

  const availableKataIds = useMemo(() => new Set(katas.map((k) => k.id)), [katas]);
  const sessionKataIds = useMemo(() => sessionKatas.map((k) => k.id), [sessionKatas]);

  const targets = useMemo(
    () =>
      resolveKataNavigation({
        mode,
        currentKataId,
        currentIndex,
        sessionKataIds,
        browseOrder,
        availableKataIds,
      }),
    [mode, currentKataId, currentIndex, sessionKataIds, browseOrder, availableKataIds],
  );

  const go = useCallback(
    (index: number | undefined, id: number | undefined) => {
      if (mode === "session") {
        if (index !== undefined) setCurrentIndex(index);
        return;
      }
      if (id !== undefined) navigate(`/editor/${id}`);
    },
    [mode, setCurrentIndex, navigate],
  );

  const next = useCallback(() => go(targets.nextIndex, targets.nextId), [go, targets.nextIndex, targets.nextId]);
  const prev = useCallback(() => go(targets.prevIndex, targets.prevId), [go, targets.prevIndex, targets.prevId]);

  return { next, prev, hasNext: targets.hasNext, hasPrev: targets.hasPrev };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: exit 0. There is no test for this file: it is a store/router adapter, and this repo has no DOM test environment. Its logic lives in `kata-navigation.test.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-kata-navigation.ts
git commit -m "feat(nav): useKataNavigation adapter over the pure resolver

Route picks the mode; the resolver decides; the hook only mutates. next/prev
are useCallback-stable so the editor can memoize its shortcut handlers."
```

---

### Task 6: Wire `KataEditor` — shortcuts, autosave, nudge

**Files:**
- Modify: `src/components/kata-editor.tsx` (autosave effect cleanup ~line 568; `useKeyboardShortcuts` call at line 640; Monaco `onChange` at line 1032)
- Modify: `src/routes/session.tsx` (remove `nextKata`/`prevKata` from `useKeyboardShortcuts` at line 85)
- Modify: `src/index.css` (append after the existing `@keyframes shimmer`)

**Interfaces:**
- Consumes: `useKataNavigation` (Task 5); `createAutosave` (Task 3).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the nudge animation**

Append to `src/index.css`:

```css
/* Played when next/prev is pressed at the end of a list. A silent no-op reads
   as a broken key. */
@keyframes nudge {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-4px); }
  75%      { transform: translateX(4px); }
}
.animate-nudge {
  animation: nudge 180ms ease-in-out;
}
```

- [ ] **Step 2: Stop `session.tsx` registering navigation shortcuts**

In `src/routes/session.tsx`, replace:

```ts
  useKeyboardShortcuts({
    nextKata: handleNext,
    prevKata: handlePrev,
  });
```

with nothing — delete the whole call, then delete the now-unused `useKeyboardShortcuts` import.

Keep everything else. `session.tsx:19-20` destructures the store actions `nextKata` and `prevKata`; `handleNext` (line 70) and `handlePrev` (line 81) wrap them and are still bound to the on-screen Next/Prev buttons. `handleNext` still finishes the session when pressed on the last kata — that is the Finish path, and it stays. Only the *keyboard* route to it goes away.

`noUnusedLocals` is on, so tsc will tell you if anything actually became unused.

- [ ] **Step 3: Register the shortcuts in `KataEditor`**

In `src/components/kata-editor.tsx`, add imports:

```ts
import { useKataNavigation } from "../hooks/use-kata-navigation";
import { createAutosave } from "../lib/autosave";
```

Add state and the hook near the other hooks:

```ts
  const [nudging, setNudging] = useState(false);
  const navigation = useKataNavigation(kata.id);

  const nudge = useCallback(() => {
    setNudging(true);
    setTimeout(() => setNudging(false), 200);
  }, []);
```

Replace the existing `useKeyboardShortcuts` call (line ~640) with:

```ts
  // Memoized: useKeyboardShortcuts lists `handlers` in a useEffect dependency
  // array, and KataEditor re-renders on every keystroke. A fresh object literal
  // would tear down and rebind the window listener on each one.
  const shortcutHandlers = useMemo(
    () => ({
      runTests: handleRun,
      toggleSolution: handleToggleSolution,
      nextKata: () => (navigation.hasNext ? navigation.next() : nudge()),
      prevKata: () => (navigation.hasPrev ? navigation.prev() : nudge()),
    }),
    [handleRun, handleToggleSolution, navigation.hasNext, navigation.hasPrev, navigation.next, navigation.prev, nudge],
  );

  useKeyboardShortcuts(shortcutHandlers);
```

Apply the class to `KataEditor`'s root element — the outermost `<div>` returned by the component:

```tsx
    <div className={`... existing classes ... ${nudging ? "animate-nudge" : ""}`}>
```

- [ ] **Step 4: Replace the raw debounce with `createAutosave`**

Still in `src/components/kata-editor.tsx`, add beside the other refs:

```ts
  const autosave = useRef(
    createAutosave<number>({
      delayMs: 1500,
      save: (id, value) => {
        saveUserCode(id, value).then(() => setSaved(true));
      },
    }),
  ).current;
```

Delete the `autosaveTimer` ref. Replace the Monaco `onChange` body (line ~1032):

```tsx
              onChange={() => {
                setSaved(false);
                autosave.schedule(kata.id, () => editorRef.current?.getValue());
              }}
```

Notes have the identical defect (`notesAutosaveTimer`, 1000ms, `src/components/kata-editor.tsx:1000-1002`), so convert them too — same mechanism, no new test needed:

```ts
  const notesAutosave = useRef(
    createAutosave<number>({
      delayMs: 1000,
      save: (id, value) => {
        saveKataNotes(id, value).then(() => setNotesSaved(true));
      },
    }),
  ).current;
```

Delete the `notesAutosaveTimer` ref. The notes `onChange` captures its value eagerly, so wrap it in a thunk — `createAutosave` reads it at flush time:

```tsx
                    notesAutosave.schedule(kata.id, () => val);
```

In the effect keyed on `[kata.id]` (line ~568), replace the cleanup:

```ts
    return () => {
      // Flush, do not drop: this runs when the kata changes and on unmount, and
      // the pending save belongs to the OUTGOING kata. createAutosave captured
      // its id at schedule time, so it cannot be written under the new kata.
      autosave.flush();
      notesAutosave.flush();
    };
  }, [kata.id, autosave, notesAutosave]);
```

- [ ] **Step 5: Typecheck and run the suite**

Run: `pnpm exec tsc --noEmit -p tsconfig.json && pnpm vitest run`
Expected: tsc silent; all tests pass.

If tsc reports `handlePrev` unused in `session.tsx`, the on-screen Prev button was not wired to it — re-read that file rather than deleting the handler.

- [ ] **Step 6: Add the regression guard**

Create `src/routes/session-shortcuts.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// KataEditor registers nextKata/prevKata. If session.tsx registers them too,
// both handlers run on one keypress and the kata advances twice. Nothing else
// in the suite would catch that: neither registration throws.
//
// The assertion is on useKeyboardShortcuts, not on the identifiers nextKata /
// prevKata — session.tsx legitimately calls the session store's nextKata() and
// prevKata() actions from its on-screen Next/Prev buttons, and must keep doing so.
//
// Crude on purpose, same reasoning as electron/safeguards.test.ts.
describe("session.tsx", () => {
  it("does not register keyboard shortcuts", () => {
    const src = readFileSync(join(__dirname, "session.tsx"), "utf8");
    expect(src).not.toContain("useKeyboardShortcuts");
  });
});
```

Run: `pnpm vitest run src/routes/session-shortcuts.test.ts`
Expected: PASS.

- [ ] **Step 7: Mutation-test the guard**

Re-add `useKeyboardShortcuts({ nextKata: handleNext, prevKata: handlePrev });` to `session.tsx`.
Run: `pnpm vitest run src/routes/session-shortcuts.test.ts`
Expected: FAIL.
Remove it again. Run. Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/kata-editor.tsx src/routes/session.tsx src/routes/session-shortcuts.test.ts src/index.css
git commit -m "feat(nav): kata navigation shortcuts live where the editor lives

KataEditor registers next/prev, so both /session/:id and /editor/:kataId get
them and session.tsx stops owning keyboard concerns. Next no longer finishes a
session; the Finish button does.

The editor nudges when next/prev is pressed at the end of a list, and both
debounced saves — code and notes — now flush on kata change instead of dropping
the last edit."
```

---

### Task 7: Verify in the packaged app, then propagate

**Files:**
- None. This task ships what the previous six built.

**Interfaces:**
- Consumes: everything above.
- Produces: nothing.

- [ ] **Step 1: Confirm the whole branch is green**

```bash
cd /Users/urielmaldonado/projects/kata-desktop/.claude/worktrees/app-core
pnpm exec tsc --noEmit -p tsconfig.json && pnpm vitest run && pnpm build
```
Expected: tsc silent, all tests pass, build succeeds.

- [ ] **Step 2: Verify the keybindings by hand**

**Resolved 2026-07-09, before the manual pass.** Real Monaco was served from `node_modules/monaco-editor/min` and driven with Playwright keypresses. `Meta+Alt+ArrowRight` left the cursor at column 3 and reached the `window` listener with `defaultPrevented: false` — the binding is free. `Meta+ArrowRight` moved the cursor to end-of-line and the `ArrowRight` keydown **never reached `window`**: Monaco calls `stopPropagation()` on keys it handles.

That last result disproves item (1) below and the spec's original Problem section. `Cmd+Right` never jumped katas while the cursor was in Monaco — Monaco always won. The real prior defect was that next/prev were *unreachable while typing*. The spec now records the correction; item (1) is kept only as a no-regression check.

monaco-vim is settled by code reading rather than by runtime probe: `CMAdapter.handleKeyDown` calls `preventDefault()`/`stopPropagation()` only when the normalized key resolves to a bound command, `monacoToCmKey` normalizes `⌘⌥→` to `"Meta-Alt-Right"`, and no `Alt-`/`Meta-` arrow binding exists in its dist.

The remaining items are behavioral and still worth a hand pass, in the Ruby variant where an editor is one click away:

```bash
cd /Users/urielmaldonado/projects/kata-desktop && pnpm tauri dev   # port 1440
```

In a kata editor, confirm each of these:

1. `Cmd+Left` / `Cmd+Right` move the cursor to line start / line end. (Unchanged by this work; a no-regression check.)
2. `Cmd+Alt+Right` advances to the next kata while the cursor is inside Monaco.
3. Same with vim mode on (Settings → Vim Mode).
4. On the last kata of a session, `Cmd+Alt+Right` shakes the editor and does **not** finish the session.
5. Open a kata from a filtered Problems list; `Cmd+Alt+Right` follows that filtered order.
6. Type a character, then immediately press `Cmd+Alt+Right`. Return to the previous kata. Your character is still there. Repeat with the Notes pane. (This is the autosave flush; before this change both were lost.)
7. Restart the app, open a kata directly from the Problems list without scrolling; `Cmd+Alt+Left` on the first row does nothing and shakes.

If (2) or (3) fails, Monaco or monaco-vim owns the binding at runtime. **Stop.** Do not work around it — revisit the binding choice with the user, as the spec requires.

- [ ] **Step 3: Confirm the migration ran against a real database**

The app writes the migrated map back on load. After running the app once:

```bash
sqlite3 ~/Library/Application\ Support/com.code-kata.ruby/kata.db \
  "SELECT value FROM settings WHERE key = 'shortcuts';"
```
Expected: `"nextKata":"Meta+Alt+ArrowRight"` and `"prevKata":"Meta+Alt+ArrowLeft"` in the JSON. Any binding you had customized is unchanged.

- [ ] **Step 4: Merge outward**

```bash
cd /Users/urielmaldonado/projects/kata-desktop && git merge app-core --no-edit
pnpm exec tsc --noEmit -p tsconfig.json && pnpm vitest run

cd /Users/urielmaldonado/projects/kata-desktop/.claude/worktrees/main-variant && git merge app-core --no-edit
pnpm exec tsc --noEmit -p tsconfig.json && pnpm vitest run

cd ~/projects/ruby-kata && git fetch core app-core && git merge core/app-core --no-edit
pnpm exec tsc --noEmit -p tsconfig.json && pnpm vitest run
```

Expected: each merge is clean; all three suites pass. `kata-editor.tsx` and `session.tsx` are shared, so conflicts are unlikely — but `ruby-kata`'s `top-bar.tsx` has diverged before, so read any conflict rather than taking `--ours`.

- [ ] **Step 5: Log the work**

```bash
eitsr commits create --hash <each commit hash>
```

---

## Notes for the implementer

**Never use `git checkout -- <file>` to undo a mutation test.** Twice in this project's history that destroyed uncommitted work. Commit before mutating, or revert with your editor.

**The two mutation tests in Task 3 are the point of that task.** One reproduces the original dropped-save bug; the other reproduces the plausible over-correction of flushing on every `schedule()`, which would put a SQLite write behind every keystroke. If both fail as described, the semantics are pinned. If either passes, the implementation is wrong regardless of what the other tests say.

**`resolveKataNavigation` returns optional fields deliberately.** `hasNext === true` implies exactly one of `nextIndex` / `nextId` is set, depending on mode. Do not "simplify" this into a single `nextTarget: number`, because an index and a kata id are different things and conflating them is how you navigate to `/editor/2` when you meant "the third kata in the queue."
