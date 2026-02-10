import { create } from "zustand";
import { getDb } from "../lib/database";

interface TodayStats {
  sessionCount: number;
  totalKatas: number;
  totalPassed: number;
  totalTimeMs: number;
}

interface HeatmapDay {
  day: string;
  sessionCount: number;
  kataCount: number;
}

interface CategoryBreakdown {
  category: string;
  totalTimeMs: number;
  attemptCount: number;
}

interface LeaderboardRow {
  kataId: number;
  kataName: string;
  category: string;
  difficulty: string;
  bestTimeMs: number | null;
  attemptCount: number;
  passCount: number;
}

interface TrendPoint {
  day: string;
  avgTimeMs: number;
  attemptCount: number;
}

interface SessionHistoryRow {
  id: number;
  session_type: string;
  started_at: string;
  finished_at: string;
  total_time_ms: number | null;
  kata_count: number;
  pass_count: number;
  preset_name: string | null;
}

export interface DrillDownRow {
  kataId: number;
  kataIndex: number;
  timeMs: number | null;
  passed: number;
  codeSnapshot: string | null;
  kataName: string;
  category: string;
}

interface DashboardState {
  loading: boolean;
  streak: number;
  today: TodayStats;
  heatmap: HeatmapDay[];
  categoryBreakdown: CategoryBreakdown[];
  leaderboard: LeaderboardRow[];
  trendLine: TrendPoint[];
  sessionHistory: SessionHistoryRow[];
  sessionHistoryHasMore: boolean;
  drillDown: DrillDownRow[] | null;
  selectedSessionId: number | null;

  loadDashboard: () => Promise<void>;
  loadMoreSessions: () => Promise<void>;
  loadDrillDown: (sessionId: number) => Promise<void>;
  clearDrillDown: () => void;
}

const PAGE_SIZE = 20;

function computeStreak(days: { day: string }[]): number {
  if (days.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(days[0].day + "T00:00:00");
  const diffFromToday = Math.floor(
    (today.getTime() - firstDay.getTime()) / 86400000,
  );

  // Streak must start today or yesterday
  if (diffFromToday > 1) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1].day + "T00:00:00");
    const curr = new Date(days[i].day + "T00:00:00");
    const gap = Math.floor((prev.getTime() - curr.getTime()) / 86400000);
    if (gap === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  loading: true,
  streak: 0,
  today: { sessionCount: 0, totalKatas: 0, totalPassed: 0, totalTimeMs: 0 },
  heatmap: [],
  categoryBreakdown: [],
  leaderboard: [],
  trendLine: [],
  sessionHistory: [],
  sessionHistoryHasMore: false,
  drillDown: null,
  selectedSessionId: null,

  loadDashboard: async () => {
    set({ loading: true });
    const db = await getDb();

    const [streakRows, todayRows, heatmapRows, categoryRows, leaderboardRows, trendRows, historyRows] =
      await Promise.all([
        // A. Streak
        db.select<{ day: string }[]>(
          `SELECT DISTINCT date(finished_at) as day FROM sessions
           WHERE finished_at IS NOT NULL ORDER BY day DESC`,
        ),
        // B. Today
        db.select<
          {
            session_count: number;
            total_katas: number;
            total_passed: number;
            total_time_ms: number;
          }[]
        >(
          `SELECT COUNT(*) as session_count, COALESCE(SUM(kata_count), 0) as total_katas,
           COALESCE(SUM(pass_count), 0) as total_passed, COALESCE(SUM(total_time_ms), 0) as total_time_ms
           FROM sessions WHERE date(started_at) = date('now', 'localtime') AND finished_at IS NOT NULL`,
        ),
        // C. Heatmap
        db.select<{ day: string; session_count: number; kata_count: number }[]>(
          `SELECT date(started_at) as day, COUNT(*) as session_count, COALESCE(SUM(kata_count), 0) as kata_count
           FROM sessions WHERE finished_at IS NOT NULL AND started_at >= date('now', '-364 days')
           GROUP BY date(started_at) ORDER BY day`,
        ),
        // D. Category breakdown
        db.select<
          { category: string; total_time_ms: number; attempt_count: number }[]
        >(
          `SELECT k.category, COALESCE(SUM(a.time_ms), 0) as total_time_ms, COUNT(*) as attempt_count
           FROM attempts a JOIN katas k ON k.id = a.kata_id
           WHERE a.time_ms IS NOT NULL GROUP BY k.category ORDER BY total_time_ms DESC`,
        ),
        // E. Leaderboard (all katas, LEFT JOIN attempts)
        db.select<
          {
            kata_id: number;
            kata_name: string;
            category: string;
            difficulty: string;
            best_time_ms: number | null;
            attempt_count: number;
            pass_count: number;
          }[]
        >(
          `SELECT k.id as kata_id, k.name as kata_name, k.category, k.difficulty,
           MIN(CASE WHEN a.passed = 1 AND a.time_ms IS NOT NULL THEN a.time_ms END) as best_time_ms,
           COUNT(a.id) as attempt_count, COALESCE(SUM(a.passed), 0) as pass_count
           FROM katas k LEFT JOIN attempts a ON k.id = a.kata_id
           GROUP BY k.id ORDER BY best_time_ms IS NULL, best_time_ms ASC, k.name ASC`,
        ),
        // F. Trend line
        db.select<
          { day: string; avg_time_ms: number; attempt_count: number }[]
        >(
          `SELECT date(a.started_at) as day, AVG(a.time_ms) as avg_time_ms, COUNT(*) as attempt_count
           FROM attempts a WHERE a.passed = 1 AND a.time_ms IS NOT NULL AND a.started_at >= date('now', '-30 days')
           GROUP BY date(a.started_at) ORDER BY day`,
        ),
        // G. Session history
        db.select<SessionHistoryRow[]>(
          `SELECT * FROM sessions WHERE finished_at IS NOT NULL ORDER BY started_at DESC LIMIT $1 OFFSET $2`,
          [PAGE_SIZE + 1, 0],
        ),
      ]);

    const hasMore = historyRows.length > PAGE_SIZE;
    const sessions = hasMore ? historyRows.slice(0, PAGE_SIZE) : historyRows;

    const todayRow = todayRows[0];

    set({
      loading: false,
      streak: computeStreak(streakRows),
      today: {
        sessionCount: todayRow?.session_count ?? 0,
        totalKatas: todayRow?.total_katas ?? 0,
        totalPassed: todayRow?.total_passed ?? 0,
        totalTimeMs: todayRow?.total_time_ms ?? 0,
      },
      heatmap: heatmapRows.map((r) => ({
        day: r.day,
        sessionCount: r.session_count,
        kataCount: r.kata_count,
      })),
      categoryBreakdown: categoryRows.map((r) => ({
        category: r.category,
        totalTimeMs: r.total_time_ms,
        attemptCount: r.attempt_count,
      })),
      leaderboard: leaderboardRows.map((r) => ({
        kataId: r.kata_id,
        kataName: r.kata_name,
        category: r.category,
        difficulty: r.difficulty,
        bestTimeMs: r.best_time_ms,
        attemptCount: r.attempt_count,
        passCount: r.pass_count,
      })),
      trendLine: trendRows.map((r) => ({
        day: r.day,
        avgTimeMs: r.avg_time_ms,
        attemptCount: r.attempt_count,
      })),
      sessionHistory: sessions,
      sessionHistoryHasMore: hasMore,
      drillDown: null,
      selectedSessionId: null,
    });
  },

  loadMoreSessions: async () => {
    const { sessionHistory } = get();
    const db = await getDb();
    const offset = sessionHistory.length;

    const rows = await db.select<SessionHistoryRow[]>(
      `SELECT * FROM sessions WHERE finished_at IS NOT NULL ORDER BY started_at DESC LIMIT $1 OFFSET $2`,
      [PAGE_SIZE + 1, offset],
    );

    const hasMore = rows.length > PAGE_SIZE;
    const newSessions = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

    set({
      sessionHistory: [...sessionHistory, ...newSessions],
      sessionHistoryHasMore: hasMore,
    });
  },

  loadDrillDown: async (sessionId: number) => {
    const db = await getDb();
    const rows = await db.select<
      {
        kata_id: number;
        kata_index: number;
        time_ms: number | null;
        passed: number;
        code_snapshot: string | null;
        kata_name: string;
        category: string;
      }[]
    >(
      `SELECT a.kata_id, a.kata_index, a.time_ms, a.passed, a.code_snapshot, k.name as kata_name, k.category
       FROM attempts a JOIN katas k ON k.id = a.kata_id WHERE a.session_id = $1 ORDER BY a.kata_index`,
      [sessionId],
    );

    set({
      selectedSessionId: sessionId,
      drillDown: rows.map((r) => ({
        kataId: r.kata_id,
        kataIndex: r.kata_index,
        timeMs: r.time_ms,
        passed: r.passed,
        codeSnapshot: r.code_snapshot,
        kataName: r.kata_name,
        category: r.category,
      })),
    });
  },

  clearDrillDown: () => {
    set({ drillDown: null, selectedSessionId: null });
  },
}));
