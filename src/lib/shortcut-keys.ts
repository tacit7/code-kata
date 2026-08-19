// Pure so it can be tested: settings-store.ts imports getDb at module load and
// cannot be loaded under vitest. Same rationale as lib/nav-items.ts.

export type ShortcutAction =
  | "runTests"
  | "nextKata"
  | "prevKata"
  | "toggleSolution"
  | "toggleRepl"
  | "zoomIn"
  | "zoomOut"
  | "resetZoom"
  | "openSettings"
  | "openCommandPalette"
  | "closePanel";

export type ShortcutMap = Record<ShortcutAction, string>;

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  runTests: "Meta+Enter",
  // Meta+Alt+Arrow, not Meta+Arrow: on macOS Cmd+Left/Right are Monaco's
  // line-start/line-end. This matches VS Code's previous/next editor tab.
  nextKata: "Meta+Alt+ArrowRight",
  prevKata: "Meta+Alt+ArrowLeft",
  toggleSolution: "Meta+Shift+S",
  toggleRepl: "Meta+`",
  zoomIn: "Meta+=",
  zoomOut: "Meta+-",
  resetZoom: "Meta+0",
  openSettings: "Meta+,",
  openCommandPalette: "Meta+Shift+P",
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
