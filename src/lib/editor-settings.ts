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
