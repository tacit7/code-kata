import { type AppLanguage } from "./app-variant";
import { getDb } from "./database";
import type { Kata } from "../types/editor";

export type ScratchpadLanguage = AppLanguage;

let pendingSave: Promise<void> = Promise.resolve();

export function scratchpadKata(language: ScratchpadLanguage): Kata {
  return {
    id: language === "javascript" ? -2 : -1,
    name: "Scratchpad",
    language,
    category: "",
    difficulty: null,
    description: null,
    code: "",
    testCode: "",
    solution: null,
    usage: null,
    tags: [],
    isCustom: true,
  };
}

export async function loadScratchpad(language: string): Promise<string | null> {
  await pendingSave;
  const db = await getDb();
  const rows = await db.select<{ value: string }[]>(
    "SELECT value FROM settings WHERE key = $1",
    [`scratchpad:${language}`],
  );
  return rows[0]?.value ?? null;
}

export function saveScratchpad(language: string, code: string): Promise<void> {
  const save = pendingSave.then(async () => {
    const db = await getDb();
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)",
      [`scratchpad:${language}`, code],
    );
  });
  pendingSave = save.catch(() => undefined);
  return save;
}
