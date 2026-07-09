# Kata Navigation Shortcuts — Design

**Date:** 2026-07-09
**Status:** Approved
**Branch:** `app-core` (language-agnostic; merges out to `main`, `js-ruby-version`, then `ruby-kata` via the `core` remote)

## Problem

`nextKata` (`Meta+ArrowRight`) and `prevKata` (`Meta+ArrowLeft`) exist as remappable
`ShortcutAction`s with defaults in `settings-store.ts`, but they are registered in
exactly one place: `src/routes/session.tsx`. Three consequences:

1. **They only work inside a practice session.** The standalone editor
   (`/editor/:kataId`) has no next/prev at all.
2. **They collide with Monaco.** `useKeyboardShortcuts` binds a `window` keydown
   listener with no focus guard. On macOS `Cmd+Left` / `Cmd+Right` are
   line-start / line-end. While editing a kata in a session, those keys jump katas
   instead of moving the cursor. This ships today.
3. **`nextKata` means two different things.** On the last kata of a session it does
   not navigate — it finishes the session and routes to results, with no
   confirmation. A stray keypress ends a timed session.

Two latent defects sit directly in this feature's path and are fixed as part of it
(see *Correctness*).

## Goals

- Next/prev work wherever a kata editor is on screen.
- One key, one meaning: navigation only.
- Restore `Cmd+Left` / `Cmd+Right` to Monaco.

## Non-Goals

- Wrap-around at the ends of a list.
- Any keyboard path to finish a session.
- Next/prev on the Problems list (it already has its own Up/Down row navigation).
- Persisting browse order across app restarts.
- Refactoring `useKeyboardShortcuts` beyond memoizing handlers at the call site.

## Behavior

Next/prev are **navigation only**: they never finish a session, never wrap, never
prompt. They are active exactly when a kata editor is on screen — `/session/:id`
and `/editor/:kataId`.

| Context | Next/prev step through | At either end |
|---|---|---|
| Practice session | the session queue, in order | no-op |
| Standalone editor | the Problems list as last seen — same filter, sort, and search | no-op |
| Standalone editor, cold open (app restart, list never visited) | nothing | both keys no-op |

**Binding:** `Meta+Alt+ArrowLeft` / `Meta+Alt+ArrowRight` (⌘⌥← / ⌘⌥→), matching
VS Code's previous/next editor tab. `Cmd+Left` / `Cmd+Right` return to Monaco.
Both remain remappable in Settings.

Finishing a session becomes click-only. That is intentional.

When a key is a no-op (first or last item), the existing kata counter (`3 of 5`)
pulses briefly. No toast, no dialog. A silent no-op reads as a broken key.

## Architecture

Four units, each with one responsibility.

### `browseOrder` — `src/stores/kata-store.ts`

A `number[]` of kata ids representing the Problems list as the user last saw it.

`src/routes/library.tsx` already computes `searchedKatas` (filter → sort → search)
and already tracks `selectedIndex`. It publishes `searchedKatas.map(k => k.id)`
whenever that list changes. Nothing else writes `browseOrder`.

Deliberately **not persisted**. A cold-opened editor has no neighbours, which the
behavior table accounts for. Persisting it would resurrect a stale ordering from a
filter the user no longer has applied.

### `useKataNavigation()` — `src/hooks/use-kata-navigation.ts`

The single answer to "what is next?". Reads the route to pick the governing list:

```
inside a session → sessionKatas / currentIndex   (session-store)
otherwise        → browseOrder  / indexOf(kata.id) (kata-store)
```

Returns `{ next, prev, hasNext, hasPrev }`. `next()` and `prev()` are no-ops at the
ends. All clamping lives here; callers never index a list themselves.

A kata whose id is absent from `browseOrder` (cold open) yields
`hasNext === hasPrev === false` and no throw. `indexOf` returning `-1` is the most
likely bug in this unit and is tested explicitly.

The session case navigates by mutating `currentIndex`; the browse case navigates by
`navigate('/editor/:id')`. The hook hides that difference behind `next()`.

### Shortcut registration moves to `KataEditor`

`src/components/kata-editor.tsx` registers `nextKata`/`prevKata`. Both routes render
`KataEditor`, so "the editor is open" and "the shortcuts are live" become the same
statement rather than a coincidence. `src/routes/session.tsx` stops owning keyboard
concerns.

`useKeyboardShortcuts` lists its `handlers` object in a `useEffect` dependency array,
so a fresh object literal rebinds the listener every render — and `KataEditor`
re-renders on every keystroke. Handlers are memoized at the call site with
`useMemo`. The hook itself is not changed.

### `src/lib/shortcut-keys.ts`

Holds `DEFAULT_SHORTCUTS` and `migrateShortcuts()`. Pure, so it can be tested:
`settings-store.ts` imports `getDb` at module load and cannot be loaded under vitest.
Same rationale as `src/lib/nav-items.ts` and `src/lib/js-exec-core.ts`.

## Correctness

Two existing defects that this feature turns from rare into routine.

### 1. Autosave discards the last edit on kata change

`kata-editor.tsx` debounces `saveUserCode` by 1500ms. The effect keyed on `kata.id`
cleans up with `clearTimeout` and nothing else, so a pending save is dropped when the
kata changes. `notesAutosaveTimer` has the identical bug.

Today switching katas requires a click, so the race is narrow. `⌘⌥→` makes
"type, then immediately jump" a one-keystroke gesture.

**Fix:** flush instead of drop. On `kata.id` change, and on unmount, if a timer is
pending, cancel it and write the current editor value **for the outgoing kata id**.

The outgoing id is load-bearing. When the cleanup runs, `kata` already refers to the
new kata, so a naive `saveUserCode(kata.id, code)` in the cleanup writes the previous
kata's code onto the next one — a worse bug than the one being fixed. The flush reads
its id from the closure the effect was created with.

**Extraction for testability:** the debounce moves into a pure
`src/lib/autosave.ts` exposing `createAutosave({ delayMs, save })` with
`schedule(id, getValue)` and `flush()`. This is testable with vitest fake timers and
no DOM. The alternative — asserting the flush through the mounted component — would
require adding `jsdom` and `@testing-library/react`, neither of which this repo has,
to test one behavior. Not worth it.

### 2. The rebinding will not reach existing users

Settings persist the whole shortcuts map as one row (`settings.shortcuts`), and the
loader takes `patch.shortcuts ?? DEFAULTS.shortcuts` — a wholesale replacement.
Changing `DEFAULT_SHORTCUTS` in code therefore has no effect on any existing install.
Verified against the live database: it holds
`{"nextKata":"Meta+ArrowRight","prevKata":"Meta+ArrowLeft",...}`.

**Fix:** `migrateShortcuts(stored)` runs once on load and writes back.

- A stored binding still equal to the **old default** (`Meta+ArrowRight` /
  `Meta+ArrowLeft`) is rewritten to the new one. The user never customized it; they
  get the fix.
- Any other value is left alone. A deliberate remap is never silently overwritten.
- An action missing from the stored map falls back to its own default, per-key rather
  than all-or-nothing.
- An unknown action in the stored map is dropped.

The old default strings are hardcoded in this one function, with a comment saying why.

## Testing

**Pure unit tests (vitest, no DOM):**

- `migrateShortcuts` — old default rewritten; custom binding untouched; missing key
  filled from defaults; unknown key dropped; empty or corrupt stored value yields full
  defaults. This writes to persisted user settings, so it gets the most attention.
- `useKataNavigation` — a table over both governing lists: first item (`hasPrev`
  false), last item (`hasNext` false), middle item, single-item list, empty
  `browseOrder`, and a kata id absent from `browseOrder` (both false, no throw).
- `createAutosave` — with fake timers: schedule then flush writes once with the
  outgoing id; schedule then re-schedule for a different id flushes the first id's
  value and never writes it under the second id; flush with nothing pending is a
  no-op.

**Verified by hand in the packaged app** (cannot be asserted in a unit test, and the
last two bugs in this app appeared only when packaged):

- `Cmd+Left` / `Cmd+Right` again move the Monaco cursor to line start / end.
- `⌘⌥←` / `⌘⌥→` are not swallowed by Monaco or by monaco-vim.
- The no-op pulse on the first/last kata reads as intentional, not as a dead key.

**Regression guard:** a test asserting `session.tsx` no longer registers
`nextKata`/`prevKata`, so the two registrations cannot silently coexist and
double-fire.

## Files

| File | Change |
|---|---|
| `src/lib/shortcut-keys.ts` | new — `DEFAULT_SHORTCUTS`, `migrateShortcuts()` |
| `src/lib/shortcut-keys.test.ts` | new |
| `src/lib/autosave.ts` | new — `createAutosave()` |
| `src/lib/autosave.test.ts` | new |
| `src/hooks/use-kata-navigation.ts` | new |
| `src/hooks/use-kata-navigation.test.ts` | new |
| `src/stores/kata-store.ts` | add `browseOrder` + setter |
| `src/stores/settings-store.ts` | import defaults from `shortcut-keys.ts`; apply `migrateShortcuts` on load |
| `src/routes/library.tsx` | publish `browseOrder` from `searchedKatas` |
| `src/routes/session.tsx` | remove `nextKata`/`prevKata` registration |
| `src/components/kata-editor.tsx` | register shortcuts via `useKataNavigation`; use `createAutosave`; counter pulse |

## Open Risks

- **monaco-vim may bind `⌘⌥` arrows.** Not verified. If it does, the binding choice
  is revisited before implementation, not worked around.
- **`browseOrder` staleness within a session of use.** If the user opens a kata, goes
  back, changes the filter, then returns to the editor via browser history, the order
  reflects the newer filter. Acceptable: the list they last saw is the list they get.
