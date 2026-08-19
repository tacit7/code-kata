import Database from "@tauri-apps/plugin-sql";
import type { SeedKata } from "../types/editor";
import { leetcodeNumberFor } from "./leetcode-numbers";
import { sampleKatas } from "./sample-katas";
import { sampleKatasPython } from "./sample-katas-python";
import { recursionFoundations } from "./recursion-foundations";
import { treeFundamentals } from "./tree-fundamentals";
import { dpFoundations } from "./dp-foundations";
import { dpFoundationsJs } from "./dp-foundations-js";
import { dpProblemsJs } from "./dp-problems-js";
import { blind75Part1 } from "./blind75-additions-part1";
import { blind75Part2 } from "./blind75-additions-part2";
import { blind75Part3 } from "./blind75-additions-part3";
import { blind75Part4 } from "./blind75-additions-part4";
import { blind75Part5 } from "./blind75-additions-part5";
import { blind75Part6 } from "./blind75-additions-part6";
import { blind75Part7 } from "./blind75-additions-part7";
import { blind75Part8 } from "./blind75-additions-part8";
import { neetcodeStack } from "./neetcode-stack";
import { neetcodeBinarySearch } from "./neetcode-binary-search";
import { neetcodeTrees } from "./neetcode-trees";
import { neetcodeBacktracking } from "./neetcode-backtracking";
import { neetcodeHeap } from "./neetcode-heap";
import { neetcodeGraphs } from "./neetcode-graphs";
import { neetcodeGreedy } from "./neetcode-greedy";
import { neetcodeAdvancedGraphs } from "./neetcode-advanced-graphs";
import { neetcode2dDp } from "./neetcode-2d-dp";
import { neetcodeMathBit } from "./neetcode-math-bit";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;
  db = await Database.load("sqlite:kata.db");
  await createSchema(db);
  await seedKatas(db);
  await migrateBuildAdjacencyListDrill(db);
  await migrateBinarySearchBoundaryDrills(db);
  await migrateBuildPrefixSumDrill(db);
  await migrateMatrixBfsDrill(db);
  await migrateCanonicalNeetcodeTitles(db);
  await seedMissingKatas(db);
  await migrateTagsIfEmpty(db);
  await backfillSeedKataTags(db);
  await backfillLeetcodeNumbers(db);
  await backfillSolutionVariants(db);
  await migrateTwoSumIiToTwoPointers(db);
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
      solution_variants TEXT,
      usage TEXT,
      tags TEXT DEFAULT '[]',
      leetcode_number INTEGER,
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

  // Migrate existing DBs: add leetcode_number column if missing
  try {
    await db.execute(`ALTER TABLE katas ADD COLUMN leetcode_number INTEGER`);
  } catch {
    // Column already exists
  }

  // Migrate existing DBs: add solution_variants column if missing
  try {
    await db.execute(`ALTER TABLE katas ADD COLUMN solution_variants TEXT`);
  } catch {
    // Column already exists
  }

  // Migrate existing DBs: rename arrays-and-hashing → arrays
  await db.execute(`UPDATE katas SET category = 'arrays' WHERE category = 'arrays-and-hashing'`);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      total_time_ms INTEGER,
      kata_count INTEGER NOT NULL,
      pass_count INTEGER DEFAULT 0,
      preset_name TEXT,
      kata_ids TEXT
    )
  `);

  // Migrate existing DBs: persist ordered session rosters for reload/resume.
  try {
    await db.execute(`ALTER TABLE sessions ADD COLUMN kata_ids TEXT`);
  } catch {
    // Column already exists
  }

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
    CREATE TABLE IF NOT EXISTS practice_presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      config TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS kata_notes (
      kata_id INTEGER PRIMARY KEY,
      notes TEXT NOT NULL,
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

export async function saveKataNotes(kataId: number, notes: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT OR REPLACE INTO kata_notes (kata_id, notes, updated_at) VALUES ($1, $2, datetime('now'))",
    [kataId, notes]
  );
}

export async function loadKataNotes(kataId: number): Promise<string> {
  const db = await getDb();
  const rows = await db.select<{ notes: string }[]>(
    "SELECT notes FROM kata_notes WHERE kata_id = $1",
    [kataId]
  );
  return rows.length > 0 ? rows[0].notes : "";
}

const blind75Katas = [
  ...blind75Part1, ...blind75Part2, ...blind75Part3, ...blind75Part4,
  ...blind75Part5, ...blind75Part6, ...blind75Part7, ...blind75Part8,
  ...neetcodeStack,
  ...neetcodeBinarySearch,
  ...neetcodeTrees,
  ...neetcodeBacktracking,
  ...neetcodeHeap,
  ...neetcodeGraphs,
  ...neetcodeGreedy,
  ...neetcodeAdvancedGraphs,
  ...neetcode2dDp,
  ...neetcodeMathBit,
];

/** The full seed corpus, in seed order — the single source seedMissingKatas checks against. */
const ALL_SEED_KATAS = [...sampleKatas, ...sampleKatasPython, ...recursionFoundations, ...treeFundamentals, ...dpFoundations, ...dpFoundationsJs, ...dpProblemsJs, ...blind75Katas];

async function migrateCanonicalNeetcodeTitles(db: Database) {
  const renames = [
    { oldName: "Count Good Nodes In Binary Tree", newName: "Count Good Nodes in Binary Tree" },
    { oldName: "Merge K Sorted Lists", newName: "Merge k Sorted Lists" },
    { oldName: "N Queens", newName: "N-Queens" },
    { oldName: "Kadane's Algorithm", newName: "Maximum Subarray" },
    { oldName: "Largest Rectangle In Histogram", newName: "Largest Rectangle in Histogram" },
    { oldName: "Single Number XOR", newName: "Single Number" },
    { oldName: "Linked List Cycle Detection", newName: "Linked List Cycle" },
    { oldName: "Count Set Bits", newName: "Number of 1 Bits" },
    { oldName: "Trie", newName: "Implement Trie (Prefix Tree)" },
    { oldName: "Add and Search Word", newName: "Design Add and Search Words Data Structure" },
    { oldName: "Kth Largest Element In An Array", newName: "Kth Largest Element in an Array" },
    { oldName: "Kth Largest Element In a Stream", newName: "Kth Largest Element in a Stream" },
    { oldName: "Swim In Rising Water", newName: "Swim in Rising Water" },
    { oldName: "Walls And Gates", newName: "Walls and Gates" },
    { oldName: "Best Time to Buy and Sell Stock With Cooldown", newName: "Best Time to Buy and Sell Stock with Cooldown" },
    { oldName: "Longest Increasing Path In a Matrix", newName: "Longest Increasing Path in a Matrix" },
    { oldName: "Climbing Stairs (Iterative)", newName: "Climbing Stairs" },
    { oldName: "Reverse Linked List (Iterative)", newName: "Reverse Linked List" },
    { oldName: "Binary Search (Iterative)", newName: "Binary Search" },
  ];

  for (const { oldName, newName } of renames) {
    const renamedKatas = ALL_SEED_KATAS.filter((kata) => kata.name === newName);
    for (const kata of renamedKatas) {
      const seedValues = [
        kata.name,
        kata.category,
        kata.difficulty,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
        kata.solutionVariants ? JSON.stringify(kata.solutionVariants) : null,
        kata.usage,
        JSON.stringify(kata.tags),
        leetcodeNumberFor(kata),
      ];

      await db.execute(
        `UPDATE katas
         SET name = $1,
             category = $2,
             difficulty = $3,
             description = $4,
             code = $5,
             test_code = $6,
             solution = $7,
             solution_variants = $8,
             usage = $9,
             tags = $10,
             leetcode_number = $11
         WHERE name = $12 AND language = $13 AND (is_custom IS NULL OR is_custom = 0)`,
        [...seedValues, oldName, kata.language],
      );

      await db.execute(
        `UPDATE katas
         SET category = $2,
             difficulty = $3,
             description = $4,
             code = $5,
             test_code = $6,
             solution = $7,
             solution_variants = $8,
             usage = $9,
             tags = $10,
             leetcode_number = $11
         WHERE name = $1 AND language = $12 AND (is_custom IS NULL OR is_custom = 0)`,
        [...seedValues, kata.language],
      );
    }
  }
}

async function migrateBuildAdjacencyListDrill(db: Database) {
  const renamedKatas = ALL_SEED_KATAS.filter((kata) => kata.name === "Build Adjacency List Drill");

  for (const kata of renamedKatas) {
    await db.execute(
      `UPDATE katas
       SET name = $1,
           description = $2,
           code = $3,
           test_code = $4,
           solution = $5,
           solution_variants = $6,
           usage = $7,
           tags = $8,
           leetcode_number = NULL
       WHERE name = $9 AND language = $10 AND (is_custom IS NULL OR is_custom = 0)`,
      [
        kata.name,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
        kata.solutionVariants ? JSON.stringify(kata.solutionVariants) : null,
        kata.usage,
        JSON.stringify(kata.tags),
        "Build Adjacency List",
        kata.language,
      ],
    );

    await db.execute(
      `UPDATE katas
       SET leetcode_number = NULL
       WHERE name = $1 AND language = $2 AND leetcode_number = 133 AND (is_custom IS NULL OR is_custom = 0)`,
      [kata.name, kata.language],
    );
  }
}

async function migrateBinarySearchBoundaryDrills(db: Database) {
  const renames = [
    { oldName: "Binary Search Find First", newName: "Find First Occurrence in Sorted Array" },
    { oldName: "Binary Search Find Last", newName: "Find Last Occurrence in Sorted Array" },
  ];

  for (const { oldName, newName } of renames) {
    const renamedKatas = ALL_SEED_KATAS.filter((kata) => kata.name === newName);
    for (const kata of renamedKatas) {
      const seedValues = [
        kata.name,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
        kata.solutionVariants ? JSON.stringify(kata.solutionVariants) : null,
        kata.usage,
        JSON.stringify(kata.tags),
      ];

      await db.execute(
        `UPDATE katas
         SET name = $1,
             description = $2,
             code = $3,
             test_code = $4,
             solution = $5,
             solution_variants = $6,
             usage = $7,
             tags = $8,
             leetcode_number = NULL
         WHERE name = $9 AND language = $10 AND (is_custom IS NULL OR is_custom = 0)`,
        [...seedValues, oldName, kata.language],
      );

      await db.execute(
        `UPDATE katas
         SET description = $2,
             code = $3,
             test_code = $4,
             solution = $5,
             solution_variants = $6,
             usage = $7,
             tags = $8,
             leetcode_number = NULL
         WHERE name = $1 AND language = $9 AND (is_custom IS NULL OR is_custom = 0)`,
        [...seedValues, kata.language],
      );
    }
  }
}

async function migrateBuildPrefixSumDrill(db: Database) {
  const renamedKatas = ALL_SEED_KATAS.filter((kata) => kata.name === "Prefix Sum Table");

  for (const kata of renamedKatas) {
    await db.execute(
      `UPDATE katas
       SET name = $1,
           description = $2,
           code = $3,
           test_code = $4,
           solution = $5,
           solution_variants = $6,
           usage = $7,
           tags = $8,
           leetcode_number = NULL
       WHERE name = $9 AND language = $10 AND (is_custom IS NULL OR is_custom = 0)`,
      [
        kata.name,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
        kata.solutionVariants ? JSON.stringify(kata.solutionVariants) : null,
        kata.usage,
        JSON.stringify(kata.tags),
        "Build Prefix Sum",
        kata.language,
      ],
    );

    await db.execute(
      `UPDATE katas
       SET leetcode_number = NULL
       WHERE name = $1 AND language = $2 AND leetcode_number = 1480 AND (is_custom IS NULL OR is_custom = 0)`,
      [kata.name, kata.language],
    );
  }
}

async function migrateMatrixBfsDrill(db: Database) {
  const renamedKatas = ALL_SEED_KATAS.filter((kata) => kata.name === "Matrix BFS With Walls");

  for (const kata of renamedKatas) {
    await db.execute(
      `UPDATE katas
       SET name = $1,
           description = $2,
           code = $3,
           test_code = $4,
           solution = $5,
           solution_variants = $6,
           usage = $7,
           tags = $8,
           leetcode_number = NULL
       WHERE name = $9 AND language = $10 AND (is_custom IS NULL OR is_custom = 0)`,
      [
        kata.name,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
        kata.solutionVariants ? JSON.stringify(kata.solutionVariants) : null,
        kata.usage,
        JSON.stringify(kata.tags),
        "Matrix BFS",
        kata.language,
      ],
    );

    await db.execute(
      `UPDATE katas
       SET leetcode_number = NULL
       WHERE name = $1 AND language = $2 AND leetcode_number = 1091 AND (is_custom IS NULL OR is_custom = 0)`,
      [kata.name, kata.language],
    );
  }
}

/**
 * Inserts katas that shipped after this database was first seeded. seedKatas
 * only fires on an empty table, so without this a user with an existing DB never
 * sees new content, and reseedKatas is not an option — it drops attempts and
 * user_code. Identity is (name, language); seed katas can't be deleted from the
 * UI, so anything missing here is genuinely new rather than removed on purpose.
 */
async function seedMissingKatas(db: Database) {
  const rows = await db.select<{ name: string; language: string }[]>(
    "SELECT name, language FROM katas"
  );
  const key = (name: string, language: string) => `${language} ${name}`;
  const existing = new Set(rows.map((r) => key(r.name, r.language)));

  for (const kata of ALL_SEED_KATAS) {
    if (existing.has(key(kata.name, kata.language))) continue;
    await db.execute(
      `INSERT INTO katas (name, category, language, difficulty, description, code, test_code, solution, solution_variants, usage, tags, leetcode_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        kata.name,
        kata.category,
        kata.language,
        kata.difficulty,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
        kata.solutionVariants ? JSON.stringify(kata.solutionVariants) : null,
        kata.usage,
        JSON.stringify(kata.tags),
        leetcodeNumberFor(kata),
      ]
    );
  }
}

/**
 * Backfills leetcode_number for rows that predate the column. New seeds set it
 * at insert time; this covers databases seeded before the column existed. Rows
 * with no known number (custom katas, non-LeetCode drills) stay null.
 */
async function backfillLeetcodeNumbers(db: Database) {
  const rows = await db.select<{ id: number; name: string; language: string }[]>(
    "SELECT id, name, language FROM katas WHERE leetcode_number IS NULL"
  );
  for (const row of rows) {
    const num = leetcodeNumberFor(row);
    if (num == null) continue;
    await db.execute("UPDATE katas SET leetcode_number = $1 WHERE id = $2", [num, row.id]);
  }
}

async function backfillSeedKataTags(db: Database) {
  for (const kata of ALL_SEED_KATAS) {
    await db.execute(
      `UPDATE katas
       SET tags = $1
       WHERE name = $2 AND language = $3 AND (is_custom IS NULL OR is_custom = 0)`,
      [JSON.stringify(kata.tags), kata.name, kata.language],
    );
  }
}

async function backfillSolutionVariants(db: Database) {
  for (const kata of ALL_SEED_KATAS) {
    if (!kata.solutionVariants || kata.solutionVariants.length === 0) continue;
    const solutionVariants = JSON.stringify(kata.solutionVariants);
    await db.execute(
      `UPDATE katas
       SET solution_variants = $1
       WHERE name = $2
         AND language = $3
         AND (is_custom IS NULL OR is_custom = 0)
         AND (solution_variants IS NULL OR solution_variants = '' OR solution_variants != $1)`,
      [solutionVariants, kata.name, kata.language],
    );
  }

  const doubleOrAdd = ALL_SEED_KATAS.find(
    (kata) => kata.name === "Double-or-Add Sequence" && kata.language === "python"
  );
  if (doubleOrAdd?.description?.includes("The sequence uses zero-based indexing:")) {
    await db.execute(
      `UPDATE katas
       SET description = $1
       WHERE name = $2 AND language = $3 AND description NOT LIKE $4`,
      [
        doubleOrAdd.description,
        doubleOrAdd.name,
        doubleOrAdd.language,
        "%The sequence uses zero-based indexing:%",
      ],
    );
  }
}

async function migrateTwoSumIiToTwoPointers(db: Database) {
  for (const kata of ALL_SEED_KATAS.filter((seed) => seed.name === "Two Sum II - Input Array Is Sorted")) {
    await db.execute(
      `UPDATE katas
       SET category = $1,
           tags = $2,
           solution_variants = $3
       WHERE name = $4
         AND language = $5
         AND (is_custom IS NULL OR is_custom = 0)`,
      [
        kata.category,
        JSON.stringify(kata.tags),
        JSON.stringify(kata.solutionVariants ?? []),
        kata.name,
        kata.language,
      ],
    );
  }
}

async function seedKatas(db: Database) {
  // Only seed when katas table is empty (first launch)
  const countRows = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM katas");
  if (countRows[0].count > 0) return;

  for (const kata of ALL_SEED_KATAS) {
    await db.execute(
      `INSERT INTO katas (name, category, language, difficulty, description, code, test_code, solution, solution_variants, usage, tags, leetcode_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        kata.name,
        kata.category,
        kata.language,
        kata.difficulty,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
        kata.solutionVariants ? JSON.stringify(kata.solutionVariants) : null,
        kata.usage,
        JSON.stringify(kata.tags),
        leetcodeNumberFor(kata),
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
  await db.execute("DELETE FROM attempts");
  await db.execute("DELETE FROM katas");
  await db.execute("DELETE FROM sqlite_sequence WHERE name = 'katas'");
  await seedKatasForce(db);
}

/** Drop all katas and reseed from source arrays. Destructive: clears attempts/user_code. */
export async function reseedKatas(): Promise<string> {
  const db = await getDb();
  await db.execute("DELETE FROM user_code");
  await db.execute("DELETE FROM attempts");
  await db.execute("DELETE FROM katas");
  await db.execute("DELETE FROM sqlite_sequence WHERE name = 'katas'");
  await seedKatasForce(db);
  return "Reseeded all katas.";
}

async function seedKatasForce(db: Database) {
  for (const kata of ALL_SEED_KATAS) {
    await db.execute(
      `INSERT INTO katas (name, category, language, difficulty, description, code, test_code, solution, solution_variants, usage, tags, leetcode_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        kata.name,
        kata.category,
        kata.language,
        kata.difficulty,
        kata.description,
        kata.code,
        kata.testCode,
        kata.solution,
        kata.solutionVariants ? JSON.stringify(kata.solutionVariants) : null,
        kata.usage,
        JSON.stringify(kata.tags),
        leetcodeNumberFor(kata),
      ]
    );
  }
}

export async function insertKata(kata: SeedKata): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    `INSERT INTO katas (name, category, language, difficulty, description, code, test_code, solution, solution_variants, usage, tags, is_custom)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1)`,
    [
      kata.name,
      kata.category,
      kata.language,
      kata.difficulty,
      kata.description,
      kata.code,
      kata.testCode,
      kata.solution,
      kata.solutionVariants ? JSON.stringify(kata.solutionVariants) : null,
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
  if (kata.solutionVariants !== undefined) { fields.push(`solution_variants = $${idx++}`); values.push(kata.solutionVariants ? JSON.stringify(kata.solutionVariants) : null); }
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

// Clears recorded attempts (best time, streak, pass rate) for a kata without
// touching the kata itself or the user's saved code draft.
export async function resetKataProgress(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM attempts WHERE kata_id = $1", [id]);
}

// Clears recorded attempts for every kata (best time, streak, pass rate)
// without touching katas themselves or saved code drafts.
export async function resetAllProgress(): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM attempts");
}
