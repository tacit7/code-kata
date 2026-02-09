import Database from "@tauri-apps/plugin-sql";
import { sampleKatas } from "./sample-katas";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;
  db = await Database.load("sqlite:kata.db");
  await createSchema(db);
  await seedKatas(db);
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
      usage TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      total_time_ms INTEGER,
      kata_count INTEGER NOT NULL,
      pass_count INTEGER DEFAULT 0,
      preset_name TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER REFERENCES sessions(id),
      kata_id TEXT REFERENCES katas(id) NOT NULL,
      kata_index INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      time_ms INTEGER,
      passed INTEGER NOT NULL DEFAULT 0,
      code_snapshot TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      kata_ids TEXT NOT NULL
    )
  `);
}

async function seedKatas(db: Database) {
  const rows = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM katas"
  );
  if (rows[0].count > 0) return;

  for (const kata of sampleKatas) {
    await db.execute(
      `INSERT OR IGNORE INTO katas (id, name, category, language, difficulty, description, code, test_code, solution, usage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
        kata.usage,
      ]
    );
  }
}
