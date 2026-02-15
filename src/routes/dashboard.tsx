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

// ── Practice Daily ──

function PracticeDailyCard() {
  const navigate = useNavigate();
  const dailyKataIds = useSettingsStore((s) => s.dailyKataIds);
  const katas = useKataStore((s) => s.katas);
  const startSession = useSessionStore((s) => s.startSession);
  const startSessionTimer = useTimerStore((s) => s.startSessionTimer);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const [launching, setLaunching] = useState(false);

  const kataIdSet = new Set(katas.map((k) => k.id));
  const dailyCount = dailyKataIds.filter((id) => kataIdSet.has(id)).length;
  const hasDaily = dailyCount > 0;

  const handleClick = useCallback(async () => {
    if (!hasDaily) {
      navigate("/practice");
      return;
    }
    if (launching) return;
    setLaunching(true);
    const kataMap = new Map(katas.map((k) => [k.id, k]));
    const resolved = dailyKataIds.map((id) => kataMap.get(id)).filter(Boolean) as typeof katas;
    if (resolved.length === 0) {
      setLaunching(false);
      navigate("/practice");
      return;
    }
    resetKataTimer();
    startSessionTimer();
    const sessionId = await startSession("daily", resolved);
    navigate(`/session/${sessionId}`);
  }, [hasDaily, launching, dailyKataIds, katas, startSession, startSessionTimer, resetKataTimer, navigate]);

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/15 rounded-lg p-4 flex items-center justify-between animate-fade-in-up">
      <div>
        <h2 className="text-sm font-semibold text-primary">Daily Practice</h2>
        <p className="text-xs text-base-content/40 mt-0.5">
          {hasDaily ? `${dailyCount} kata${dailyCount !== 1 ? "s" : ""} queued` : "Set up your daily kata routine"}
        </p>
      </div>
      <button
        onClick={handleClick}
        disabled={launching}
        className="btn btn-primary btn-sm gap-1.5"
      >
        {launching ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z" />
          </svg>
        )}
        {launching ? "Launching..." : hasDaily ? "Start" : "Set Up"}
      </button>
    </div>
  );
}

// ── Stat Cards ──

function StatCards() {
  const streak = useDashboardStore((s) => s.streak);
  const today = useDashboardStore((s) => s.today);

  const cards = [
    {
      label: "Streak",
      value: streak,
      suffix: streak !== 1 ? " days" : " day",
      color: streak > 0 ? "text-primary" : "text-base-content",
    },
    {
      label: "Sessions Today",
      value: today.sessionCount,
      suffix: "",
      color: today.sessionCount > 0 ? "text-accent" : "text-base-content",
    },
    {
      label: "Time Today",
      value: today.totalTimeMs > 0 ? formatTime(today.totalTimeMs) : "00:00",
      suffix: "",
      color: "text-base-content",
      mono: true,
    },
    {
      label: "Pass Rate",
      value: today.totalKatas > 0 ? `${today.totalPassed}/${today.totalKatas}` : "0/0",
      suffix: "",
      color: today.totalPassed === today.totalKatas && today.totalKatas > 0 ? "text-success" : "text-base-content",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 stagger">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-base-100 rounded-lg p-4 border border-base-300/50"
        >
          <div className="text-[11px] font-medium text-base-content/35 uppercase tracking-wider mb-2">
            {card.label}
          </div>
          <div className={`text-xl font-bold ${card.color} ${card.mono ? "font-mono" : ""}`}>
            {card.value}
            {card.suffix && (
              <span className="text-sm font-normal text-base-content/30 ml-0.5">{card.suffix}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Heatmap ──

function getHeatmapClass(count: number): string {
  if (count === 0) return "hm-0";
  if (count <= 1) return "hm-1";
  if (count <= 3) return "hm-2";
  if (count <= 6) return "hm-3";
  return "hm-4";
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function Heatmap() {
  const heatmap = useDashboardStore((s) => s.heatmap);

  const countMap = new Map<string, number>();
  for (const d of heatmap) {
    countMap.set(d.day, d.kataCount);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 363);
  const startDow = start.getDay();
  start.setDate(start.getDate() - startDow);

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
    <div className="bg-base-100 rounded-lg p-5 border border-base-300/50 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-base-content/35 mb-4">
        Activity
      </h2>
      <div className="overflow-x-auto">
        {/* Month labels */}
        <div
          className="grid gap-[3px] ml-8 mb-1.5"
          style={{ gridTemplateColumns: "repeat(52, 11px)" }}
        >
          {Array.from({ length: 52 }, (_, col) => {
            const ml = monthLabels.find((m) => m.col === col);
            return (
              <span key={col} className="text-[10px] text-base-content/25 leading-none">
                {ml ? ml.label : ""}
              </span>
            );
          })}
        </div>
        {/* Grid body */}
        <div className="flex">
          <div className="flex flex-col gap-[3px] mr-1.5 pt-0">
            {DAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="text-[10px] text-base-content/25 h-[11px] leading-[11px] w-6 text-right"
              >
                {label}
              </span>
            ))}
          </div>
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateColumns: "repeat(52, 11px)",
              gridTemplateRows: "repeat(7, 11px)",
              gridAutoFlow: "column",
            }}
          >
            {cells.map((cell) => (
              <div
                key={cell.date}
                className={`w-[11px] h-[11px] rounded-[2px] ${getHeatmapClass(cell.count)} transition-colors`}
                title={`${cell.date}: ${cell.count} kata${cell.count !== 1 ? "s" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Charts ──

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "oklch(16% 0.02 255)",
  border: "1px solid oklch(24% 0.022 255)",
  borderRadius: 8,
  color: "oklch(85% 0.008 250)",
  fontSize: 12,
  fontFamily: "'Outfit', system-ui, sans-serif",
};

function CategoryChart() {
  const categoryBreakdown = useDashboardStore((s) => s.categoryBreakdown);

  const data = categoryBreakdown.map((c) => ({
    category: c.category,
    minutes: Math.round(c.totalTimeMs / 60000),
  }));

  if (data.length === 0) {
    return (
      <div className="flex-1 bg-base-100 rounded-lg border border-base-300/50 flex items-center justify-center h-[280px] text-base-content/30 text-sm">
        No category data yet
      </div>
    );
  }

  return (
    <div className="flex-1 bg-base-100 rounded-lg p-5 border border-base-300/50">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-base-content/35 mb-4">
        Time by Category
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(22% 0.02 255)" />
          <XAxis type="number" tick={{ fill: "oklch(50% 0.02 255)", fontSize: 11, fontFamily: "'Outfit', system-ui" }} />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: "oklch(50% 0.02 255)", fontSize: 11, fontFamily: "'Outfit', system-ui" }}
            width={70}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value) => [`${value ?? 0} min`, "Time"]} />
          <Bar dataKey="minutes" fill="oklch(78% 0.14 165)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendChart() {
  const trendLine = useDashboardStore((s) => s.trendLine);

  const data = trendLine.map((t) => ({
    day: t.day.slice(5),
    avgTimeSec: Math.round(t.avgTimeMs / 1000),
  }));

  if (data.length === 0) {
    return (
      <div className="flex-1 bg-base-100 rounded-lg border border-base-300/50 flex items-center justify-center h-[280px] text-base-content/30 text-sm">
        No trend data yet
      </div>
    );
  }

  return (
    <div className="flex-1 bg-base-100 rounded-lg p-5 border border-base-300/50">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-base-content/35 mb-4">
        Avg Completion Time (30d)
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ left: 0, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(22% 0.02 255)" />
          <XAxis dataKey="day" tick={{ fill: "oklch(50% 0.02 255)", fontSize: 11, fontFamily: "'Outfit', system-ui" }} />
          <YAxis tick={{ fill: "oklch(50% 0.02 255)", fontSize: 11, fontFamily: "'Outfit', system-ui" }} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value) => [`${value ?? 0}s`, "Avg Time"]} />
          <Line
            type="monotone"
            dataKey="avgTimeSec"
            stroke="oklch(70% 0.13 180)"
            strokeWidth={2}
            dot={{ r: 2.5, fill: "oklch(70% 0.13 180)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartsRow() {
  return (
    <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
      <CategoryChart />
      <TrendChart />
    </div>
  );
}

// ── Leaderboard ──

function Leaderboard() {
  const leaderboard = useDashboardStore((s) => s.leaderboard);

  if (leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-base-content/30 text-sm">
        No katas loaded yet.
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-lg border border-base-300/50 overflow-hidden animate-fade-in-up">
      <table className="table table-sm">
        <thead>
          <tr className="text-left text-[11px] text-base-content/35 uppercase tracking-wider">
            <th className="font-semibold">Kata</th>
            <th className="font-semibold">Category</th>
            <th className="font-semibold">Difficulty</th>
            <th className="font-semibold">Best Time</th>
            <th className="font-semibold">Attempts</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row) => (
            <tr key={row.kataId} className="border-base-300/30">
              <td className="font-medium text-sm">{row.kataName}</td>
              <td className="text-base-content/45 text-sm">{row.category}</td>
              <td className="text-base-content/45 text-sm">{row.difficulty}</td>
              <td className="font-mono text-base-content/45 text-sm">
                {row.bestTimeMs != null ? formatTime(row.bestTimeMs) : "--:--"}
              </td>
              <td className="text-base-content/45 text-sm tabular-nums">{row.attemptCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Session History ──

function DrillDown({ rows }: { rows: DrillDownRow[] }) {
  return (
    <tr>
      <td colSpan={5} className="p-0">
        <div className="bg-base-200 px-6 py-3">
          <table className="table table-sm">
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.kataId}-${row.kataIndex}`}
                  className="border-b border-base-300/30 last:border-0"
                >
                  <td className="font-medium text-sm">{row.kataName}</td>
                  <td className="text-base-content/45 text-sm">{row.category}</td>
                  <td className="font-mono text-base-content/45 text-sm">
                    {row.timeMs != null ? formatTime(row.timeMs) : "--:--"}
                  </td>
                  <td>
                    {row.passed ? (
                      <span className="badge badge-success badge-xs">Pass</span>
                    ) : (
                      <span className="badge badge-error badge-xs">Fail</span>
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
      <div className="flex items-center justify-center h-48 text-base-content/30 text-sm">
        No sessions yet. Start practicing to build your history.
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
    <div className="bg-base-100 rounded-lg border border-base-300/50 overflow-hidden animate-fade-in-up">
      <table className="table table-sm">
        <thead>
          <tr className="text-left text-[11px] text-base-content/35 uppercase tracking-wider">
            <th className="font-semibold">Date</th>
            <th className="font-semibold">Type</th>
            <th className="font-semibold">Katas</th>
            <th className="font-semibold">Time</th>
            <th className="font-semibold">Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          {sessionHistory.map((session) => (
            <Fragment key={session.id}>
              <tr
                className="cursor-pointer hover:bg-base-300/30 transition-colors border-base-300/30"
                onClick={() => handleRowClick(session.id)}
              >
                <td className="text-base-content/45 text-sm">
                  {new Date(session.started_at).toLocaleDateString()}
                </td>
                <td className="capitalize text-sm">{session.session_type}</td>
                <td className="text-base-content/45 text-sm tabular-nums">{session.kata_count}</td>
                <td className="font-mono text-base-content/45 text-sm">
                  {session.total_time_ms != null ? formatTime(session.total_time_ms) : "--:--"}
                </td>
                <td className="text-base-content/45 text-sm tabular-nums">
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
        <div className="px-4 py-3 border-t border-base-300/30">
          <button onClick={loadMoreSessions} className="btn btn-ghost btn-sm text-xs">
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

// ── Dev Toolbar ──

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
    <div className="flex items-center gap-3 px-4 py-2 border border-dashed border-warning/30 rounded-lg bg-warning/5">
      <span className="badge badge-warning badge-xs">DEV</span>
      <button onClick={handleSeed} disabled={busy} className="btn btn-primary btn-xs">Seed</button>
      <button onClick={handleClear} disabled={busy} className="btn btn-error btn-outline btn-xs">Clear</button>
      {busy && <span className="text-xs text-base-content/40">Working...</span>}
      {status && <span className="text-xs text-base-content/40">{status}</span>}
    </div>
  );
}

// ── Main Page ──

type DashTab = "dashboard" | "leaderboard" | "history";

export function DashboardPage() {
  const loading = useDashboardStore((s) => s.loading);
  const loadDashboard = useDashboardStore((s) => s.loadDashboard);
  const [tab, setTab] = useState<DashTab>("dashboard");

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-base-content/30 text-sm">
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner loading-sm text-primary" />
          Loading dashboard
        </div>
      </div>
    );
  }

  const tabClass = (t: DashTab) =>
    `px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
      tab === t
        ? "bg-base-100 text-base-content shadow-sm"
        : "text-base-content/35 hover:text-base-content/60"
    }`;

  return (
    <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto">
      {/* Daily Practice CTA */}
      <PracticeDailyCard />

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-base-300/40 rounded-lg p-1 self-start">
        <button onClick={() => setTab("dashboard")} className={tabClass("dashboard")}>Overview</button>
        <button onClick={() => setTab("leaderboard")} className={tabClass("leaderboard")}>Leaderboard</button>
        <button onClick={() => setTab("history")} className={tabClass("history")}>History</button>
      </div>

      {/* Tab content */}
      {tab === "dashboard" && (
        <div className="flex flex-col gap-4">
          <DevToolbar onRefresh={loadDashboard} />
          <StatCards />
          <Heatmap />
          <ChartsRow />
        </div>
      )}
      {tab === "leaderboard" && <Leaderboard />}
      {tab === "history" && <SessionHistory />}
    </div>
  );
}
