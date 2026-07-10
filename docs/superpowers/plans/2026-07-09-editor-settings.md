# Editor Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the editor toggles on the Practice launcher, make `Autocomplete` and `Auto-Closing Brackets` actually silence everything they claim to, and add a `Highlight Occurrences` toggle.

**Architecture:** A new pure module `src/lib/editor-settings.ts` owns two things: `EDITOR_TOGGLES` (the descriptor list that Settings and Practice both render from, so they cannot drift) and `monacoEditorOptions(settings)` (the settings→Monaco mapping, lifted out of `kata-editor.tsx` so it can be unit-tested without rendering Monaco). The store gains one boolean. Nothing else changes.

**Tech Stack:** React 19, TypeScript (strict: `noUnusedLocals`, `noUnusedParameters`), Zustand, Monaco (`@monaco-editor/react`), Vitest 4.1.10 (**Node environment — no jsdom, no `@testing-library/react`**), Tailwind v4 + daisyUI.

## Global Constraints

- Branch: `app-core`. Language-agnostic work only. Flow is one-way: `app-core` → variants. **Never** merge a variant into `app-core`.
- **No new cosmetic settings.** Bracket pair colorization, whitespace rendering, sticky scroll, indent guides are explicit non-goals.
- **No default changes.** Every existing user's editor behaves identically until they flip something. `highlightOccurrences` defaults to `true` because that is Monaco's current behavior.
- **No migration.** A `highlightOccurrences` row absent from the database falls through the `??` in the validation block to the default, exactly as the four existing booleans do.
- Nothing may render in a test. `practice.tsx` and `settings.tsx` cannot be imported under this Vitest setup. Their correctness rests on both rendering from `EDITOR_TOGGLES`, which is tested.
- `monacoEditorOptions` declares **no explicit return type** — TypeScript infers the object literal. Annotating it `Record<string, unknown>` breaks the spread at the `kata-editor.tsx` call site.
- `src/lib/editor-settings.ts` must **never** import `monaco-editor`. That would pull Monaco into the Vitest module graph and fail in a Node environment.
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
- Produces: `EditorSettings` (interface), `monacoEditorOptions(s: EditorSettings)` returning an inferred object literal. Task 3 calls it from `kata-editor.tsx`.

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
// strings, asserted by name in editor-settings.test.ts.

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

Break each of the six new options in turn, confirm the suite catches it, restore. Run after each edit: `pnpm exec vitest run src/lib/editor-settings.test.ts`

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

Autocomplete left parameterHints on, so the signature popup still fired on `(`
with the toggle off -- despite its hint text reading 'Turn off to practice API
recall without suggestions'. Auto-Closing Brackets left autoSurround,
autoClosingOvertype and autoClosingDelete on, so selecting text and typing `(`
still wrapped it.

Extracting the mapping out of kata-editor.tsx is what makes either fix
testable: the object could not be asserted on without rendering Monaco, which
this repo's Node-environment Vitest cannot do."
```

---

### Task 2: `highlightOccurrences` on the settings store

**Files:**
- Modify: `src/stores/settings-store.ts` (defaults ~line 48, interface ~line 72, validation ~line 157)
- Test: `src/lib/editor-settings.test.ts` (append)

**Interfaces:**
- Consumes: nothing.
- Produces: `useSettingsStore.getState().highlightOccurrences: boolean`, default `true`. Tasks 3, 4, 5 read it.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/editor-settings.test.ts`:

```ts
import { useSettingsStore } from "../stores/settings-store";

// settings-store imports getDb from database.ts, but calls it lazily, so the
// module imports cleanly under Vitest's Node environment. Verified 2026-07-09.
describe("settings store", () => {
  it("defaults highlightOccurrences to true, matching Monaco's own behavior", () => {
    expect(useSettingsStore.getState().highlightOccurrences).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/lib/editor-settings.test.ts`
Expected: FAIL — `expected undefined to be true`.

- [ ] **Step 3: Write the implementation**

Three edits to `src/stores/settings-store.ts`, each placed immediately after the `fontLigatures` line in its block.

In `DEFAULTS` (after `fontLigatures: false,`):
```ts
  highlightOccurrences: true,
```

In the settings interface (after `fontLigatures: boolean;`):
```ts
  highlightOccurrences: boolean;
```

In the persisted-settings validation block (after the `fontLigatures:` line):
```ts
      highlightOccurrences: (patch.highlightOccurrences as boolean) ?? DEFAULTS.highlightOccurrences,
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/lib/editor-settings.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Verify no migration is needed**

The `??` means a database with no `highlightOccurrences` row yields the default. Confirm by mutation: change the validation line to `(patch.highlightOccurrences as boolean)` (drop the `?? DEFAULTS...`). Run `pnpm exec vitest run`. The store test still passes — it reads `DEFAULTS` before any load — so this mutation is **not** caught by the suite, which is expected and is why the line is copied verbatim from its four siblings rather than invented. Restore the `??` immediately.

- [ ] **Step 6: Commit**

```bash
git add src/stores/settings-store.ts src/lib/editor-settings.test.ts
git commit -m "feat(editor): add highlightOccurrences setting, default on

Default is true because that is Monaco's current behavior: nobody's editor
changes until they flip it. Absent from an existing database, it falls through
the ?? to the default like every other boolean, so no migration is needed."
```

---

### Task 3: `kata-editor.tsx` calls the extracted mapping

**Files:**
- Modify: `src/components/kata-editor.tsx` (store destructure line 496; `sharedEditorOptions` line 558)

**Interfaces:**
- Consumes: `monacoEditorOptions(s: EditorSettings)` from Task 1; `highlightOccurrences` from Task 2.
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

### Task 4: `EDITOR_TOGGLES` and Settings renders from it

One deliverable: the descriptor list exists and is the only definition of the Settings toggle rows.

**Files:**
- Modify: `src/lib/editor-settings.ts` (append)
- Modify: `src/routes/settings.tsx` (selectors ~lines 71-75; toggle blocks lines 189-231)
- Test: `src/lib/editor-settings.test.ts` (append)

**Interfaces:**
- Consumes: `useSettingsStore` (Task 2).
- Produces: `EditorToggleKey` (union type), `EditorToggle` (interface), `EDITOR_TOGGLES: EditorToggle[]`. Task 5 filters it by `onPractice`.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/editor-settings.test.ts`:

```ts
import { EDITOR_TOGGLES } from "./editor-settings";

describe("EDITOR_TOGGLES", () => {
  // A toggle naming a key the store does not have would render, flip nothing,
  // and look like a bug in Monaco. The union type catches typos at compile
  // time; this catches a key that type-checks but was never added to the store.
  it("every key exists on the store and is a boolean", () => {
    const state = useSettingsStore.getState() as Record<string, unknown>;
    for (const toggle of EDITOR_TOGGLES) {
      expect(typeof state[toggle.key], toggle.key).toBe("boolean");
    }
  });

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
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/lib/editor-settings.test.ts`
Expected: FAIL — `EDITOR_TOGGLES` is not exported.

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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/lib/editor-settings.test.ts`
Expected: PASS, 14 tests.

- [ ] **Step 5: Mutation-test the descriptor guards**

| Mutation | Expected |
|---|---|
| Add `{ key: "vimMode" as EditorToggleKey, label: "X", onPractice: true }` | PASS — `vimMode` **is** a store boolean. This proves the key-existence test alone does not constrain membership; that is what the union type is for. Revert. |
| Change `fontLigatures` to `onPractice: true` | FAIL — `keeps Font Ligatures out of Practice` and `splits: Practice gets a non-empty subset, and not everything` |
| Set every `onPractice: false` | FAIL — `splits: Practice gets a non-empty subset` |
| Duplicate the `wordWrap` entry | FAIL — `has no duplicate keys` |
| Change a `label` to `""` | FAIL — `every toggle has a non-empty label` |

- [ ] **Step 6: Render Settings from the list**

In `src/routes/settings.tsx`, add the import beside the other `../lib` imports:

```ts
import { EDITOR_TOGGLES } from "../lib/editor-settings";
```

Delete the four now-unused selectors at lines 71-75 (`editorAutocomplete`, `wordWrap`, `autoClosingBrackets`, `fontLigatures`). Strict mode's `noUnusedLocals` will fail the build if you leave them.

Replace the four hand-written toggle blocks (lines 189-231, from `<div>` before `<SectionLabel>Autocomplete</SectionLabel>` through the closing `</div>` after the Font Ligatures button) with:

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

`settings` is the whole store. `settings.tsx` declares `setSetting` three times, once per tab component — the editor tab is the one at **line 70**, and every edit in this step happens inside it. Add one selector beside its `setSetting`, replacing the four you deleted:

```ts
  const settings = useSettingsStore();
```

Reading the whole store here re-renders the editor tab on any settings change. That is what `kata-editor.tsx:496` already does, and this component only mounts on the Settings page.

This preserves the existing render order — Autocomplete, Word Wrap, Auto-Closing Brackets — and inserts Highlight Occurrences before Font Ligatures.

- [ ] **Step 7: Verify the build**

Run: `pnpm build`
Expected: `tsc` clean, `✓ built`. A `noUnusedLocals` error here means a deleted selector is still referenced somewhere else in the file — find it before proceeding.

- [ ] **Step 8: Commit**

```bash
git add src/lib/editor-settings.ts src/lib/editor-settings.test.ts src/routes/settings.tsx
git commit -m "feat(editor): one definition of an editor toggle, rendered by Settings

Four hand-written near-identical blocks become a map over EDITOR_TOGGLES, so
Practice can render the same list in Task 5 without a second copy to keep in
sync. Adds the Highlight Occurrences row."
```

---

### Task 5: The Editor section on the Practice launcher

**Files:**
- Modify: `src/routes/practice.tsx` (imports; store selectors near line 196; the configuration column after the Category block that ends near line 445)

**Interfaces:**
- Consumes: `EDITOR_TOGGLES`, `EditorToggleKey` (Task 4); `highlightOccurrences` (Task 2).
- Produces: nothing.

- [ ] **Step 1: Add the import**

In `src/routes/practice.tsx`, beside the existing `../lib/levels` import:

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

In the configuration column, immediately after the closing `</div>` of the Level-picker / Category-filter conditional (the `) : (` ... `)}` block that ends near line 445), insert:

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

- [ ] **Step 6: Verify by hand**

```bash
cd /Users/urielmaldonado/projects/ruby-kata && pnpm dev
```

Use the Electron app, **not** `pnpm tauri dev`: WKWebView cannot run ruby.wasm and the Tauri Ruby variant crashes on any kata run. (This task's changes reach `ruby-kata` only after Task 6, so for a pre-merge check run `pnpm dev` on `app-core`'s Vite server instead and open `http://localhost:1420`.)

1. Practice shows an Editor section with four toggles and no Font Ligatures.
2. Flip Autocomplete off in Practice. Open Settings. It reads Off. No page reload needed.
3. In a kata editor with Autocomplete off, type `puts(` — no signature popup. **This is the parameterHints fix.**
4. With Auto-Closing Brackets off, select a word and type `(` — the selection is replaced, not wrapped. **This is the autoSurround fix.**
5. With Highlight Occurrences off, rest the cursor on a variable used twice — no other instance lights up. Select a word — no other match lights up.
6. Turn all four back on and confirm each behavior returns.

- [ ] **Step 7: Commit**

```bash
git add src/routes/practice.tsx
git commit -m "feat(practice): editor toggles where the session is configured

Whether autocomplete is on is a decision about how hard the next session will
be, and it was only reachable from Settings. Same store keys, second view --
no local state, so the two pages cannot drift."
```

---

### Task 6: Propagate to the variants

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

- [ ] **Step 2: Merge into `js-ruby-version`**

```bash
cd /Users/urielmaldonado/projects/kata-desktop   # this checkout is js-ruby-version
git merge app-core
```

`src/routes/settings.tsx` **will conflict** — it is variant-owned because its language options differ. Resolve by keeping this variant's language list and taking the `EDITOR_TOGGLES` map from `app-core`. Then:

```bash
pnpm exec vitest run && pnpm build && pnpm verify-katas
```
Expected: all pass; `verify-katas` reports `"passed": 217, "failed": 0`.

- [ ] **Step 3: Merge into `main`**

```bash
cd /Users/urielmaldonado/projects/kata-desktop/.claude/worktrees/main-variant
git merge app-core
pnpm exec vitest run && pnpm build
```
Resolve `settings.tsx` the same way, keeping `main`'s language list (python, not ruby).

- [ ] **Step 4: Merge into the Electron fork**

```bash
cd /Users/urielmaldonado/projects/ruby-kata
git fetch core app-core && git merge FETCH_HEAD
pnpm exec vitest run && pnpm build
```

- [ ] **Step 5: Log the commits to EITS**

```bash
eitsr commits create --hash <each hash from Tasks 1-5>
eitsr tasks complete <task_id> --message "Editor toggles on Practice; parameterHints and autoSurround/Overtype/Delete fixed; highlightOccurrences added. Merged app-core to main, js-ruby-version, ruby-kata."
```

- [ ] **Step 6: Stop**

Do **not** repackage the `.dmg` or install to `/Applications`. That is a separate, explicitly-requested step. Report what shipped and wait.

---

## Self-Review

**1. Spec coverage.** Every spec section maps to a task: the five settings and their Monaco options → Task 1; `highlightOccurrences` store field, defaults, validation, no-migration → Task 2; `kata-editor.tsx` extraction → Task 3; `EDITOR_TOGGLES` + `settings.tsx` → Task 4; `practice.tsx` Editor section + the Font Ligatures exclusion → Task 5; branch propagation and the `settings.tsx` conflict → Task 6. The spec's Testing section lists six assertions; all six appear as named tests in Tasks 1, 2 and 4. The spec's Error Handling section (no migration) is Task 2 Step 5.

**2. Placeholder scan.** No TBD, no "handle edge cases", no "similar to Task N". Every code step carries the code. Every command carries its expected output.

**3. Type consistency.** `EditorSettings` (Task 1) has exactly the nine fields Task 3 passes. `EditorToggleKey` (Task 4) has exactly the five keys Task 5's `Record<EditorToggleKey, boolean>` supplies. `monacoEditorOptions` is spelled identically in Tasks 1 and 3. `EDITOR_TOGGLES` is spelled identically in Tasks 4 and 5. `LineNumbersMode` is re-declared in `editor-settings.ts` rather than imported from `settings-store.ts` — deliberate, so `src/lib` does not depend on `src/stores`; the two must stay in sync and Task 3's `pnpm build` is what enforces it.

**4. Corrections found while planning.** Two, both folded in above. `monacoEditorOptions` cannot return `Record<string, unknown>` — the spread at the `kata-editor.tsx` call site would fail `tsc`; the spec's Open Risks section is amended. And Task 4's mutation table records that the store-key test does **not** constrain membership (`vimMode` would pass it); the union type is what does.
