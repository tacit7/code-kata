import { describe, expect, it } from "vitest";
import { isTemplateSearch, templateSearchValue } from "./command-palette";

describe("command palette search parsing", () => {
  it("treats cs as the cheatsheet template search prefix", () => {
    expect(isTemplateSearch("cs")).toBe(true);
    expect(isTemplateSearch("cs sliding")).toBe(true);
    expect(isTemplateSearch("  cs   dfs  ")).toBe(true);
  });

  it("does not treat unrelated words as template search", () => {
    expect(isTemplateSearch("sc")).toBe(false);
    expect(isTemplateSearch("search")).toBe(false);
    expect(isTemplateSearch("scale")).toBe(false);
    expect(isTemplateSearch("new kata")).toBe(false);
  });

  it("removes only the cs prefix from template searches", () => {
    expect(templateSearchValue("cs")).toBe("");
    expect(templateSearchValue("cs sliding window")).toBe("sliding window");
    expect(templateSearchValue("  cs   dfs  ")).toBe("dfs");
  });
});
