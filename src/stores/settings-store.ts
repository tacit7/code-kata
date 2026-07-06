import { create } from "zustand";
import { isEditorThemeId, type EditorThemeId } from "../lib/editor-themes";
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

export type LineNumbersMode = "on" | "off" | "relative";

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
  editorTheme: "auto" as EditorThemeId,
  editorAutocomplete: true,
  lineNumbersMode: "on" as LineNumbersMode,
  wordWrap: false,
  autoClosingBrackets: true,
  fontLigatures: false,
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

interface SettingsState {
  loaded: boolean;
  // Editor
  theme: AppTheme;
  vimMode: boolean;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  editorTheme: EditorThemeId;
  editorAutocomplete: boolean;
  lineNumbersMode: LineNumbersMode;
  wordWrap: boolean;
  autoClosingBrackets: boolean;
  fontLigatures: boolean;
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
      theme: (patch.theme as AppTheme) ?? DEFAULTS.theme,
      vimMode: (patch.vimMode as boolean) ?? DEFAULTS.vimMode,
      fontSize: (patch.fontSize as number) ?? DEFAULTS.fontSize,
      fontFamily: (patch.fontFamily as string) ?? DEFAULTS.fontFamily,
      tabSize: (patch.tabSize as number) ?? DEFAULTS.tabSize,
      editorTheme: isEditorThemeId(patch.editorTheme) ? patch.editorTheme : DEFAULTS.editorTheme,
      editorAutocomplete: (patch.editorAutocomplete as boolean) ?? DEFAULTS.editorAutocomplete,
      lineNumbersMode:
        patch.lineNumbersMode === "off" || patch.lineNumbersMode === "relative" || patch.lineNumbersMode === "on"
          ? patch.lineNumbersMode
          : DEFAULTS.lineNumbersMode,
      wordWrap: (patch.wordWrap as boolean) ?? DEFAULTS.wordWrap,
      autoClosingBrackets: (patch.autoClosingBrackets as boolean) ?? DEFAULTS.autoClosingBrackets,
      fontLigatures: (patch.fontLigatures as boolean) ?? DEFAULTS.fontLigatures,
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
      shortcuts:
        (patch.shortcuts as Record<ShortcutAction, string>) ??
        DEFAULTS.shortcuts,
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
