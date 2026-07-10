# Editor Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the editor toggles on the Practice launcher, make `Autocomplete` and `Auto-Closing Brackets` actually silence everything they claim to, and add a `Highlight Occurrences` toggle.

**Architecture:** A new pure module `src/lib/editor-settings.ts` owns three things: `monacoEditorOptions(settings)` (the settings→Monaco mapping, lifted out of `kata-editor.tsx` so it is unit-testable without rendering Monaco), `EDITOR_TOGGLES` (the descriptor list Settings and Practice both render from, so they cannot drift), and `resolveEditorToggles(patch, defaults)` (the persisted-settings merge for the five editor booleans, so the "no migration needed" claim is a test rather than an assertion). The store gains one boolean.

**Tech Stack:** React 19, TypeScript (strict: `noUnusedLocals`, `noUnusedParameters`), Zustand, Monaco (`@monaco-editor/react`), Vitest 4.1.10 (**Node environment — no jsdom, no `@testing-library/react`**), Tailwind v4 + daisyUI.

## Global Constraints

- Branch: `app-core`. Language-agnostic work only. Flow is one-way: `app-core` → variants. **Never** merge a variant into `app-core`.
- **No new cosmetic settings.** Bracket pair colorization, whitespace rendering, sticky scroll, indent guides are explicit non-goals.
- **No default changes.** Every existing user's editor behaves identically until they flip something. `highlightOccurrences` defaults to `true` because that is Monaco's current behavior.
- **No migration.** A `highlightOccurrences` row absent from the database yields the default. Task 3 proves this with a test.
- **No behavior change to the persisted-settings merge.** `resolveEditorToggles` reproduces `(patch.x as boolean) ?? DEFAULTS.x` exactly, including its tolerance of non-boolean junk. Tightening it to a `typeof` check would change how a corrupted row loads and is out of scope.
- Nothing may render in a test. `practice.tsx` and `settings.tsx` cannot be imported under this Vitest setup. Their correctness rests on both rendering from `EDITOR_TOGGLES`, which is tested.
- `monacoEditorOptions` declares **no explicit return type** — TypeScript infers the object literal. Annotating it `Record<string, unknown>` breaks the spread at the `kata-editor.tsx` call site.
- `src/lib/editor-settings.ts` must **never** import `monaco-editor` (it would pull Monaco into the Vitest module graph, which has no DOM) and must **never** import from `src/stores` (`src/lib` does not depend on `src/stores`; the reverse is established — four store files already import from `src/lib`).
- `LineNumbersMode` has exactly one definition, in `src/lib/editor-settings.ts`. `settings-store.ts` imports and re-exports it.
- Every guard in this plan is mutation-tested: break the code, confirm the test fails, restore, confirm green. A test that does not fail when its subject is broken is not a test.
- EITS: a task must be In Progress before editing files. Commit messages carry no Anthropic attribution or co-author tags.

---

### Task 1: `monacoEditorOptions` — the settings→Monaco mapping

This is where both bugs live. Two of the tests below fail against today's behavior, which is the point of writing them first.

**Files:**
- Create: `src/lib/editor-settings.ts`
- Test: `src/lib/editor-settings.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `LineNumbersMode` (union type), `EditorSettings` (interface), `monacoEditorOptions(s: EditorSettings)` returning an inferred object literal. Task 3 imports `LineNumbersMode`; Task 4 calls `monacoEditorOptions`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/editor-settings.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { monacoEditorOptions, type EditorSettings } from "./editor-settings";

const BASE: EditorSettings = {
  fontSize: 14,
  fontFamily: "JetBrains Mono, monospace",
  tabSize: 2,
  lineNumbersMode: "on",
  editorAutocomplete: true,
  autoClosingBrackets: true,
  wordWrap: false,
  fontLigatures: false,
  highlightOccurrences: true,
};

describe("monacoEditorOptions", () => {
  // The Autocomplete toggle's own hint text reads "Turn off to practice API
  // recall without suggestions". parameterHints is the popup that fires on `(`,
  // and it did not follow the toggle. This test fails against the old inline
  // sharedEditorOptions.
  it("autocomplete off silences every suggestion, parameter hints included", () => {
    const o = monacoEditorOptions({ ...BASE, editorAutocomplete: false });
    expect(o.quickSuggestions).toBe(false);
    expect(o.suggestOnTriggerCharacters).toBe(false);
    expect(o.wordBasedSuggestions).toBe("off");
    expect(o.parameterHints).toEqual({ enabled: false });
  });

  it("autocomplete on enables every suggestion", () => {
    const o = monacoEditorOptions({ ...BASE, editorAutocomplete: true });
    expect(o.quickSuggestions).toBe(true);
    expect(o.suggestOnTriggerCharacters).toBe(true);
    expect(o.wordBasedSuggestions).toBe("currentDocument");
    expect(o.parameterHints).toEqual({ enabled: true });
  });

  // autoSurround is why selecting text and typing `(` still wrapped the
  // selection with the toggle off. Overtype and Delete are its siblings.
  // This test also fails against the old inline sharedEditorOptions.
  it("auto-closing off disables all five auto-close behaviors", () => {
    const o = monacoEditorOptions({ ...BASE, autoClosingBrackets: false });
    expect(o.autoClosingBrackets).toBe("never");
    expect(o.autoClosingQuotes).toBe("never");
    expect(o.autoSurround).toBe("never");
    expect(o.autoClosingOvertype).toBe("never");
    expect(o.autoClosingDelete).toBe("never");
  });

  it("auto-closing on restores all five", () => {
    const o = monacoEditorOptions({ ...BASE, autoClosingBrackets: true });
    expect(o.autoClosingBrackets).toBe("languageDefined");
    expect(o.autoClosingQuotes).toBe("languageDefined");
    expect(o.autoSurround).toBe("languageDefined");
    expect(o.autoClosingOvertype).toBe("auto");
    expect(o.autoClosingDelete).toBe("auto");
  });

  // Both options are needed. occurrencesHighlight follows the cursor;
  // selectionHighlight highlights matches of a selection. Leaving one on still
  // reads as "the editor is highlighting things at me".
  it("highlightOccurrences drives both highlight options", () => {
    const off = monacoEditorOptions({ ...BASE, highlightOccurrences: false });
    expect(off.occurrencesHighlight).toBe("off");
    expect(off.selectionHighlight).toBe(false);

    const on = monacoEditorOptions({ ...BASE, highlightOccurrences: true });
    expect(on.occurrencesHighlight).toBe("singleFile");
    expect(on.selectionHighlight).toBe(true);
  });

  it("passes the display settings straight through", () => {
    const o = monacoEditorOptions({ ...BASE, wordWrap: true, fontLigatures: true, lineNumbersMode: "relative" });
    expect(o.fontSize).toBe(14);
    expect(o.fontFamily).toBe("JetBrains Mono, monospace");
    expect(o.tabSize).toBe(2);
    expect(o.lineNumbers).toBe("relative");
    expect(o.wordWrap).toBe("on");
    expect(o.fontLigatures).toBe(true);
  });

  it("wordWrap false maps to the string 'off', not the boolean", () => {
    expect(monacoEditorOptions({ ...BASE, wordWrap: false }).wordWrap).toBe("off");
  });

  // A typo'd key would silently yield undefined and Monaco would fall back to
  // its default, producing a toggle that renders and controls nothing.
  it("never emits an undefined option value", () => {
    for (const settings of [BASE, { ...BASE, editorAutocomplete: false, autoClosingBrackets: false, highlightOccurrences: false }]) {
      for (const [key, value] of Object.entries(monacoEditorOptions(settings))) {
        expect(value, key).not.toBeUndefined();
      }
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/lib/editor-settings.test.ts`
Expected: FAIL — `Failed to resolve import "./editor-settings"`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/editor-settings.ts`. This is the current inline `sharedEditorOptions` from `kata-editor.tsx:558` plus the six new options. Note there is **no return type annotation** — see Global Constraints.

```ts
// The settings→Monaco mapping, and the one definition of what an editor toggle
// is. Both Settings and Practice render from EDITOR_TOGGLES, so the two pages
// cannot drift.
//
// This module must never import monaco-editor: it would pull Monaco into the
// Vitest module graph, which has no DOM. Option names are therefore plain
// strings, asserted by name in editor-settings.test.ts. It must also never
// import from src/stores -- the dependency runs stores → lib.

export type LineNumbersMode = "on" | "off" | "relative";

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  lineNumbersMode: LineNumbersMode;
  editorAutocomplete: boolean;
  autoClosingBrackets: boolean;
  wordWrap: boolean;
  fontLigatures: boolean;
  highlightOccurrences: boolean;
}

export function monacoEditorOptions(s: EditorSettings) {
  return {
    fontSize: s.fontSize,
    fontFamily: s.fontFamily,
    tabSize: s.tabSize,
    detectIndentation: false,
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    lineNumbers: s.lineNumbersMode,
    fontLigatures: s.fontLigatures,
    wordWrap: s.wordWrap ? ("on" as const) : ("off" as const),

    // Autocomplete. parameterHints is the signature popup that fires on `(`;
    // it did not follow this toggle before 2026-07-09.
    quickSuggestions: s.editorAutocomplete,
    suggestOnTriggerCharacters: s.editorAutocomplete,
    wordBasedSuggestions: s.editorAutocomplete ? ("currentDocument" as const) : ("off" as const),
    parameterHints: { enabled: s.editorAutocomplete },

    // Auto-closing. autoSurround is why selecting text and typing `(` still
    // wrapped the selection; Overtype and Delete are its siblings. None of the
    // three followed this toggle before 2026-07-09.
    autoClosingBrackets: s.autoClosingBrackets ? ("languageDefined" as const) : ("never" as const),
    autoClosingQuotes: s.autoClosingBrackets ? ("languageDefined" as const) : ("never" as const),
    autoSurround: s.autoClosingBrackets ? ("languageDefined" as const) : ("never" as const),
    autoClosingOvertype: s.autoClosingBrackets ? ("auto" as const) : ("never" as const),
    autoClosingDelete: s.autoClosingBrackets ? ("auto" as const) : ("never" as const),

    // occurrencesHighlight follows the cursor; selectionHighlight highlights
    // matches of a selection. Ruby has no semantic DocumentHighlightProvider,
    // but Monaco registers TextualMultiDocumentHighlightFeature as a fallback
    // for every language, so both apply to Ruby katas.
    occurrencesHighlight: s.highlightOccurrences ? ("singleFile" as const) : ("off" as const),
    selectionHighlight: s.highlightOccurrences,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/lib/editor-settings.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Mutation-test each new option**

Break each option in turn, confirm the suite catches it, restore. Run after each edit: `pnpm exec vitest run src/lib/editor-settings.test.ts`

| Mutation | Expected |
|---|---|
| Delete the `parameterHints` line | FAIL — `autocomplete off silences every suggestion` and `never emits an undefined option value` |
| `parameterHints: { enabled: true }` (hardcode) | FAIL — `autocomplete off silences every suggestion` |
| Delete `autoSurround` | FAIL — `auto-closing off disables all five` |
| `autoClosingOvertype: "auto"` (hardcode) | FAIL — `auto-closing off disables all five` |
| Delete `autoClosingDelete` | FAIL — `auto-closing off disables all five` |
| `selectionHighlight: true` (hardcode) | FAIL — `highlightOccurrences drives both` |
| `occurrencesHighlight: "singleFile"` (hardcode) | FAIL — `highlightOccurrences drives both` |

If any mutation leaves the suite green, the test is not testing what it claims. Fix the test before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/editor-settings.ts src/lib/editor-settings.test.ts
git commit -m "feat(editor): pure settings-to-Monaco mapping, with the options its toggles forgot

Autocomplete left parameterHints on, so the signature popup still fired on \`(\`
with the toggle off -- despite its hint text reading 'Turn off to practice API
recall without suggestions'. Auto-Closing Brackets left autoSurround,
autoClosingOvertype and autoClosingDelete on, so selecting text and typing \`(\`
still wrapped it.

Extracting the mapping out of kata-editor.tsx is what makes either fix
testable: the object could not be asserted on without rendering Monaco, which
this repo's Node-environment Vitest cannot do."
```

---

### Task 2: `EDITOR_TOGGLES` and `resolveEditorToggles`

Both are pure and depend only on Task 1's module. Neither imports the store.

**Files:**
- Modify: `src/lib/editor-settings.ts` (append)
- Test: `src/lib/editor-settings.test.ts` (append)

**Interfaces:**
- Consumes: nothing from Task 1 at runtime; appends to the same file.
- Produces: `EditorToggleKey` (union type), `EditorToggle` (interface), `EDITOR_TOGGLES: EditorToggle[]`, `resolveEditorToggles(patch: Record<string, unknown>, defaults: Record<EditorToggleKey, boolean>): Record<EditorToggleKey, boolean>`. Task 3 calls `resolveEditorToggles`; Tasks 5 and 6 render from `EDITOR_TOGGLES`.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/editor-settings.test.ts`:

```ts
import { EDITOR_TOGGLES, resolveEditorToggles, type EditorToggleKey } from "./editor-settings";

const TOGGLE_DEFAULTS: Record<EditorToggleKey, boolean> = {
  editorAutocomplete: true,
  autoClosingBrackets: true,
  wordWrap: false,
  highlightOccurrences: true,
  fontLigatures: false,
};

describe("EDITOR_TOGGLES", () => {
  it("has no duplicate keys", () => {
    const keys = EDITOR_TOGGLES.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every toggle has a non-empty label", () => {
    for (const toggle of EDITOR_TOGGLES) {
      expect(toggle.label.trim(), toggle.key).not.toBe("");
    }
  });

  // The Practice/Settings split must be a real split. All-true or all-false
  // would mean the onPractice flag is doing nothing.
  it("splits: Practice gets a non-empty subset, and not everything", () => {
    const onPractice = EDITOR_TOGGLES.filter((t) => t.onPractice);
    expect(onPractice.length).toBeGreaterThan(0);
    expect(onPractice.length).toBeLessThan(EDITOR_TOGGLES.length);
  });

  // Nobody picks a typeface feature before a timed session.
  it("keeps Font Ligatures out of Practice", () => {
    const ligatures = EDITOR_TOGGLES.find((t) => t.key === "fontLigatures");
    expect(ligatures).toBeDefined();
    expect(ligatures!.onPractice).toBe(false);
  });

  // Task 6 builds a Record<EditorToggleKey, boolean> for the Practice page.
  // Every rendered toggle must have a value in it.
  it("every toggle key is an EditorToggleKey the defaults record covers", () => {
    for (const toggle of EDITOR_TOGGLES) {
      expect(TOGGLE_DEFAULTS[toggle.key], toggle.key).toBeTypeOf("boolean");
    }
  });
});

describe("resolveEditorToggles", () => {
  // This is the "no migration needed" claim, as a test. An existing database
  // has no highlightOccurrences row; the setting must come back as its default.
  it("falls back to the default when the key is absent from the patch", () => {
    const resolved = resolveEditorToggles({}, TOGGLE_DEFAULTS);
    expect(resolved.highlightOccurrences).toBe(true);
    expect(resolved.editorAutocomplete).toBe(true);
    expect(resolved.wordWrap).toBe(false);
  });

  it("a persisted false overrides a true default", () => {
    const resolved = resolveEditorToggles({ highlightOccurrences: false }, TOGGLE_DEFAULTS);
    expect(resolved.highlightOccurrences).toBe(false);
  });

  it("a persisted true overrides a false default", () => {
    const resolved = resolveEditorToggles({ wordWrap: true }, TOGGLE_DEFAULTS);
    expect(resolved.wordWrap).toBe(true);
  });

  it("returns every key in defaults, and only those", () => {
    const resolved = resolveEditorToggles({ somethingElse: 1 }, TOGGLE_DEFAULTS);
    expect(Object.keys(resolved).sort()).toEqual(Object.keys(TOGGLE_DEFAULTS).sort());
  });

  // Reproduces the existing `(patch.x as boolean) ?? DEFAULTS.x` exactly:
  // null is nullish and falls back, but other junk passes through. Tightening
  // this would change how a corrupted row loads. Out of scope -- see Global
  // Constraints.
  it("treats null as absent, matching the ?? it replaces", () => {
    expect(resolveEditorToggles({ wordWrap: null }, TOGGLE_DEFAULTS).wordWrap).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/lib/editor-settings.test.ts`
Expected: FAIL — `EDITOR_TOGGLES` and `resolveEditorToggles` are not exported.

- [ ] **Step 3: Write the implementation**

Append to `src/lib/editor-settings.ts`:

```ts
export type EditorToggleKey =
  | "editorAutocomplete"
  | "autoClosingBrackets"
  | "wordWrap"
  | "highlightOccurrences"
  | "fontLigatures";

export interface EditorToggle {
  key: EditorToggleKey;
  label: string;
  hint?: string;
  /** Practice shows only the toggles that change how hard a session is. */
  onPractice: boolean;
}

// Order is the render order on both pages: behavior first, cosmetics last.
export const EDITOR_TOGGLES: EditorToggle[] = [
  {
    key: "editorAutocomplete",
    label: "Autocomplete",
    hint: "Turn off to practice API recall without suggestions.",
    onPractice: true,
  },
  {
    key: "wordWrap",
    label: "Word Wrap",
    onPractice: true,
  },
  {
    key: "autoClosingBrackets",
    label: "Auto-Closing Brackets",
    hint: "Turn off to type every closing bracket and quote yourself.",
    onPractice: true,
  },
  {
    key: "highlightOccurrences",
    label: "Highlight Occurrences",
    hint: "Turn off to stop other instances of the identifier under the cursor from lighting up.",
    onPractice: true,
  },
  {
    key: "fontLigatures",
    label: "Font Ligatures",
    onPractice: false,
  },
];

/**
 * Merges the persisted settings rows over the defaults for the editor booleans.
 *
 * Reproduces `(patch.x as boolean) ?? DEFAULTS.x` per key, which is why a key
 * absent from the database yields its default and no migration is needed when a
 * new toggle ships. The `??` semantics are deliberate: null falls back, other
 * junk passes through, exactly as the five hand-written lines it replaces did.
 */
export function resolveEditorToggles(
  patch: Record<string, unknown>,
  defaults: Record<EditorToggleKey, boolean>,
): Record<EditorToggleKey, boolean> {
  const keys = Object.keys(defaults) as EditorToggleKey[];
  return Object.fromEntries(
    keys.map((key) => [key, (patch[key] as boolean) ?? defaults[key]]),
  ) as Record<EditorToggleKey, boolean>;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/lib/editor-settings.test.ts`
Expected: PASS, 18 tests.

- [ ] **Step 5: Mutation-test the guards**

| Mutation | Expected |
|---|---|
| Change `fontLigatures` to `onPractice: true` | FAIL — `keeps Font Ligatures out of Practice` and `splits: Practice gets a non-empty subset, and not everything` |
| Set every `onPractice: false` | FAIL — `splits: Practice gets a non-empty subset` |
| Duplicate the `wordWrap` entry | FAIL — `has no duplicate keys` |
| Change a `label` to `""` | FAIL — `every toggle has a non-empty label` |
| `resolveEditorToggles`: return `{ ...defaults }` (ignore the patch) | FAIL — `a persisted false overrides a true default` and `a persisted true overrides a false default` |
| `resolveEditorToggles`: return `patch as ...` (ignore the defaults) | FAIL — `falls back to the default when the key is absent` |
| `resolveEditorToggles`: `patch[key] ?? defaults[key]` → `patch[key] !== undefined ? patch[key] : defaults[key]` | FAIL — `treats null as absent, matching the ?? it replaces` |

- [ ] **Step 6: Commit**

```bash
git add src/lib/editor-settings.ts src/lib/editor-settings.test.ts
git commit -m "feat(editor): one definition of an editor toggle, and a tested settings merge

EDITOR_TOGGLES is the single source both Settings and Practice render from.
resolveEditorToggles replaces five hand-copied '(patch.x as boolean) ??
DEFAULTS.x' lines with one tested function, so 'a new toggle needs no
migration' is a test rather than a claim."
```

---

### Task 3: `highlightOccurrences` on the settings store

**Files:**
- Modify: `src/stores/settings-store.ts` (type export line 12; defaults ~line 48; interface ~line 72; validation block ~lines 150-157)
- Test: `src/lib/editor-settings.test.ts` (append)

**Interfaces:**
- Consumes: `LineNumbersMode` (Task 1), `resolveEditorToggles`, `EditorToggleKey` (Task 2).
- Produces: `useSettingsStore.getState().highlightOccurrences: boolean`, default `true`. Tasks 4, 5, 6 read it.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/editor-settings.test.ts`:

```ts
import { useSettingsStore } from "../stores/settings-store";

// settings-store imports getDb from database.ts but calls it lazily, so the
// module imports cleanly under Vitest's Node environment. Verified 2026-07-09.
describe("settings store", () => {
  it("defaults highlightOccurrences to true, matching Monaco's own behavior", () => {
    expect(useSettingsStore.getState().highlightOccurrences).toBe(true);
  });

  // A toggle naming a key the store does not have would render, flip nothing,
  // and look like a bug in Monaco.
  it("has a boolean for every EDITOR_TOGGLES key", () => {
    const state = useSettingsStore.getState() as unknown as Record<string, unknown>;
    for (const toggle of EDITOR_TOGGLES) {
      expect(typeof state[toggle.key], toggle.key).toBe("boolean");
    }
  });
});
```

Note: this test constrains **type**, not membership. `vimMode` is also a store boolean and would pass it. `EditorToggleKey` is what constrains membership, at compile time.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/lib/editor-settings.test.ts`
Expected: FAIL — `expected undefined to be true`.

- [ ] **Step 3: Write the implementation**

Four edits to `src/stores/settings-store.ts`.

Add to the imports:
```ts
import { resolveEditorToggles, type EditorToggleKey, type LineNumbersMode } from "../lib/editor-settings";
```

Replace the local declaration at line 12 (`export type LineNumbersMode = "on" | "off" | "relative";`) with a re-export, so the type has exactly one definition:
```ts
export type { LineNumbersMode };
```

In `DEFAULTS`, after `fontLigatures: false,`:
```ts
  highlightOccurrences: true,
```

In the settings interface, after `fontLigatures: boolean;`:
```ts
  highlightOccurrences: boolean;
```

In the `set({...})` merge inside `loadSettings`, delete these four lines:
```ts
      editorAutocomplete: (patch.editorAutocomplete as boolean) ?? DEFAULTS.editorAutocomplete,
      wordWrap: (patch.wordWrap as boolean) ?? DEFAULTS.wordWrap,
      autoClosingBrackets: (patch.autoClosingBrackets as boolean) ?? DEFAULTS.autoClosingBrackets,
      fontLigatures: (patch.fontLigatures as boolean) ?? DEFAULTS.fontLigatures,
```

and replace them with a spread of the resolver. Place it where `editorAutocomplete` was, so `lineNumbersMode` keeps its position:
```ts
      ...resolveEditorToggles(patch, EDITOR_TOGGLE_DEFAULTS),
```

Define `EDITOR_TOGGLE_DEFAULTS` immediately after the `DEFAULTS` object, deriving from it so the two cannot disagree:
```ts
const EDITOR_TOGGLE_DEFAULTS: Record<EditorToggleKey, boolean> = {
  editorAutocomplete: DEFAULTS.editorAutocomplete,
  autoClosingBrackets: DEFAULTS.autoClosingBrackets,
  wordWrap: DEFAULTS.wordWrap,
  highlightOccurrences: DEFAULTS.highlightOccurrences,
  fontLigatures: DEFAULTS.fontLigatures,
};
```

Leave every other line of the merge alone — `theme`, `lineNumbersMode`, `shortcuts`, `practiceConfig` and the rest keep their existing handling.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/lib/editor-settings.test.ts`
Expected: PASS, 20 tests.

- [ ] **Step 5: Verify the build**

Run: `pnpm build`
Expected: `tsc` clean, `✓ built`. A `noUnusedLocals` error means the old `LineNumbersMode` declaration is still present.

- [ ] **Step 6: Mutation-test the store wiring**

| Mutation | Expected |
|---|---|
| `highlightOccurrences: false` in `DEFAULTS` | FAIL — `defaults highlightOccurrences to true` |
| Delete `highlightOccurrences` from `DEFAULTS` | FAIL — `defaults highlightOccurrences to true` and `has a boolean for every EDITOR_TOGGLES key` |
| Delete `highlightOccurrences` from `EDITOR_TOGGLE_DEFAULTS` | FAIL — `tsc` (Record is not satisfied) |

- [ ] **Step 7: Commit**

```bash
git add src/stores/settings-store.ts src/lib/editor-settings.test.ts
git commit -m "feat(editor): add highlightOccurrences setting, default on

Default is true because that is Monaco's current behavior: nobody's editor
changes until they flip it. The five editor booleans now load through
resolveEditorToggles, so the no-migration fallback is covered by a test.
LineNumbersMode moves to editor-settings.ts and is re-exported here, leaving
one definition."
```

---

### Task 4: `kata-editor.tsx` calls the extracted mapping

**Files:**
- Modify: `src/components/kata-editor.tsx` (store destructure line 496; `sharedEditorOptions` line 558)

**Interfaces:**
- Consumes: `monacoEditorOptions(s: EditorSettings)` (Task 1); `highlightOccurrences` (Task 3).
- Produces: nothing. The read-only solution editor keeps spreading the result and overriding `readOnly` / `lineNumbers`.

- [ ] **Step 1: Add the import**

At the top of `src/components/kata-editor.tsx`, beside the other `../lib` imports:

```ts
import { monacoEditorOptions } from "../lib/editor-settings";
```

- [ ] **Step 2: Read `highlightOccurrences` from the store**

Line 496 destructures the whole store in one call. Add the new key:

```ts
  const { theme, vimMode, toggleVimMode, shortcuts, fontSize, fontFamily, tabSize, hideDescriptionInSession, setSetting, editorAutocomplete, lineNumbersMode, wordWrap, autoClosingBrackets, fontLigatures, highlightOccurrences } = useSettingsStore();
```

- [ ] **Step 3: Replace the inline object**

Replace the whole `sharedEditorOptions` object (line 558, through its closing `};`) with:

```ts
  const sharedEditorOptions = monacoEditorOptions({
    fontSize,
    fontFamily,
    tabSize,
    lineNumbersMode,
    editorAutocomplete,
    autoClosingBrackets,
    wordWrap,
    fontLigatures,
    highlightOccurrences,
  });
```

Leave every use site alone. The read-only solution editor at line 995 still does `{...sharedEditorOptions, readOnly: true, lineNumbers: "off"}`. The `DiffEditor` at line 1014 has its own hand-written options and is **not** touched — it is read-only, so suggestions and auto-closing never fire in it.

- [ ] **Step 4: Verify the types and the build**

Run: `pnpm build`
Expected: `tsc` clean, `✓ built`.

This is the step that would catch a misspelled Monaco option name: `sharedEditorOptions` is spread into `options`, typed `IStandaloneEditorConstructionOptions`. If `tsc` reports `Object literal may only specify known properties`, an option name in Task 1 is wrong. Fix it in `editor-settings.ts`, not here.

- [ ] **Step 5: Run the full suite**

Run: `pnpm exec vitest run`
Expected: PASS. No test imports `kata-editor.tsx` — it cannot be imported under a Node environment — so this only confirms nothing else regressed.

- [ ] **Step 6: Commit**

```bash
git add src/components/kata-editor.tsx
git commit -m "refactor(editor): build Monaco options from the extracted mapping

Behavior change is Task 1's, not this commit's: the editor now gets
parameterHints, autoSurround, autoClosingOvertype, autoClosingDelete and the
two highlight options wired to the toggles that claim to own them."
```

---

### Task 5: Settings renders from `EDITOR_TOGGLES`

**Files:**
- Modify: `src/routes/settings.tsx` (selectors ~lines 70-75; toggle blocks lines 189-231)

**Interfaces:**
- Consumes: `EDITOR_TOGGLES` (Task 2); `highlightOccurrences` (Task 3).
- Produces: nothing.

- [ ] **Step 1: Add the import**

Beside the other `../lib` imports in `src/routes/settings.tsx`:

```ts
import { EDITOR_TOGGLES } from "../lib/editor-settings";
```

- [ ] **Step 2: Swap the selectors**

`settings.tsx` declares `setSetting` three times, once per tab component. The editor tab is the one at **line 70**, and every edit in this task happens inside it.

Delete the four now-unused selectors at lines 71-75: `editorAutocomplete`, `wordWrap`, `autoClosingBrackets`, `fontLigatures`. Strict mode's `noUnusedLocals` fails the build if you leave them. Add one selector beside `setSetting`:

```ts
  const settings = useSettingsStore();
```

Reading the whole store here re-renders the editor tab on any settings change. That is what `kata-editor.tsx:496` already does, and this component only mounts on the Settings page.

- [ ] **Step 3: Render the list**

Replace the four hand-written toggle blocks (lines 189-231: from the `<div>` before `<SectionLabel>Autocomplete</SectionLabel>` through the closing `</div>` after the Font Ligatures button) with:

```tsx
      {EDITOR_TOGGLES.map(({ key, label, hint }) => {
        const on = settings[key];
        return (
          <div key={key}>
            <SectionLabel>{label}</SectionLabel>
            <button
              onClick={() => setSetting(key, !on)}
              className={`btn btn-sm ${on ? "btn-success" : "btn-ghost"}`}
            >
              {on ? "On" : "Off"}
            </button>
            {hint && <p className="text-[11px] text-base-content/40 mt-1.5">{hint}</p>}
          </div>
        );
      })}
```

This preserves the existing render order — Autocomplete, Word Wrap, Auto-Closing Brackets — and inserts Highlight Occurrences before Font Ligatures.

- [ ] **Step 4: Verify the build**

Run: `pnpm build`
Expected: `tsc` clean, `✓ built`. A `noUnusedLocals` error means a deleted selector is still referenced elsewhere in the file — find it before proceeding.

- [ ] **Step 5: Run the full suite**

Run: `pnpm exec vitest run`
Expected: PASS, all tests.

- [ ] **Step 6: Commit**

```bash
git add src/routes/settings.tsx
git commit -m "refactor(settings): render editor toggles from EDITOR_TOGGLES

Four near-identical hand-written blocks become a map, so Practice can render
the same list in the next task without a second copy to keep in sync. The
Highlight Occurrences row appears for free."
```

---

### Task 6: The Editor section on the Practice launcher

**Files:**
- Modify: `src/routes/practice.tsx` (imports; store selectors near line 196; the configuration column after the Category block that ends near line 445)

**Interfaces:**
- Consumes: `EDITOR_TOGGLES`, `EditorToggleKey` (Task 2); `highlightOccurrences` (Task 3).
- Produces: nothing.

- [ ] **Step 1: Add the import**

Beside the existing `../lib/levels` import in `src/routes/practice.tsx`:

```ts
import { EDITOR_TOGGLES, type EditorToggleKey } from "../lib/editor-settings";
```

- [ ] **Step 2: Read the toggle values**

`practice.tsx` already binds `setSetting` at line 147 — do **not** add a second one. It reads `language` at line 196 via a selector; add the five booleans beside that:

```ts
  const editorAutocomplete = useSettingsStore((s) => s.editorAutocomplete);
  const autoClosingBrackets = useSettingsStore((s) => s.autoClosingBrackets);
  const wordWrap = useSettingsStore((s) => s.wordWrap);
  const highlightOccurrences = useSettingsStore((s) => s.highlightOccurrences);
  const fontLigatures = useSettingsStore((s) => s.fontLigatures);

  const toggleValues: Record<EditorToggleKey, boolean> = {
    editorAutocomplete,
    autoClosingBrackets,
    wordWrap,
    highlightOccurrences,
    fontLigatures,
  };
```

Individual selectors, not `useSettingsStore()`, so the page re-renders only when one of these changes. Typing `toggleValues` as `Record<EditorToggleKey, boolean>` means adding a sixth toggle in `editor-settings.ts` fails `tsc` here until it is wired — a compile-time reminder, not a silent gap.

`setSetting` is typed `(key: string, value: unknown) => Promise<void>`, so passing an `EditorToggleKey` needs no cast.

- [ ] **Step 3: Add the Editor section**

In the configuration column, immediately after the closing `</div>` of the Level-picker / Category-filter conditional (the `) : (` … `)}` block ending near line 445), insert:

```tsx
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-base-content/35 mb-2">
            Editor
          </p>
          <div className="flex flex-col gap-1.5">
            {EDITOR_TOGGLES.filter((t) => t.onPractice).map(({ key, label }) => {
              const on = toggleValues[key];
              return (
                <button
                  key={key}
                  onClick={() => setSetting(key, !on)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 border transition-colors ${
                    on
                      ? "border-primary/60 bg-primary/[0.06]"
                      : "border-base-300/60 bg-base-200 hover:border-base-300"
                  }`}
                >
                  <span className={`text-[12px] ${on ? "text-base-content" : "text-base-content/50"}`}>
                    {label}
                  </span>
                  <span className={`text-[11px] font-bold ${on ? "text-primary" : "text-base-content/35"}`}>
                    {on ? "On" : "Off"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
```

The classes match the Level-picker buttons directly above it, so the section reads as part of the same column.

- [ ] **Step 4: Verify the build**

Run: `pnpm build`
Expected: `tsc` clean, `✓ built`.

- [ ] **Step 5: Run the full suite**

Run: `pnpm exec vitest run`
Expected: PASS, all tests.

- [ ] **Step 6: Commit**

```bash
git add src/routes/practice.tsx
git commit -m "feat(practice): editor toggles where the session is configured

Whether autocomplete is on is a decision about how hard the next session will
be, and it was only reachable from Settings. Same store keys, second view --
no local state, so the two pages cannot drift."
```

---

### Task 7: Verify by hand, then propagate

**Files:**
- Modify: none directly. Merge commits on `main`, `js-ruby-version`, `~/projects/ruby-kata`.

**Interfaces:**
- Consumes: everything above.
- Produces: nothing.

- [ ] **Step 1: Confirm `app-core` is green**

```bash
cd /Users/urielmaldonado/projects/kata-desktop/.claude/worktrees/app-core
pnpm exec vitest run && pnpm build
```
Expected: all tests pass, `✓ built`.

- [ ] **Step 2: Verify the behavior by hand**

```bash
cd /Users/urielmaldonado/projects/kata-desktop/.claude/worktrees/app-core && pnpm dev
```
Open `http://localhost:1420`. Do **not** run `pnpm tauri dev` on the Ruby variant: WKWebView cannot run ruby.wasm and it crashes on any kata run. Vite alone is enough for a JavaScript kata.

1. Practice shows an Editor section with four toggles and no Font Ligatures.
2. Flip Autocomplete off in Practice. Open Settings. It reads Off. No reload.
3. In a kata editor with Autocomplete off, type `foo(` — no signature popup. **This is the parameterHints fix.**
4. With Auto-Closing Brackets off, select a word and type `(` — the selection is replaced, not wrapped. **This is the autoSurround fix.**
5. With Highlight Occurrences off, rest the cursor on a variable used twice — no other instance lights up. Select a word — no other match lights up.
6. Turn all four back on; confirm each behavior returns.

If (3), (4) or (5) fails, the option is not reaching Monaco. **Stop** and report — do not work around it.

- [ ] **Step 3: Merge into `js-ruby-version`**

```bash
cd /Users/urielmaldonado/projects/kata-desktop   # this checkout is js-ruby-version
git merge app-core
```

`src/routes/settings.tsx` **will conflict** — it is variant-owned because its language options differ. Resolve by keeping this variant's language list and taking the `EDITOR_TOGGLES` map from `app-core`. Then:

```bash
pnpm exec vitest run && pnpm build && pnpm verify-katas
```
Expected: all pass; `verify-katas` reports `"passed": 217, "failed": 0`.

- [ ] **Step 4: Merge into `main`**

```bash
cd /Users/urielmaldonado/projects/kata-desktop/.claude/worktrees/main-variant
git merge app-core
pnpm exec vitest run && pnpm build
```
Resolve `settings.tsx` the same way, keeping `main`'s language list (python, not ruby).

- [ ] **Step 5: Merge into the Electron fork**

```bash
cd /Users/urielmaldonado/projects/ruby-kata
git fetch core app-core && git merge FETCH_HEAD
pnpm exec vitest run && pnpm build
```

- [ ] **Step 6: Log the commits to EITS**

```bash
eitsr commits create --hash <each hash from Tasks 1-6>
eitsr tasks complete <task_id> --message "Editor toggles on Practice; parameterHints and autoSurround/Overtype/Delete fixed; highlightOccurrences added. Merged app-core to main, js-ruby-version, ruby-kata."
```

- [ ] **Step 7: Stop**

Do **not** repackage the `.dmg` or install to `/Applications`. That is a separate, explicitly-requested step. Report what shipped and wait.

---

## Self-Review

**1. Spec coverage.** Every spec section maps to a task: the five settings and their Monaco options → Task 1; `EDITOR_TOGGLES` and the descriptor list → Task 2; `highlightOccurrences` store field, defaults, validation, no-migration → Tasks 2-3; `kata-editor.tsx` extraction → Task 4; `settings.tsx` → Task 5; `practice.tsx` Editor section and the Font Ligatures exclusion → Task 6; branch propagation and the `settings.tsx` conflict → Task 7. The spec's Testing section lists six assertions; all six appear as named tests in Tasks 1-3. The spec's Error Handling section (no migration) is now a test — `falls back to the default when the key is absent` — not a note.

**2. Placeholder scan.** No TBD, no "handle edge cases", no "similar to Task N". Every code step carries the code. Every command carries its expected output.

**3. Type consistency.** `EditorSettings` (Task 1) has exactly the nine fields Task 4 passes. `EditorToggleKey` (Task 2) has exactly the five keys Task 3's `EDITOR_TOGGLE_DEFAULTS` and Task 6's `toggleValues` supply. `monacoEditorOptions` is spelled identically in Tasks 1 and 4. `EDITOR_TOGGLES` is spelled identically in Tasks 2, 5 and 6. `resolveEditorToggles` is spelled identically in Tasks 2 and 3. `LineNumbersMode` is defined once, in Task 1, and re-exported by the store in Task 3.

**4. Corrections folded in during planning.** Four. `monacoEditorOptions` cannot return `Record<string, unknown>` — the spread at the `kata-editor.tsx` call site would fail `tsc`; the spec's Open Risks section is amended. The store-key test does **not** constrain `EDITOR_TOGGLES` membership (`vimMode` would pass it); Task 3 says so, and the union type is what constrains it. `LineNumbersMode` is defined once rather than duplicated — `src/stores` already imports from `src/lib` in four files, so no dependency inverts. And the persisted-settings `??` fallback, which the first draft left untested behind a deliberately-green mutation, is now `resolveEditorToggles` with seven tests and a mutation table.
