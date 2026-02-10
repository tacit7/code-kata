import Database from "@tauri-apps/plugin-sql";
import type { SeedKata } from "../types/editor";
import { sampleKatas } from "./sample-katas";
import { sampleKatasPython } from "./sample-katas-python";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;
  db = await Database.load("sqlite:kata.db");
  await createSchema(db);
  await seedKatas(db);
  await migrateTagsIfEmpty(db);
  return db;
}

async function createSchema(db: Database) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS katas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'arrays',
      language TEXT NOT NULL DEFAULT 'javascript',
      difficulty TEXT DEFAULT 'easy',
      description TEXT,
      code TEXT NOT NULL,
      test_code TEXT NOT NULL,
      solution TEXT,
      usage TEXT,
      tags TEXT DEFAULT '[]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrate existing DBs: add tags column if missing
  try {
    await db.execute(`ALTER TABLE katas ADD COLUMN tags TEXT DEFAULT '[]'`);
  } catch {
    // Column already exists
  }

  // Migrate existing DBs: add is_custom column if missing
  try {
    await db.execute(`ALTER TABLE katas ADD COLUMN is_custom INTEGER DEFAULT 0`);
  } catch {
    // Column already exists
  }

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
      kata_id INTEGER REFERENCES katas(id) NOT NULL,
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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_code (
      kata_id INTEGER PRIMARY KEY REFERENCES katas(id),
      code TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function saveUserCode(kataId: number, code: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT OR REPLACE INTO user_code (kata_id, code, updated_at) VALUES ($1, $2, datetime('now'))",
    [kataId, code]
  );
}

export async function deleteUserCode(kataId: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM user_code WHERE kata_id = $1", [kataId]);
}

export async function loadUserCode(kataId: number): Promise<string | null> {
  const db = await getDb();
  const rows = await db.select<{ code: string }[]>(
    "SELECT code FROM user_code WHERE kata_id = $1",
    [kataId]
  );
  return rows.length > 0 ? rows[0].code : null;
}

async function seedKatas(db: Database) {
  // Only seed when katas table is empty (first launch)
  const countRows = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM katas");
  if (countRows[0].count > 0) return;

  for (const kata of [...sampleKatas, ...sampleKatasPython]) {
    await db.execute(
      `INSERT INTO katas (name, category, language, difficulty, description, code, test_code, solution, usage, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        kata.name,
        kata.category,
        kata.language,
        kata.difficulty,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
        kata.usage,
        JSON.stringify(kata.tags),
      ]
    );
  }
}

/** One-time migration: if every kata has tags='[]', reseed to populate tags from source. */
async function migrateTagsIfEmpty(db: Database) {
  const rows = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM katas WHERE tags != '[]'"
  );
  if (rows[0].count > 0) return; // tags already populated
  // All tags are empty defaults — reseed to pick up tag data
  await db.execute("DELETE FROM user_code");
  await db.execute("DELETE FROM katas");
  await db.execute("DELETE FROM sqlite_sequence WHERE name = 'katas'");
  await seedKatasForce(db);
}

/** Drop all katas and reseed from source arrays. Destructive: orphans attempts/user_code/dailyKataIds. */
export async function reseedKatas(): Promise<string> {
  const db = await getDb();
  await db.execute("DELETE FROM user_code");
  await db.execute("DELETE FROM katas");
  // Reset autoincrement counter
  await db.execute("DELETE FROM sqlite_sequence WHERE name = 'katas'");
  await seedKatasForce(db);
  return "Reseeded all katas. Previous attempt/user_code references are now orphaned.";
}

async function seedKatasForce(db: Database) {
  for (const kata of [...sampleKatas, ...sampleKatasPython]) {
    await db.execute(
      `INSERT INTO katas (name, category, language, difficulty, description, code, test_code, solution, usage, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        kata.name,
        kata.category,
        kata.language,
        kata.difficulty,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
        kata.usage,
        JSON.stringify(kata.tags),
      ]
    );
  }
}

export async function insertKata(kata: SeedKata): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    `INSERT INTO katas (name, category, language, difficulty, description, code, test_code, solution, usage, tags, is_custom)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)`,
    [
      kata.name,
      kata.category,
      kata.language,
      kata.difficulty,
      kata.description,
      kata.code,
      kata.testCode,
      kata.solution,
      kata.usage,
      JSON.stringify(kata.tags),
    ]
  );
  return result.lastInsertId as number;
}

export async function updateKata(id: number, kata: Partial<SeedKata>): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (kata.name !== undefined) { fields.push(`name = $${idx++}`); values.push(kata.name); }
  if (kata.category !== undefined) { fields.push(`category = $${idx++}`); values.push(kata.category); }
  if (kata.language !== undefined) { fields.push(`language = $${idx++}`); values.push(kata.language); }
  if (kata.difficulty !== undefined) { fields.push(`difficulty = $${idx++}`); values.push(kata.difficulty); }
  if (kata.description !== undefined) { fields.push(`description = $${idx++}`); values.push(kata.description); }
  if (kata.code !== undefined) { fields.push(`code = $${idx++}`); values.push(kata.code); }
  if (kata.testCode !== undefined) { fields.push(`test_code = $${idx++}`); values.push(kata.testCode); }
  if (kata.solution !== undefined) { fields.push(`solution = $${idx++}`); values.push(kata.solution); }
  if (kata.usage !== undefined) { fields.push(`usage = $${idx++}`); values.push(kata.usage); }
  if (kata.tags !== undefined) { fields.push(`tags = $${idx++}`); values.push(JSON.stringify(kata.tags)); }

  if (fields.length === 0) return;

  values.push(id);
  await db.execute(
    `UPDATE katas SET ${fields.join(", ")} WHERE id = $${idx} AND is_custom = 1`,
    values
  );
}

export async function deleteKata(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM user_code WHERE kata_id = $1", [id]);
  await db.execute("DELETE FROM attempts WHERE kata_id = $1", [id]);
  await db.execute("DELETE FROM katas WHERE id = $1 AND is_custom = 1", [id]);
}
