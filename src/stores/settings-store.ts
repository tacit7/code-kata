import { create } from "zustand";
import type { AppTheme } from "../types/editor";
import { getDb } from "../lib/database";

export type ShortcutAction =
  | "runTests"
  | "nextKata"
  | "prevKata"
  | "toggleSolution"
  | "openSettings"
  | "closePanel";

export const DEFAULT_SHORTCUTS: Record<ShortcutAction, string> = {
  runTests: "Meta+Enter",
  nextKata: "Meta+ArrowRight",
  prevKata: "Meta+ArrowLeft",
  toggleSolution: "Meta+Shift+S",
  openSettings: "Meta+,",
  closePanel: "Escape",
};

const DEFAULTS = {
  theme: "dark" as AppTheme,
  vimMode: false,
  fontSize: 14,
  fontFamily: "JetBrains Mono, monospace",
  tabSize: 2,
  defaultSessionSize: 5,
  targetTimeMs: 300000,
  autoRunTests: false,
  shortcuts: { ...DEFAULT_SHORTCUTS },
};

interface SettingsState {
  loaded: boolean;
  // Editor
  theme: AppTheme;
  vimMode: boolean;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  // Practice
  defaultSessionSize: number;
  targetTimeMs: number;
  autoRunTests: boolean;
  // Shortcuts
  shortcuts: Record<ShortcutAction, string>;
  // Actions
  loadSettings: () => Promise<void>;
  setSetting: (key: string, value: unknown) => Promise<void>;
  resetDefaults: () => Promise<void>;
  toggleTheme: () => void;
  toggleVimMode: () => void;
}

const LEGACY_MIGRATIONS: Record<string, string> = {
  "kata-theme": "theme",
  "kata-vimMode": "vimMode",
  "kata-fontSize": "fontSize",
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  loaded: false,
  ...DEFAULTS,

  loadSettings: async () => {
    const db = await getDb();

    // Migrate localStorage keys on first load
    for (const [lsKey, settingKey] of Object.entries(LEGACY_MIGRATIONS)) {
      const raw = localStorage.getItem(lsKey);
      if (raw !== null) {
        try {
          const parsed = JSON.parse(raw);
          await db.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)",
            [settingKey, JSON.stringify(parsed)]
          );
        } catch {
          // If parse fails, store raw string
          await db.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)",
            [settingKey, JSON.stringify(raw)]
          );
        }
        localStorage.removeItem(lsKey);
      }
    }

    // Read all settings from DB
    const rows = await db.select<{ key: string; value: string }[]>(
      "SELECT key, value FROM settings"
    );

    const patch: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        patch[row.key] = JSON.parse(row.value);
      } catch {
        patch[row.key] = row.value;
      }
    }

    // Merge with defaults: DB values override defaults
    set({
      theme: (patch.theme as AppTheme) ?? DEFAULTS.theme,
      vimMode: (patch.vimMode as boolean) ?? DEFAULTS.vimMode,
      fontSize: (patch.fontSize as number) ?? DEFAULTS.fontSize,
      fontFamily: (patch.fontFamily as string) ?? DEFAULTS.fontFamily,
      tabSize: (patch.tabSize as number) ?? DEFAULTS.tabSize,
      defaultSessionSize:
        (patch.defaultSessionSize as number) ?? DEFAULTS.defaultSessionSize,
      targetTimeMs: (patch.targetTimeMs as number) ?? DEFAULTS.targetTimeMs,
      autoRunTests: (patch.autoRunTests as boolean) ?? DEFAULTS.autoRunTests,
      shortcuts:
        (patch.shortcuts as Record<ShortcutAction, string>) ??
        DEFAULTS.shortcuts,
      loaded: true,
    });
  },

  setSetting: async (key: string, value: unknown) => {
    const db = await getDb();
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)",
      [key, JSON.stringify(value)]
    );
    set({ [key]: value });
  },

  resetDefaults: async () => {
    const db = await getDb();
    await db.execute("DELETE FROM settings");
    set({ ...DEFAULTS, loaded: true });
  },

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setSetting("theme", next);
  },

  toggleVimMode: () => {
    const next = !get().vimMode;
    get().setSetting("vimMode", next);
  },
}));
