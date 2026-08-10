import { describe, expect, it } from "vitest";
import { moduleBodyClass } from "./module-accordion";

describe("module accordion classes", () => {
  it("does not wrap nested module groups in daisyUI collapse-content", () => {
    expect(moduleBodyClass(true)).not.toContain("collapse-content");
  });

  it("uses daisyUI collapse-content for leaf module tables", () => {
    expect(moduleBodyClass(false)).toContain("collapse-content");
  });
});
