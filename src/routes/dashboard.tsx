import { Fragment, useEffect, useId, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
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
import { AlertCircle, ArrowUpRight, ChevronRight, Info } from "lucide-react";
import { useKataStore } from "../stores/kata-store";
import { useDashboardStore } from "../stores/dashboard-store";
import type { DrillDownRow } from "../stores/dashboard-store";
import { useSettingsStore, type DashboardTab, type KataLanguage } from "../stores/settings-store";
import { formatTime } from "../lib/format";
import { OPEN_MODULES_PARAM, serializeOpenModuleIds } from "../lib/module-page-state";

function activateRow(event: KeyboardEvent, action: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  action();
}

function TooltipHint({
  label,
  text,
  children,
  align = "right",
  triggerClassName = "",
}: {
  label: string;
  text: string;
  children: ReactNode;
  align?: "center" | "right";
  triggerClassName?: string;
}) {
  const id = useId();
  const positionClass =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "right-0";

  return (
    <span
      className="group relative inline-flex"
    >
      <span
        className={`inline-flex cursor-help items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${triggerClassName}`}
        aria-describedby={id}
        aria-label={`${label}: ${text}`}
        tabIndex={0}
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none invisible absolute top-full z-50 mt-2 w-64 rounded-md border border-base-300 bg-base-100 px-3 py-2 text-left text-xs normal-case leading-5 tracking-normal text-base-content/75 opacity-0 shadow-xl shadow-black/20 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ${positionClass}`}
      >
        {text}
      </span>
    </span>
  );
}

function MetricHint({ label, text }: { label: string; text: string }) {
  return (
    <TooltipHint label={label} text={text}>
      <Info className="h-3.5 w-3.5 text-base-content/35" aria-hidden="true" />
      <span className="text-xs text-base-content/45">How this is calculated</span>
    </TooltipHint>
  );
}

function useOpenDashboardProblem() {
  const navigate = useNavigate();
  const language = useSettingsStore((s) => s.language);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const loadKatas = useKataStore((s) => s.loadKatas);

  return async (kataId: number, kataLanguage: string) => {
    if (kataLanguage !== language) {
      await setSetting("language", kataLanguage as KataLanguage);
      await loadKatas(kataLanguage);
    }

    navigate(`/editor/${kataId}`);
  };
}

function resetLibraryFilters(setLibraryUI: ReturnType<typeof useKataStore.getState>["setLibraryUI"]) {
  setLibraryUI({
    librarySearch: "",
    libraryLeetcodeOnly: false,
    libraryBlind75Only: false,
    libraryNeetcodeOnly: false,
    libraryNeetcode250Only: false,
    libraryDifficultyFilters: [],
    libraryImplementationSizeFilters: [],
  });
}

type ProblemSetFilter = "leetcode" | "neetcode" | "blind75";

function useOpenProblemSetFilter() {
  const navigate = useNavigate();
  const setLibraryUI = useKataStore((s) => s.setLibraryUI);

  return (filter: ProblemSetFilter) => {
    resetLibraryFilters(setLibraryUI);
    if (filter === "leetcode") setLibraryUI({ libraryLeetcodeOnly: true });
    if (filter === "neetcode") setLibraryUI({ libraryNeetcodeOnly: true });
    if (filter === "blind75") setLibraryUI({ libraryBlind75Only: true });
    navigate("/problems");
  };
}

function useOpenDashboardModule() {
  const navigate = useNavigate();
  const setLibraryUI = useKataStore((s) => s.setLibraryUI);

  return (moduleId: string) => {
    const openModules = moduleId === "1-d-dp" || moduleId === "2-d-dp"
      ? ["dynamic-programming", moduleId]
      : [moduleId];

    resetLibraryFilters(setLibraryUI);
    navigate(`/modules?${OPEN_MODULES_PARAM}=${encodeURIComponent(serializeOpenModuleIds(openModules))}`);
  };
}

// ── Stat Cards ──

function NextPracticeFocus() {
  const reviewQueue = useDashboardStore((s) => s.reviewQueue);
  const moduleProgress = useDashboardStore((s) => s.moduleProgress);
  const leetcode = useDashboardStore((s) => s.leetcodeProgress);
  const openProblem = useOpenDashboardProblem();
  const openModule = useOpenDashboardModule();
  const openProblemSet = useOpenProblemSetFilter();

  const review = reviewQueue[0] ?? null;
  const weakModule = [...moduleProgress]
    .sort((a, b) => {
      if (b.needsReview !== a.needsReview) return b.needsReview - a.needsReview;
      if (a.percentSolved !== b.percentSolved) return a.percentSolved - b.percentSolved;
      return b.total - a.total;
    })[0] ?? null;

  const primaryTitle = review ? review.kataName : weakModule ? weakModule.moduleLabel : "Start a focused review";
  const primaryDetail = review
    ? review.reason
    : weakModule
    ? `${weakModule.solved}/${weakModule.total} solved in this module`
    : "Use the recommended problem sets to choose the next drill.";

  const primaryAction = () => {
    if (review) {
      void openProblem(review.kataId, review.language);
      return;
    }
    if (weakModule) {
      openModule(weakModule.moduleId);
      return;
    }
    openProblemSet("leetcode");
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-base-100 p-4 shadow-sm shadow-primary/5 animate-fade-in-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-base-content">Next practice focus</h2>
          <div className="mt-1 truncate text-lg font-bold text-primary">{primaryTitle}</div>
          <p className="mt-1 text-sm text-base-content/45">{primaryDetail}</p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={primaryAction}
            className="btn btn-primary btn-sm"
          >
            {review ? "Open review problem" : weakModule ? "Open weakest module" : "Open problems"}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
          {weakModule && (
            <button
              type="button"
              onClick={() => openModule(weakModule.moduleId)}
              className="btn btn-sm kata-btn-secondary"
            >
              {weakModule.moduleLabel}
            </button>
          )}
          {leetcode.recommendedUnattempted > 0 && (
            <button
              type="button"
              onClick={() => openProblemSet("leetcode")}
              className="btn btn-sm kata-btn-secondary"
            >
              {leetcode.recommendedUnattempted} unattempted
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 stagger">
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
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-base-content/35">
          Activity
        </h2>
        <MetricHint
          label="Activity"
          text="Completed katas by day over the last year. Darker squares mean more completed katas; focus or hover a square for the exact count."
        />
      </div>
      <div className="w-full min-w-0 pb-1">
        {/* Month labels */}
        <div
          className="ml-8 mb-1.5 grid min-w-0 gap-[3px]"
          style={{ gridTemplateColumns: "repeat(52, minmax(0, 1fr))" }}
        >
          {Array.from({ length: 52 }, (_, col) => {
            const ml = monthLabels.find((m) => m.col === col);
            return (
              <span key={col} className="overflow-visible text-[10px] leading-none text-base-content/25">
                {ml ? ml.label : ""}
              </span>
            );
          })}
        </div>
        {/* Grid body */}
        <div className="flex min-w-0">
          <div className="mr-1.5 grid w-6 shrink-0 gap-[3px] pt-0" style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}>
            {DAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="w-6 text-right text-[10px] leading-none text-base-content/25"
              >
                {label}
              </span>
            ))}
          </div>
          <div
            className="grid aspect-[52/7] min-w-0 flex-1 gap-[3px]"
            style={{
              gridTemplateColumns: "repeat(52, minmax(0, 1fr))",
              gridTemplateRows: "repeat(7, minmax(0, 1fr))",
              gridAutoFlow: "column",
            }}
          >
            {cells.map((cell) => (
              <TooltipHint
                key={cell.date}
                label={cell.date}
                text={`${cell.count} completed kata${cell.count !== 1 ? "s" : ""}`}
                align="center"
                triggerClassName="h-full w-full min-w-0"
              >
                <span
                  className={`h-full w-full min-w-0 rounded-[2px] ${getHeatmapClass(cell.count)} transition-colors`}
                  aria-hidden="true"
                />
              </TooltipHint>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Charts ──

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "var(--color-base-100)",
  border: "1px solid var(--color-base-300)",
  borderRadius: 8,
  color: "var(--color-base-content)",
  fontSize: 12,
  fontFamily: "'Outfit', system-ui, sans-serif",
};

const CHART_GRID_COLOR = "var(--color-base-300)";

const CHART_TICK_STYLE = {
  fill: "var(--color-base-content)",
  fillOpacity: 0.45,
  fontSize: 11,
  fontFamily: "'Outfit', system-ui",
};

const CHART_CURSOR_STYLE = {
  fill: "var(--color-base-300)",
  fillOpacity: 0.35,
};

function CategoryChart() {
  const categoryBreakdown = useDashboardStore((s) => s.categoryBreakdown);
  const navigate = useNavigate();
  const setLibraryUI = useKataStore((s) => s.setLibraryUI);

  const data = categoryBreakdown.map((c) => ({
    category: c.category,
    minutes: Math.round(c.totalTimeMs / 60000),
  }));

  const openCategory = (category: string) => {
    resetLibraryFilters(setLibraryUI);
    setLibraryUI({ librarySearch: category });
    navigate("/problems");
  };

  const openCategoryFromBar = (entry: unknown) => {
    const candidate = entry as { category?: unknown; payload?: { category?: unknown } };
    const category = typeof candidate.category === "string"
      ? candidate.category
      : typeof candidate.payload?.category === "string"
      ? candidate.payload.category
      : null;
    if (category) openCategory(category);
  };

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
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} strokeOpacity={0.5} />
          <XAxis type="number" tick={CHART_TICK_STYLE} />
          <YAxis
            type="category"
            dataKey="category"
            tick={CHART_TICK_STYLE}
            width={70}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            cursor={CHART_CURSOR_STYLE}
            formatter={(value) => [`${value ?? 0} min`, "Time"]}
          />
          <Bar
            dataKey="minutes"
            fill="var(--color-primary)"
            radius={[0, 4, 4, 0]}
            className="cursor-pointer"
            onClick={(entry: unknown) => openCategoryFromBar(entry)}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-2">
        {data.map((row) => (
          <button
            key={row.category}
            type="button"
            onClick={() => openCategory(row.category)}
            className="btn btn-ghost btn-xs h-auto min-h-0 rounded-md px-2 py-1 text-[11px] font-medium text-base-content/45 hover:bg-base-300/50 hover:text-base-content/70 focus-visible:bg-base-300/50 focus-visible:text-base-content/70"
          >
            <span className="max-w-36 truncate">{row.category}</span>
            <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          </button>
        ))}
      </div>
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
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} strokeOpacity={0.5} />
          <XAxis dataKey="day" tick={CHART_TICK_STYLE} />
          <YAxis tick={CHART_TICK_STYLE} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value) => [`${value ?? 0}s`, "Avg Time"]} />
          <Line
            type="monotone"
            dataKey="avgTimeSec"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ r: 2.5, fill: "var(--color-accent)" }}
            activeDot={{ r: 4, fill: "var(--color-accent)", stroke: "var(--color-base-100)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartsRow() {
  return (
    <div className="flex flex-col gap-3 animate-fade-in-up xl:flex-row" style={{ animationDelay: "225ms" }}>
      <CategoryChart />
      <TrendChart />
    </div>
  );
}

// -- High Value Insights --

function MasteryPanel() {
  const summary = useDashboardStore((s) => s.masterySummary);
  const leetcode = useDashboardStore((s) => s.leetcodeProgress);
  const openProblemSet = useOpenProblemSetFilter();
  const attempted = Math.max(summary.attempted, 1);
  const strongPct = (summary.strong / attempted) * 100;
  const developingPct = (summary.developing / attempted) * 100;
  const reviewPct = (summary.needsReview / attempted) * 100;
  const progressRows = [
    {
      label: "LeetCode",
      solved: leetcode.solved,
      total: leetcode.total,
      percent: leetcode.percentSolved,
      color: "progress-primary",
      filter: "leetcode" as ProblemSetFilter,
    },
    {
      label: "NeetCode",
      solved: leetcode.neetcodeSolved,
      total: leetcode.neetcodeTotal,
      percent: leetcode.neetcodePercentSolved,
      color: "progress-info",
      filter: "neetcode" as ProblemSetFilter,
    },
    {
      label: "Blind 75",
      solved: leetcode.blind75Solved,
      total: leetcode.blind75Total,
      percent: leetcode.blind75PercentSolved,
      color: "progress-success",
      filter: "blind75" as ProblemSetFilter,
    },
  ];

  return (
    <div className="bg-base-100 rounded-lg p-5 border border-base-300/50">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-base-content/35">
          Problem Mastery
        </h2>
        <MetricHint
          label="Problem mastery"
          text="Strong problems divided by attempted problems."
        />
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-bold text-primary">{summary.percent}%</div>
          <div className="text-xs text-base-content/45 mt-1">{summary.attempted} attempted</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-right">
          <div>
            <div className="text-lg font-bold text-success">{summary.strong}</div>
            <TooltipHint label="Strong" text="Passed at least twice, including the current streak." align="center">
              <span className="text-[10px] uppercase tracking-wider text-base-content/35">Strong</span>
            </TooltipHint>
          </div>
          <div>
            <div className="text-lg font-bold text-warning">{summary.developing}</div>
            <TooltipHint label="Developing" text="Passed before, but not yet stable enough to count as strong." align="center">
              <span className="text-[10px] uppercase tracking-wider text-base-content/35">Developing</span>
            </TooltipHint>
          </div>
          <div>
            <div className="text-lg font-bold text-error">{summary.needsReview}</div>
            <TooltipHint label="Review" text="Failed, due for review, or not passed yet." align="center">
              <span className="text-[10px] uppercase tracking-wider text-base-content/35">Review</span>
            </TooltipHint>
          </div>
        </div>
      </div>
      <div className="mt-5 h-2 rounded-full overflow-hidden bg-base-300 flex">
        <div className="bg-success" style={{ width: `${strongPct}%` }} />
        <div className="bg-warning" style={{ width: `${developingPct}%` }} />
        <div className="bg-error" style={{ width: `${reviewPct}%` }} />
      </div>
      <div className="mt-5 border-t border-base-300/50 pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/35">
            Progress
          </div>
          <div className="text-xs text-base-content/40">
            {leetcode.recommendedUnattempted} recommended problems not attempted yet
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {progressRows.map((row) => (
            <button
              key={row.label}
              type="button"
              onClick={() => openProblemSet(row.filter)}
              className="block w-full rounded-md p-2 text-left transition-colors hover:bg-base-300/30 focus-visible:bg-base-300/30 focus-visible:outline-none"
              aria-label={`Open ${row.label} problems`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <div className="truncate text-xs font-medium text-base-content/70">{row.label}</div>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-base-content/30" aria-hidden="true" />
                </div>
                <div className="text-xs tabular-nums text-base-content/45">
                  {row.solved}/{row.total}
                </div>
              </div>
              <progress className={`progress ${row.color} h-2 w-full bg-base-content/15`} value={row.percent} max="100" />
              <div className="mt-1 text-[11px] tabular-nums text-base-content/35">
                {row.percent}% solved at least once
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ["Easy", leetcode.easySolved, "text-success"],
            ["Medium", leetcode.mediumSolved, "text-warning"],
            ["Hard", leetcode.hardSolved, "text-error"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-md border border-base-300/50 bg-base-200/60 px-3 py-2">
              <div className={`text-sm font-bold tabular-nums ${color}`}>{value}</div>
              <div className="text-[10px] uppercase tracking-wider text-base-content/35">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentlyImprovedPanel() {
  const recentlyImproved = useDashboardStore((s) => s.recentlyImproved);
  const openProblem = useOpenDashboardProblem();

  return (
    <div className="bg-base-100 rounded-lg border border-base-300/50 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-base-content/35">
          Recently Improved
        </h2>
        <span className="text-xs text-base-content/40">last 30 days</span>
      </div>
      {recentlyImproved.length === 0 ? (
        <div className="px-5 pb-5 text-sm text-base-content/35">No new best times yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm min-w-[360px]">
            <tbody>
              {recentlyImproved.map((row) => (
                <tr
                  key={`${row.kataId}-${row.improvedAt}`}
                  onClick={() => void openProblem(row.kataId, row.language)}
                  onKeyDown={(event) => activateRow(event, () => void openProblem(row.kataId, row.language))}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open problem: ${row.kataName}`}
                  className="cursor-pointer border-base-300/30 transition-colors hover:bg-base-300/30 focus-visible:bg-base-300/30 focus-visible:outline-none"
                >
                  <td className="min-w-0">
                    <div className="font-medium text-sm truncate">{row.kataName}</div>
                    <div className="font-mono text-xs text-base-content/40">
                      {formatTime(row.previousBestMs)} → {formatTime(row.currentBestMs)}
                    </div>
                  </td>
                  <td className="text-right text-success font-bold tabular-nums">
                    -{row.improvementPercent}%
                  </td>
                  <td className="w-8 text-right text-base-content/30" aria-label="Open problem">
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReviewQueuePanel() {
  const reviewQueue = useDashboardStore((s) => s.reviewQueue);
  const openProblem = useOpenDashboardProblem();

  return (
    <div className="bg-base-100 rounded-lg border border-base-300/50 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-base-content/35">
          Review Queue
        </h2>
        <span className="text-xs text-base-content/40">highest priority</span>
      </div>
      {reviewQueue.length === 0 ? (
        <div className="px-5 pb-5 text-sm text-base-content/35">No review items right now.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm min-w-[520px]">
            <tbody>
              {reviewQueue.map((row) => (
                <tr
                  key={row.kataId}
                  onClick={() => void openProblem(row.kataId, row.language)}
                  onKeyDown={(event) => activateRow(event, () => void openProblem(row.kataId, row.language))}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open problem: ${row.kataName}`}
                  className="cursor-pointer border-base-300/30 transition-colors hover:bg-base-300/30 focus-visible:bg-base-300/30 focus-visible:outline-none"
                >
                  <td className="min-w-0">
                    <div className="truncate text-sm font-medium">{row.kataName}</div>
                    <div className="truncate text-xs text-base-content/40">{row.reason}</div>
                  </td>
                  <td className="hidden text-base-content/45 text-sm sm:table-cell">
                    <div className="truncate">{row.category}</div>
                  </td>
                  <td className="text-right text-sm tabular-nums text-error">
                    {row.failedAttempts} failed
                  </td>
                  <td className="w-8 text-right text-base-content/30" aria-label="Open problem">
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ModuleProgressPanel() {
  const moduleProgress = useDashboardStore((s) => s.moduleProgress);
  const openModule = useOpenDashboardModule();

  return (
    <div className="bg-base-100 rounded-lg p-5 border border-base-300/50">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-base-content/35">
          Module Progress
        </h2>
        <span className="text-xs text-base-content/40">solved / total</span>
      </div>
      {moduleProgress.length === 0 ? (
        <div className="text-sm text-base-content/35">No modules loaded.</div>
      ) : (
        <div className="space-y-3">
          {moduleProgress.map((row) => (
            <button
              key={row.moduleId}
              type="button"
              onClick={() => openModule(row.moduleId)}
              className="block w-full rounded-md p-2 text-left transition-colors hover:bg-base-300/30 focus-visible:bg-base-300/30 focus-visible:outline-none"
              aria-label={`Open module: ${row.moduleLabel}`}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="min-w-0 flex items-center gap-2">
                  <div className="truncate text-sm font-medium">{row.moduleLabel}</div>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-base-content/30" aria-hidden="true" />
                </div>
                <div className="shrink-0 text-xs text-base-content/45 tabular-nums">
                  {row.solved}/{row.total}
                </div>
              </div>
              <progress className="progress progress-success h-2 w-full bg-base-content/20" value={row.percentSolved} max="100" />
              <div className="mt-1 text-[11px] text-base-content/35">
                {row.strong} strong · {row.developing} developing · {row.needsReview} review
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HighValueInsights() {
  return (
    <div className="grid gap-3 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
      <ReviewQueuePanel />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-3">
        <MasteryPanel />
        <RecentlyImprovedPanel />
      </div>
    </div>
  );
}

// ── Leaderboard ──

function Leaderboard() {
  const leaderboard = useDashboardStore((s) => s.leaderboard);
  const openProblem = useOpenDashboardProblem();

  if (leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-base-content/30 text-sm">
        No katas loaded yet.
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-lg border border-base-300/50 overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <table className="table table-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-[11px] text-base-content/35 uppercase tracking-wider">
              <th className="font-semibold">Kata</th>
              <th className="font-semibold">Category</th>
              <th className="font-semibold">Difficulty</th>
              <th className="font-semibold">Best Time</th>
              <th className="font-semibold">Attempts</th>
              <th className="w-8" aria-label="Open problem" />
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row) => (
              <tr
                key={row.kataId}
                onClick={() => void openProblem(row.kataId, row.language)}
                onKeyDown={(event) => activateRow(event, () => void openProblem(row.kataId, row.language))}
                role="button"
                tabIndex={0}
                aria-label={`Open problem: ${row.kataName}`}
                className="cursor-pointer border-base-300/30 transition-colors hover:bg-base-300/30 focus-visible:bg-base-300/30 focus-visible:outline-none"
              >
                <td className="min-w-0">
                  <div className="truncate text-sm font-medium">{row.kataName}</div>
                </td>
                <td className="text-base-content/45 text-sm">
                  <div className="truncate">{row.category}</div>
                </td>
                <td className="text-base-content/45 text-sm">{row.difficulty}</td>
                <td className="font-mono text-base-content/45 text-sm">
                  {row.bestTimeMs != null ? formatTime(row.bestTimeMs) : "--:--"}
                </td>
                <td className="text-base-content/45 text-sm tabular-nums">{row.attemptCount}</td>
                <td className="w-8 text-right text-base-content/30" aria-label="Open problem">
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Session History ──

function DrillDown({ rows }: { rows: DrillDownRow[] }) {
  const openProblem = useOpenDashboardProblem();

  return (
    <tr>
      <td colSpan={6} className="p-0">
        <div className="overflow-x-auto bg-base-200 px-6 py-3">
          <table className="table table-sm min-w-[520px]">
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => void openProblem(row.kataId, row.language)}
                  onKeyDown={(event) => activateRow(event, () => void openProblem(row.kataId, row.language))}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open problem: ${row.kataName}`}
                  className="cursor-pointer border-b border-base-300/30 transition-colors last:border-0 hover:bg-base-300/40 focus-visible:bg-base-300/40 focus-visible:outline-none"
                >
                  <td className="min-w-0">
                    <div className="truncate text-sm font-medium">{row.kataName}</div>
                  </td>
                  <td className="text-base-content/45 text-sm">
                    <div className="truncate">{row.category}</div>
                  </td>
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
                  <td className="w-8 text-right text-base-content/30" aria-label="Open problem">
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
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
      <div className="overflow-x-auto">
        <table className="table table-sm min-w-[620px]">
          <thead>
            <tr className="text-left text-[11px] text-base-content/35 uppercase tracking-wider">
              <th className="w-8" aria-label="Expand session" />
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
                  className="cursor-pointer border-base-300/30 transition-colors hover:bg-base-300/30 focus-visible:bg-base-300/30 focus-visible:outline-none"
                  onClick={() => handleRowClick(session.id)}
                  onKeyDown={(event) => activateRow(event, () => handleRowClick(session.id))}
                  role="button"
                  tabIndex={0}
                  aria-expanded={selectedSessionId === session.id}
                  aria-label={`${selectedSessionId === session.id ? "Collapse" : "Expand"} ${session.session_type} session from ${new Date(session.started_at).toLocaleDateString()}`}
                >
                  <td className="w-8 text-base-content/30">
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform ${selectedSessionId === session.id ? "rotate-90 text-primary" : ""}`}
                      aria-hidden="true"
                    />
                  </td>
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
      </div>
      {sessionHistoryHasMore && (
        <div className="px-4 py-3 border-t border-base-300/30">
          <button onClick={loadMoreSessions} className="btn btn-sm kata-btn-secondary text-xs">
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──

export function DashboardPage() {
  const loading = useDashboardStore((s) => s.loading);
  const error = useDashboardStore((s) => s.error);
  const loadDashboard = useDashboardStore((s) => s.loadDashboard);
  const dashboardTab = useSettingsStore((s) => s.dashboardTab);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const [tab, setTabState] = useState<DashboardTab>(dashboardTab);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const setTab = (next: DashboardTab) => {
    setTabState(next);
    void setSetting("dashboardTab", next);
  };

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

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border border-error/25 bg-base-100 p-5 shadow-sm shadow-error/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden="true" />
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-base-content">Dashboard data could not load</h1>
              <p className="mt-2 break-words text-sm leading-6 text-base-content/55">{error}</p>
              <button
                type="button"
                onClick={() => void loadDashboard()}
                className="btn btn-primary btn-sm mt-4"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabClass = (t: DashboardTab) =>
    `px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
      tab === t
        ? "bg-base-100 text-base-content shadow-sm"
        : "text-base-content/35 hover:text-base-content/60"
    }`;

  return (
    <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto">
      {/* Tab switcher */}
      <div className="flex max-w-full flex-wrap items-center justify-center gap-1 bg-base-300/40 rounded-lg p-1 self-center">
        <button onClick={() => setTab("overview")} className={tabClass("overview")}>Overview</button>
        <button onClick={() => setTab("progress")} className={tabClass("progress")}>Progress</button>
        <button onClick={() => setTab("leaderboard")} className={tabClass("leaderboard")}>Leaderboard</button>
        <button onClick={() => setTab("history")} className={tabClass("history")}>History</button>
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="flex flex-col gap-4">
          <NextPracticeFocus />
          <HighValueInsights />
          <StatCards />
          <ChartsRow />
          <Heatmap />
        </div>
      )}
      {tab === "progress" && (
        <div className="mx-auto w-full lg:w-3/4">
          <ModuleProgressPanel />
        </div>
      )}
      {tab === "leaderboard" && <Leaderboard />}
      {tab === "history" && <SessionHistory />}
    </div>
  );
}
