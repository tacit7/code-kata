import { describe, expect, it } from "vitest";
import { moduleBodyClass, moduleDetailsClass, moduleHeaderClass, moduleTitleClass } from "./module-accordion";

describe("module accordion classes", () => {
  it("does not wrap nested module groups in daisyUI collapse-content", () => {
    expect(moduleBodyClass(true)).not.toContain("collapse-content");
  });

  it("uses daisyUI collapse-content for leaf module tables", () => {
    expect(moduleBodyClass(false)).toContain("collapse-content");
  });

  it("makes nested submodules visually quieter than top-level modules", () => {
    expect(moduleDetailsClass(true)).toContain("ml-4");
    expect(moduleDetailsClass(true)).not.toContain("border-l-4");
    expect(moduleDetailsClass(true)).not.toContain("border-l-primary");
    expect(moduleDetailsClass(false)).toContain("shadow-md");

    expect(moduleHeaderClass(true)).toContain("bg-base-200/70");
    expect(moduleHeaderClass(false)).toContain("px-5");

    expect(moduleTitleClass(true)).toContain("text-base");
    expect(moduleTitleClass(false)).toContain("text-lg");
  });
});
