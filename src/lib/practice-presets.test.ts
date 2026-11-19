import { describe, expect, it } from "vitest";
import {
  applyPracticePresetConfig,
  normalizePracticePresetConfig,
  normalizePracticePresetName,
  practicePresetCanSaveName,
  practicePresetConfigFromSettings,
} from "./practice-presets";
import type { PracticeConfig } from "../stores/settings-store";

const config: PracticeConfig = {
  mode: "level",
  moduleFilters: ["recursion", "trees"],
  categoryFilters: ["arrays", "dp"],
  difficultyFilters: ["easy", "hard"],
  implementationSizeFilters: ["Short", "Long"],
  selectedLevels: [1, 3],
  dailyRandomize: true,
  sessionSize: 15,
  maxTestRuns: 5,
};

describe("practice presets", () => {
  it("normalizes names", () => {
    expect(normalizePracticePresetName("  DP   drills  ")).toBe("DP drills");
  });

  it("requires a visible non-empty preset name before saving", () => {
    expect(practicePresetCanSaveName("")).toBe(false);
    expect(practicePresetCanSaveName("   ")).toBe(false);
    expect(practicePresetCanSaveName(" DP drills ")).toBe(true);
  });

  it("creates a preset config from current settings without sharing arrays", () => {
    const preset = practicePresetConfigFromSettings(config, 600000);

    expect(preset).toEqual({ ...config, sessionTimeLimitMs: 600000 });
    expect(preset.moduleFilters).not.toBe(config.moduleFilters);
    expect(preset.categoryFilters).not.toBe(config.categoryFilters);
    expect(preset.difficultyFilters).not.toBe(config.difficultyFilters);
    expect(preset.implementationSizeFilters).not.toBe(config.implementationSizeFilters);
    expect(preset.selectedLevels).not.toBe(config.selectedLevels);
  });

  it("normalizes corrupt preset config values back to valid practice settings", () => {
    const preset = normalizePracticePresetConfig({
      mode: "review",
      moduleFilters: ["recursion", 12],
      categoryFilters: ["trees", 12],
      difficultyFilters: ["medium", "expert"],
      implementationSizeFilters: ["Tiny", "Huge"],
      selectedLevels: [2, "3"],
      dailyRandomize: false,
      sessionSize: "all",
      maxTestRuns: null,
      sessionTimeLimitMs: -1,
    });

    expect(preset).toEqual({
      mode: "review",
      moduleFilters: ["recursion"],
      categoryFilters: ["trees"],
      difficultyFilters: ["medium"],
      implementationSizeFilters: ["Tiny"],
      selectedLevels: [2],
      dailyRandomize: false,
      sessionSize: "all",
      maxTestRuns: null,
      sessionTimeLimitMs: 0,
    });
  });

  it("splits stored preset config into store settings", () => {
    expect(applyPracticePresetConfig({ ...config, sessionTimeLimitMs: 300000 })).toEqual({
      practiceConfig: config,
      sessionTimeLimitMs: 300000,
    });
  });
});
