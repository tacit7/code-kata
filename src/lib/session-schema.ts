export interface SessionSchemaDatabase {
  execute(sql: string, params?: unknown[]): Promise<unknown>;
}

// Call after the base tables exist and before loading or starting a session.
// Older databases may have either column already.
export async function migrateSessionSchema(db: SessionSchemaDatabase): Promise<void> {
  for (const column of ["max_test_runs INTEGER", "kata_ids TEXT"]) {
    try {
      await db.execute(`ALTER TABLE sessions ADD COLUMN ${column}`);
    } catch (error) {
      if (!/duplicate column/i.test(String(error))) throw error;
    }
  }
  await db.execute(`
    CREATE TABLE IF NOT EXISTS practice_presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      config TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
