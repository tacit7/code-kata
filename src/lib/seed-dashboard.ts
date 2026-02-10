/**
 * Seeds the database with realistic session/attempt data for testing the dashboard.
 * Call from the browser console via: window.__seedDashboard()
 * Or from the dev toolbar button when in development mode.
 *
 * Generates ~45 days of practice history with varying activity levels,
 * covering all kata categories, mixed pass/fail rates, and realistic timing.
 */

import { getDb } from "./database";

let KATA_IDS: number[] = [];

const SESSION_TYPES = ["daily", "random", "custom"] as const;

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function isoDate(date: Date): string {
  return date.toISOString().replace("T", " ").replace("Z", "");
}

export async function seedDashboard(): Promise<string> {
  const db = await getDb();

  // Check if we already have seed data
  const existing = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM sessions",
  );
  if (existing[0].count > 10) {
    return `Already have ${existing[0].count} sessions. Run clearDashboardSeed() first to reset.`;
  }

  // Load kata IDs from DB
  const kataRows = await db.select<{ id: number }[]>("SELECT id FROM katas");
  KATA_IDS = kataRows.map((r) => r.id);
  if (KATA_IDS.length === 0) {
    return "No katas in database. Cannot seed dashboard.";
  }

  const now = new Date();
  let totalSessions = 0;
  let totalAttempts = 0;

  // Generate sessions over the last 60 days, skipping some days for realism
  // More activity in recent days, less in older days
  for (let daysAgo = 59; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(8, 0, 0, 0);

    // Skip some days (more skips further back)
    const skipChance = daysAgo > 30 ? 0.6 : daysAgo > 14 ? 0.35 : 0.15;
    if (Math.random() < skipChance) continue;

    // 1-3 sessions per active day
    const sessionsToday = daysAgo > 30 ? 1 : rand(1, daysAgo > 14 ? 2 : 3);

    for (let s = 0; s < sessionsToday; s++) {
      const sessionStart = new Date(date);
      sessionStart.setHours(8 + s * 3 + rand(0, 2), rand(0, 59), rand(0, 59));

      const kataCount = rand(3, 6);
      const sessionKatas = pickN(KATA_IDS, kataCount);
      const sessionType = pick(SESSION_TYPES);

      // Simulate attempts; pass rate improves over time (more recent = better)
      const basePassRate = Math.min(0.95, 0.5 + (60 - daysAgo) * 0.008);
      let passCount = 0;
      let sessionTimeMs = 0;

      const attemptRows: {
        kataId: number;
        kataIndex: number;
        startedAt: string;
        finishedAt: string;
        timeMs: number;
        passed: number;
      }[] = [];

      let attemptTime = new Date(sessionStart);

      for (let k = 0; k < sessionKatas.length; k++) {
        const kataId = sessionKatas[k];
        // Time varies: earlier katas in session are faster (warmed up), harder katas take longer
        const baseMs = rand(30000, 180000); // 30s to 3min
        // Improvement over time: recent attempts are ~20% faster
        const improvementFactor = 1 - (60 - daysAgo) * 0.003;
        const timeMs = Math.max(15000, Math.floor(baseMs * improvementFactor));

        const passed = Math.random() < basePassRate ? 1 : 0;
        if (passed) passCount++;
        sessionTimeMs += timeMs;

        const kataStart = new Date(attemptTime);
        const kataEnd = new Date(kataStart.getTime() + timeMs);
        attemptTime = new Date(kataEnd.getTime() + rand(2000, 10000)); // gap between katas

        attemptRows.push({
          kataId,
          kataIndex: k,
          startedAt: isoDate(kataStart),
          finishedAt: isoDate(kataEnd),
          timeMs,
          passed,
        });
      }

      const sessionEnd = new Date(sessionStart.getTime() + sessionTimeMs + rand(5000, 30000));

      // Insert session
      const result = await db.execute(
        `INSERT INTO sessions (session_type, started_at, finished_at, total_time_ms, kata_count, pass_count, preset_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          sessionType,
          isoDate(sessionStart),
          isoDate(sessionEnd),
          sessionTimeMs,
          kataCount,
          passCount,
          sessionType === "custom" ? "Custom Set" : null,
        ],
      );

      const sessionId = result.lastInsertId;

      // Insert attempts
      for (const a of attemptRows) {
        await db.execute(
          `INSERT INTO attempts (session_id, kata_id, kata_index, started_at, finished_at, time_ms, passed, code_snapshot)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            sessionId,
            a.kataId,
            a.kataIndex,
            a.startedAt,
            a.finishedAt,
            a.timeMs,
            a.passed,
            a.passed ? `// solved ${a.kataId}\nfunction solution() { /* ... */ }` : null,
          ],
        );
        totalAttempts++;
      }

      totalSessions++;
    }
  }

  return `Seeded ${totalSessions} sessions with ${totalAttempts} attempts over ~60 days.`;
}

export async function clearDashboardSeed(): Promise<string> {
  const db = await getDb();
  await db.execute("DELETE FROM attempts");
  await db.execute("DELETE FROM sessions");
  return "Cleared all sessions and attempts.";
}
