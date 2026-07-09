import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useKataStore } from "../stores/kata-store";
import { reseedKatas } from "../lib/database";
import { useSettingsStore, type PracticeConfig } from "../stores/settings-store";
import { useSessionStore, fetchKataStats, fetchAttemptHistory } from "../stores/session-store";
import { computeSrState, formatDue, type SrState } from "../lib/sr";
import { useTimerStore } from "../stores/timer-store";
import type { KataStats } from "../stores/session-store";
import type { Kata } from "../types/editor";
import { levelsForKatas, visibleSelection, mergeSelection, CATEGORY_LEVEL } from "../lib/levels";

type Mode = "sr" | "daily" | "weak" | "speed" | "level";
type SizeOpt = 3 | 5 | 10 | 15 | 20 | "all";
type KataStatus = "new" | "failed" | "slow" | "due" | "ok";
type DifficultyFilter = "" | "easy" | "medium" | "hard";

interface QueueItem {
  kata: Kata;
  stats: KataStats | undefined;
  score: number;
  status: KataStatus;
  meta: string;
  streak: number;
  dueAt: number | null;
}

const MODES: { id: Mode; title: string; desc: string }[] = [
  {
    id: "sr",
    title: "SR Queue",
    desc: "Katas ranked by how urgently they need review — new, failed, and idle float to the top.",
  },
  {
    id: "daily",
    title: "Daily",
    desc: "Your starred katas in SR order. Re-run anytime.",
  },
  {
    id: "weak",
    title: "Weak Spots",
    desc: "Only katas where your last attempt failed.",
  },
  {
    id: "speed",
    title: "Speed Run",
    desc: "Katas you've already solved. Race your best time.",
  },
  {
    id: "level",
    title: "Level Up",
    desc: "Pick one or more levels and drill only those topics.",
  },
];

const SIZE_OPTIONS: SizeOpt[] = [3, 5, 10, 15, 20, "all"];

const DIFFICULTY_OPTIONS: { id: DifficultyFilter; label: string }[] = [
  { id: "", label: "All" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

function srStatusToKataStatus(sr: SrState): KataStatus {
  if (sr.status === "new") return "new";
  if (sr.status === "failed") return "failed";
  if (sr.status === "due") return "due";
  return "ok";
}


function buildMeta(kata: Kata, stats: KataStats | undefined, status: KataStatus): string {
  if (!stats || stats.attempt_count === 0) return `${kata.category} · never attempted`;

  const daysSince = stats.last_attempt_at
    ? Math.floor((Date.now() - new Date(stats.last_attempt_at).getTime()) / 86_400_000)
    : 999;

  const daysStr =
    daysSince === 0 ? "today" : daysSince === 1 ? "yesterday" : `${daysSince} days ago`;

  switch (status) {
    case "new":
      return `${kata.category} · never attempted`;
    case "failed":
      return `${kata.category} · failed ${daysStr}`;
    case "slow":
      return daysSince === 0
        ? `${kata.category} · slow`
        : `${kata.category} · slow · ${daysSince} days idle`;
    case "due":
      return daysSince === 0
        ? `${kata.category} · practiced today`
        : `${kata.category} · ${daysSince} days idle`;
    case "ok":
      return `${kata.category} · last passed ${daysStr}`;
  }
}

const DOT_CLASS: Record<KataStatus, string> = {
  new: "bg-[#f7768e] shadow-[0_0_5px_#f7768e88]",
  failed: "bg-[#ff9e64] shadow-[0_0_5px_#ff9e6488]",
  slow: "bg-[#e0af68] shadow-[0_0_5px_#e0af6888]",
  due: "bg-[#7aa2f7] shadow-[0_0_5px_#7aa2f788]",
  ok: "bg-[#9ece6a] shadow-[0_0_5px_#9ece6a88]",
};

const BADGE_CLASS: Record<KataStatus, string> = {
  new: "bg-[#f7768e]/10 text-[#f7768e] border border-[#f7768e]/25",
  failed: "bg-[#ff9e64]/10 text-[#ff9e64] border border-[#ff9e64]/25",
  slow: "bg-[#e0af68]/10 text-[#e0af68] border border-[#e0af68]/25",
  due: "bg-[#7aa2f7]/10 text-[#7aa2f7] border border-[#7aa2f7]/25",
  ok: "bg-[#9ece6a]/10 text-[#9ece6a] border border-[#9ece6a]/25",
};

const BADGE_LABEL: Record<KataStatus, string> = {
  new: "New",
  failed: "Failed",
  slow: "Slow",
  due: "Due",
  ok: "Good",
};

const MODE_LABEL: Record<Mode, string> = {
  sr: "SR Queue",
  daily: "Daily",
  weak: "Weak Spots",
  speed: "Speed Run",
  level: "Level Up",
};

const MODE_SUBTITLE: Record<Mode, string> = {
  sr: "Sorted by urgency",
  daily: "Starred katas",
  weak: "Failed last attempt",
  speed: "Sorted by best time",
  level: "By level",
};

export function PracticeQueuePage() {
  const katas = useKataStore((s) => s.katas);
  const bestTimes = useKataStore((s) => s.bestTimes);
  const streaks = useKataStore((s) => s.streaks);
  const dailyKataIds = useSettingsStore((s) => s.dailyKataIds);
  const practiceConfig = useSettingsStore((s) => s.practiceConfig);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const startSession = useSessionStore((s) => s.startSession);
  const startSessionTimer = useTimerStore((s) => s.startSessionTimer);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const navigate = useNavigate();

  const mode = practiceConfig.mode as Mode;
  const dailyRandomize = practiceConfig.dailyRandomize;
  const categoryFilter = practiceConfig.categoryFilter;
  const difficultyFilter = practiceConfig.difficultyFilter as DifficultyFilter;
  const sessionSize = practiceConfig.sessionSize as SizeOpt;
  const maxTestRuns = practiceConfig.maxTestRuns;
  // Levels with no katas in the loaded language are hidden, and a level selected
  // under another language goes inert rather than being dropped: the selection
  // survives in settings and comes back when that language does.
  const visibleLevels = useMemo(() => levelsForKatas(katas), [katas]);

  const visibleLevelIds = useMemo(
    () => new Set<number>(visibleLevels.map((l) => l.level)),
    [visibleLevels],
  );

  const selectedLevels = useMemo(
    () => visibleSelection(practiceConfig.selectedLevels, visibleLevelIds),
    [practiceConfig.selectedLevels, visibleLevelIds],
  );

  const updateConfig = useCallback(
    (patch: Partial<PracticeConfig>) => {
      setSetting("practiceConfig", { ...practiceConfig, ...patch });
    },
    [practiceConfig, setSetting],
  );

  const setMode = (m: Mode) => updateConfig({ mode: m });
  const setDailyRandomize = (v: boolean) => updateConfig({ dailyRandomize: v });
  const setCategoryFilter = (c: string) => updateConfig({ categoryFilter: c });
  const setDifficultyFilter = (d: DifficultyFilter) => updateConfig({ difficultyFilter: d });
  // `levels` only ever holds visible ones. Levels selected under another language
  // are carried through untouched, or toggling any level here would erase them.
  const setSelectedLevels = (levels: Set<number>) =>
    updateConfig({
      selectedLevels: mergeSelection(practiceConfig.selectedLevels, visibleLevelIds, levels),
    });
  const setSessionSize = (s: SizeOpt) => updateConfig({ sessionSize: s });
  const setMaxTestRuns = (n: number | null) => updateConfig({ maxTestRuns: n });

  const [statsMap, setStatsMap] = useState<Map<number, KataStats>>(new Map());
  const [historyMap, setHistoryMap] = useState<Map<number, { passed: number; started_at: string }[]>>(new Map());

  const [launching, setLaunching] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  const language = useSettingsStore((s) => s.language);

  const handleReseed = async () => {
    setReseeding(true);
    try {
      await reseedKatas();
      await useKataStore.getState().loadKatas(language);
    } finally {
      setReseeding(false);
    }
  };

  useEffect(() => {
    if (katas.length === 0) return;
    fetchKataStats(katas.map((k) => k.id)).then(setStatsMap);
    fetchAttemptHistory(katas.map((k) => k.id)).then(setHistoryMap);
  }, [katas]);

  const categories = useMemo(
    () => [...new Set(katas.map((k) => k.category))].sort(),
    [katas],
  );

  const queueItems = useMemo((): QueueItem[] => {
    let pool = categoryFilter
      ? katas.filter((k) => k.category === categoryFilter)
      : [...katas];

    if (difficultyFilter) {
      pool = pool.filter((k) => k.difficulty === difficultyFilter);
    }

    switch (mode) {
      case "daily": {
        const dailySet = new Set(dailyKataIds);
        pool = pool.filter((k) => dailySet.has(k.id));
        break;
      }
      case "weak":
        pool = pool.filter((k) => {
          const s = statsMap.get(k.id);
          return s !== undefined && s.last_passed === 0;
        });
        break;
      case "speed":
        pool = pool.filter((k) => {
          const s = statsMap.get(k.id);
          return s !== undefined && s.pass_count > 0;
        });
        break;
      case "level":
        if (selectedLevels.size > 0) {
          pool = pool.filter((k) => selectedLevels.has(CATEGORY_LEVEL[k.category] ?? -1));
        }
        break;
    }

    const items: QueueItem[] = pool.map((kata) => {
      const stats = statsMap.get(kata.id);
      const sr = computeSrState(historyMap.get(kata.id));
      const status = srStatusToKataStatus(sr);
      const dueLabel = sr.status === "new" || sr.status === "failed" ? "" : ` · ${formatDue(sr)}`;
      return {
        kata,
        stats,
        score: sr.score,
        status,
        meta: buildMeta(kata, stats, status) + dueLabel,
        streak: streaks[kata.id] ?? 0,
        dueAt: sr.dueAt,
      };
    });

    if (mode === "speed") {
      items.sort(
        (a, b) => (bestTimes[a.kata.id] ?? Infinity) - (bestTimes[b.kata.id] ?? Infinity),
      );
    } else {
      items.sort((a, b) => b.score - a.score);
    }

    if (mode === "daily" && dailyRandomize) {
      items.sort(() => Math.random() - 0.5);
    }

    return items;
  }, [katas, statsMap, historyMap, mode, categoryFilter, difficultyFilter, selectedLevels, dailyKataIds, streaks, bestTimes, dailyRandomize]);

  const modeCounts = useMemo(() => {
    const dailySet = new Set(dailyKataIds);
    const allItems = katas.map((k) => {
      const stats = statsMap.get(k.id);
      return { id: k.id, status: srStatusToKataStatus(computeSrState(historyMap.get(k.id))), stats, inDaily: dailySet.has(k.id), category: k.category };
    });
    const levelPool = selectedLevels.size > 0
      ? allItems.filter((i) => selectedLevels.has(CATEGORY_LEVEL[i.category] ?? -1))
      : allItems;
    return {
      sr: allItems.filter((i) => i.status !== "ok").length,
      daily: allItems.filter((i) => i.inDaily).length,
      weak: allItems.filter((i) => i.stats?.last_passed === 0).length,
      speed: allItems.filter((i) => (i.stats?.pass_count ?? 0) > 0).length,
      level: levelPool.length,
    };
  }, [katas, statsMap, historyMap, dailyKataIds, selectedLevels]);

  const dueNow = queueItems.filter((i) => i.status !== "ok");
  const doingWell = queueItems.filter((i) => i.status === "ok");

  const launchCount =
    sessionSize === "all" ? queueItems.length : Math.min(sessionSize, queueItems.length);
  const launchKatas =
    sessionSize === "all" ? queueItems.map((i) => i.kata) : queueItems.slice(0, sessionSize).map((i) => i.kata);

  const handleLaunch = useCallback(async () => {
    if (launchKatas.length === 0 || launching) return;
    setLaunching(true);
    resetKataTimer();
    startSessionTimer();
    const sessionType = mode === "daily" ? "daily" : "random";
    const sessionId = await startSession(sessionType, launchKatas, undefined, maxTestRuns);
    navigate(`/session/${sessionId}`);
  }, [launchKatas, launching, mode, maxTestRuns, resetKataTimer, startSessionTimer, startSession, navigate]);

  const formatMs = (ms: number): string => {
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="flex h-full overflow-hidden animate-fade-in">
      {/* ── Left panel ── */}
      <aside className="w-[300px] shrink-0 border-r border-base-300/60 flex flex-col gap-5 p-5 overflow-y-auto bg-base-100">
        {/* Mode selector */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-base-content/35 mb-2">
            Mode
          </p>
          <div className="flex flex-col gap-2">
            {MODES.map(({ id, title, desc }) => {
              const count = modeCounts[id];
              const active = mode === id;
              return (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`w-full text-left rounded-lg px-3.5 py-3 border transition-colors cursor-pointer ${
                    active
                      ? "border-primary/60 bg-primary/[0.06]"
                      : "border-base-300/60 bg-base-200 hover:border-base-300"
                  }`}
                >
                  <p
                    className={`text-[13px] font-semibold mb-0.5 ${active ? "text-primary" : "text-base-content"}`}
                  >
                    {title}
                  </p>
                  <p className="text-[12px] text-base-content/40 leading-snug">{desc}</p>
                  <p
                    className={`text-[11px] font-semibold mt-1.5 ${active ? "text-primary" : "text-base-content/40"}`}
                  >
                    {id === "sr" ? `${count} due now` : id === "level" ? `${count} in selection` : `${count} katas`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level picker (Level Up mode) or Category filter (other modes) */}
        {mode === "level" ? (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-base-content/35 mb-2">
              Levels
            </p>
            <div className="flex flex-col gap-1.5">
              {visibleLevels.map(({ level, label }) => {
                const active = selectedLevels.has(level);
                return (
                  <button
                    key={level}
                    onClick={() => {
                      const next = new Set(selectedLevels);
                      if (next.has(level)) next.delete(level);
                      else next.add(level);
                      setSelectedLevels(next);
                    }}
                    className={`w-full text-left rounded-lg px-3 py-2 border transition-colors ${
                      active
                        ? "border-primary/60 bg-primary/[0.06]"
                        : "border-base-300/60 bg-base-200 hover:border-base-300"
                    }`}
                  >
                    <span className={`text-[11px] font-bold mr-2 tabular-nums ${active ? "text-primary" : "text-base-content/35"}`}>
                      Lv.{level}
                    </span>
                    <span className={`text-[12px] ${active ? "text-base-content" : "text-base-content/50"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
              {selectedLevels.size > 0 && (
                <button
                  onClick={() => setSelectedLevels(new Set())}
                  className="text-[11px] text-base-content/35 hover:text-base-content/60 transition-colors mt-0.5 text-left px-1"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-base-content/35 mb-2">
              Category
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryFilter("")}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                  !categoryFilter
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-base-300/60 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    categoryFilter === cat
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-base-300/60 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty filter */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-base-content/35 mb-2">
            Difficulty
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DIFFICULTY_OPTIONS.map(({ id, label }) => (
              <button
                key={id || "all"}
                onClick={() => setDifficultyFilter(id)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                  difficultyFilter === id
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-base-300/60 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily order toggle */}
        {mode === "daily" && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-base-content/35 mb-2">
              Order
            </p>
            <div className="flex gap-1.5">
              {([false, true] as const).map((rand) => (
                <button
                  key={String(rand)}
                  onClick={() => setDailyRandomize(rand)}
                  className={`flex-1 py-1.5 rounded-md border text-[12px] font-semibold transition-all ${
                    dailyRandomize === rand
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-base-300/60 text-base-content/40 hover:border-base-300 hover:text-base-content/60 bg-transparent"
                  }`}
                >
                  {rand ? "Random" : "SR Queue"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Session size */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-base-content/35 mb-2">
            Session size
          </p>
          <div className="flex gap-1.5">
            {SIZE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSessionSize(s)}
                className={`flex-1 py-1.5 rounded-md border text-[12px] font-semibold transition-all ${
                  sessionSize === s
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-base-300/60 text-base-content/40 hover:border-base-300 hover:text-base-content/60 bg-transparent"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Max attempts per kata */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-base-content/35 mb-2">
            Max attempts / kata
          </p>
          <div className="flex gap-1.5">
            {([null, 3, 5, 10] as (number | null)[]).map((n) => (
              <button
                key={n ?? "none"}
                onClick={() => setMaxTestRuns(n)}
                className={`flex-1 py-1.5 rounded-md border text-[12px] font-semibold transition-all ${
                  maxTestRuns === n
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-base-300/60 text-base-content/40 hover:border-base-300 hover:text-base-content/60 bg-transparent"
                }`}
              >
                {n === null ? "∞" : n}
              </button>
            ))}
          </div>
        </div>

        {/* Launch button */}
        <button
          onClick={handleLaunch}
          disabled={launchKatas.length === 0 || launching}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-content text-[13px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {launching ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-3 h-3"
            >
              <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z" />
            </svg>
          )}
          {launching ? "Launching..." : `Start ${launchCount} Katas`}
        </button>
      </aside>

      {/* ── Right panel ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-base-300/60 flex items-center gap-3 shrink-0">
          <h2 className="text-[15px] font-bold text-base-content">{MODE_LABEL[mode]}</h2>
          <span className="text-[12px] text-base-content/35 ml-auto">
            {mode === "level" && selectedLevels.size > 0
              ? `Lv.${[...selectedLevels].sort((a, b) => a - b).join(", ")} · `
              : `${MODE_SUBTITLE[mode]} · `}
            {mode === "sr"
              ? `${queueItems.filter((i) => i.status !== "ok").length} due now · ${
                  queueItems.filter((i) => i.status === "ok" && i.dueAt !== null && i.dueAt <= Date.now() + 7 * 86_400_000).length
                } due this week · ${queueItems.length} katas`
              : `${queueItems.length} katas`}
          </span>
        </div>

        {/* Queue list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {queueItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-base-content/30 text-sm">No katas match this filter</p>
              {katas.length === 0 && (
                <button
                  onClick={handleReseed}
                  disabled={reseeding}
                  className="btn btn-sm btn-ghost text-base-content/40 hover:text-base-content/70"
                >
                  {reseeding ? "Reseeding…" : "Reload problem statements"}
                </button>
              )}
            </div>
          ) : (
            <>
              {dueNow.length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/35 px-2.5 pt-3 pb-1">
                    Due now
                  </p>
                  {dueNow.map((item, idx) => (
                    <KataRow
                      key={item.kata.id}
                      item={item}
                      rank={idx + 1}
                      bestTime={bestTimes[item.kata.id]}
                      formatMs={formatMs}
                    />
                  ))}
                </>
              )}
              {doingWell.length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/35 px-2.5 pt-4 pb-1">
                    Doing well
                  </p>
                  {doingWell.map((item, idx) => (
                    <KataRow
                      key={item.kata.id}
                      item={item}
                      rank={dueNow.length + idx + 1}
                      bestTime={bestTimes[item.kata.id]}
                      formatMs={formatMs}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Legend */}
        <div className="px-5 py-2.5 border-t border-base-300/60 flex gap-4 items-center shrink-0 flex-wrap">
          <span className="flex items-center gap-1.5 text-[11px] text-base-content/40">
            <span className="w-[7px] h-[7px] rounded-full bg-[#f7768e] shrink-0" />
            Never tried / Failed
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-base-content/40">
            <span className="w-[7px] h-[7px] rounded-full bg-[#e0af68] shrink-0" />
            Slow or idle
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-base-content/40">
            <span className="w-[7px] h-[7px] rounded-full bg-[#9ece6a] shrink-0" />
            On track
          </span>
          <span className="ml-auto text-[11px] text-base-content/30">
            Score = SR weight · higher = more urgent
          </span>
        </div>
      </div>
    </div>
  );
}

interface KataRowProps {
  item: QueueItem;
  rank: number;
  bestTime: number | undefined;
  formatMs: (ms: number) => string;
}

function KataRow({ item, rank, bestTime, formatMs }: KataRowProps) {
  const { kata, status, meta, streak, score } = item;
  return (
    <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg border border-transparent hover:bg-base-200 hover:border-base-300/60 transition-colors cursor-pointer">
      <span className="w-[22px] text-right text-[11px] font-bold text-base-content/30 shrink-0">
        {rank}
      </span>
      <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_CLASS[status]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-base-content truncate">{kata.name}</p>
        <p className="text-[11px] text-base-content/35 mt-0.5">
          {meta}
          {bestTime !== undefined && ` · best: ${formatMs(bestTime)}`}
        </p>
      </div>
      {CATEGORY_LEVEL[kata.category] !== undefined && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-base-300/60 text-base-content/40 tabular-nums shrink-0">
          Lv.{CATEGORY_LEVEL[kata.category]}
        </span>
      )}
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${BADGE_CLASS[status]}`}
      >
        {BADGE_LABEL[status]}
      </span>
      <span className="text-[11px] font-bold text-base-content/35 w-7 text-right shrink-0">
        {score.toFixed(1)}
      </span>
      {streak > 0 && (
        <span
          className={`text-[10px] shrink-0 flex items-center gap-0.5 ${streak >= 5 ? "text-[#ff9e64]" : "text-base-content/35"}`}
        >
          🔥 {streak}
        </span>
      )}
    </div>
  );
}
