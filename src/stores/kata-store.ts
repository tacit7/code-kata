import { create } from "zustand";
import type { Kata } from "../types/editor";
import { getDb } from "../lib/database";

interface KataRow {
  id: string;
  name: string;
  category: string;
  language: string;
  difficulty: string | null;
  description: string | null;
  code: string;
  test_code: string;
  solution: string | null;
}

interface KataState {
  katas: Kata[];
  loading: boolean;
  error: string | null;
  loadKatas: () => Promise<void>;
}

export const useKataStore = create<KataState>((set) => ({
  katas: [],
  loading: true,
  error: null,

  loadKatas: async () => {
    try {
      set({ loading: true, error: null });
      const db = await getDb();
      const rows = await db.select<KataRow[]>("SELECT * FROM katas");
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
      }));
      set({ katas, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
}));
