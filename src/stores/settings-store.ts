import { create } from "zustand";
import type { AppTheme } from "../types/editor";
import { getDb } from "../lib/database";
import { getHardwareFingerprint, activateLicense as activateLicenseAPI } from "../lib/license";

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

export type KataLanguage = "javascript" | "python";

const DEFAULTS = {
  theme: "dark" as AppTheme,
  vimMode: false,
  fontSize: 14,
  fontFamily: "JetBrains Mono, monospace",
  tabSize: 2,
  language: "javascript" as KataLanguage,
  defaultSessionSize: 5,
  targetTimeMs: 300000,
  autoRunTests: false,
  hideDescriptionInSession: false,
  shortcuts: { ...DEFAULT_SHORTCUTS },
  dailyKataIds: [] as number[],
  // License
  licenseKey: null as string | null,
  hwFingerprint: null as string | null,
  activatedAt: null as string | null,
  isPremium: false,
};

interface SettingsState {
  loaded: boolean;
  // Editor
  theme: AppTheme;
  vimMode: boolean;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
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
  // License
  licenseKey: string | null;
  hwFingerprint: string | null;
  activatedAt: string | null;
  isPremium: boolean;
  // Actions
  loadSettings: () => Promise<void>;
  setSetting: (key: string, value: unknown) => Promise<void>;
  resetDefaults: () => Promise<void>;
  toggleTheme: () => void;
  toggleVimMode: () => void;
  activateLicense: (key: string) => Promise<{ success: boolean; error?: string }>;
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
      language: (patch.language as KataLanguage) ?? DEFAULTS.language,
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
      licenseKey: (patch.licenseKey as string | null) ?? DEFAULTS.licenseKey,
      hwFingerprint:
        (patch.hwFingerprint as string | null) ?? DEFAULTS.hwFingerprint,
      activatedAt: (patch.activatedAt as string | null) ?? DEFAULTS.activatedAt,
      isPremium: (patch.isPremium as boolean) ?? DEFAULTS.isPremium,
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

  activateLicense: async (key: string) => {
    try {
      const hwFingerprint = await getHardwareFingerprint();
      const result = await activateLicenseAPI(key, hwFingerprint);

      if (result.valid && result.premium) {
        await get().setSetting("licenseKey", key);
        await get().setSetting("hwFingerprint", hwFingerprint);
        await get().setSetting("activatedAt", new Date().toISOString());
        await get().setSetting("isPremium", true);
        return { success: true };
      } else {
        return { success: false, error: result.error || "Invalid license key" };
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Activation failed",
      };
    }
  },
}));
