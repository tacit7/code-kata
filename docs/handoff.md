# Kata Desktop Handoff

Last updated: 2026-08-19

## Current Workspace State

- Primary repo: `/Users/urielmaldonado/projects/kata-desktop`
- Current branch: `main`
- Python app is the active Tauri app in this repo.
- Ruby app is a separate Electron project at `/Users/urielmaldonado/projects/ruby-kata`.
- The worktree is intentionally dirty from a long feature/content session. Do not reset or revert unrelated changes.
- EITS registration is not active for this session. `EITS_AGENT_UUID`, `EITS_SESSION_UUID`, and `EITS_PROJECT_ID` were empty, and `eits sessions create` returned `401 unauthorized`.

## Most Recent Implemented Feature

Command palette was added with `cmdk` to both Python and Ruby apps.

Python files changed:

- `package.json`
- `pnpm-lock.yaml`
- `src/App.tsx`
- `src/components/command-palette.tsx`
- `src/components/kata-editor.tsx`
- `src/lib/shortcut-keys.ts`
- `src/lib/shortcut-keys.test.ts`
- `src/routes/settings.tsx`
- `src/stores/command-palette-store.ts`
- `docs/features.md`

Ruby files changed:

- `/Users/urielmaldonado/projects/ruby-kata/package.json`
- `/Users/urielmaldonado/projects/ruby-kata/pnpm-lock.yaml`
- `/Users/urielmaldonado/projects/ruby-kata/src/App.tsx`
- `/Users/urielmaldonado/projects/ruby-kata/src/components/command-palette.tsx`
- `/Users/urielmaldonado/projects/ruby-kata/src/components/kata-editor.tsx`
- `/Users/urielmaldonado/projects/ruby-kata/src/lib/shortcut-keys.ts`
- `/Users/urielmaldonado/projects/ruby-kata/src/lib/shortcut-keys.test.ts`
- `/Users/urielmaldonado/projects/ruby-kata/src/routes/settings.tsx`
- `/Users/urielmaldonado/projects/ruby-kata/src/stores/command-palette-store.ts`

Behavior added:

- `Cmd+Shift+P` on macOS / `Ctrl+Shift+P` elsewhere opens the command palette.
- Global commands include navigation, start/resume practice, settings, zoom in/out, and actual size.
- Problem pages register contextual commands while mounted:
  - Run tests
  - Toggle problem panel
  - Toggle solutions
  - Toggle REPL
  - Copy selected solution to editor
  - Reset code
  - Previous kata
  - Next kata
  - Open LeetCode when available
- Settings now lists the command palette shortcut.
- `docs/features.md` marks command palette as implemented for Python and Ruby.

## Validation Already Run

Python app:

```bash
pnpm vitest run src/lib/shortcut-keys.test.ts
pnpm build
```

Ruby app:

```bash
cd /Users/urielmaldonado/projects/ruby-kata
pnpm vitest run src/lib/shortcut-keys.test.ts
pnpm build
```

All commands passed. Builds emitted only existing-style warnings from DaisyUI/Tailwind and bundling.

## Important Project Rules

- Use `pnpm`.
- Use `apply_patch` for manual file edits.
- Do not revert unrelated dirty files.
- Python app lives on `main` in this repo.
- Ruby work must happen in `/Users/urielmaldonado/projects/ruby-kata`.
- Shared UI changes should usually be mirrored to Ruby when practical.
- LeetCode statements must be paraphrased, not copied verbatim.
- Every displayed solution variant should include `complexity` and `explanation`.

## Recently Relevant Product Decisions

- Use `cmdk` for command palette.
- Next native-feel improvements should likely be:
  1. Native app menu commands.
  2. Persisted pane layouts.
  3. Custom native-style dialogs.
  4. Context menus.
  5. Shortcut editor with conflict detection.
- The user prefers compact, native-feeling desktop UI:
  - Avoid oversized settings headings.
  - Keep problem page controls less cramped.
  - Use lucide icons for toolbar buttons.
  - Use Slack-like settings layout where appropriate.
- Module lists should match NeetCode modules as closely as possible, but non-LeetCode/custom problems should not be deleted. Filters should distinguish NeetCode 150 and NeetCode 250.

## Known Follow-Ups

- Visually test the command palette in dev mode if the user asks to run the app.
- Consider adding native menu commands next; the command palette action model makes this easier.
- If doing EITS-tracked work, fix EITS auth/session registration first.
- If committing, review the dirty worktree carefully. There are many pre-existing modifications and untracked files from earlier tasks.

