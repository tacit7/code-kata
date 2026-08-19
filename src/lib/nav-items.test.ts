import { describe, it, expect } from "vitest";
import { NAV_ITEMS, activeNavPath } from "../lib/nav-items";

describe("activeNavPath", () => {
  it("highlights the tab whose path you are on", () => {
    expect(activeNavPath("/dashboard")).toBe("/dashboard");
    expect(activeNavPath("/practice")).toBe("/practice");
    expect(activeNavPath("/problems")).toBe("/problems");
    expect(activeNavPath("/modules")).toBe("/modules");
    expect(activeNavPath("/results")).toBe("/results");
    expect(activeNavPath("/settings")).toBe("/settings");
  });

  it("places Modules next to Problems in the nav", () => {
    expect(NAV_ITEMS.map((item) => item.path)).toEqual([
      "/dashboard",
      "/practice",
      "/problems",
      "/modules",
      "/results",
      "/settings",
    ]);
  });

  it("keeps Problems lit while a session is running", () => {
    expect(activeNavPath("/session/12")).toBe("/problems");
  });

  // The page a practice session ends on. It used to light up Problems, because
  // Problems matched any /session path.
  it("lights up Results on the page a session ends on", () => {
    expect(activeNavPath("/session/12/results")).toBe("/results");
    expect(activeNavPath("/session/abc/results")).toBe("/results");
  });

  it("does not treat a deeper session path as the results page", () => {
    expect(activeNavPath("/session/12/results/extra")).toBe("/problems");
  });

  it("returns null for a path with no tab", () => {
    expect(activeNavPath("/editor/3")).toBeNull();
    expect(activeNavPath("/kata/new")).toBeNull();
  });
});
