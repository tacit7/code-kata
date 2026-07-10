import { describe, it, expect } from "vitest";
import {
  monacoEditorOptions,
  EDITOR_TOGGLES,
  resolveEditorToggles,
  type EditorSettings,
  type EditorToggleKey,
} from "./editor-settings";

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

  // Guards a value expression that evaluates to undefined. It cannot see a
  // typo'd or deleted key: a missing key never appears in Object.entries().
  // That case is the next test's job.
  it("never emits an undefined option value", () => {
    for (const settings of [BASE, { ...BASE, editorAutocomplete: false, autoClosingBrackets: false, highlightOccurrences: false }]) {
      for (const [key, value] of Object.entries(monacoEditorOptions(settings))) {
        expect(value, key).not.toBeUndefined();
      }
    }
  });

  // Monaco silently falls back to its default for any option it is not handed,
  // so a dropped or misspelled key is invisible at runtime. Four of these --
  // detectIndentation, minimap, automaticLayout, scrollBeyondLastLine -- are
  // asserted nowhere else, and deleting one would otherwise leave the suite
  // green while changing the editor.
  it("emits exactly the expected option keys", () => {
    expect(Object.keys(monacoEditorOptions(BASE)).sort()).toEqual([
      "autoClosingBrackets",
      "autoClosingDelete",
      "autoClosingOvertype",
      "autoClosingQuotes",
      "autoSurround",
      "automaticLayout",
      "detectIndentation",
      "fontFamily",
      "fontLigatures",
      "fontSize",
      "lineNumbers",
      "minimap",
      "occurrencesHighlight",
      "parameterHints",
      "quickSuggestions",
      "scrollBeyondLastLine",
      "selectionHighlight",
      "suggestOnTriggerCharacters",
      "tabSize",
      "wordBasedSuggestions",
      "wordWrap",
    ]);
  });
});

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
