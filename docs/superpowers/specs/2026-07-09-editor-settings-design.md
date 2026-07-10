# Editor Settings on the Practice Launcher — Design

**Date:** 2026-07-09
**Status:** Approved, pending implementation
**Branch:** `app-core` (language-agnostic; merges out to `main`, `js-ruby-version`, then `ruby-kata` via the `core` remote)

## Problem

The request was "add a toggle for autocomplete, open/close parenthesis." Both
toggles already exist. `src/routes/settings.tsx` renders `Autocomplete`,
`Word Wrap`, `Auto-Closing Brackets`, and `Font Ligatures`, all persisted through
`settings-store` and all read by `kata-editor.tsx`. They ship in the installed
build.

That they were asked for anyway is the finding. Three defects sit behind it:

1. **The toggles are only in Settings.** Whether autocomplete should be on is a
   decision about how hard the next practice session will be, and it is made on
   the Practice launcher — a page that exposes session size and max test runs but
   no editor behavior at all.

2. **`Autocomplete` does not turn off every suggestion.** It drives
   `quickSuggestions`, `suggestOnTriggerCharacters`, and `wordBasedSuggestions`.
   It does not touch `parameterHints`, so the signature popup still fires on `(`
   with the toggle off. The stated purpose of the toggle — its own hint text reads
   "Turn off to practice API recall without suggestions" — is not met.

3. **`Auto-Closing Brackets` does not turn off every auto-close.** It drives
   `autoClosingBrackets` and `autoClosingQuotes`. It does not touch `autoSurround`,
   `autoClosingOvertype`, or `autoClosingDelete`, so with the toggle off, selecting
   text and typing `(` still wraps the selection.

There is also no way to disable the highlight that appears on every other instance
of the identifier under the cursor.

## Goals

- Editor behavior is adjustable from the Practice launcher, where the session is configured.
- A toggle that claims to silence suggestions silences all of them.
- The occurrence highlight can be turned off.
- One definition of what an editor toggle is, rendered by both pages.

## Non-Goals

- New cosmetic settings — bracket pair colorization, whitespace rendering, sticky
  scroll, indent guides. None were asked for. A settings page nobody can find the
  autocomplete toggle in is the problem being solved; adding three more rows is not
  the fix.
- A quick-toggle control inside the editor toolbar.
- Per-kata or per-session overrides. Settings are global and persisted, as today.
- Changing any default. Every existing user's editor behaves identically until they
  flip something.

## Behavior

### The settings

| Setting | Key | Default | Exists | Practice | Settings |
|---|---|---|---|---|---|
| Autocomplete | `editorAutocomplete` | on | yes | yes | yes |
| Auto-Closing Brackets | `autoClosingBrackets` | on | yes | yes | yes |
| Word Wrap | `wordWrap` | off | yes | yes | yes |
| Highlight Occurrences | `highlightOccurrences` | on | **new** | yes | yes |
| Font Ligatures | `fontLigatures` | off | yes | no | yes |

`Font Ligatures` is deliberately absent from Practice. Nobody chooses a typeface
feature before a timed session. It stays a Settings-only row.

`highlightOccurrences` defaults to `true` because that is Monaco's current
behavior. Turning the setting on by default changes nothing for anyone.

### Monaco options each setting drives

Bold entries are new — options that should have followed their toggle and did not.

**`editorAutocomplete`**
```
quickSuggestions:            editorAutocomplete
suggestOnTriggerCharacters:  editorAutocomplete
wordBasedSuggestions:        editorAutocomplete ? "currentDocument" : "off"
parameterHints:              { enabled: editorAutocomplete }     // new
```

**`autoClosingBrackets`**
```
autoClosingBrackets:  autoClosingBrackets ? "languageDefined" : "never"
autoClosingQuotes:    autoClosingBrackets ? "languageDefined" : "never"
autoSurround:         autoClosingBrackets ? "languageDefined" : "never"   // new
autoClosingOvertype:  autoClosingBrackets ? "auto" : "never"              // new
autoClosingDelete:    autoClosingBrackets ? "auto" : "never"              // new
```

**`highlightOccurrences`** (new setting)
```
occurrencesHighlight: highlightOccurrences ? "singleFile" : "off"
selectionHighlight:   highlightOccurrences
```

Both options are needed. `occurrencesHighlight` is the highlight that follows the
cursor; `selectionHighlight` highlights other matches of a *selection*. Disabling
one and not the other still reads as "the editor is highlighting things at me."

Ruby has no semantic `DocumentHighlightProvider`, but Monaco registers
`TextualMultiDocumentHighlightFeature` (`wordHighlighter.js:24`), a textual
fallback for every language. So the highlight does appear on Ruby katas, and
`occurrencesHighlight: "off"` does suppress it.

**`wordWrap`** → `wordWrap: "on" | "off"`. **`fontLigatures`** → `fontLigatures`.
Unchanged.

## Architecture

### `src/lib/editor-settings.ts` (new)

Two exports, no React, no store, no Monaco import.

**`EDITOR_TOGGLES`** — the descriptor list both pages render from.

```ts
export interface EditorToggle {
  key: EditorToggleKey;
  label: string;
  hint?: string;
  /** Practice shows the toggles that change how hard a session is. */
  onPractice: boolean;
}
```

`EditorToggleKey` is a union of the five keys above. Typing it as a union rather
than `string` is what makes the "no dead toggle" test possible: a typo fails
`tsc`, and the test proves the union matches the store.

**`monacoEditorOptions(settings)`** — the pure mapping from settings to Monaco
options, lifted verbatim out of `kata-editor.tsx:558` (`sharedEditorOptions`) and
extended with the new options above. It takes a plain object, not the store:

```ts
export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  lineNumbersMode: "on" | "off" | "relative";
  editorAutocomplete: boolean;
  autoClosingBrackets: boolean;
  wordWrap: boolean;
  fontLigatures: boolean;
  highlightOccurrences: boolean;
}

export function monacoEditorOptions(s: EditorSettings): Record<string, unknown>;
```

Extraction is the point. The option mapping is where both bugs live, and today it
cannot be asserted on without rendering Monaco — which this repo's Vitest setup
(Node environment, no jsdom, no `@testing-library/react`) cannot do. As a pure
function it is directly testable.

### `src/stores/settings-store.ts`

Three additions, mirroring the existing booleans exactly:
- `highlightOccurrences: true` in `DEFAULTS` (~line 48, beside `fontLigatures`)
- `highlightOccurrences: boolean` on the settings interface (~line 72)
- `highlightOccurrences: (patch.highlightOccurrences as boolean) ?? DEFAULTS.highlightOccurrences` in the persisted-settings validation block (~line 157)

### `src/components/kata-editor.tsx`

`kata-editor.tsx:496` already destructures the whole store in one call; add
`highlightOccurrences` to it. Replace the inline `sharedEditorOptions` object
(line 558) with a call to `monacoEditorOptions({...})`. Behavior is otherwise
unchanged — the read-only solution editor still spreads it and overrides
`readOnly` and `lineNumbers`.

### `src/routes/settings.tsx`

Replace the four hand-written toggle blocks with a map over
`EDITOR_TOGGLES`, reusing the existing `SectionLabel` (line 55) and the existing
`btn btn-sm` / `btn-success` / `btn-ghost` classes. Same markup, same order, one
source.

`settings.tsx` is a variant-owned file (`CLAUDE.md`: language options differ per
variant). Expect a conflict on merge-out; resolve keeping each variant's language
list and taking the toggle map from `app-core`.

### `src/routes/practice.tsx`

A new `Editor` section in the left configuration column, below the existing
difficulty/category filters, rendering the `EDITOR_TOGGLES` entries where
`onPractice` is true. Reads and writes the same store keys via the same
`setSetting` the page already imports. No local state, so Settings and Practice
cannot drift.

## Data Flow

There is one source of truth: `settings-store`, persisted to the `settings` table.
Settings and Practice are both views over it. Flipping `Autocomplete` on Practice
writes the same key Settings writes; `kata-editor.tsx` subscribes to the store and
Monaco re-renders with new options. No new state, no synchronization, no effect.

## Error Handling

Nothing here can fail at runtime. `setSetting` already persists asynchronously and
already swallows write failures the same way for every key. A `highlightOccurrences`
row absent from the database — every existing install — falls through the `??` in
the validation block to `DEFAULTS.highlightOccurrences`, exactly as the four
existing booleans do. Adding the setting therefore requires no migration.

## Testing

Vitest, Node environment. Everything asserted below is a pure function or a source
of truth about data — nothing renders.

**`monacoEditorOptions`**
- Autocomplete off sets all four suggestion options off, `parameterHints.enabled`
  included. This test fails against today's code, which is the point.
- Auto-closing off sets all five auto-close options to their disabled value,
  `autoSurround` / `autoClosingOvertype` / `autoClosingDelete` included. Also fails
  against today's code.
- `highlightOccurrences` false sets `occurrencesHighlight: "off"` and
  `selectionHighlight: false`; true sets `"singleFile"` and `true`.
- Every setting is defaulted on: passing all-true settings yields no `undefined`
  option value.

**`EDITOR_TOGGLES`**
- Every `key` exists on the settings store's defaults, and its default is a
  boolean. Guards against a toggle that renders and controls nothing.
- Keys are unique.
- At least one entry has `onPractice: false` (`fontLigatures`) and the Practice
  subset is non-empty — the split is real, not accidentally all-or-nothing.

**Mutation testing.** Each guard is broken deliberately, the suite is run to confirm
it fails, then restored and confirmed green. A test that does not fail when its
subject is broken is not a test. Applied to: the `parameterHints` line, each of the
three new auto-close options, both `highlightOccurrences` options, and the store-key
existence check.

**No test asserts on rendered output.** `practice.tsx` and `settings.tsx` cannot be
imported under this Vitest setup. Their correctness rests on both rendering from
`EDITOR_TOGGLES`, which is tested.

## Branch and Propagation

Committed on `app-core`, then merged out per `CLAUDE.md`:
`main` and `js-ruby-version` (`git merge app-core`), then `~/projects/ruby-kata`
(`git fetch core app-core && git merge core/app-core`). Each target's suite and
build must pass before moving to the next. `settings.tsx` will conflict on every
variant; resolve per variant.

## Open Risks

- **`monacoEditorOptions` returns `Record<string, unknown>`, not Monaco's
  `IStandaloneEditorConstructionOptions`.** Importing that type into a `src/lib`
  module pulls `monaco-editor` into the Vitest module graph, which fails in a Node
  environment. The cost is that a misspelled option name type-checks. The
  `kata-editor.tsx` call site, which does import Monaco, is where a bad option
  surfaces — and every option name in the mapping is covered by a unit test that
  asserts its exact key.
