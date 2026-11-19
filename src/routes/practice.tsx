import { useState, useEffect, useMemo, useCallback, useId } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { Code2, Flame, Info, ListFilter, ListOrdered, Play, Save, Settings2, Timer, Trash2, X } from "lucide-react";
import { useKataStore } from "../stores/kata-store";
import { reseedKatas } from "../lib/database";
import { useSettingsStore, type PracticeConfig, type PracticeDifficulty } from "../stores/settings-store";
import { useSessionStore, fetchKataStats, fetchAttemptHistory } from "../stores/session-store";
import { computeSrState, formatDue } from "../lib/sr";
import { useTimerStore } from "../stores/timer-store";
import type { KataStats } from "../stores/session-store";
import type { Kata } from "../types/editor";
import { levelsForKatas, visibleSelection, mergeSelection, CATEGORY_LEVEL } from "../lib/levels";
import { EDITOR_TOGGLES, type EditorToggleKey } from "../lib/editor-settings";
import { confirmAction } from "../lib/confirm-action";
import { resumableSessionPath } from "../lib/session-resume";
import { isReviewStatus, queueStatusForSr, type QueueKataStatus } from "../lib/practice-status";
import { toast } from "../stores/toast-store";
import { IMPLEMENTATION_SIZES, implementationComplexityFor, type ImplementationSize } from "../lib/implementation-complexity";
import { DASHBOARD_MODULES, dashboardModuleFor } from "../lib/dashboard-metrics";
import {
  applyPracticePresetConfig,
  deletePracticePreset,
  loadPracticePresets,
  normalizePracticePresetName,
  practicePresetCanSaveName,
  practicePresetConfigFromSettings,
  savePracticePreset,
  type PracticePreset,
} from "../lib/practice-presets";

type Mode = "sr" | "review" | "daily" | "weak" | "speed" | "level";
type SizeOpt = 3 | 5 | 10 | 15 | 20 | "all";
type KataStatus = QueueKataStatus;
type PracticeSettingsSection = "queue" | "filters" | "limits" | "editor";

function TooltipHint({
  label,
  text,
  children,
}: {
  label: string;
  text: string;
  children: ReactNode;
}) {
  const id = useId();

  return (
    <span className="group relative inline-flex">
      <span
        className="inline-flex cursor-help items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
        aria-describedby={id}
        aria-label={`${label}: ${text}`}
        tabIndex={0}
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible absolute right-0 top-full z-50 mt-2 w-72 rounded-md border border-base-300 bg-base-100 px-3 py-2 text-left text-xs normal-case leading-5 tracking-normal text-base-content/75 opacity-0 shadow-xl shadow-black/20 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

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
    id: "review",
    title: "Review",
    desc: "Only attempted katas that are failed or due by the spaced-review schedule.",
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

const DIFFICULTY_OPTIONS: { id: PracticeDifficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

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
    case "done":
      return `${kata.category} · marked done`;
  }
}

const DOT_CLASS: Record<KataStatus, string> = {
  new: "bg-[#f7768e] shadow-[0_0_5px_#f7768e88]",
  failed: "bg-[#ff9e64] shadow-[0_0_5px_#ff9e6488]",
  slow: "bg-[#e0af68] shadow-[0_0_5px_#e0af6888]",
  due: "bg-[#7aa2f7] shadow-[0_0_5px_#7aa2f788]",
  ok: "bg-[#9ece6a] shadow-[0_0_5px_#9ece6a88]",
  done: "bg-success shadow-[0_0_5px_rgba(34,197,94,0.55)]",
};

const BADGE_CLASS: Record<KataStatus, string> = {
  new: "bg-[#f7768e]/10 text-[#f7768e] border border-[#f7768e]/25",
  failed: "bg-[#ff9e64]/10 text-[#ff9e64] border border-[#ff9e64]/25",
  slow: "bg-[#e0af68]/10 text-[#e0af68] border border-[#e0af68]/25",
  due: "bg-[#7aa2f7]/10 text-[#7aa2f7] border border-[#7aa2f7]/25",
  ok: "bg-[#9ece6a]/10 text-[#9ece6a] border border-[#9ece6a]/25",
  done: "bg-success/15 text-success border border-success/25",
};

const BADGE_LABEL: Record<KataStatus, string> = {
  new: "New",
  failed: "Failed",
  slow: "Slow",
  due: "Due",
  ok: "Good",
  done: "Done",
};

const MODE_LABEL: Record<Mode, string> = {
  sr: "SR Queue",
  review: "Review",
  daily: "Daily",
  weak: "Weak Spots",
  speed: "Speed Run",
  level: "Level Up",
};

export function PracticeQueuePage() {
  const katas = useKataStore((s) => s.katas);
  const bestTimes = useKataStore((s) => s.bestTimes);
  const streaks = useKataStore((s) => s.streaks);
  const dailyKataIds = useSettingsStore((s) => s.dailyKataIds);
  const doneKataIds = useSettingsStore((s) => s.doneKataIds);
  const practiceConfig = useSettingsStore((s) => s.practiceConfig);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const activeSession = useSessionStore((s) => s.activeSession);
  const startSession = useSessionStore((s) => s.startSession);
  const startSessionTimer = useTimerStore((s) => s.startSessionTimer);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const navigate = useNavigate();

  const mode = practiceConfig.mode as Mode;
  const dailyRandomize = practiceConfig.dailyRandomize;
  const moduleFilters = practiceConfig.moduleFilters;
  const categoryFilters = practiceConfig.categoryFilters;
  const difficultyFilters = practiceConfig.difficultyFilters;
  const implementationSizeFilters = practiceConfig.implementationSizeFilters;
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
  const clearModuleFilters = () => updateConfig({ moduleFilters: [] });
  const toggleModuleFilter = (moduleId: string) => {
    updateConfig({
      moduleFilters: moduleFilters.includes(moduleId)
        ? moduleFilters.filter((item) => item !== moduleId)
        : [...moduleFilters, moduleId],
    });
  };
  const clearCategoryFilters = () => updateConfig({ categoryFilters: [] });
  const toggleCategoryFilter = (category: string) => {
    updateConfig({
      categoryFilters: categoryFilters.includes(category)
        ? categoryFilters.filter((item) => item !== category)
        : [...categoryFilters, category],
    });
  };
  const clearDifficultyFilters = () => updateConfig({ difficultyFilters: [] });
  const toggleDifficultyFilter = (difficulty: PracticeDifficulty) => {
    updateConfig({
      difficultyFilters: difficultyFilters.includes(difficulty)
        ? difficultyFilters.filter((item) => item !== difficulty)
        : [...difficultyFilters, difficulty],
    });
  };
  const clearImplementationSizeFilters = () => updateConfig({ implementationSizeFilters: [] });
  const toggleImplementationSizeFilter = (size: ImplementationSize) => {
    updateConfig({
      implementationSizeFilters: implementationSizeFilters.includes(size)
        ? implementationSizeFilters.filter((item) => item !== size)
        : [...implementationSizeFilters, size],
    });
  };
  // `levels` only ever holds visible ones. Levels selected under another language
  // are carried through untouched, or toggling any level here would erase them.
  const setSelectedLevels = (levels: Set<number>) =>
    updateConfig({
      selectedLevels: mergeSelection(practiceConfig.selectedLevels, visibleLevelIds, levels),
    });
  const setSessionSize = (s: SizeOpt) => updateConfig({ sessionSize: s });
  const setMaxTestRuns = (n: number | null) => updateConfig({ maxTestRuns: n });
  const clearPracticeFilters = () => {
    updateConfig({
      moduleFilters: [],
      categoryFilters: [],
      difficultyFilters: [],
      implementationSizeFilters: [],
      selectedLevels: mergeSelection(practiceConfig.selectedLevels, visibleLevelIds, new Set()),
    });
  };

  const [statsMap, setStatsMap] = useState<Map<number, KataStats>>(new Map());
  const [historyMap, setHistoryMap] = useState<Map<number, { passed: number; started_at: string }[]>>(new Map());

  const [launching, setLaunching] = useState(false);
  const [reseeding, setReseeding] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<PracticeSettingsSection>("queue");
  const [practicePresets, setPracticePresets] = useState<PracticePreset[]>([]);
  const [selectedPracticePresetId, setSelectedPracticePresetId] = useState("");
  const [presetNameDraft, setPresetNameDraft] = useState("");
  const [presetFeedback, setPresetFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [presetBusy, setPresetBusy] = useState(false);

  const language = useSettingsStore((s) => s.language);
  const sessionTimeLimitMs = useSettingsStore((s) => s.sessionTimeLimitMs);

  const editorAutocomplete = useSettingsStore((s) => s.editorAutocomplete);
  const autoClosingBrackets = useSettingsStore((s) => s.autoClosingBrackets);
  const wordWrap = useSettingsStore((s) => s.wordWrap);
  const highlightOccurrences = useSettingsStore((s) => s.highlightOccurrences);
  const bracketPairColorization = useSettingsStore((s) => s.bracketPairColorization);
  const fontLigatures = useSettingsStore((s) => s.fontLigatures);

  const toggleValues: Record<EditorToggleKey, boolean> = {
    editorAutocomplete,
    autoClosingBrackets,
    wordWrap,
    highlightOccurrences,
    bracketPairColorization,
    fontLigatures,
  };

  const timeLimitMinutes = Math.round(sessionTimeLimitMs / 60000);

  const selectedPracticePreset = useMemo(
    () => practicePresets.find((preset) => String(preset.id) === selectedPracticePresetId),
    [practicePresets, selectedPracticePresetId],
  );

  const refreshPracticePresets = useCallback(async () => {
    const presets = await loadPracticePresets();
    setPracticePresets(presets);
    return presets;
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    refreshPracticePresets().catch((error) => {
      console.error("[practice] Failed to load practice presets:", error);
    });
  }, [refreshPracticePresets, settingsOpen]);

  useEffect(() => {
    const resumePath = resumableSessionPath(activeSession);
    if (resumePath) navigate(resumePath, { replace: true });
  }, [activeSession, navigate]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settingsOpen]);

  const handleApplyPracticePreset = useCallback(
    async (presetId: string) => {
      setSelectedPracticePresetId(presetId);
      setPresetFeedback(null);
      const preset = practicePresets.find((item) => String(item.id) === presetId);
      if (!preset) {
        setPresetNameDraft("");
        return;
      }

      const next = applyPracticePresetConfig(preset.config);
      setPresetBusy(true);
      try {
        await Promise.all([
          setSetting("practiceConfig", next.practiceConfig, { throwOnError: true }),
          setSetting("sessionTimeLimitMs", next.sessionTimeLimitMs, { throwOnError: true }),
        ]);
        setPresetNameDraft(preset.name);
        setPresetFeedback({ kind: "success", message: `Applied "${preset.name}"` });
        toast.success(`Applied preset: ${preset.name}`, 1800);
      } catch (error) {
        console.error("[practice] Failed to apply practice preset:", error);
        setPresetFeedback({ kind: "error", message: "Could not apply preset" });
        toast.error("Could not apply preset");
      } finally {
        setPresetBusy(false);
      }
    },
    [practicePresets, setSetting],
  );

  const handleSavePracticePreset = useCallback(async () => {
    const name = normalizePracticePresetName(presetNameDraft);
    if (!name) {
      setPresetFeedback({ kind: "error", message: "Name the preset before saving" });
      toast.warning("Name the preset before saving");
      return;
    }

    setPresetBusy(true);
    try {
      await savePracticePreset(
        name,
        practicePresetConfigFromSettings(practiceConfig, sessionTimeLimitMs),
      );
      const presets = await refreshPracticePresets();
      const saved = presets.find((preset) => preset.name === name);
      setSelectedPracticePresetId(saved ? String(saved.id) : "");
      setPresetNameDraft(name);
      setPresetFeedback({ kind: "success", message: `Saved "${name}"` });
      toast.success(`Saved preset: ${name}`, 1800);
    } catch (error) {
      console.error("[practice] Failed to save practice preset:", error);
      setPresetFeedback({ kind: "error", message: "Could not save preset" });
      toast.error("Could not save preset");
    } finally {
      setPresetBusy(false);
    }
  }, [practiceConfig, presetNameDraft, refreshPracticePresets, sessionTimeLimitMs]);

  const handleDeletePracticePreset = useCallback(async () => {
    if (!selectedPracticePreset) return;
    const ok = await confirmAction({
      message: `Delete "${selectedPracticePreset.name}"?`,
      title: "Delete Preset",
      kind: "warning",
      okLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;

    setPresetBusy(true);
    try {
      await deletePracticePreset(selectedPracticePreset.id);
      await refreshPracticePresets();
      setSelectedPracticePresetId("");
      setPresetNameDraft("");
      setPresetFeedback({ kind: "success", message: `Deleted "${selectedPracticePreset.name}"` });
      toast.success(`Deleted preset: ${selectedPracticePreset.name}`, 1800);
    } catch (error) {
      console.error("[practice] Failed to delete practice preset:", error);
      setPresetFeedback({ kind: "error", message: "Could not delete preset" });
      toast.error("Could not delete preset");
    } finally {
      setPresetBusy(false);
    }
  }, [refreshPracticePresets, selectedPracticePreset]);

  const handleReseed = async () => {
    setReseeding(true);
    try {
      const message = await reseedKatas();
      await useKataStore.getState().loadKatas(language);
      toast.success(message || "Problem statements reloaded");
    } catch (error) {
      console.error("[practice] Failed to reload problem statements:", error);
      toast.error("Could not reload problem statements");
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

  const moduleOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const kata of katas) {
      const module = dashboardModuleFor(kata);
      if (!module) continue;
      counts.set(module.id, (counts.get(module.id) ?? 0) + 1);
    }
    return DASHBOARD_MODULES
      .map((module) => ({ ...module, count: counts.get(module.id) ?? 0 }))
      .filter((module) => module.count > 0);
  }, [katas]);

  const queueItems = useMemo((): QueueItem[] => {
    let pool = [...katas];

    if (moduleFilters.length > 0) {
      pool = pool.filter((k) => {
        const module = dashboardModuleFor(k);
        return module != null && moduleFilters.includes(module.id);
      });
    }

    if (categoryFilters.length > 0) {
      pool = pool.filter((k) => categoryFilters.includes(k.category));
    }

    if (difficultyFilters.length > 0) {
      pool = pool.filter((k) => difficultyFilters.includes(k.difficulty as PracticeDifficulty));
    }

    if (implementationSizeFilters.length > 0) {
      pool = pool.filter((k) => {
        const size = implementationComplexityFor(k).size;
        return size != null && implementationSizeFilters.includes(size);
      });
    }

    switch (mode) {
      case "review":
        pool = pool.filter((k) => {
          const sr = computeSrState(historyMap.get(k.id));
          return sr.status === "failed" || sr.status === "due";
        });
        break;
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
      const status = queueStatusForSr(sr, doneKataIds.includes(kata.id));
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
  }, [katas, statsMap, historyMap, mode, moduleFilters, categoryFilters, difficultyFilters, implementationSizeFilters, selectedLevels, dailyKataIds, doneKataIds, streaks, bestTimes, dailyRandomize]);

  const modeCounts = useMemo(() => {
    const dailySet = new Set(dailyKataIds);
    const allItems = katas.map((k) => {
      const stats = statsMap.get(k.id);
      return { id: k.id, status: queueStatusForSr(computeSrState(historyMap.get(k.id)), doneKataIds.includes(k.id)), stats, inDaily: dailySet.has(k.id), category: k.category };
    });
    const levelPool = selectedLevels.size > 0
      ? allItems.filter((i) => selectedLevels.has(CATEGORY_LEVEL[i.category] ?? -1))
      : allItems;
    return {
      sr: allItems.filter((i) => isReviewStatus(i.status)).length,
      review: allItems.filter((i) => i.status === "failed" || i.status === "due").length,
      daily: allItems.filter((i) => i.inDaily).length,
      weak: allItems.filter((i) => i.stats?.last_passed === 0).length,
      speed: allItems.filter((i) => (i.stats?.pass_count ?? 0) > 0).length,
      level: levelPool.length,
    };
  }, [katas, statsMap, historyMap, dailyKataIds, doneKataIds, selectedLevels]);

  const dueNow = queueItems.filter((i) => isReviewStatus(i.status));
  const doingWell = queueItems.filter((i) => !isReviewStatus(i.status));

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

  const plural = (count: number, singular: string, pluralLabel = `${singular}s`) =>
    `${count} ${count === 1 ? singular : pluralLabel}`;

  const moduleSummary =
    moduleFilters.length === 0
      ? "All modules"
      : moduleFilters.length === 1
      ? moduleOptions.find((module) => module.id === moduleFilters[0])?.label ?? "1 module"
      : plural(moduleFilters.length, "module");

  const categorySummary =
    mode === "level" && selectedLevels.size > 0
      ? `Lv.${[...selectedLevels].sort((a, b) => a - b).join(", ")}`
      : mode === "level"
      ? "All visible levels"
      : categoryFilters.length === 0
      ? "All categories"
      : categoryFilters.length === 1
      ? categoryFilters[0]
      : plural(categoryFilters.length, "category", "categories");

  const complexitySummary =
    implementationSizeFilters.length === 0
      ? "Any length"
      : implementationSizeFilters.join(", ");

  const timeLimitSummary =
    sessionTimeLimitMs > 0 ? `${timeLimitMinutes} min / problem` : "No time limit";

  const attemptsSummary = maxTestRuns === null ? "Unlimited attempts" : `${maxTestRuns} attempts / kata`;
  const activeFilterCount =
    moduleFilters.length +
    categoryFilters.length +
    difficultyFilters.length +
    implementationSizeFilters.length +
    (mode === "level" ? selectedLevels.size : 0);
  const activeFilterSummary = [
    moduleSummary,
    categorySummary,
    difficultyFilters.length === 0
      ? "Any difficulty"
      : difficultyFilters.map((item) => item[0].toUpperCase() + item.slice(1)).join(", "),
    complexitySummary,
  ];
  const dueThisWeekCount = queueItems.filter((i) => i.status === "ok" && i.dueAt !== null && i.dueAt <= Date.now() + 7 * 86_400_000).length;
  const launchReason =
    mode === "sr"
      ? `${dueNow.length} due now, ${dueThisWeekCount} due this week`
      : mode === "review"
      ? "Failed and due problems only"
      : mode === "daily"
      ? dailyRandomize ? "Daily list in random order" : "Daily list in review order"
      : mode === "weak"
      ? "Problems failed on the last attempt"
      : mode === "speed"
      ? "Solved problems sorted by best time"
      : categorySummary;
  const launchDisabledReason =
    katas.length === 0
      ? "No problems are loaded yet."
      : queueItems.length === 0
      ? "No problems match the current setup."
      : "";
  const settingsSections = [
    { id: "queue" as const, label: "Queue", icon: ListOrdered },
    { id: "filters" as const, label: "Filters", icon: ListFilter },
    { id: "limits" as const, label: "Limits", icon: Timer },
    { id: "editor" as const, label: "Editor", icon: Code2 },
  ];
  const activeSettingsSection =
    settingsSections.find((section) => section.id === settingsSection) ?? settingsSections[0];

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-in xl:flex-row">
      {/* ── Mode panel ── */}
      <aside className="flex max-h-[38vh] shrink-0 flex-col gap-3 overflow-y-auto border-b border-base-300/60 bg-base-100 p-4 xl:max-h-none xl:w-[300px] xl:border-b-0 xl:border-r xl:p-5">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-base-content/35">
            Mode
          </p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:flex xl:flex-col">
            {MODES.map(({ id, title, desc }) => {
              const count = modeCounts[id];
              const active = mode === id;
              return (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  aria-pressed={active}
                  className={`min-h-[92px] w-full cursor-pointer rounded-lg border px-3.5 py-3 text-left transition-colors xl:min-h-0 ${
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
                  <p className="hidden text-[12px] leading-snug text-base-content/40 sm:block">{desc}</p>
                  <p
                    className={`text-[11px] font-semibold mt-1.5 ${active ? "text-primary" : "text-base-content/40"}`}
                  >
                    {id === "sr" ? `${count} due now` : id === "review" ? `${count} due` : id === "level" ? `${count} in selection` : `${count} katas`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {settingsOpen && (
        <>
          <button
            type="button"
            aria-label="Close practice settings"
            onClick={() => setSettingsOpen(false)}
            className="absolute inset-0 z-30 cursor-default bg-black/45"
          />

          {/* ── Practice settings modal ── */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="practice-settings-title"
            className="absolute left-1/2 top-1/2 z-40 flex h-[min(760px,calc(100vh-40px))] w-[min(980px,calc(100vw-40px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-base-300/70 bg-base-100 shadow-2xl"
          >
            <div className="flex items-center gap-4 border-b border-base-300/60 px-7 py-5">
              <div className="min-w-0">
                <h2 id="practice-settings-title" className="text-[22px] font-bold leading-none text-base-content">
                  Practice setup
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close practice settings"
                title="Close"
                onClick={() => setSettingsOpen(false)}
                className="btn btn-ghost btn-lg btn-square ml-auto text-base-content/45 hover:text-base-content"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1">
              <aside className="w-[260px] shrink-0 border-r border-base-300/60 bg-base-200/50 px-4 py-5">
                <div className="flex flex-col gap-1">
                  {settingsSections.map((section) => {
                    const active = settingsSection === section.id;
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setSettingsSection(section.id)}
                        aria-pressed={active}
                        className={`flex items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                          active
                            ? "bg-primary text-primary-content"
                            : "text-base-content/70 hover:bg-base-300/60 hover:text-base-content"
                        }`}
                      >
                        <Icon size={18} className="mt-0.5 shrink-0" />
                        <span className="min-w-0 text-[14px] font-semibold leading-tight">{section.label}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <main className="flex min-w-0 flex-1 flex-col">
                <div className="border-b border-base-300/60 px-8 py-5">
                  <h3 className="text-[18px] font-bold leading-none text-base-content">{activeSettingsSection.label}</h3>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6">
                  {settingsSection === "queue" && (
                    <div className="max-w-[620px] space-y-8">
                      <section>
                        <h4 className="text-[16px] font-bold text-base-content">Queue mode</h4>
                        <p className="mt-1 text-[13px] leading-relaxed text-base-content/45">
                          Choose how the next practice queue is built.
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {MODES.map(({ id, title }) => {
                            const active = mode === id;
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setMode(id)}
                                aria-pressed={active}
                                className={`rounded-md border px-3 py-2 text-left transition-colors ${
                                  active
                                    ? "border-primary/60 bg-primary/10 text-primary"
                                    : "kata-btn-secondary"
                                }`}
                              >
                                <span className="block text-[13px] font-semibold">{title}</span>
                                <span className="mt-0.5 block text-[11px] text-base-content/35">
                                  {modeCounts[id]} {id === "sr" ? "due" : "katas"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </section>

                      <section className="border-t border-base-300/60 pt-7">
                        <h4 className="text-[16px] font-bold text-base-content">Presets</h4>
                        <p className="mt-1 text-[13px] leading-relaxed text-base-content/45">
                          Save and reload queue settings for repeated drills.
                        </p>
                        <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
                          <select
                            value={selectedPracticePresetId}
                            onChange={(event) => handleApplyPracticePreset(event.currentTarget.value)}
                            disabled={presetBusy}
                            className="select select-bordered select-sm min-w-0 bg-base-100 text-sm"
                          >
                            <option value="">Choose preset</option>
                            {practicePresets.map((preset) => (
                              <option key={preset.id} value={preset.id}>
                                {preset.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleSavePracticePreset}
                            disabled={presetBusy || !practicePresetCanSaveName(presetNameDraft)}
                            className="btn btn-sm btn-primary gap-1.5"
                            title="Save current preset"
                          >
                            <Save size={15} />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleDeletePracticePreset}
                            disabled={presetBusy || !selectedPracticePreset}
                            className="btn btn-sm btn-ghost btn-square text-base-content/45 hover:text-error"
                            title="Delete selected preset"
                            aria-label="Delete selected preset"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={presetNameDraft}
                          onChange={(event) => {
                            setPresetNameDraft(event.currentTarget.value);
                            setPresetFeedback(null);
                          }}
                          placeholder="Preset name"
                          aria-label="Preset name"
                          className="input input-bordered input-sm mt-2 w-full bg-base-100 text-sm"
                        />
                        {presetFeedback && (
                          <p className={`mt-2 text-[11px] ${presetFeedback.kind === "error" ? "text-error" : "text-success"}`}>
                            {presetFeedback.message}
                          </p>
                        )}
                      </section>
                    </div>
                  )}

                  {settingsSection === "filters" && (
                    <div className="max-w-[680px] space-y-8">
                      <section>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-[16px] font-bold text-base-content">Modules</h4>
                            <p className="mt-1 text-[13px] leading-relaxed text-base-content/45">{moduleSummary}</p>
                          </div>
                          {moduleFilters.length > 0 && (
                            <button
                              type="button"
                              onClick={clearModuleFilters}
                              className="btn btn-sm kata-btn-secondary"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={clearModuleFilters}
                            aria-pressed={moduleFilters.length === 0}
                            className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                              moduleFilters.length === 0
                                ? "kata-btn-selected"
                                : "kata-btn-secondary"
                            }`}
                          >
                            All
                          </button>
                          {moduleOptions.map((module) => (
                            <button
                              type="button"
                              key={module.id}
                              onClick={() => toggleModuleFilter(module.id)}
                              aria-pressed={moduleFilters.includes(module.id)}
                              className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                                moduleFilters.includes(module.id)
                                  ? "kata-btn-selected"
                                  : "kata-btn-secondary"
                              }`}
                            >
                              {module.label}
                              <span className="ml-1 text-base-content/35">{module.count}</span>
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="border-t border-base-300/60 pt-7">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-[16px] font-bold text-base-content">
                              {mode === "level" ? "Levels" : "Categories"}
                            </h4>
                            <p className="mt-1 text-[13px] leading-relaxed text-base-content/45">{categorySummary}</p>
                          </div>
                          {mode === "level" && selectedLevels.size > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedLevels(new Set())}
                              className="btn btn-sm kata-btn-secondary"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {mode === "level" ? (
                          <div className="mt-4 grid gap-1.5">
                            {visibleLevels.map(({ level, label }) => {
                              const active = selectedLevels.has(level);
                              return (
                                <label
                                  key={level}
                                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-[13px] transition-colors hover:bg-base-200"
                                >
                                  <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={() => {
                                      const next = new Set(selectedLevels);
                                      if (next.has(level)) next.delete(level);
                                      else next.add(level);
                                      setSelectedLevels(next);
                                    }}
                                    className="checkbox checkbox-primary checkbox-sm"
                                  />
                                  <span className="w-12 shrink-0 font-mono text-[12px] text-base-content/35">Lv.{level}</span>
                                  <span className={active ? "text-base-content" : "text-base-content/60"}>{label}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={clearCategoryFilters}
                              aria-pressed={categoryFilters.length === 0}
                              className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                                categoryFilters.length === 0
                                  ? "kata-btn-selected"
                                  : "kata-btn-secondary"
                              }`}
                            >
                              All
                            </button>
                            {categories.map((cat) => (
                              <button
                                type="button"
                                key={cat}
                                onClick={() => toggleCategoryFilter(cat)}
                                aria-pressed={categoryFilters.includes(cat)}
                                className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                                  categoryFilters.includes(cat)
                                    ? "kata-btn-selected"
                                    : "kata-btn-secondary"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}
                      </section>

                      <section className="border-t border-base-300/60 pt-7">
                        <h4 className="text-[16px] font-bold text-base-content">Difficulty</h4>
                        <div className="join mt-4 w-full max-w-[520px]">
                          <button
                            type="button"
                            onClick={clearDifficultyFilters}
                            aria-pressed={difficultyFilters.length === 0}
                            className={`btn btn-sm join-item flex-1 ${difficultyFilters.length === 0 ? "btn-primary" : "kata-btn-secondary"}`}
                          >
                            All
                          </button>
                          {DIFFICULTY_OPTIONS.map(({ id, label }) => (
                            <button
                              type="button"
                              key={id}
                              onClick={() => toggleDifficultyFilter(id)}
                              aria-pressed={difficultyFilters.includes(id)}
                              className={`btn btn-sm join-item flex-1 ${difficultyFilters.includes(id) ? "btn-primary" : "kata-btn-secondary"}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="border-t border-base-300/60 pt-7">
                        <h4 className="text-[16px] font-bold text-base-content">Implementation</h4>
                        <p className="mt-1 text-[13px] leading-relaxed text-base-content/45">{complexitySummary}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={clearImplementationSizeFilters}
                            aria-pressed={implementationSizeFilters.length === 0}
                            className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                              implementationSizeFilters.length === 0
                                ? "kata-btn-selected"
                                : "kata-btn-secondary"
                            }`}
                          >
                            Any
                          </button>
                          {IMPLEMENTATION_SIZES.map((size) => (
                            <button
                              type="button"
                              key={size}
                              onClick={() => toggleImplementationSizeFilter(size)}
                              aria-pressed={implementationSizeFilters.includes(size)}
                              className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                                implementationSizeFilters.includes(size)
                                  ? "kata-btn-selected"
                                  : "kata-btn-secondary"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}

                  {settingsSection === "limits" && (
                    <div className="max-w-[620px] space-y-6">
                      {mode === "daily" && (
                        <section>
                          <h4 className="text-[16px] font-bold text-base-content">Daily order</h4>
                          <div className="join mt-4 w-full max-w-[360px]">
                            {([false, true] as const).map((rand) => (
                              <button
                                type="button"
                                key={String(rand)}
                                onClick={() => setDailyRandomize(rand)}
                                aria-pressed={dailyRandomize === rand}
                                className={`btn btn-sm join-item flex-1 ${dailyRandomize === rand ? "btn-primary" : "kata-btn-secondary"}`}
                              >
                                {rand ? "Random" : "SR Queue"}
                              </button>
                            ))}
                          </div>
                        </section>
                      )}

                      <section className={mode === "daily" ? "border-t border-base-300/60 pt-6" : ""}>
                        <h4 className="text-[16px] font-bold text-base-content">Session size</h4>
                        <div className="join mt-4 w-full">
                          {SIZE_OPTIONS.map((s) => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => setSessionSize(s)}
                              aria-pressed={sessionSize === s}
                              className={`btn btn-sm join-item flex-1 ${sessionSize === s ? "btn-primary" : "kata-btn-secondary"}`}
                            >
                              {s === "all" ? "All" : s}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="border-t border-base-300/60 pt-6">
                        <h4 className="text-[16px] font-bold text-base-content">Problem time limit</h4>
                        <p className="mt-1 text-[13px] leading-relaxed text-base-content/45">{timeLimitSummary}</p>
                        <label className="mt-4 flex items-center gap-3">
                          <input
                            type="number"
                            min={0}
                            value={timeLimitMinutes}
                            aria-label="Minutes per problem"
                            onChange={(event) => {
                              const mins = Math.max(0, parseInt(event.currentTarget.value) || 0);
                              setSetting("sessionTimeLimitMs", mins * 60000);
                            }}
                            className="input input-bordered input-sm w-24 bg-base-100 text-sm"
                          />
                          <span className="text-[13px] text-base-content/40">minutes, 0 disables the timer</span>
                        </label>
                      </section>

                      <section className="border-t border-base-300/60 pt-6">
                        <h4 className="text-[16px] font-bold text-base-content">Attempts per kata</h4>
                        <p className="mt-1 text-[13px] leading-relaxed text-base-content/45">{attemptsSummary}</p>
                        <div className="join mt-4 w-full max-w-[420px]">
                          {([null, 3, 5, 10] as (number | null)[]).map((n) => (
                            <button
                              type="button"
                              key={n ?? "none"}
                              onClick={() => setMaxTestRuns(n)}
                              aria-pressed={maxTestRuns === n}
                              className={`btn btn-sm join-item flex-1 ${maxTestRuns === n ? "btn-primary" : "kata-btn-secondary"}`}
                            >
                              {n === null ? "∞" : n}
                            </button>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}

                  {settingsSection === "editor" && (
                    <div className="max-w-[620px]">
                      <h4 className="text-[16px] font-bold text-base-content">Practice editor behavior</h4>
                      <p className="mt-1 text-[13px] leading-relaxed text-base-content/45">
                        Tune assistance features that affect how much you have to remember while practicing.
                      </p>
                      <div className="mt-5 divide-y divide-base-300/50 border-y border-base-300/50">
                        {EDITOR_TOGGLES.filter((t) => t.onPractice).map(({ key, label, hint }) => {
                          const on = toggleValues[key];
                          return (
                            <label
                              key={key}
                              className="flex cursor-pointer items-center justify-between gap-6 py-4"
                            >
                              <span className="min-w-0">
                                <span className={`block text-[14px] font-semibold ${on ? "text-base-content" : "text-base-content/55"}`}>
                                  {label}
                                </span>
                                {hint && <span className="mt-1 block text-[12px] leading-relaxed text-base-content/35">{hint}</span>}
                              </span>
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={(event) => setSetting(key, event.currentTarget.checked)}
                                className="toggle toggle-primary toggle-sm shrink-0"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </main>
            </div>
          </div>
        </>
      )}

      {/* ── Right panel ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Launch command */}
        <div className="shrink-0 border-b border-base-300/60 bg-base-100 px-4 py-4 lg:px-5">
          <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[18px] font-bold leading-tight text-base-content">
                  {MODE_LABEL[mode]}
                </h2>
                <span className="kata-chip rounded-md border px-2 py-0.5 text-[11px] font-semibold">
                  {queueItems.length} queued
                </span>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-base-content/50">
                {launchReason}
              </p>
              {launchDisabledReason && (
                <p className="mt-1 text-[12px] font-medium text-warning">
                  {launchDisabledReason}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <TooltipHint
                  label="Session size"
                  text="Pick how many problems this session will include."
                >
                  <Info size={15} className="text-base-content/35" aria-hidden="true" />
                </TooltipHint>
                <div className="join" title="Pick how many problems this session will include">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSessionSize(s)}
                      aria-pressed={sessionSize === s}
                      title={s === "all" ? "Include every matching problem" : `Include ${s} problems in this session`}
                      className={`btn btn-sm join-item min-w-10 ${sessionSize === s ? "btn-primary" : "kata-btn-secondary"}`}
                    >
                      {s === "all" ? "All" : s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipHint
                  label="Time limit"
                  text="Set the minutes allowed for each problem. Use 0 for no timer."
                >
                  <Info size={15} className="text-base-content/35" aria-hidden="true" />
                </TooltipHint>
                <label
                  className="kata-chip flex h-8 items-center gap-2 rounded-md border px-2 text-[12px]"
                  title="Set minutes per problem. Use 0 for no timer."
                >
                  <Timer size={14} aria-hidden="true" />
                  <input
                    type="number"
                    min={0}
                    value={timeLimitMinutes}
                    aria-label="Minutes per problem"
                    onChange={(event) => {
                      const mins = Math.max(0, parseInt(event.currentTarget.value) || 0);
                      setSetting("sessionTimeLimitMs", mins * 60000);
                    }}
                    className="w-9 bg-transparent text-right text-[12px] font-semibold tabular-nums text-base-content outline-none"
                  />
                  <span>min</span>
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSettingsSection("filters");
                  setSettingsOpen(true);
                }}
                className="btn btn-sm kata-btn-secondary"
              >
                <ListFilter size={15} />
                Filters
              </button>
              <button
                type="button"
                aria-label="Practice setup"
                title="Practice setup"
                onClick={() => setSettingsOpen(true)}
                className="btn btn-ghost btn-sm btn-square text-base-content/55 hover:text-base-content"
              >
                <Settings2 size={17} />
              </button>
              <button
                onClick={handleLaunch}
                disabled={launchKatas.length === 0 || launching}
                className="btn btn-primary btn-sm min-w-36"
              >
                {launching ? <span className="loading loading-spinner loading-xs" /> : <Play size={15} />}
                {launching ? "Launching" : `Start ${launchCount}`}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeFilterSummary.map((item) => (
              <span key={item} className="kata-chip rounded-md border px-2 py-1 text-[11px] font-medium">
                {item}
              </span>
            ))}
            <span className="kata-chip rounded-md border px-2 py-1 text-[11px] font-medium">
              {timeLimitSummary}
            </span>
            <span className="kata-chip rounded-md border px-2 py-1 text-[11px] font-medium">
              {attemptsSummary}
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearPracticeFilters}
                className="btn btn-xs kata-btn-secondary"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Queue list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {queueItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
              <div>
                <p className="text-sm font-semibold text-base-content/65">
                  {katas.length === 0 ? "No problems loaded" : "No problems match this setup"}
                </p>
                <p className="mt-1 max-w-md text-[12px] leading-relaxed text-base-content/40">
                  {katas.length === 0
                    ? "Reload the bundled problem statements to build a practice queue."
                    : "Relax one of the active constraints, or switch back to the review queue."}
                </p>
              </div>
              {katas.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearPracticeFilters}
                      className="btn btn-primary btn-sm"
                    >
                      Clear filters
                    </button>
                  )}
                  {mode !== "sr" && (
                    <button
                      type="button"
                      onClick={() => setMode("sr")}
                      className="btn btn-sm kata-btn-secondary"
                    >
                      Use SR Queue
                    </button>
                  )}
                  {moduleFilters.length > 0 && (
                    <button type="button" onClick={clearModuleFilters} className="btn btn-ghost btn-sm">
                      Clear modules
                    </button>
                  )}
                  {difficultyFilters.length > 0 && (
                    <button type="button" onClick={clearDifficultyFilters} className="btn btn-ghost btn-sm">
                      Clear difficulty
                    </button>
                  )}
                  {implementationSizeFilters.length > 0 && (
                    <button type="button" onClick={clearImplementationSizeFilters} className="btn btn-ghost btn-sm">
                      Clear length
                    </button>
                  )}
                </div>
              )}
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
            Urgency rises when a problem is failed, new, slow, or idle
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
    <div
      className="flex w-full items-center gap-3 px-2.5 py-2.5 rounded-lg border border-transparent text-left"
    >
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
          title={`${streak} pass streak`}
        >
          <Flame size={12} aria-hidden="true" />
          {streak}
        </span>
      )}
    </div>
  );
}
