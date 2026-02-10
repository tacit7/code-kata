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
}

interface KataState {
  katas: Kata[];
  loading: boolean;
  error: string | null;
  loadKatas: (language?: string) => Promise<void>;
}

export const useKataStore = create<KataState>((set) => ({
  katas: [],
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
      }));
      set({ katas, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
}));
