import { DatabaseSync } from "node:sqlite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Kata } from "../types/editor";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  navigate: vi.fn(),
  editor: vi.fn((_props: unknown) => null),
}));
vi.mock("../lib/database", () => ({ getDb: async () => ({ execute: mocks.execute }) }));
// Server rendering otherwise reads Zustand's initial empty snapshot, not this test's session.
vi.mock("../stores/session-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../stores/session-store")>();
  return { ...actual, useSessionStore: Object.assign(() => actual.useSessionStore.getState(), actual.useSessionStore) };
});
vi.mock("../lib/dock-badge", () => ({ refreshDockBadge: vi.fn() }));
vi.mock("../components/kata-editor", () => ({ KataEditor: mocks.editor }));
vi.mock("react-router", () => ({
  useParams: () => ({ sessionId: "1" }),
  useNavigate: () => mocks.navigate,
  Navigate: () => null,
}));
vi.mock("../stores/kata-store", () => ({ useKataStore: (selector: (state: unknown) => unknown) => selector({ katas: [] }) }));
vi.mock("../stores/settings-store", () => ({ useSettingsStore: (selector: (state: unknown) => unknown) => selector({ sessionTimeLimitMs: 0 }) }));
vi.mock("../hooks/use-timer-tick", () => ({ useTimerTick: () => ({ kataElapsed: 1000, sessionElapsed: 1000 }) }));
vi.mock("../stores/timer-store", () => {
  const state = { kataStatus: "paused", kataElapsed: 1000, kataStartTime: null,
    resetKataTimer: vi.fn(), startKataTimer: vi.fn(), stopSessionTimer: () => 1000 };
  return { useTimerStore: Object.assign((selector: (value: typeof state) => unknown) => selector(state), { getState: () => state }) };
});

import { useSessionStore } from "../stores/session-store";
import { SessionPage } from "./session";

const kata: Kata = { id: 10, name: "Example", language: "javascript", category: "arrays",
  difficulty: "easy", description: null, code: "", testCode: "", solution: null,
  usage: null, tags: [], isCustom: false };
let sqlite: DatabaseSync;

beforeEach(async () => {
  vi.clearAllMocks();
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`CREATE TABLE sessions (id INTEGER PRIMARY KEY, session_type TEXT, started_at TEXT,
    finished_at TEXT, total_time_ms INTEGER, kata_count INTEGER, pass_count INTEGER,
    preset_name TEXT, max_test_runs INTEGER, kata_ids TEXT);
    CREATE TABLE attempts (id INTEGER PRIMARY KEY, session_id INTEGER, kata_id INTEGER,
    kata_index INTEGER, started_at TEXT, finished_at TEXT, time_ms INTEGER,
    passed INTEGER, code_snapshot TEXT);`);
  mocks.execute.mockImplementation(async (sql: string, params: unknown[] = []) => {
    const info = sqlite.prepare(sql.replace(/\$\d+/g, "?")).run(...params as never[]);
    return { lastInsertId: Number(info.lastInsertRowid), rowsAffected: Number(info.changes) };
  });
  useSessionStore.getState().clearSession();
  await useSessionStore.getState().startSession("daily", [kata], undefined, 3);
});
afterEach(() => sqlite.close());

describe("failed practice outcomes", () => {
  it("saves a failed test callback before an attempt-limit advance finishes the session", async () => {
    renderToStaticMarkup(createElement(SessionPage));
    const props = mocks.editor.mock.calls[0][0] as unknown as {
      onTestComplete: (passed: boolean, code: string) => Promise<void>;
      onAdvance: () => void;
    };
    await props.onTestComplete(false, "broken code");
    expect(useSessionStore.getState().attempts).toMatchObject([
      { kataId: kata.id, passed: false, codeSnapshot: "broken code" },
    ]);
    props.onAdvance();
    await vi.waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/session/1/results"));
    expect(sqlite.prepare("SELECT passed, code_snapshot FROM attempts").all())
      .toEqual([{ passed: 0, code_snapshot: "broken code" }]);
  });

  it("keeps one outcome per kata when failures are retried and then pass", async () => {
    const record = useSessionStore.getState().recordAttempt;
    await record(kata.id, 1000, false, "first failure");
    await record(kata.id, 2000, false, "second failure");
    await record(kata.id, 3000, true, "passing code");
    expect(useSessionStore.getState().attempts).toMatchObject([
      { passed: true, timeMs: 3000, codeSnapshot: "passing code" },
    ]);
    expect(useSessionStore.getState().attempts).toHaveLength(1);
    expect(sqlite.prepare("SELECT passed, code_snapshot FROM attempts").all())
      .toEqual([{ passed: 1, code_snapshot: "passing code" }]);
    expect(sqlite.prepare("SELECT pass_count FROM sessions").get()?.pass_count).toBe(1);
  });

  it("leaves a kata skipped when the session finishes without any test run", async () => {
    renderToStaticMarkup(createElement(SessionPage));
    const props = mocks.editor.mock.calls[0][0] as { onAdvance: () => void };
    props.onAdvance();
    await vi.waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
    expect(sqlite.prepare("SELECT * FROM attempts").all()).toEqual([]);
  });

  it("does not downgrade or double-count a previously passed kata", async () => {
    const record = useSessionStore.getState().recordAttempt;
    await record(kata.id, 1000, true, "passing code");
    await record(kata.id, 2000, false, "later failure");
    await record(kata.id, 3000, true, "another pass");
    expect(useSessionStore.getState().attempts).toHaveLength(1);
    expect(useSessionStore.getState().attempts[0].codeSnapshot).toBe("passing code");
    expect(sqlite.prepare("SELECT pass_count FROM sessions").get()?.pass_count).toBe(1);
  });
});
