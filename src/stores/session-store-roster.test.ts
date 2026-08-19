import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("session-store roster persistence", () => {
  const src = () => readFileSync(join(__dirname, "session-store.ts"), "utf8");

  it("persists the full kata roster when a session starts", () => {
    expect(src()).toContain("ALTER TABLE sessions ADD COLUMN kata_ids TEXT");
    expect(src()).toContain("JSON.stringify(katas.map((k) => k.id))");
  });

  it("rebuilds sessionKatas from the persisted roster before falling back to attempts", () => {
    expect(src()).toContain("session.kataIds");
    expect(src()).toContain("row.kata_ids ? JSON.parse(row.kata_ids)");
  });
});
