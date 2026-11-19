import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("session-store roster persistence", () => {
  const src = () => readFileSync(join(__dirname, "session-store.ts"), "utf8");

  it("persists the full kata roster when a session starts", () => {
    expect(src()).toContain("JSON.stringify(katas.map((k) => k.id))");
    expect(src()).toContain("INSERT INTO sessions (session_type, started_at, kata_count, pass_count, preset_name, max_test_runs, kata_ids)");
  });

  it("rebuilds sessionKatas from the persisted roster before falling back to attempts", () => {
    expect(src()).toContain("session.kataIds");
    expect(src()).toContain("row.kata_ids ? JSON.parse(row.kata_ids)");
  });

  it("does not create failed attempt rows for skipped roster items", () => {
    expect(src()).not.toContain("unrecordedKataIndexes");
    expect(src()).not.toContain("backfilled");
  });
});
