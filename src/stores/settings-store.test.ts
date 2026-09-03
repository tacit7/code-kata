import { beforeEach, describe, expect, it, vi } from "vitest";

const execute = vi.fn();

vi.mock("../lib/database", () => ({
  getDb: vi.fn(async () => ({ execute })),
}));

import { normalizeEditorLayout, useSettingsStore } from "./settings-store";

describe("normalizeEditorLayout", () => {
  it("keeps valid expanded editor layout values", () => {
    expect(normalizeEditorLayout({
      problemPanelVisible: false,
      activePanel: "solution",
      problemPanelWidth: 520,
      replVisible: true,
      replLayout: "vertical",
      outputPaneVisible: false,
      outputTab: "results",
      outputPaneHeight: 360,
      outputPaneWidth: 640,
      activeTestcaseIndex: 2,
      activeSolutionVariant: 3,
      vizSpeed: "200",
      maximizedPane: "repl",
    })).toMatchObject({
      problemPanelVisible: false,
      activePanel: "solution",
      problemPanelWidth: 520,
      replVisible: true,
      replLayout: "vertical",
      outputPaneVisible: false,
      outputTab: "results",
      outputPaneHeight: 360,
      outputPaneWidth: 640,
      activeTestcaseIndex: 2,
      activeSolutionVariant: 3,
      vizSpeed: "200",
      maximizedPane: "repl",
    });
  });

  it("falls back safely for invalid expanded layout values", () => {
    expect(normalizeEditorLayout({
      activeTestcaseIndex: -4,
      activeSolutionVariant: 4.8,
      outputPaneWidth: 100,
      vizSpeed: "100",
      maximizedPane: "terminal",
    })).toMatchObject({
      activeTestcaseIndex: 0,
      activeSolutionVariant: 4,
      outputPaneWidth: 280,
      vizSpeed: "500",
      maximizedPane: null,
    });
  });
});

describe("settings persistence", () => {
  beforeEach(() => {
    execute.mockReset();
    useSettingsStore.setState({ saveStatus: "idle", saveError: null, lastSavedAt: null });
  });

  it("rejects when a setting cannot be persisted", async () => {
    execute.mockRejectedValueOnce(new Error("disk full"));

    await expect(useSettingsStore.getState().setSetting("fontSize", 16, { throwOnError: true })).rejects.toThrow("disk full");
    expect(useSettingsStore.getState()).toMatchObject({
      saveStatus: "error",
      saveError: "disk full",
    });
  });

  it("does not let a concurrent successful write hide a failed write", async () => {
    let resolveSuccess!: () => void;
    execute
      .mockRejectedValueOnce(new Error("disk full"))
      .mockImplementationOnce(() => new Promise<void>((resolve) => { resolveSuccess = resolve; }));

    const failed = useSettingsStore.getState().setSetting("fontSize", 16, { throwOnError: true });
    const succeeded = useSettingsStore.getState().setSetting("tabSize", 4);
    await expect(failed).rejects.toThrow("disk full");
    resolveSuccess();
    await succeeded;

    expect(useSettingsStore.getState().saveStatus).toBe("error");
  });
});
