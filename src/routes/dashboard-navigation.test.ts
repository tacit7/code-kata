import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("dashboard navigation", () => {
  const source = readFileSync(new URL("./dashboard.tsx", import.meta.url), "utf8");

  it("opens review queue rows in the editor", () => {
    expect(source).toContain("navigate(`/editor/${kataId}`)");
    expect(source).toContain("onClick={() => void openProblem(row.kataId, row.language)}");
  });
});
