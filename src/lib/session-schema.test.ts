import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { migrateSessionSchema } from "./session-schema";

describe("session schema upgrades", () => {
  it("upgrades an existing database twice without losing sessions or presets", async () => {
    const sqlite = new DatabaseSync(":memory:");
    try {
      sqlite.exec("CREATE TABLE sessions (id INTEGER PRIMARY KEY, started_at TEXT); INSERT INTO sessions VALUES (7, '2026-01-01')");
      const db = { execute: async (sql: string) => sqlite.exec(sql) };
      await migrateSessionSchema(db);
      sqlite.exec(`UPDATE sessions SET max_test_runs = 3, kata_ids = '[4,2,9]' WHERE id = 7;
        INSERT INTO practice_presets(name, config) VALUES ('Daily', '{"count":3}')`);
      await migrateSessionSchema(db);
      expect({ ...sqlite.prepare("SELECT * FROM sessions").get() }).toEqual({
        id: 7, started_at: "2026-01-01", max_test_runs: 3, kata_ids: "[4,2,9]",
      });
      expect(sqlite.prepare("SELECT name FROM practice_presets").get()?.name).toBe("Daily");
    } finally {
      sqlite.close();
    }
  });

  it("surfaces migration failures unrelated to an existing column", async () => {
    await expect(migrateSessionSchema({ execute: async () => { throw new Error("disk is full"); } }))
      .rejects.toThrow("disk is full");
  });
});
