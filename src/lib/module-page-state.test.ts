import { describe, expect, it } from "vitest";
import { OPEN_MODULES_PARAM, parseOpenModuleIds, sameOpenModuleIds, serializeOpenModuleIds, withOpenModuleIds } from "./module-page-state";

describe("module page state", () => {
  it("parses open module ids from a query param", () => {
    expect(Array.from(parseOpenModuleIds("dynamic-programming,dp-foundations,trees"))).toEqual([
      "dynamic-programming",
      "dp-foundations",
      "trees",
    ]);
  });

  it("ignores empty ids while serializing", () => {
    expect(serializeOpenModuleIds(["trees", "", "trees", "dynamic-programming"])).toBe("trees,dynamic-programming");
  });

  it("updates the open query param without dropping unrelated params", () => {
    const params = new URLSearchParams("q=dp");
    const next = withOpenModuleIds(params, ["dynamic-programming", "dp-foundations"]);

    expect(next.get("q")).toBe("dp");
    expect(next.get(OPEN_MODULES_PARAM)).toBe("dynamic-programming,dp-foundations");
  });

  it("removes the open query param when no modules are expanded", () => {
    const params = new URLSearchParams("q=dp&open=trees");
    const next = withOpenModuleIds(params, []);

    expect(next.get("q")).toBe("dp");
    expect(next.has(OPEN_MODULES_PARAM)).toBe(false);
  });

  it("compares open module sets by value", () => {
    expect(sameOpenModuleIds(new Set(["a", "b"]), new Set(["b", "a"]))).toBe(true);
    expect(sameOpenModuleIds(new Set(["a"]), new Set(["a", "b"]))).toBe(false);
  });
});
