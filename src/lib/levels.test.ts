import { describe, it, expect } from "vitest";
import { LEVELS, levelsForKatas, visibleSelection, mergeSelection } from "./levels";

const kata = (category: string) => ({ category });

describe("levelsForKatas", () => {
  it("keeps only the levels the pool has katas for", () => {
    const levels = levelsForKatas([kata("arrays"), kata("trees")]);
    expect(levels.map((l) => l.level)).toEqual([1, 4]);
  });

  it("returns nothing for an empty pool", () => {
    expect(levelsForKatas([])).toEqual([]);
  });

  // A kata whose category is in no level (a custom kata, say) must not add a
  // level, and must not crash the lookup.
  it("ignores katas whose category maps to no level", () => {
    expect(levelsForKatas([kata("made-up")])).toEqual([]);
  });

  it("preserves LEVELS order regardless of pool order", () => {
    const levels = levelsForKatas([kata("trees"), kata("arrays"), kata("stack")]);
    expect(levels.map((l) => l.level)).toEqual([1, 2, 4]);
  });

  it("dedupes: many katas in one level yield one level", () => {
    const levels = levelsForKatas([kata("arrays"), kata("hashing"), kata("string")]);
    expect(levels.map((l) => l.level)).toEqual([1]);
  });

  it("a pool covering every category yields every level", () => {
    const all = LEVELS.flatMap((l) => l.categories.map(kata));
    expect(levelsForKatas(all).map((l) => l.level)).toEqual(LEVELS.map((l) => l.level));
  });
});

// Level 0 exists only in Ruby. Under JavaScript it is hidden, and a stored
// selection of it must neither filter the queue nor be destroyed.
describe("visibleSelection", () => {
  it("drops levels the current language cannot show", () => {
    expect([...visibleSelection([0, 1], new Set([1, 2]))]).toEqual([1]);
  });

  it("is empty when every stored level is hidden", () => {
    expect([...visibleSelection([0], new Set([1, 2]))]).toEqual([]);
  });

  it("passes a fully visible selection through", () => {
    expect([...visibleSelection([1, 2], new Set([1, 2]))]).toEqual([1, 2]);
  });
});

describe("mergeSelection", () => {
  it("keeps a hidden level when a visible one is toggled on", () => {
    expect(mergeSelection([0, 1], new Set([1, 2]), new Set([1, 2]))).toEqual([0, 1, 2]);
  });

  it("keeps a hidden level when the visible selection is cleared", () => {
    expect(mergeSelection([0, 1], new Set([1, 2]), new Set())).toEqual([0]);
  });

  it("drops a visible level that was toggled off", () => {
    expect(mergeSelection([1, 2], new Set([1, 2]), new Set([2]))).toEqual([2]);
  });

  it("never duplicates a level that is both stored and reselected", () => {
    expect(mergeSelection([1], new Set([1]), new Set([1]))).toEqual([1]);
  });

  it("returns a sorted list so the persisted value is stable", () => {
    expect(mergeSelection([8, 0], new Set([1, 8]), new Set([8, 1]))).toEqual([0, 1, 8]);
  });
});
