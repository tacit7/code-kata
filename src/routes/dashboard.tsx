import { Fragment, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useDashboardStore } from "../stores/dashboard-store";
import type { DrillDownRow } from "../stores/dashboard-store";
import { useSettingsStore } from "../stores/settings-store";
import { useKataStore } from "../stores/kata-store";
import { useSessionStore } from "../stores/session-store";
import { useTimerStore } from "../stores/timer-store";
import { formatTime } from "../lib/format";
import { seedDashboard, clearDashboardSeed } from "../lib/seed-dashboard";

// --- Practice Daily ---

function PracticeDailyButton() {
  const navigate = useNavigate();
  const dailyKataIds = useSettingsStore((s) => s.dailyKataIds);
  const katas = useKataStore((s) => s.katas);
  const startSession = useSessionStore((s) => s.startSession);
  const startSessionTimer = useTimerStore((s) => s.startSessionTimer);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const [launching, setLaunching] = useState(false);

  const hasDaily = dailyKataIds.length > 0;

  const handleClick = useCallback(async () => {
    if (!hasDaily) {
      navigate("/session/setup");
      return;
    }

    if (launching) return;
    setLaunching(true);

    const kataMap = new Map(katas.map((k) => [k.id, k]));
    const resolved = dailyKataIds.map((id) => kataMap.get(id)).filter(Boolean) as typeof katas;

    if (resolved.length === 0) {
      setLaunching(false);
      navigate("/session/setup");
      return;
    }

    resetKataTimer();
    startSessionTimer();
    const sessionId = await startSession("daily", resolved);
    navigate(`/session/${sessionId}`);
  }, [hasDaily, launching, dailyKataIds, katas, startSession, startSessionTimer, resetKataTimer, navigate]);

  return (
    <button
      onClick={handleClick}
      disabled={launching}
      className="w-full px-6 py-3 text-sm font-semibold rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 transition-colors"
    >
      {launching
        ? "Launching..."
        : hasDaily
          ? `Practice Daily (${dailyKataIds.length} katas)`
          : "Set Up Daily Katas"}
    </button>
  );
}

// --- Stat Cards ---

function StatCards() {
  const streak = useDashboardStore((s) => s.streak);
  const today = useDashboardStore((s) => s.today);

  const passRate =
    today.totalKatas > 0
      ? `${today.totalPassed}/${today.totalKatas}`
      : "0/0";

  return (
    <div className="flex gap-4">
      <div className="flex-1 px-4 py-3 rounded bg-zinc-100 dark:bg-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Streak</p>
        <p className="text-lg font-semibold">{streak} day{streak !== 1 ? "s" : ""}</p>
      </div>
      <div className="flex-1 px-4 py-3 rounded bg-zinc-100 dark:bg-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Today's Sessions</p>
        <p className="text-lg font-semibold">{today.sessionCount}</p>
      </div>
      <div className="flex-1 px-4 py-3 rounded bg-zinc-100 dark:bg-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Today's Time</p>
        <p className="text-lg font-mono font-semibold">
          {today.totalTimeMs > 0 ? formatTime(today.totalTimeMs) : "00:00"}
        </p>
      </div>
      <div className="flex-1 px-4 py-3 rounded bg-zinc-100 dark:bg-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Today's Pass Rate</p>
        <p className="text-lg font-semibold">{passRate}</p>
      </div>
    </div>
  );
}

// --- Heatmap ---

function getHeatmapColor(count: number): string {
  if (count === 0) return "bg-zinc-800";
  if (count <= 2) return "bg-green-900";
  if (count <= 5) return "bg-green-700";
  return "bg-green-500";
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function Heatmap() {
  const heatmap = useDashboardStore((s) => s.heatmap);

  // Build a lookup map: "YYYY-MM-DD" -> kataCount
  const countMap = new Map<string, number>();
  for (const d of heatmap) {
    countMap.set(d.day, d.kataCount);
  }

  // Start 364 days ago (to fill 52 cols x 7 rows = 364 cells)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 363);

  // Adjust start to the nearest Sunday (start of week)
  const startDow = start.getDay(); // 0=Sun
  start.setDate(start.getDate() - startDow);

  // Build cells: 52 columns x 7 rows (col-major)
  const cells: { date: string; count: number; col: number; row: number }[] = [];
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;

  for (let col = 0; col < 52; col++) {
    for (let row = 0; row < 7; row++) {
      const d = new Date(start);
      d.setDate(d.getDate() + col * 7 + row);
      const key = d.toISOString().slice(0, 10);
      cells.push({ date: key, count: countMap.get(key) ?? 0, col, row });

      if (row === 0 && d.getMonth() !== lastMonth) {
        monthLabels.push({ label: MONTH_NAMES[d.getMonth()], col });
        lastMonth = d.getMonth();
      }
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
        Activity
      </h2>
      <div className="overflow-x-auto">
        {/* Month labels */}
        <div
          className="grid gap-[3px] ml-8 mb-1"
          style={{
            gridTemplateColumns: "repeat(52, 12px)",
          }}
        >
          {Array.from({ length: 52 }, (_, col) => {
            const ml = monthLabels.find((m) => m.col === col);
            return (
              <span
                key={col}
                className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-none"
              >
                {ml ? ml.label : ""}
              </span>
            );
          })}
        </div>
        {/* Grid body with day labels */}
        <div className="flex">
          <div className="flex flex-col gap-[3px] mr-1 pt-0">
            {DAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="text-[10px] text-zinc-500 dark:text-zinc-400 h-[12px] leading-[12px] w-6 text-right"
              >
                {label}
              </span>
            ))}
          </div>
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateColumns: "repeat(52, 12px)",
              gridTemplateRows: "repeat(7, 12px)",
              gridAutoFlow: "column",
            }}
          >
            {cells.map((cell) => (
              <div
                key={cell.date}
                className={`w-[12px] h-[12px] rounded-sm ${getHeatmapColor(cell.count)}`}
                title={`${cell.date}: ${cell.count} kata${cell.count !== 1 ? "s" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Charts ---

function CategoryChart() {
  const categoryBreakdown = useDashboardStore((s) => s.categoryBreakdown);

  const data = categoryBreakdown.map((c) => ({
    category: c.category,
    minutes: Math.round(c.totalTimeMs / 60000),
  }));

  if (data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-[250px] text-zinc-500 text-sm">
        No category data yet
      </div>
    );
  }

  return (
    <div className="flex-1">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
        Time by Category
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#27272a",
              border: "1px solid #3f3f46",
              borderRadius: 6,
              color: "#e4e4e7",
            }}
            formatter={(value) => [`${value ?? 0} min`, "Time"]}
          />
          <Bar dataKey="minutes" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendChart() {
  const trendLine = useDashboardStore((s) => s.trendLine);

  const data = trendLine.map((t) => ({
    day: t.day.slice(5), // "MM-DD"
    avgTimeSec: Math.round(t.avgTimeMs / 1000),
  }));

  if (data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-[250px] text-zinc-500 text-sm">
        No trend data yet
      </div>
    );
  }

  return (
    <div className="flex-1">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
        Avg Completion Time (30 days)
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis dataKey="day" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#27272a",
              border: "1px solid #3f3f46",
              borderRadius: 6,
              color: "#e4e4e7",
            }}
            formatter={(value) => [`${value ?? 0}s`, "Avg Time"]}
          />
          <Line
            type="monotone"
            dataKey="avgTimeSec"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3, fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartsRow() {
  return (
    <div className="flex gap-6">
      <CategoryChart />
      <TrendChart />
    </div>
  );
}

// --- Leaderboard ---

function Leaderboard() {
  const leaderboard = useDashboardStore((s) => s.leaderboard);

  if (leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">
        No katas loaded yet.
      </div>
    );
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            <th className="pb-2 font-medium">Kata</th>
            <th className="pb-2 font-medium">Category</th>
            <th className="pb-2 font-medium">Difficulty</th>
            <th className="pb-2 font-medium">Best Time</th>
            <th className="pb-2 font-medium">Attempts</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row) => (
            <tr
              key={row.kataId}
              className="border-b border-zinc-100 dark:border-zinc-800/50"
            >
              <td className="py-2 font-medium">{row.kataName}</td>
              <td className="py-2 text-zinc-500 dark:text-zinc-400">{row.category}</td>
              <td className="py-2 text-zinc-500 dark:text-zinc-400">{row.difficulty}</td>
              <td className="py-2 font-mono text-zinc-500 dark:text-zinc-400">
                {row.bestTimeMs != null ? formatTime(row.bestTimeMs) : "--:--"}
              </td>
              <td className="py-2 text-zinc-500 dark:text-zinc-400">{row.attemptCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Session History ---

function DrillDown({ rows }: { rows: DrillDownRow[] }) {
  return (
    <tr>
      <td colSpan={5} className="p-0">
        <div className="bg-zinc-100 dark:bg-zinc-900 px-6 py-3">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.kataId}-${row.kataIndex}`}
                  className="border-b border-zinc-200 dark:border-zinc-800/50 last:border-0"
                >
                  <td className="py-1.5 font-medium">{row.kataName}</td>
                  <td className="py-1.5 text-zinc-500 dark:text-zinc-400">{row.category}</td>
                  <td className="py-1.5 font-mono text-zinc-500 dark:text-zinc-400">
                    {row.timeMs != null ? formatTime(row.timeMs) : "--:--"}
                  </td>
                  <td className="py-1.5">
                    {row.passed ? (
                      <span className="px-2 py-0.5 text-xs rounded bg-green-600/20 text-green-400 font-medium">
                        Pass
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded bg-red-600/20 text-red-400 font-medium">
                        Fail
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

function SessionHistory() {
  const sessionHistory = useDashboardStore((s) => s.sessionHistory);
  const sessionHistoryHasMore = useDashboardStore((s) => s.sessionHistoryHasMore);
  const selectedSessionId = useDashboardStore((s) => s.selectedSessionId);
  const drillDown = useDashboardStore((s) => s.drillDown);
  const loadDrillDown = useDashboardStore((s) => s.loadDrillDown);
  const clearDrillDown = useDashboardStore((s) => s.clearDrillDown);
  const loadMoreSessions = useDashboardStore((s) => s.loadMoreSessions);

  if (sessionHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">
        No sessions yet. Start a practice session to build your history.
      </div>
    );
  }

  const handleRowClick = (sessionId: number) => {
    if (selectedSessionId === sessionId) {
      clearDrillDown();
    } else {
      loadDrillDown(sessionId);
    }
  };

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
        Session History
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            <th className="pb-2 font-medium">Date</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Katas</th>
            <th className="pb-2 font-medium">Time</th>
            <th className="pb-2 font-medium">Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          {sessionHistory.map((session) => (
            <Fragment key={session.id}>
              <tr
                className="border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                onClick={() => handleRowClick(session.id)}
              >
                <td className="py-2 text-zinc-500 dark:text-zinc-400">
                  {new Date(session.started_at).toLocaleDateString()}
                </td>
                <td className="py-2 capitalize">{session.session_type}</td>
                <td className="py-2 text-zinc-500 dark:text-zinc-400">{session.kata_count}</td>
                <td className="py-2 font-mono text-zinc-500 dark:text-zinc-400">
                  {session.total_time_ms != null ? formatTime(session.total_time_ms) : "--:--"}
                </td>
                <td className="py-2 text-zinc-500 dark:text-zinc-400">
                  {session.pass_count}/{session.kata_count}
                </td>
              </tr>
              {selectedSessionId === session.id && drillDown && (
                <DrillDown key={`drill-${session.id}`} rows={drillDown} />
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      {sessionHistoryHasMore && (
        <button
          onClick={loadMoreSessions}
          className="mt-3 px-4 py-2 text-sm font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
        >
          Load more
        </button>
      )}
    </div>
  );
}

// --- Dev Toolbar ---

function DevToolbar({ onRefresh }: { onRefresh: () => void }) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (import.meta.env.PROD) return null;

  const handleSeed = async () => {
    setBusy(true);
    setStatus(null);
    const msg = await seedDashboard();
    setStatus(msg);
    setBusy(false);
    onRefresh();
  };

  const handleClear = async () => {
    setBusy(true);
    setStatus(null);
    const msg = await clearDashboardSeed();
    setStatus(msg);
    setBusy(false);
    onRefresh();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 border border-dashed border-yellow-600/40 rounded bg-yellow-600/5">
      <span className="text-xs font-medium text-yellow-500">DEV</span>
      <button
        onClick={handleSeed}
        disabled={busy}
        className="px-2.5 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
      >
        Seed Data
      </button>
      <button
        onClick={handleClear}
        disabled={busy}
        className="px-2.5 py-1 text-xs font-medium rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-50 transition-colors"
      >
        Clear Data
      </button>
      {busy && <span className="text-xs text-zinc-500">Working...</span>}
      {status && <span className="text-xs text-zinc-400">{status}</span>}
    </div>
  );
}

// --- Main Page ---

type DashTab = "dashboard" | "leaderboard" | "history";

export function DashboardPage() {
  const loading = useDashboardStore((s) => s.loading);
  const loadDashboard = useDashboardStore((s) => s.loadDashboard);
  const [tab, setTab] = useState<DashTab>("dashboard");

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const tabClass = (t: DashTab) =>
    `px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
      tab === t
        ? "border-blue-500 text-blue-600 dark:text-blue-400"
        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
    }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6 overflow-y-auto dark:bg-zinc-950">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <PracticeDailyButton />

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700">
        <button onClick={() => setTab("dashboard")} className={tabClass("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("leaderboard")} className={tabClass("leaderboard")}>Leaderboard</button>
        <button onClick={() => setTab("history")} className={tabClass("history")}>Session History</button>
      </div>

      {/* Tab content */}
      {tab === "dashboard" && (
        <>
          <DevToolbar onRefresh={loadDashboard} />
          <StatCards />
          <Heatmap />
          <ChartsRow />
        </>
      )}
      {tab === "leaderboard" && <Leaderboard />}
      {tab === "history" && <SessionHistory />}
    </div>
  );
}
