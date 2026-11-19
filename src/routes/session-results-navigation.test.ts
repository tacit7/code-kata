import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("session results navigation", () => {
  const source = readFileSync(new URL("./session-results.tsx", import.meta.url), "utf8");

  it("opens result problem names in the editor", () => {
    expect(source).toContain("onClick={() => navigate(`/editor/${kata.id}`)}");
    expect(source).toContain("hover:text-primary hover:underline");
  });
});
