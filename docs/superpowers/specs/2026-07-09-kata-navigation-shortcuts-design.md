# Kata Navigation Shortcuts — Design

**Date:** 2026-07-09
**Status:** Approved, pending implementation
**Branch:** `app-core` (language-agnostic; merges out to `main`, `js-ruby-version`, then `ruby-kata` via the `core` remote)

## Problem

`nextKata` (`Meta+ArrowRight`) and `prevKata` (`Meta+ArrowLeft`) exist as remappable
`ShortcutAction`s with defaults in `settings-store.ts`, but they are registered in
exactly one place: `src/routes/session.tsx`. Three consequences:

1. **They only work inside a practice session.** The standalone editor
   (`/editor/:kataId`) has no next/prev at all.
2. **They are unreachable from the editor.** `Cmd+Left` / `Cmd+Right` are
   line-start / line-end on macOS, and Monaco calls `stopPropagation()` on the keys
   it handles. `useKeyboardShortcuts` binds a `window` keydown listener, so while
   the cursor is in Monaco the keydown never reaches it: Monaco wins, the cursor
   moves, and next/prev never fire. They fire only when focus sits outside the
   editor.

   > **Correction (2026-07-09, during implementation).** An earlier draft of this
   > spec claimed the opposite — that these keys "jump katas instead of moving the
   > cursor," and that this "ships today." That was wrong. A Playwright probe
   > against real Monaco confirmed `Cmd+Right` moves the cursor to end-of-line and
   > the `ArrowRight` keydown never reaches `window`. The rebinding is still
   > correct, but for the inverse reason: it makes next/prev *reachable* while
   > typing. `Meta+Alt+ArrowRight` was measured to reach `window` with
   > `defaultPrevented: false` and no cursor movement.

3. **`nextKata` means two different things.** On the last kata of a session it does
   not navigate — it finishes the session and routes to results, with no
   confirmation. A stray keypress ends a timed session. Real, but narrower than
   first stated: per (2), only reachable while focus is outside Monaco.

Two latent defects sit directly in this feature's path and are fixed as part of it
(see *Correctness*).

## Goals

- Next/prev work wherever a kata editor is on screen, including while the cursor is
  in Monaco.
- One key, one meaning: navigation only.
- Leave `Cmd+Left` / `Cmd+Right` to Monaco, which already owns them.

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
VS Code's previous/next editor tab. `Cmd+Left` / `Cmd+Right` stay with Monaco.
Both remain remappable in Settings.

Finishing a session becomes click-only. That is intentional.

### Shortcut focus policy

`nextKata` and `prevKata` are allowed to fire while Monaco has focus. This is
intentional: the new default binding avoids Monaco's `Cmd+Left` / `Cmd+Right`
cursor movement, and kata navigation is an editor-local action a user expects to
work without first clicking away from the code.

`useKeyboardShortcuts` binds a `window` listener with no focus guard, so if a user
deliberately remaps next/prev onto a Monaco-owned binding, the app-level shortcut
wins and overrides the editor. That is the user's choice, not a bug, and no guard
is added to prevent it.

**Binding availability, measured (2026-07-09).** Real Monaco was served from
`node_modules/monaco-editor/min` and driven with Playwright keypresses:

| Keys | Monaco cursor | Reached `window` |
|---|---|---|
| `Meta+ArrowRight` | moved to end of line | no — Monaco stopped propagation |
| `Meta+Alt+ArrowRight` | unmoved | yes, `defaultPrevented: false` |

monaco-vim is settled by reading its dispatch path, not by grep for `addCommand`:
`CMAdapter.handleKeyDown` calls `preventDefault()` / `stopPropagation()` **only**
when the normalized key resolves to a bound command. `monacoToCmKey` normalizes
`⌘⌥→` to `"Meta-Alt-Right"`, and no `Alt-`/`Meta-` arrow binding exists anywhere in
`monaco-vim`'s dist. Unbound keys fall through untouched.

When a key is a no-op (first or last item), the editor gives a brief nudge — a ~180ms
horizontal shake of `KataEditor`'s root element. No toast, no dialog. A silent no-op
reads as a broken key.

**Amended 2026-07-09 (during planning).** An earlier draft said the `3 of 5` counter
pulses. That counter is rendered by `src/routes/session.tsx:128` and exists only in a
session; the standalone editor has none, and `KataEditor` — which owns the shortcuts —
cannot reach it without lifting state across routes. The nudge therefore lives on
`KataEditor`'s own root, where it works identically in both modes and stays local to
the component that fired the no-op. A new `@keyframes nudge` is added to
`src/index.css`, which today has only `fade-in-up`, `fade-in`, and `shimmer`.

## Architecture

Four units, each with one responsibility.

### `browseOrder` — `src/stores/kata-store.ts`

A `number[]` of kata ids representing the Problems list as the user last saw it.

`src/routes/library.tsx` already computes `searchedKatas` (filter → sort → search)
and already tracks `selectedIndex`. It publishes `searchedKatas.map(k => k.id)`
whenever that list changes. Nothing else writes `browseOrder`.

The published order is the **rendered** order, not the raw store order. Publishing all
kata ids from the store would be a plausible-looking optimization that silently breaks
the feature, so the rule is stated rather than left to inference.

Deliberately **not persisted**. A cold-opened editor has no neighbours, which the
behavior table accounts for. Persisting it would resurrect a stale ordering from a
filter the user no longer has applied.

### `resolveKataNavigation()` — `src/lib/kata-navigation.ts`

All the decision-making, as a pure function. No React, no stores, no router.

```ts
resolveKataNavigation({
  mode: "session" | "browse",
  currentKataId: number,
  currentIndex: number,        // session mode only
  sessionKataIds: number[],
  browseOrder: number[],
  availableKataIds: ReadonlySet<number>,
}): {
  prevId?: number
  nextId?: number
  prevIndex?: number           // session mode only
  nextIndex?: number
  hasPrev: boolean
  hasNext: boolean
}
```

It performs every bounds check, handles `indexOf === -1`, and clamps at both ends.
Callers never index a list themselves.

**Stale ids.** `browseOrder` is a snapshot and the kata store moves underneath it:
`loadKatas(language)` replaces the whole list on a language switch, and `deleteKata`
removes custom katas. So the resolver filters `browseOrder` against
`availableKataIds` before computing neighbours, and never returns an id that no
longer exists. The app must not navigate to `/editor/:id` merely because the id
appears in `browseOrder`.

**Session mode is governed by the queue, not the route.** `nextIndex`/`prevIndex` are
returned only when that index exists in `sessionKataIds`. The resolver never infers
position from `currentKataId` in session mode, so route/store drift cannot move the
queue.

A `currentKataId` absent from the governing list (cold open) yields
`hasNext === hasPrev === false` and no throw.

### `useKataNavigation()` — `src/hooks/use-kata-navigation.ts`

A thin React adapter over the resolver. It reads the route to pick `mode`, pulls the
two lists and `availableKataIds` from the stores, and owns mutation only:

- session mode → set `currentIndex` to the resolved index
- browse mode  → `navigate('/editor/:nextId')`

It returns `{ next, prev, hasNext, hasPrev }`. `next` and `prev` are
`useCallback`-stable, so `KataEditor` can memoize its shortcut handlers and stop
rebinding the global keydown listener on every keystroke. Without that stability the
call-site `useMemo` is decorative.

The hook owns no animation state. It exposes `hasNext`/`hasPrev`; the component
decides whether to nudge before calling `next()`/`prev()`.

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
`schedule(id, readValue)` and `flush()`. Testable with vitest fake timers and no DOM.
The alternative — asserting the flush through the mounted component — would require
adding `jsdom` and `@testing-library/react`, neither of which this repo has, to test
one behavior. Not worth it.

`readValue` is named for when it runs: the value is read at flush time, not at
schedule time, so the save always writes the editor's latest content.

#### Autosave scheduling semantics

The flush is conditional on the id, and that condition is load-bearing:

- `schedule(sameId, readValue)` while a save is pending → **reset the timer**. Plain
  debounce. No write.
- `schedule(differentId, readValue)` while a save is pending → **flush the pending
  save first**, using the pending save's own id and its own `readValue`, then schedule
  the new one.
- `flush()` → write the pending save under its own id. A no-op when nothing is
  pending.

An unconditional "flush whatever is pending on every `schedule()`" would be wrong.
`onChange` fires on every keystroke and calls `schedule(kata.id, …)`, so flushing each
time means a `saveUserCode` IPC round trip and a SQLite write per character. The
1500ms debounce exists to prevent exactly that.

The dropped-save hole still closes: a pending save can only be abandoned by an id
change or by unmount, and both now flush.

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

`migrateShortcuts` builds its result by iterating the keys of `DEFAULT_SHORTCUTS`,
never by spreading the stored object. A non-object, `null`, or array input returns the
full defaults. This is what makes "unknown action is dropped" true by construction
rather than by a separate filtering step.

## Testing

**Pure unit tests (vitest, no DOM):**

- `migrateShortcuts` — old default rewritten; custom binding untouched; missing key
  filled from defaults; unknown key dropped; empty or corrupt stored value yields full
  defaults. This writes to persisted user settings, so it gets the most attention.
- `resolveKataNavigation` — a table over both modes: first item (`hasPrev` false),
  last item (`hasNext` false), middle item, single-item list, empty list, and a
  `currentKataId` absent from the governing list (both false, no throw — the
  `indexOf === -1` case). Plus the stale-id cases: a `browseOrder` containing ids
  missing from `availableKataIds` skips them rather than returning them, and a
  `browseOrder` whose entries are *all* stale yields both false. Session mode never
  resolves an index outside `sessionKataIds`.
- `createAutosave` — with fake timers: schedule then flush writes once with the
  outgoing id and the value read at flush time; re-scheduling the **same** id resets
  the timer and writes nothing before the delay elapses (guards the debounce);
  re-scheduling a **different** id flushes the first id's value and never writes it
  under the second id (guards the cross-kata write); flush with nothing pending is a
  no-op.

**Verified by hand in the packaged app** (cannot be asserted in a unit test, and the
last two bugs in this app appeared only when packaged):

- `Cmd+Left` / `Cmd+Right` move the Monaco cursor to line start / end. (They always
  did; see the Problem correction.)
- `⌘⌥←` / `⌘⌥→` are not swallowed by Monaco or by monaco-vim. **Confirmed** — see
  *Binding availability, measured*.
- The no-op nudge on the first/last kata reads as intentional, not as a dead key.

**Regression guard:** a source-text test asserting `src/routes/session.tsx` no longer
references `nextKata` or `prevKata`, so the two registrations cannot silently coexist
and double-fire. Crude, and deliberately so — the same reasoning as
`electron/safeguards.test.ts` in the Electron repo. A double registration would not
fail any other test; both handlers would simply run.

## Files

| File | Change |
|---|---|
| `src/lib/shortcut-keys.ts` | new — `DEFAULT_SHORTCUTS`, `migrateShortcuts()` |
| `src/lib/shortcut-keys.test.ts` | new |
| `src/lib/autosave.ts` | new — `createAutosave()` |
| `src/lib/autosave.test.ts` | new |
| `src/lib/kata-navigation.ts` | new — `resolveKataNavigation()` (pure) |
| `src/lib/kata-navigation.test.ts` | new |
| `src/hooks/use-kata-navigation.ts` | new — React adapter, `useCallback`-stable `next`/`prev` |
| `src/stores/kata-store.ts` | add `browseOrder` + setter |
| `src/stores/settings-store.ts` | import + re-export `DEFAULT_SHORTCUTS`/`ShortcutAction` from `shortcut-keys.ts` (settings.tsx and use-keyboard-shortcuts.ts import them from here); apply `migrateShortcuts` on load |
| `src/routes/library.tsx` | publish `browseOrder` from `searchedKatas` |
| `src/index.css` | add `@keyframes nudge` |
| `src/routes/session.tsx` | remove `nextKata`/`prevKata` registration |
| `src/components/kata-editor.tsx` | register shortcuts via `useKataNavigation`; use `createAutosave`; nudge on no-op |

## Open Risks

- ~~**monaco-vim may bind `⌘⌥` arrows at runtime.**~~ **Closed 2026-07-09.** Monaco
  measured with Playwright; monaco-vim settled by reading `CMAdapter.handleKeyDown`,
  which swallows a key only when it resolves to a bound command. See *Binding
  availability, measured*.
- **`browseOrder` staleness within a session of use.** If the user opens a kata, goes
  back, changes the filter, then returns to the editor via browser history, the order
  reflects the newer filter. Acceptable: the list they last saw is the list they get.
