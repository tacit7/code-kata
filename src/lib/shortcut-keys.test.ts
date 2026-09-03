import { describe, it, expect } from "vitest";
import { DEFAULT_SHORTCUTS, migrateShortcuts, normalizeShortcutCombo } from "./shortcut-keys";

describe("DEFAULT_SHORTCUTS", () => {
  it("binds next/prev off Monaco's line-start/line-end keys", () => {
    expect(DEFAULT_SHORTCUTS.nextKata).toBe("Meta+Alt+ArrowRight");
    expect(DEFAULT_SHORTCUTS.prevKata).toBe("Meta+Alt+ArrowLeft");
  });

  it("binds REPL toggle to the terminal-style shortcut", () => {
    expect(DEFAULT_SHORTCUTS.toggleRepl).toBe("Meta+`");
  });

  it("binds app zoom to Chrome-style shortcuts", () => {
    expect(DEFAULT_SHORTCUTS.zoomIn).toBe("Meta+=");
    expect(DEFAULT_SHORTCUTS.zoomOut).toBe("Meta+-");
    expect(DEFAULT_SHORTCUTS.resetZoom).toBe("Meta+0");
  });

  it("binds the command palette to a VS Code-style shortcut", () => {
    expect(DEFAULT_SHORTCUTS.openCommandPalette).toBe("Meta+Shift+P");
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
    expect(out.toggleRepl).toBe(DEFAULT_SHORTCUTS.toggleRepl);
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

describe("normalizeShortcutCombo", () => {
  it("normalizes letter key casing so recorded shortcuts match keydown events", () => {
    expect(normalizeShortcutCombo("Meta+k")).toBe("Meta+K");
    expect(normalizeShortcutCombo("Meta+Shift+p")).toBe("Meta+Shift+P");
  });

  it("normalizes Control to the listener's Ctrl token", () => {
    expect(normalizeShortcutCombo("Control+K")).toBe("Ctrl+K");
  });

  it("normalizes migrated user shortcuts", () => {
    const out = migrateShortcuts({ ...DEFAULT_SHORTCUTS, openCommandPalette: "Meta+k" });
    expect(out.openCommandPalette).toBe("Meta+K");
  });
});
