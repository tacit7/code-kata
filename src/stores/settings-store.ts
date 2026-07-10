import { create } from "zustand";
import { isAppThemeId } from "../lib/editor-themes";
import type { AppTheme } from "../types/editor";
import { getDb } from "../lib/database";
import { resolveEditorToggles, type EditorToggleKey, type LineNumbersMode } from "../lib/editor-settings";

import { DEFAULT_SHORTCUTS, migrateShortcuts, type ShortcutAction, type ShortcutMap } from "../lib/shortcut-keys";

// settings.tsx and use-keyboard-shortcuts.ts import these from here.
export { DEFAULT_SHORTCUTS };
export type { ShortcutAction, ShortcutMap };

export type { LineNumbersMode };

export type KataLanguage = "javascript" | "python";

export type PracticeMode = "sr" | "daily" | "weak" | "speed" | "level";

export interface PracticeConfig {
  mode: PracticeMode;
  categoryFilter: string;
  difficultyFilter: "" | "easy" | "medium" | "hard";
  selectedLevels: number[];
  dailyRandomize: boolean;
  sessionSize: number | "all";
  maxTestRuns: number | null;
}

export const DEFAULT_PRACTICE_CONFIG: PracticeConfig = {
  mode: "sr",
  categoryFilter: "",
  difficultyFilter: "",
  selectedLevels: [],
  dailyRandomize: false,
  sessionSize: 10,
  maxTestRuns: null,
};

const DEFAULTS = {
  theme: "dark" as AppTheme,
  vimMode: false,
  fontSize: 14,
  fontFamily: "JetBrains Mono, monospace",
  tabSize: 2,
  editorAutocomplete: true,
  lineNumbersMode: "on" as LineNumbersMode,
  wordWrap: false,
  autoClosingBrackets: true,
  fontLigatures: false,
  highlightOccurrences: true,
  language: "javascript" as KataLanguage,
  defaultSessionSize: 5,
  targetTimeMs: 300000,
  autoRunTests: false,
  hideDescriptionInSession: false,
  shortcuts: { ...DEFAULT_SHORTCUTS },
  dailyKataIds: [] as number[],
  doneKataIds: [] as number[],
  practiceConfig: { ...DEFAULT_PRACTICE_CONFIG },
};

const EDITOR_TOGGLE_DEFAULTS: Record<EditorToggleKey, boolean> = {
  editorAutocomplete: DEFAULTS.editorAutocomplete,
  autoClosingBrackets: DEFAULTS.autoClosingBrackets,
  wordWrap: DEFAULTS.wordWrap,
  highlightOccurrences: DEFAULTS.highlightOccurrences,
  fontLigatures: DEFAULTS.fontLigatures,
};

interface SettingsState {
  loaded: boolean;
  // Editor
  theme: AppTheme;
  vimMode: boolean;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  editorAutocomplete: boolean;
  lineNumbersMode: LineNumbersMode;
  wordWrap: boolean;
  autoClosingBrackets: boolean;
  fontLigatures: boolean;
  highlightOccurrences: boolean;
  language: KataLanguage;
  // Practice
  defaultSessionSize: number;
  targetTimeMs: number;
  autoRunTests: boolean;
  hideDescriptionInSession: boolean;
  // Shortcuts
  shortcuts: Record<ShortcutAction, string>;
  // Daily kata set
  dailyKataIds: number[];
  // Completed katas
  doneKataIds: number[];
  // Practice page config
  practiceConfig: PracticeConfig;
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
      theme: isAppThemeId(patch.theme) ? patch.theme : DEFAULTS.theme,
      vimMode: (patch.vimMode as boolean) ?? DEFAULTS.vimMode,
      fontSize: (patch.fontSize as number) ?? DEFAULTS.fontSize,
      fontFamily: (patch.fontFamily as string) ?? DEFAULTS.fontFamily,
      tabSize: (patch.tabSize as number) ?? DEFAULTS.tabSize,
      ...resolveEditorToggles(patch, EDITOR_TOGGLE_DEFAULTS),
      lineNumbersMode:
        patch.lineNumbersMode === "off" || patch.lineNumbersMode === "relative" || patch.lineNumbersMode === "on"
          ? patch.lineNumbersMode
          : DEFAULTS.lineNumbersMode,
      // Persisted settings can outlive this variant's language set — a foreign
      // variant may have written "ruby", or the value may be corrupted. Only
      // known-good languages pass through; ruby (the other algo variant) maps
      // to python; everything else falls back to the default.
      language:
        patch.language === "javascript" || patch.language === "python"
          ? patch.language
          : patch.language === "ruby"
          ? "python"
          : DEFAULTS.language,
      defaultSessionSize:
        (patch.defaultSessionSize as number) ?? DEFAULTS.defaultSessionSize,
      targetTimeMs: (patch.targetTimeMs as number) ?? DEFAULTS.targetTimeMs,
      autoRunTests: (patch.autoRunTests as boolean) ?? DEFAULTS.autoRunTests,
      hideDescriptionInSession:
        (patch.hideDescriptionInSession as boolean) ??
        DEFAULTS.hideDescriptionInSession,
      shortcuts: migrateShortcuts(patch.shortcuts),
      dailyKataIds:
        (patch.dailyKataIds as number[]) ?? DEFAULTS.dailyKataIds,
      doneKataIds:
        (patch.doneKataIds as number[]) ?? DEFAULTS.doneKataIds,
      practiceConfig: {
        ...DEFAULT_PRACTICE_CONFIG,
        ...((patch.practiceConfig as Partial<PracticeConfig>) ?? {}),
      },
      loaded: true,
    });

    // Write the migrated map back, so the rebinding survives the next load and
    // the Settings screen shows what is actually bound.
    const migrated = migrateShortcuts(patch.shortcuts);
    if (JSON.stringify(migrated) !== JSON.stringify(patch.shortcuts)) {
      await get().setSetting("shortcuts", migrated);
    }
  },

  setSetting: async (key: string, value: unknown) => {
    // Optimistic update first so UI is always immediate
    set({ [key]: value });
    try {
      const db = await getDb();
      await db.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)",
        [key, JSON.stringify(value)]
      );
    } catch (err) {
      console.error(`[settings] Failed to persist "${key}":`, err);
    }
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
