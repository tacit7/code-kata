import { create } from "zustand";
import type { Kata, Session, Attempt, Preset, SessionType } from "../types/editor";
import { getDb } from "../lib/database";

interface SessionState {
  activeSession: Session | null;
  sessionKatas: Kata[];
  currentIndex: number;
  attempts: Attempt[];
  presets: Preset[];

  startSession: (type: SessionType, katas: Kata[], presetName?: string) => Promise<number>;
  recordAttempt: (kataId: string, timeMs: number, passed: boolean, codeSnapshot: string) => Promise<void>;
  nextKata: () => void;
  prevKata: () => void;
  finishSession: (totalTimeMs: number) => Promise<void>;
  loadPresets: () => Promise<void>;
  savePreset: (name: string, kataIds: string[]) => Promise<void>;
  deletePreset: (id: number) => Promise<void>;
  loadSession: (sessionId: number, allKatas: Kata[]) => Promise<void>;
  clearSession: () => void;
}

interface SessionRow {
  id: number;
  session_type: string;
  started_at: string;
  finished_at: string | null;
  total_time_ms: number | null;
  kata_count: number;
  pass_count: number;
  preset_name: string | null;
}

interface AttemptRow {
  id: number;
  session_id: number;
  kata_id: string;
  kata_index: number;
  started_at: string;
  finished_at: string | null;
  time_ms: number | null;
  passed: number;
  code_snapshot: string | null;
}

interface PresetRow {
  id: number;
  name: string;
  kata_ids: string;
}

function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    sessionType: row.session_type as SessionType,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    totalTimeMs: row.total_time_ms,
    kataCount: row.kata_count,
    passCount: row.pass_count,
    presetName: row.preset_name,
  };
}

function rowToAttempt(row: AttemptRow): Attempt {
  return {
    id: row.id,
    sessionId: row.session_id,
    kataId: row.kata_id,
    kataIndex: row.kata_index,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    timeMs: row.time_ms,
    passed: row.passed === 1,
    codeSnapshot: row.code_snapshot,
  };
}

export function selectDailyKatas(allKatas: Kata[], attemptRows: AttemptRow[], count: number): Kata[] {
  const attemptedIds = new Set(attemptRows.map((a) => a.kata_id));
  const passedIds = new Set(attemptRows.filter((a) => a.passed === 1).map((a) => a.kata_id));

  // Latest attempt time per kata
  const latestAttempt = new Map<string, string>();
  for (const a of attemptRows) {
    const prev = latestAttempt.get(a.kata_id);
    if (!prev || a.started_at > prev) {
      latestAttempt.set(a.kata_id, a.started_at);
    }
  }

  // Best time per kata (passed only)
  const bestTime = new Map<string, number>();
  for (const a of attemptRows) {
    if (a.passed === 1 && a.time_ms != null) {
      const prev = bestTime.get(a.kata_id);
      if (prev == null || a.time_ms > prev) {
        bestTime.set(a.kata_id, a.time_ms);
      }
    }
  }

  const sorted = [...allKatas].sort((a, b) => {
    const aAttempted = attemptedIds.has(a.id);
    const bAttempted = attemptedIds.has(b.id);
    if (!aAttempted && bAttempted) return -1;
    if (aAttempted && !bAttempted) return 1;

    const aPassed = passedIds.has(a.id);
    const bPassed = passedIds.has(b.id);
    if (!aPassed && bPassed) return -1;
    if (aPassed && !bPassed) return 1;

    // Oldest attempted first
    const aTime = latestAttempt.get(a.id) ?? "";
    const bTime = latestAttempt.get(b.id) ?? "";
    if (aTime !== bTime) return aTime < bTime ? -1 : 1;

    // Slowest first
    const aBest = bestTime.get(a.id) ?? 0;
    const bBest = bestTime.get(b.id) ?? 0;
    return bBest - aBest;
  });

  return sorted.slice(0, count);
}

export function selectRandomKatas(allKatas: Kata[], count: number): Kata[] {
  const shuffled = [...allKatas];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  sessionKatas: [],
  currentIndex: 0,
  attempts: [],
  presets: [],

  startSession: async (type, katas, presetName) => {
    const db = await getDb();
    const now = new Date().toISOString();
    const result = await db.execute(
      `INSERT INTO sessions (session_type, started_at, kata_count, pass_count, preset_name)
       VALUES ($1, $2, $3, 0, $4)`,
      [type, now, katas.length, presetName ?? null],
    );
    const sessionId = result.lastInsertId as number;
    const session: Session = {
      id: sessionId,
      sessionType: type,
      startedAt: now,
      finishedAt: null,
      totalTimeMs: null,
      kataCount: katas.length,
      passCount: 0,
      presetName: presetName ?? null,
    };
    set({ activeSession: session, sessionKatas: katas, currentIndex: 0, attempts: [] });
    return sessionId;
  },

  recordAttempt: async (kataId, timeMs, passed, codeSnapshot) => {
    const { activeSession, currentIndex, attempts } = get();
    if (!activeSession) return;

    const db = await getDb();
    const now = new Date().toISOString();
    const startedAt = new Date(Date.now() - timeMs).toISOString();
    const result = await db.execute(
      `INSERT INTO attempts (session_id, kata_id, kata_index, started_at, finished_at, time_ms, passed, code_snapshot)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [activeSession.id, kataId, currentIndex, startedAt, now, timeMs, passed ? 1 : 0, codeSnapshot],
    );

    const attempt: Attempt = {
      id: result.lastInsertId as number,
      sessionId: activeSession.id,
      kataId,
      kataIndex: currentIndex,
      startedAt,
      finishedAt: now,
      timeMs,
      passed,
      codeSnapshot,
    };

    const newAttempts = [...attempts, attempt];
    const newPassCount = passed ? activeSession.passCount + 1 : activeSession.passCount;

    if (passed) {
      await db.execute(`UPDATE sessions SET pass_count = $1 WHERE id = $2`, [
        newPassCount,
        activeSession.id,
      ]);
    }

    set({
      attempts: newAttempts,
      activeSession: { ...activeSession, passCount: newPassCount },
    });
  },

  nextKata: () => {
    const { currentIndex, sessionKatas } = get();
    if (currentIndex < sessionKatas.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevKata: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  finishSession: async (totalTimeMs) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const db = await getDb();
    const now = new Date().toISOString();
    await db.execute(
      `UPDATE sessions SET finished_at = $1, total_time_ms = $2 WHERE id = $3`,
      [now, totalTimeMs, activeSession.id],
    );

    set({
      activeSession: { ...activeSession, finishedAt: now, totalTimeMs },
    });
  },

  loadSession: async (sessionId, allKatas) => {
    const db = await getDb();
    const sessionRows = await db.select<SessionRow[]>(
      `SELECT * FROM sessions WHERE id = $1`,
      [sessionId],
    );
    if (sessionRows.length === 0) return;

    const session = rowToSession(sessionRows[0]);
    const attemptRows = await db.select<AttemptRow[]>(
      `SELECT * FROM attempts WHERE session_id = $1 ORDER BY kata_index`,
      [sessionId],
    );
    const attempts = attemptRows.map(rowToAttempt);

    // Reconstruct kata list from attempts
    const kataMap = new Map(allKatas.map((k) => [k.id, k]));
    const kataIds = attemptRows.map((a) => a.kata_id);
    const uniqueIds = [...new Set(kataIds)];
    const sessionKatas = uniqueIds.map((id) => kataMap.get(id)).filter(Boolean) as Kata[];

    set({ activeSession: session, sessionKatas, attempts, currentIndex: 0 });
  },

  loadPresets: async () => {
    const db = await getDb();
    const rows = await db.select<PresetRow[]>(`SELECT * FROM presets ORDER BY name`);
    const presets: Preset[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      kataIds: JSON.parse(r.kata_ids) as string[],
    }));
    set({ presets });
  },

  savePreset: async (name, kataIds) => {
    const db = await getDb();
    await db.execute(
      `INSERT OR REPLACE INTO presets (name, kata_ids) VALUES ($1, $2)`,
      [name, JSON.stringify(kataIds)],
    );
    await get().loadPresets();
  },

  deletePreset: async (id) => {
    const db = await getDb();
    await db.execute(`DELETE FROM presets WHERE id = $1`, [id]);
    await get().loadPresets();
  },

  clearSession: () => {
    set({ activeSession: null, sessionKatas: [], currentIndex: 0, attempts: [] });
  },
}));
