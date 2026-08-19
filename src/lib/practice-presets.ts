import { getDb } from "./database";
import {
  normalizePracticeConfig,
  type PracticeConfig,
} from "../stores/settings-store";

export type PracticePresetConfig = PracticeConfig & {
  sessionTimeLimitMs: number;
};

export interface PracticePreset {
  id: number;
  name: string;
  config: PracticePresetConfig;
  createdAt: string | null;
  updatedAt: string | null;
}

interface PracticePresetRow {
  id: number;
  name: string;
  config: string;
  created_at: string | null;
  updated_at: string | null;
}

export function normalizePracticePresetName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function practicePresetCanSaveName(name: string): boolean {
  return normalizePracticePresetName(name).length > 0;
}

export function practicePresetConfigFromSettings(
  practiceConfig: PracticeConfig,
  sessionTimeLimitMs: number,
): PracticePresetConfig {
  return {
    ...normalizePracticeConfig(practiceConfig),
    moduleFilters: [...practiceConfig.moduleFilters],
    categoryFilters: [...practiceConfig.categoryFilters],
    difficultyFilters: [...practiceConfig.difficultyFilters],
    implementationSizeFilters: [...practiceConfig.implementationSizeFilters],
    selectedLevels: [...practiceConfig.selectedLevels],
    sessionTimeLimitMs: Math.max(0, sessionTimeLimitMs),
  };
}

export function normalizePracticePresetConfig(value: unknown): PracticePresetConfig {
  const raw = value && typeof value === "object"
    ? value as Partial<PracticePresetConfig>
    : {};

  return {
    ...normalizePracticeConfig(raw),
    sessionTimeLimitMs:
      typeof raw.sessionTimeLimitMs === "number" && Number.isFinite(raw.sessionTimeLimitMs)
        ? Math.max(0, raw.sessionTimeLimitMs)
        : 0,
  };
}

export function applyPracticePresetConfig(config: PracticePresetConfig): {
  practiceConfig: PracticeConfig;
  sessionTimeLimitMs: number;
} {
  const { sessionTimeLimitMs, ...practiceConfig } = normalizePracticePresetConfig(config);
  return { practiceConfig, sessionTimeLimitMs };
}

function rowToPracticePreset(row: PracticePresetRow): PracticePreset | null {
  try {
    return {
      id: row.id,
      name: row.name,
      config: normalizePracticePresetConfig(JSON.parse(row.config)),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch {
    return null;
  }
}

export async function loadPracticePresets(): Promise<PracticePreset[]> {
  const db = await getDb();
  const rows = await db.select<PracticePresetRow[]>(
    "SELECT id, name, config, created_at, updated_at FROM practice_presets ORDER BY name ASC",
  );
  return rows
    .map(rowToPracticePreset)
    .filter((preset): preset is PracticePreset => preset !== null);
}

export async function savePracticePreset(
  name: string,
  config: PracticePresetConfig,
): Promise<void> {
  const normalizedName = normalizePracticePresetName(name);
  if (!normalizedName) throw new Error("Preset name is required");

  const db = await getDb();
  await db.execute(
    `INSERT INTO practice_presets (name, config, created_at, updated_at)
     VALUES ($1, $2, datetime('now'), datetime('now'))
     ON CONFLICT(name) DO UPDATE SET
       config = excluded.config,
       updated_at = datetime('now')`,
    [normalizedName, JSON.stringify(normalizePracticePresetConfig(config))],
  );
}

export async function deletePracticePreset(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM practice_presets WHERE id = $1", [id]);
}
