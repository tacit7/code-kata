import { create } from "zustand";
import { isAppThemeId } from "../lib/editor-themes";
import { IMPLEMENTATION_SIZES, type ImplementationSize } from "../lib/implementation-complexity";
import type { AppTheme } from "../types/editor";
import { getDb } from "../lib/database";
import { resolveEditorToggles, type EditorToggleKey, type LineNumbersMode } from "../lib/editor-settings";
import { DEFAULT_UI_SCALE, normalizeUiScale, type UiScale } from "../lib/ui-scale";
import { DEFAULT_AGENT_SYSTEM_PROMPT } from "../lib/agent-bridge";

import { DEFAULT_SHORTCUTS, migrateShortcuts, type ShortcutAction, type ShortcutMap } from "../lib/shortcut-keys";

// settings.tsx and use-keyboard-shortcuts.ts import these from here.
export { DEFAULT_SHORTCUTS };
export type { ShortcutAction, ShortcutMap };

export type { LineNumbersMode };

export type KataLanguage = "javascript" | "python" | "java";

export type PracticeMode = "sr" | "review" | "daily" | "weak" | "speed" | "level";
export type PracticeDifficulty = "easy" | "medium" | "hard";
export type EditorLayoutMode = "horizontal" | "vertical";
export type EditorPanelId = "description" | "solution" | "notes" | "viz" | "diff";
export type DashboardTab = "overview" | "progress" | "leaderboard" | "history";
export type AgentProvider = "codex" | "claude";

export interface EditorLayoutSettings {
  problemPanelVisible: boolean;
  activePanel: EditorPanelId;
  problemPanelWidth: number;
  replVisible: boolean;
  replLayout: EditorLayoutMode;
  outputPaneVisible: boolean;
  outputTab: "testcase" | "results";
  outputPaneHeight: number;
}

export interface PracticeConfig {
  mode: PracticeMode;
  moduleFilters: string[];
  categoryFilters: string[];
  difficultyFilters: PracticeDifficulty[];
  implementationSizeFilters: ImplementationSize[];
  selectedLevels: number[];
  dailyRandomize: boolean;
  sessionSize: number | "all";
  maxTestRuns: number | null;
}

export const DEFAULT_PRACTICE_CONFIG: PracticeConfig = {
  mode: "sr",
  moduleFilters: [],
  categoryFilters: [],
  difficultyFilters: [],
  implementationSizeFilters: [],
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
  uiScale: DEFAULT_UI_SCALE,
  tabSize: 2,
  editorAutocomplete: true,
  lineNumbersMode: "on" as LineNumbersMode,
  wordWrap: false,
  autoClosingBrackets: true,
  fontLigatures: false,
  highlightOccurrences: true,
  bracketPairColorization: true,
  language: "javascript" as KataLanguage,
  defaultSessionSize: 5,
  targetTimeMs: 300000,
  sessionTimeLimitMs: 0,
  autoRunTests: false,
  hideDescriptionInSession: false,
  shortcuts: { ...DEFAULT_SHORTCUTS },
  dailyKataIds: [] as number[],
  doneKataIds: [] as number[],
  practiceConfig: { ...DEFAULT_PRACTICE_CONFIG },
  editorLayout: {
    problemPanelVisible: true,
    activePanel: "description",
    problemPanelWidth: 440,
    replVisible: false,
    replLayout: "horizontal",
    outputPaneVisible: true,
    outputTab: "testcase",
    outputPaneHeight: 280,
  } as EditorLayoutSettings,
  dashboardTab: "overview" as DashboardTab,
  agentProvider: "codex" as AgentProvider,
  agentSystemPrompt: DEFAULT_AGENT_SYSTEM_PROMPT,
};

const EDITOR_TOGGLE_DEFAULTS: Record<EditorToggleKey, boolean> = {
  editorAutocomplete: DEFAULTS.editorAutocomplete,
  autoClosingBrackets: DEFAULTS.autoClosingBrackets,
  wordWrap: DEFAULTS.wordWrap,
  highlightOccurrences: DEFAULTS.highlightOccurrences,
  bracketPairColorization: DEFAULTS.bracketPairColorization,
  fontLigatures: DEFAULTS.fontLigatures,
};

interface SettingsState {
  loaded: boolean;
  // Editor
  theme: AppTheme;
  vimMode: boolean;
  fontSize: number;
  fontFamily: string;
  uiScale: UiScale;
  tabSize: number;
  editorAutocomplete: boolean;
  lineNumbersMode: LineNumbersMode;
  wordWrap: boolean;
  autoClosingBrackets: boolean;
  fontLigatures: boolean;
  highlightOccurrences: boolean;
  bracketPairColorization: boolean;
  language: KataLanguage;
  // Practice
  defaultSessionSize: number;
  targetTimeMs: number;
  sessionTimeLimitMs: number;
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
  // Workspace layout
  editorLayout: EditorLayoutSettings;
  dashboardTab: DashboardTab;
  agentProvider: AgentProvider;
  agentSystemPrompt: string;
  // Actions
  loadSettings: () => Promise<void>;
  setSetting: (key: string, value: unknown) => Promise<void>;
  resetDefaults: () => Promise<void>;
  toggleTheme: () => void;
  toggleVimMode: () => void;
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(min, Math.min(max, value))
    : fallback;
}

function isEditorPanelId(value: unknown): value is EditorPanelId {
  return value === "description" || value === "solution" || value === "notes" || value === "viz" || value === "diff";
}

function normalizeEditorLayout(value: unknown): EditorLayoutSettings {
  const raw = (value && typeof value === "object" ? value : {}) as Partial<EditorLayoutSettings>;
  return {
    problemPanelVisible: typeof raw.problemPanelVisible === "boolean" ? raw.problemPanelVisible : DEFAULTS.editorLayout.problemPanelVisible,
    activePanel: isEditorPanelId(raw.activePanel) ? raw.activePanel : DEFAULTS.editorLayout.activePanel,
    problemPanelWidth: clampNumber(raw.problemPanelWidth, DEFAULTS.editorLayout.problemPanelWidth, 200, 800),
    replVisible: typeof raw.replVisible === "boolean" ? raw.replVisible : DEFAULTS.editorLayout.replVisible,
    replLayout: raw.replLayout === "vertical" || raw.replLayout === "horizontal" ? raw.replLayout : DEFAULTS.editorLayout.replLayout,
    outputPaneVisible: typeof raw.outputPaneVisible === "boolean" ? raw.outputPaneVisible : DEFAULTS.editorLayout.outputPaneVisible,
    outputTab: raw.outputTab === "results" || raw.outputTab === "testcase" ? raw.outputTab : DEFAULTS.editorLayout.outputTab,
    outputPaneHeight: clampNumber(raw.outputPaneHeight, DEFAULTS.editorLayout.outputPaneHeight, 160, 900),
  };
}

function normalizeDashboardTab(value: unknown): DashboardTab {
  return value === "overview" || value === "progress" || value === "leaderboard" || value === "history"
    ? value
    : DEFAULTS.dashboardTab;
}

function normalizeAgentProvider(value: unknown): AgentProvider {
  return value === "claude" || value === "codex" ? value : DEFAULTS.agentProvider;
}

function normalizeAgentSystemPrompt(value: unknown): string {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : DEFAULTS.agentSystemPrompt;
}

const LEGACY_MIGRATIONS: Record<string, string> = {
  "kata-theme": "theme",
  "kata-vimMode": "vimMode",
  "kata-fontSize": "fontSize",
};

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function isPracticeDifficulty(value: unknown): value is PracticeDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

function normalizePracticeDifficulties(value: unknown): PracticeDifficulty[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isPracticeDifficulty);
}

function isImplementationSize(value: unknown): value is ImplementationSize {
  return typeof value === "string" && IMPLEMENTATION_SIZES.includes(value as ImplementationSize);
}

function normalizeImplementationSizes(value: unknown): ImplementationSize[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isImplementationSize);
}

export function normalizePracticeConfig(value: unknown): PracticeConfig {
  const raw = (value && typeof value === "object" ? value : {}) as Partial<PracticeConfig> & {
    categoryFilter?: unknown;
    difficultyFilter?: unknown;
  };

  const categoryFilters = Array.isArray(raw.categoryFilters)
    ? normalizeStringArray(raw.categoryFilters)
    : typeof raw.categoryFilter === "string" && raw.categoryFilter.length > 0
    ? [raw.categoryFilter]
    : DEFAULT_PRACTICE_CONFIG.categoryFilters;

  const difficultyFilters = Array.isArray(raw.difficultyFilters)
    ? normalizePracticeDifficulties(raw.difficultyFilters)
    : isPracticeDifficulty(raw.difficultyFilter)
    ? [raw.difficultyFilter]
    : DEFAULT_PRACTICE_CONFIG.difficultyFilters;

  return {
    mode: raw.mode ?? DEFAULT_PRACTICE_CONFIG.mode,
    moduleFilters: Array.isArray(raw.moduleFilters)
      ? normalizeStringArray(raw.moduleFilters)
      : DEFAULT_PRACTICE_CONFIG.moduleFilters,
    categoryFilters,
    difficultyFilters,
    implementationSizeFilters: Array.isArray(raw.implementationSizeFilters)
      ? normalizeImplementationSizes(raw.implementationSizeFilters)
      : DEFAULT_PRACTICE_CONFIG.implementationSizeFilters,
    selectedLevels: Array.isArray(raw.selectedLevels)
      ? raw.selectedLevels.filter((level): level is number => typeof level === "number")
      : DEFAULT_PRACTICE_CONFIG.selectedLevels,
    dailyRandomize: raw.dailyRandomize ?? DEFAULT_PRACTICE_CONFIG.dailyRandomize,
    sessionSize: raw.sessionSize ?? DEFAULT_PRACTICE_CONFIG.sessionSize,
    maxTestRuns: raw.maxTestRuns ?? DEFAULT_PRACTICE_CONFIG.maxTestRuns,
  };
}

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
      uiScale: normalizeUiScale(patch.uiScale),
      tabSize: (patch.tabSize as number) ?? DEFAULTS.tabSize,
      ...resolveEditorToggles(patch, EDITOR_TOGGLE_DEFAULTS),
      lineNumbersMode:
        patch.lineNumbersMode === "off" || patch.lineNumbersMode === "relative" || patch.lineNumbersMode === "on"
          ? patch.lineNumbersMode
          : DEFAULTS.lineNumbersMode,
      // Persisted settings can outlive this variant's language set — a foreign
      // variant may have written "ruby", or the value may be corrupted. Only
      // known-good languages pass through; ruby (the retired variant) maps
      // to python; everything else falls back to the default.
      language:
        patch.language === "javascript" || patch.language === "python" || patch.language === "java"
          ? patch.language
          : patch.language === "ruby"
          ? "python"
          : DEFAULTS.language,
      defaultSessionSize:
        (patch.defaultSessionSize as number) ?? DEFAULTS.defaultSessionSize,
      targetTimeMs: (patch.targetTimeMs as number) ?? DEFAULTS.targetTimeMs,
      sessionTimeLimitMs:
        (patch.sessionTimeLimitMs as number) ?? DEFAULTS.sessionTimeLimitMs,
      autoRunTests: (patch.autoRunTests as boolean) ?? DEFAULTS.autoRunTests,
      hideDescriptionInSession:
        (patch.hideDescriptionInSession as boolean) ??
        DEFAULTS.hideDescriptionInSession,
      shortcuts: migrateShortcuts(patch.shortcuts),
      dailyKataIds:
        (patch.dailyKataIds as number[]) ?? DEFAULTS.dailyKataIds,
      doneKataIds:
        (patch.doneKataIds as number[]) ?? DEFAULTS.doneKataIds,
      practiceConfig: normalizePracticeConfig(patch.practiceConfig),
      editorLayout: normalizeEditorLayout(patch.editorLayout),
      dashboardTab: normalizeDashboardTab(patch.dashboardTab),
      agentProvider: normalizeAgentProvider(patch.agentProvider),
      agentSystemPrompt: normalizeAgentSystemPrompt(patch.agentSystemPrompt),
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
