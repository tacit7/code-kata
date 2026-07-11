import { describe, it, expect } from "vitest";
import { unrecordedKataIndexes } from "./session-backfill";

describe("unrecordedKataIndexes", () => {
  it("returns the roster indexes with no attempt, in order", () => {
    expect(unrecordedKataIndexes(5, [0, 1, 3])).toEqual([2, 4]);
  });

  // Nothing passed: every kata is a fail. This is the case the whole feature
  // exists for — a session where you skipped everything still shows all katas.
  it("returns the whole roster when nothing was recorded", () => {
    expect(unrecordedKataIndexes(5, [])).toEqual([0, 1, 2, 3, 4]);
  });

  // Everything passed: no fail rows to add.
  it("returns nothing when every index is recorded", () => {
    expect(unrecordedKataIndexes(5, [0, 1, 2, 3, 4])).toEqual([]);
  });

  it("returns nothing for an empty roster", () => {
    expect(unrecordedKataIndexes(0, [])).toEqual([]);
  });

  // A double-finish or a corrupted row could list an index past the roster;
  // it must not create a phantom kata.
  it("ignores recorded indexes outside the roster", () => {
    expect(unrecordedKataIndexes(3, [0, 5, 7])).toEqual([1, 2]);
  });

  it("tolerates duplicate recorded indexes", () => {
    expect(unrecordedKataIndexes(3, [0, 0, 1])).toEqual([2]);
  });
});
