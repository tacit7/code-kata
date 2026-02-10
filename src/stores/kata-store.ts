import { create } from "zustand";
import type { Kata } from "../types/editor";
import { getDb } from "../lib/database";

interface KataRow {
  id: number;
  name: string;
  category: string;
  language: string;
  difficulty: string | null;
  description: string | null;
  code: string;
  test_code: string;
  solution: string | null;
  usage: string | null;
  tags: string | null;
}

interface BestTimeRow {
  kata_id: number;
  best_time: number;
}

interface AttemptRow {
  kata_id: number;
  passed: number;
}

interface KataState {
  katas: Kata[];
  bestTimes: Record<number, number>;
  streaks: Record<number, number>;
  loading: boolean;
  error: string | null;
  loadKatas: (language?: string) => Promise<void>;
}

export const useKataStore = create<KataState>((set) => ({
  katas: [],
  bestTimes: {},
  streaks: {},
  loading: true,
  error: null,

  loadKatas: async (language = "javascript") => {
    try {
      const { katas: current } = useKataStore.getState();
      // Only show loading spinner on initial load, not on language switches
      if (current.length === 0) {
        set({ loading: true, error: null });
      }
      const db = await getDb();
      const rows = await db.select<KataRow[]>(
        "SELECT * FROM katas WHERE language = $1",
        [language],
      );
      const katas: Kata[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        language: row.language,
        difficulty: row.difficulty,
        description: row.description,
        code: row.code,
        testCode: row.test_code,
        solution: row.solution,
        usage: row.usage,
        tags: row.tags ? JSON.parse(row.tags) as string[] : [],
      }));
      const bestRows = await db.select<BestTimeRow[]>(
        `SELECT kata_id, MIN(time_ms) as best_time
         FROM attempts
         WHERE passed = 1 AND time_ms IS NOT NULL
           AND kata_id IN (SELECT id FROM katas WHERE language = $1)
         GROUP BY kata_id`,
        [language],
      );
      const bestTimes: Record<number, number> = {};
      for (const row of bestRows) {
        bestTimes[row.kata_id] = row.best_time;
      }

      const attemptRows = await db.select<AttemptRow[]>(
        `SELECT kata_id, passed
         FROM attempts
         WHERE kata_id IN (SELECT id FROM katas WHERE language = $1)
         ORDER BY kata_id, id DESC`,
        [language],
      );
      const streaks: Record<number, number> = {};
      let currentKataId: number | null = null;
      let counting = true;
      for (const row of attemptRows) {
        if (row.kata_id !== currentKataId) {
          currentKataId = row.kata_id;
          counting = true;
          streaks[row.kata_id] = 0;
        }
        if (counting) {
          if (row.passed === 1) {
            streaks[row.kata_id]++;
          } else {
            counting = false;
          }
        }
      }

      set({ katas, bestTimes, streaks, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
}));
