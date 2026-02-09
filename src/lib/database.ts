import Database from "@tauri-apps/plugin-sql";
import { sampleKatas } from "./sample-katas";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;
  db = await Database.load("sqlite:kata.db");
  await createSchema(db);
  await seedIfEmpty(db);
  return db;
}

async function createSchema(db: Database) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS katas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'arrays',
      language TEXT NOT NULL DEFAULT 'javascript',
      difficulty TEXT DEFAULT 'easy',
      description TEXT,
      code TEXT NOT NULL,
      test_code TEXT NOT NULL,
      solution TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function seedIfEmpty(db: Database) {
  const rows = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM katas"
  );
  if (rows[0].count > 0) return;

  for (const kata of sampleKatas) {
    await db.execute(
      `INSERT OR IGNORE INTO katas (id, name, category, language, difficulty, description, code, test_code, solution)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        kata.id,
        kata.name,
        kata.category,
        kata.language,
        kata.difficulty,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
      ]
    );
  }
}
