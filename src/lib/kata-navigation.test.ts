import { describe, it, expect } from "vitest";
import { resolveKataNavigation } from "./kata-navigation";

const ALL = new Set([1, 2, 3, 4]);

function browse(currentKataId: number, browseOrder: number[], available = ALL) {
  return resolveKataNavigation({
    mode: "browse",
    currentKataId,
    currentIndex: 0,
    sessionKataIds: [],
    browseOrder,
    availableKataIds: available,
  });
}

function session(currentIndex: number, sessionKataIds: number[]) {
  return resolveKataNavigation({
    mode: "session",
    currentKataId: sessionKataIds[currentIndex] ?? -1,
    currentIndex,
    sessionKataIds,
    browseOrder: [],
    availableKataIds: ALL,
  });
}

describe("browse mode", () => {
  it("steps the list in both directions", () => {
    const r = browse(2, [1, 2, 3]);
    expect(r).toMatchObject({ prevId: 1, nextId: 3, hasPrev: true, hasNext: true });
  });

  it("clamps at the first item", () => {
    const r = browse(1, [1, 2, 3]);
    expect(r.hasPrev).toBe(false);
    expect(r.prevId).toBeUndefined();
    expect(r.nextId).toBe(2);
  });

  it("clamps at the last item", () => {
    const r = browse(3, [1, 2, 3]);
    expect(r.hasNext).toBe(false);
    expect(r.nextId).toBeUndefined();
  });

  it("has no neighbours in a single-item list", () => {
    expect(browse(1, [1])).toMatchObject({ hasPrev: false, hasNext: false });
  });

  it("has no neighbours when the list is empty (cold open)", () => {
    expect(browse(1, [])).toMatchObject({ hasPrev: false, hasNext: false });
  });

  // The indexOf === -1 case: the kata was opened without visiting the list.
  it("does not throw when the current kata is absent from the order", () => {
    expect(browse(99, [1, 2, 3])).toMatchObject({ hasPrev: false, hasNext: false });
  });

  // loadKatas(language) replaces the store list wholesale; deleteKata removes
  // custom katas. browseOrder is a snapshot and goes stale.
  it("skips ids that no longer exist rather than returning them", () => {
    const available = new Set([1, 4]);
    const r = browse(1, [1, 2, 3, 4], available);
    expect(r.nextId).toBe(4);
  });

  it("has no neighbours when every other id is stale", () => {
    const available = new Set([2]);
    expect(browse(2, [1, 2, 3], available)).toMatchObject({ hasPrev: false, hasNext: false });
  });

  it("is unreachable when the current kata itself is stale", () => {
    const available = new Set([1, 3]);
    expect(browse(2, [1, 2, 3], available)).toMatchObject({ hasPrev: false, hasNext: false });
  });
});

describe("session mode", () => {
  it("steps the queue by index", () => {
    const r = session(1, [10, 20, 30]);
    expect(r).toMatchObject({ prevIndex: 0, nextIndex: 2, hasPrev: true, hasNext: true });
  });

  it("clamps at the first kata", () => {
    expect(session(0, [10, 20])).toMatchObject({ hasPrev: false, hasNext: true });
  });

  // The old behaviour finished the session here. It must now be a no-op.
  it("clamps at the last kata instead of finishing the session", () => {
    const r = session(1, [10, 20]);
    expect(r.hasNext).toBe(false);
    expect(r.nextIndex).toBeUndefined();
  });

  it("never resolves an index outside the queue", () => {
    expect(session(5, [10, 20])).toMatchObject({ hasPrev: false, hasNext: false });
    expect(session(-1, [10, 20])).toMatchObject({ hasPrev: false, hasNext: false });
  });

  it("ignores browseOrder and availability entirely", () => {
    const r = resolveKataNavigation({
      mode: "session",
      currentKataId: 20,
      currentIndex: 1,
      sessionKataIds: [10, 20, 30],
      browseOrder: [99],
      availableKataIds: new Set<number>(),
    });
    expect(r).toMatchObject({ prevIndex: 0, nextIndex: 2 });
  });

  it("returns no ids in session mode", () => {
    const r = session(1, [10, 20, 30]);
    expect(r.nextId).toBeUndefined();
    expect(r.prevId).toBeUndefined();
  });
});
