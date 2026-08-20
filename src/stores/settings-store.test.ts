import { describe, expect, it } from "vitest";
import { normalizeEditorLayout } from "./settings-store";

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
      vizSpeed: "100",
      maximizedPane: "terminal",
    })).toMatchObject({
      activeTestcaseIndex: 0,
      activeSolutionVariant: 4,
      vizSpeed: "500",
      maximizedPane: null,
    });
  });
});
