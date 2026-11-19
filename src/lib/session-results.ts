import { getDb } from "./database";
import type { Attempt, Kata, Session } from "../types/editor";

type SessionRow = Omit<Session, "kataIds"> & { kataIds: string | null };
type AttemptRow = Omit<Attempt, "passed"> & { passed: number };
type KataRow = Omit<Kata, "tags" | "isCustom" | "solutionVariants"> & {
  tags: string | null;
  isCustom: number;
  solutionVariants: string | null;
};

export interface SessionResultsData {
  session: Session;
  katas: Kata[];
  attempts: Attempt[];
}

/** Read historical results without replacing the running practice session or language. */
export async function loadSessionResults(sessionId: number): Promise<SessionResultsData | null> {
  const db = await getDb();
  const rows = await db.select<SessionRow[]>(
    `SELECT id, session_type AS sessionType, started_at AS startedAt, finished_at AS finishedAt,
      total_time_ms AS totalTimeMs, kata_count AS kataCount, pass_count AS passCount,
      preset_name AS presetName, max_test_runs AS maxTestRuns, kata_ids AS kataIds
     FROM sessions WHERE id = $1`, [sessionId],
  );
  if (!rows.length) return null;
  const row = rows[0];
  const attempts = (await db.select<AttemptRow[]>(
    `SELECT id, session_id AS sessionId, kata_id AS kataId, kata_index AS kataIndex,
      started_at AS startedAt, finished_at AS finishedAt, time_ms AS timeMs,
      passed, code_snapshot AS codeSnapshot FROM attempts
     WHERE session_id = $1 ORDER BY kata_index`, [sessionId],
  )).map((attempt) => ({ ...attempt, passed: attempt.passed === 1 }));
  const kataIds: number[] | null = row.kataIds ? JSON.parse(row.kataIds) : null;
  if (kataIds && (!Array.isArray(kataIds) || kataIds.some((id) => !Number.isSafeInteger(id) || id <= 0))) {
    throw new Error("Session has an invalid problem roster.");
  }
  const roster = kataIds?.length ? kataIds : attempts.map((attempt) => attempt.kataId);
  const kataRows = roster.length ? await db.select<KataRow[]>(
    `SELECT id, name, category, language, difficulty, description, code, test_code AS testCode,
      solution, solution_variants AS solutionVariants, usage, tags, is_custom AS isCustom,
      leetcode_number AS leetcodeNumber FROM katas
     WHERE id IN (${roster.map((_, index) => `$${index + 1}`).join(", ")})`, roster,
  ) : [];
  const byId = new Map(kataRows.map((kata): [number, Kata] => [kata.id, {
    ...kata, tags: kata.tags ? JSON.parse(kata.tags) : [], isCustom: kata.isCustom === 1,
    solutionVariants: kata.solutionVariants ? JSON.parse(kata.solutionVariants) : null,
  }]));
  return {
    session: { ...row, kataIds },
    katas: roster.flatMap((id) => byId.has(id) ? [byId.get(id)!] : []),
    attempts,
  };
}
