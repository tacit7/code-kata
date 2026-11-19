import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ select: vi.fn() }));
vi.mock("./database", () => ({ getDb: async () => ({ select: mocks.select }) }));
import { loadSessionResults } from "./session-results";
import { useDashboardStore } from "../stores/dashboard-store";
let sqlite: DatabaseSync;
beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`CREATE TABLE sessions (id INTEGER PRIMARY KEY, session_type TEXT, started_at TEXT,
    finished_at TEXT, total_time_ms INTEGER, kata_count INTEGER, pass_count INTEGER,
    preset_name TEXT, max_test_runs INTEGER, kata_ids TEXT);
    CREATE TABLE attempts (id INTEGER PRIMARY KEY, session_id INTEGER, kata_id INTEGER,
      kata_index INTEGER, started_at TEXT, finished_at TEXT, time_ms INTEGER, passed INTEGER, code_snapshot TEXT);
    CREATE TABLE katas (id INTEGER PRIMARY KEY, name TEXT, category TEXT, language TEXT, difficulty TEXT,
      description TEXT, code TEXT, test_code TEXT, solution TEXT, solution_variants TEXT,
      usage TEXT, tags TEXT, is_custom INTEGER, leetcode_number INTEGER);
    INSERT INTO sessions VALUES (82, 'daily', '2026-11-19T09:00:00Z', '2026-11-19T09:05:00Z', 300000, 3, 1, NULL, 3, '[2,1,3]');
    INSERT INTO sessions VALUES (99, 'daily', '2026-11-19T10:00:00Z', NULL, NULL, 1, 0, NULL, 3, '[1]');
    INSERT INTO katas VALUES (1, 'Skipped problem', 'arrays', 'javascript', 'easy', NULL, '', '', '', '[]', NULL, '[]', 0, NULL);
    INSERT INTO katas VALUES (2, 'Passed problem', 'arrays', 'python', 'easy', NULL, '', '', '', '[]', NULL, '["example"]', 0, 1);
    INSERT INTO katas VALUES (3, 'Failed problem', 'arrays', 'javascript', 'easy', NULL, '', '', '', '[]', NULL, '[]', 0, NULL);
    INSERT INTO attempts VALUES (1, 82, 2, 0, 'start', 'end', 1000, 1, 'passed code');
    INSERT INTO attempts VALUES (2, 82, 3, 2, 'start', 'end', 2000, 0, 'failed code');`);
  mocks.select.mockImplementation(async (sql: string, params: unknown[] = []) =>
    sqlite.prepare(sql.replace(/\$\d+/g, "?")).all(...params as never[]));
});
afterEach(() => sqlite.close());

describe("historical session results", () => {
  it("loads the requested session with its full ordered roster across languages", async () => {
    const result = await loadSessionResults(82);
    expect(result?.session).toMatchObject({ id: 82, passCount: 1, kataIds: [2, 1, 3] });
    expect(result?.katas.map((kata) => kata.name)).toEqual(["Passed problem", "Skipped problem", "Failed problem"]);
    expect(result?.katas[0]).toMatchObject({ language: "python", tags: ["example"], isCustom: false, leetcodeNumber: 1 });
    expect(result?.attempts).toMatchObject([{ kataIndex: 0, passed: true }, { kataIndex: 2, passed: false }]);
    expect(sqlite.prepare("SELECT finished_at FROM sessions WHERE id=99").get()?.finished_at).toBeNull();
  });
  it("shows the full roster in the Results overview, including skipped problems", async () => {
    await useDashboardStore.getState().loadDrillDown(82);
    const rows = useDashboardStore.getState().drillDown!;
    expect(rows.map((row) => row.kataName)).toEqual(["Passed problem", "Skipped problem", "Failed problem"]);
    expect(rows.map((row) => row.passed)).toEqual([1, null, 0]);
  });

  it("returns null for a session that does not exist", async () => {
    expect(await loadSessionResults(100)).toBeNull();
  });
  it("supports older sessions with no stored roster", async () => {
    sqlite.exec("UPDATE sessions SET kata_ids = NULL WHERE id=82");
    expect((await loadSessionResults(82))?.katas.map((kata) => kata.id)).toEqual([2, 3]);
    await useDashboardStore.getState().loadDrillDown(82);
    expect(useDashboardStore.getState().drillDown?.map((row) => row.passed)).toEqual([1, 0]);
  });
});
