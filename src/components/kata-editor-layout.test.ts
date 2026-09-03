import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("kata editor layout persistence", () => {
  it("persists the actual bottom-panel visibility", () => {
    const source = readFileSync(join(__dirname, "kata-editor.tsx"), "utf8");

    expect(source).toContain("outputPaneVisible: bottomPanelVisible");
  });
});
