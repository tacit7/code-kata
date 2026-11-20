import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Kata } from "../types/editor";

const mocks = vi.hoisted(() => ({
  config: {} as Record<string, unknown>, katas: [] as unknown[], done: [] as number[],
  daily: [] as number[], maps: [] as Map<unknown, unknown>[], mapIndex: 0,
}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useState: (initial: unknown) => actual.useState(
    initial instanceof Map ? mocks.maps[mocks.mapIndex++] ?? initial : initial,
  ) };
});
vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));
vi.mock("../stores/kata-store", () => ({ useKataStore: (selector: (state: unknown) => unknown) => selector({ katas: mocks.katas, bestTimes: {}, streaks: {} }) }));
vi.mock("../stores/settings-store", () => ({ useSettingsStore: (selector: (state: unknown) => unknown) => selector({
  practiceConfig: mocks.config, dailyKataIds: mocks.daily, doneKataIds: mocks.done,
  language: "javascript", sessionTimeLimitMs: 0, setSetting: vi.fn(),
}) }));
vi.mock("../stores/session-store", () => ({
  useSessionStore: (selector: (state: unknown) => unknown) => selector({ activeSession: null, startSession: vi.fn() }),
  fetchKataStats: vi.fn(), fetchAttemptHistory: vi.fn(),
}));
vi.mock("../stores/timer-store", () => ({ useTimerStore: () => vi.fn() }));
vi.mock("../lib/practice-presets", () => ({
  applyPracticePresetConfig: vi.fn(), deletePracticePreset: vi.fn(), loadPracticePresets: vi.fn(),
  normalizePracticePresetName: vi.fn(), practicePresetCanSaveName: vi.fn(),
  practicePresetConfigFromSettings: vi.fn(), savePracticePreset: vi.fn(),
}));
vi.mock("../lib/database", () => ({ reseedKatas: vi.fn() }));
import { PracticeQueuePage } from "./practice";

const kata = (id: number, name: string, category: string, difficulty = "easy", lines = 8): Kata => ({
  id, name, category, difficulty, language: "javascript", tags: [], isCustom: false,
  description: null, code: "", testCode: "", solution: "value = 1\n".repeat(lines), usage: null,
});
const preview = () => { mocks.mapIndex = 0; return renderToStaticMarkup(createElement(PracticeQueuePage)).replace(/<[^>]*>/g, " ").replace(/\s+/g, " "); };

beforeEach(() => {
  mocks.config = { mode: "sr", moduleFilters: [], categoryFilters: [], difficultyFilters: [],
    implementationSizeFilters: [], selectedLevels: [], dailyRandomize: false, sessionSize: 5, maxTestRuns: 3 };
  mocks.katas = [kata(1, "ArrayEasyShort", "arrays"), kata(2, "TreeEasyShort", "trees"),
    kata(3, "ArrayHardShort", "arrays", "hard"), kata(4, "ArrayEasyLong", "arrays", "easy", 25)];
  mocks.daily = [1, 2]; mocks.done = [];
  mocks.maps = [new Map(), new Map()];
});

describe("practice filter behavior", () => {
  it("does not apply a hidden category constraint while Level Up is selected", () => {
    mocks.config = { ...mocks.config, mode: "level", selectedLevels: [1], categoryFilters: ["trees"] };
    const html = preview();
    expect(html).toContain("ArrayEasyShort");
    expect(html).not.toContain("TreeEasyShort");
    expect(html).toContain("1 filter");
  });

  it("excludes manually done problems from Review, consistently with its count", () => {
    mocks.config.mode = "review";
    mocks.done = [1];
    mocks.maps = [new Map(), new Map([
      [1, [{ passed: 0, started_at: "2026-01-01T00:00:00Z" }]],
      [2, [{ passed: 0, started_at: "2026-01-01T00:00:00Z" }]],
    ])];
    const html = preview();
    expect(html).not.toContain("ArrayEasyShort");
    expect(html).toContain("TreeEasyShort");
    expect(html).toContain("1 queued");
  });

  it("combines category, difficulty and length constraints inside Daily", () => {
    mocks.config = { ...mocks.config, mode: "daily", categoryFilters: ["arrays"],
      difficultyFilters: ["easy"], implementationSizeFilters: ["Short"] };
    const html = preview();
    expect(html).toContain("ArrayEasyShort");
    for (const name of ["TreeEasyShort", "ArrayHardShort", "ArrayEasyLong"]) expect(html).not.toContain(name);
    expect(html).toContain("Start 1");
  });

  it("allows multiple values within each filter and intersects separate filters", () => {
    mocks.config = { ...mocks.config, categoryFilters: ["arrays", "trees"],
      difficultyFilters: ["easy", "hard"], implementationSizeFilters: ["Short"] };
    const html = preview();
    for (const name of ["ArrayEasyShort", "TreeEasyShort", "ArrayHardShort"]) expect(html).toContain(name);
    expect(html).not.toContain("ArrayEasyLong");
  });
});
