import { describe, expect, it } from "vitest";
import {
  DEFAULT_UI_SCALE,
  formatUiScale,
  nextUiScale,
  normalizeUiScale,
  previousUiScale,
} from "./ui-scale";

describe("ui-scale", () => {
  it("normalizes unknown values to the default scale", () => {
    expect(normalizeUiScale("100%")).toBe(DEFAULT_UI_SCALE);
    expect(normalizeUiScale(1.2)).toBe(DEFAULT_UI_SCALE);
    expect(normalizeUiScale(null)).toBe(DEFAULT_UI_SCALE);
  });

  it("steps through the supported scale values", () => {
    expect(nextUiScale(1)).toBe(1.1);
    expect(nextUiScale(1.5)).toBe(1.5);
    expect(previousUiScale(1)).toBe(0.9);
    expect(previousUiScale(0.9)).toBe(0.9);
  });

  it("formats scale values as percentages", () => {
    expect(formatUiScale(1)).toBe("100%");
    expect(formatUiScale(1.25)).toBe("125%");
  });
});
