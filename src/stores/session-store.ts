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
  recordAttempt: (kataId: number, timeMs: number, passed: boolean, codeSnapshot: string) => Promise<void>;
  nextKata: () => void;
  prevKata: () => void;
  finishSession: (totalTimeMs: number) => Promise<void>;
  loadPresets: () => Promise<void>;
  savePreset: (name: string, kataIds: number[]) => Promise<void>;
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
  kata_id: number;
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

interface KataStats {
  kata_id: number;
  attempt_count: number;
  pass_count: number;
  avg_time_ms: number;
}

export async function selectRandomKatas(allKatas: Kata[], count: number): Promise<Kata[]> {
  if (allKatas.length === 0) return [];
  const actual = Math.min(count, allKatas.length);

  const db = await getDb();
  const kataIds = allKatas.map((k) => k.id);
  const placeholders = kataIds.map((_, i) => `$${i + 1}`).join(", ");

  const rows = await db.select<KataStats[]>(
    `SELECT kata_id,
            COUNT(*) as attempt_count,
            SUM(passed) as pass_count,
            AVG(time_ms) as avg_time_ms
     FROM attempts
     WHERE kata_id IN (${placeholders})
     GROUP BY kata_id`,
    kataIds,
  );

  const statsMap = new Map(rows.map((r) => [r.kata_id, r]));

  // Median time among high-pass-rate katas to split slow vs fast
  const highPassTimes: number[] = [];
  for (const r of rows) {
    const passRate = r.pass_count / r.attempt_count;
    if (passRate > 0.8 && r.avg_time_ms > 0) {
      highPassTimes.push(r.avg_time_ms);
    }
  }
  highPassTimes.sort((a, b) => a - b);
  const medianTime =
    highPassTimes.length > 0
      ? highPassTimes[Math.floor(highPassTimes.length / 2)]
      : Infinity;

  // Weight per kata: untried > struggling > moderate > slow-but-passing > mastered
  const weights = allKatas.map((k) => {
    const stats = statsMap.get(k.id);
    if (!stats || stats.attempt_count === 0) return 3;
    const passRate = stats.pass_count / stats.attempt_count;
    if (passRate < 0.5) return 2.5;
    if (passRate <= 0.8) return 1.5;
    if (stats.avg_time_ms > medianTime) return 1.2;
    return 0.5;
  });

  // Weighted random selection without replacement
  const selected: Kata[] = [];
  const remaining = allKatas.map((k, i) => ({ kata: k, weight: weights[i] }));

  for (let i = 0; i < actual; i++) {
    const totalWeight = remaining.reduce((sum, r) => sum + r.weight, 0);
    let rand = Math.random() * totalWeight;
    let pick = 0;
    for (let j = 0; j < remaining.length; j++) {
      rand -= remaining[j].weight;
      if (rand <= 0) {
        pick = j;
        break;
      }
    }
    selected.push(remaining[pick].kata);
    remaining.splice(pick, 1);
  }

  return selected;
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
      kataIds: JSON.parse(r.kata_ids) as number[],
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
