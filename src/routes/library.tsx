import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useKataStore } from "../stores/kata-store";
import type { LibrarySortMode } from "../stores/kata-store";
import { useSettingsStore } from "../stores/settings-store";
import { useSessionStore, selectRandomKatas, sortBySpacedRepetition } from "../stores/session-store";
import { useTimerStore } from "../stores/timer-store";
import type { SessionType } from "../types/editor";
import { CATEGORY_LEVEL } from "../lib/levels";

type Tab = "browse" | "daily" | "random" | "custom";
const SIZE_OPTIONS = [5, 10, 15, 20];

export function PracticePage() {
  const katas = useKataStore((s) => s.katas);
  const bestTimes = useKataStore((s) => s.bestTimes);
  const streaks = useKataStore((s) => s.streaks);
  const deleteKata = useKataStore((s) => s.deleteKata);
  const dailyKataIds = useSettingsStore((s) => s.dailyKataIds);
  const doneKataIds = useSettingsStore((s) => s.doneKataIds);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const { startSession, loadPresets, presets, savePreset, deletePreset } = useSessionStore();
  const startSessionTimer = useTimerStore((s) => s.startSessionTimer);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const navigate = useNavigate();

  const librarySearch = useKataStore((s) => s.librarySearch);
  const libraryTab = useKataStore((s) => s.libraryTab);
  const libraryCategoryFilter = useKataStore((s) => s.libraryCategoryFilter);
  const libraryDiffSort = useKataStore((s) => s.libraryDiffSort);
  const librarySortMode = useKataStore((s) => s.librarySortMode);
  const setLibraryUI = useKataStore((s) => s.setLibraryUI);

  const tab = libraryTab;
  const setTab = (t: Tab) => setLibraryUI({ libraryTab: t });
  const search = librarySearch;
  const setSearch = (v: string) => setLibraryUI({ librarySearch: v });
  const diffSort = libraryDiffSort;
  const setDiffSort = (v: "asc" | "desc" | null) => setLibraryUI({ libraryDiffSort: v });
  const sortMode = librarySortMode;
  const setSortMode = (v: LibrarySortMode) => setLibraryUI({ librarySortMode: v });
  const [starting, setStarting] = useState(false);
  const [maxTestRuns, setMaxTestRuns] = useState<number | null>(null);

  // Daily state
  const [dailySelectedIds, setDailySelectedIds] = useState<Set<number>>(new Set());

  // Random state
  const [size, setSize] = useState(5);
  const categoryFilter = libraryCategoryFilter;
  const setCategoryFilter = (v: string) => setLibraryUI({ libraryCategoryFilter: v });
  const categories = [...new Set(katas.map((k) => k.category))].sort();
  const filteredKatas = categoryFilter
    ? katas.filter((k) => k.category === categoryFilter)
    : katas;

  // Custom state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [customOrder, setCustomOrder] = useState<number[]>([]);
  const [presetName, setPresetName] = useState("");
  const [activePresetId, setActivePresetId] = useState<number | null>(null);

  const diffRank: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

  const searchedKatas = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = katas.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.category.toLowerCase().includes(q) ||
        (k.difficulty?.toLowerCase().includes(q) ?? false) ||
        k.tags.some((t) => t.toLowerCase().includes(q))
    );
    // diffSort column header takes priority when active
    if (diffSort) {
      return [...filtered].sort((a, b) => {
        const ra = diffRank[a.difficulty ?? ""] ?? 3;
        const rb = diffRank[b.difficulty ?? ""] ?? 3;
        return diffSort === "asc" ? ra - rb : rb - ra;
      });
    }
    if (sortMode === "default") return filtered;
    return [...filtered].sort((a, b) => {
      switch (sortMode) {
        case "starred": {
          const aS = dailyKataIds.includes(a.id) ? 0 : 1;
          const bS = dailyKataIds.includes(b.id) ? 0 : 1;
          return aS - bS;
        }
        case "level": {
          const aL = CATEGORY_LEVEL[a.category] ?? 99;
          const bL = CATEGORY_LEVEL[b.category] ?? 99;
          return aL - bL;
        }
        case "level-difficulty": {
          const aL = CATEGORY_LEVEL[a.category] ?? 99;
          const bL = CATEGORY_LEVEL[b.category] ?? 99;
          if (aL !== bL) return aL - bL;
          const ra = diffRank[a.difficulty ?? ""] ?? 3;
          const rb = diffRank[b.difficulty ?? ""] ?? 3;
          return ra - rb;
        }
        case "category":
          return a.category.localeCompare(b.category);
        case "best-time": {
          const aT = bestTimes[a.id] ?? Infinity;
          const bT = bestTimes[b.id] ?? Infinity;
          return aT - bT;
        }
        case "streak": {
          const aSt = streaks[a.id] ?? 0;
          const bSt = streaks[b.id] ?? 0;
          return bSt - aSt;
        }
        case "difficulty-asc": {
          const ra = diffRank[a.difficulty ?? ""] ?? 3;
          const rb = diffRank[b.difficulty ?? ""] ?? 3;
          return ra - rb;
        }
        case "difficulty-desc": {
          const ra = diffRank[a.difficulty ?? ""] ?? 3;
          const rb = diffRank[b.difficulty ?? ""] ?? 3;
          return rb - ra;
        }
        default:
          return 0;
      }
    });
  }, [katas, search, diffSort, sortMode, dailyKataIds, bestTimes, streaks]);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  useEffect(() => {
    setDailySelectedIds(new Set(dailyKataIds));
  }, [dailyKataIds]);

  // Browse daily toggle (star)
  const toggleDaily = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = dailyKataIds.includes(id)
      ? dailyKataIds.filter((x) => x !== id)
      : [...dailyKataIds, id];
    setSetting("dailyKataIds", next);
  };

  const toggleDone = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = doneKataIds.includes(id)
      ? doneKataIds.filter((x) => x !== id)
      : [...doneKataIds, id];
    setSetting("doneKataIds", next);
  };

  // Custom handlers
  const toggleKata = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
      setCustomOrder((prev) => prev.filter((i) => i !== id));
    } else {
      next.add(id);
      setCustomOrder((prev) => [...prev, id]);
    }
    setSelectedIds(next);
  };

  const moveUp = (id: number) => {
    setCustomOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (id: number) => {
    setCustomOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const loadPreset = (presetId: number) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedIds(new Set(preset.kataIds));
    setCustomOrder(preset.kataIds);
    setActivePresetId(presetId);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim() || customOrder.length === 0) return;
    await savePreset(presetName.trim(), customOrder);
    setPresetName("");
  };

  // Start session
  const handleStart = useCallback(async () => {
    if (starting) return;
    setStarting(true);

    let sessionType: SessionType;
    let selectedKatas;

    if (tab === "daily") {
      sessionType = "daily";
      const kataMap = new Map(katas.map((k) => [k.id, k]));
      const ids = [...dailySelectedIds];
      const starred = ids.map((id) => kataMap.get(id)).filter(Boolean) as typeof katas;
      selectedKatas = await sortBySpacedRepetition(starred);
    } else if (tab === "random") {
      sessionType = "random";
      selectedKatas = await selectRandomKatas(filteredKatas, size);
    } else {
      sessionType = "custom";
      const kataMap = new Map(katas.map((k) => [k.id, k]));
      selectedKatas = customOrder.map((id) => kataMap.get(id)).filter(Boolean) as typeof katas;
    }

    if (selectedKatas.length === 0) {
      setStarting(false);
      return;
    }

    resetKataTimer();
    startSessionTimer();
    const sessionId = await startSession(sessionType, selectedKatas, undefined, maxTestRuns);
    navigate(`/session/${sessionId}`);
  }, [
    starting, tab, size, filteredKatas, customOrder, katas, dailySelectedIds,
    maxTestRuns, startSession, startSessionTimer, resetKataTimer, navigate,
  ]);

  const tabClass = (t: Tab) =>
    `px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
      tab === t
        ? "bg-base-100 text-base-content shadow-sm"
        : "text-base-content/35 hover:text-base-content/60"
    }`;

  const diffColor = (d: string | null) => {
    if (d === "easy") return "badge-success";
    if (d === "medium") return "badge-warning";
    if (d === "hard") return "badge-error";
    return "badge-ghost";
  };

  const isSessionMode = tab !== "browse";
  const canStart =
    (tab === "daily" && dailySelectedIds.size > 0) ||
    tab === "random" ||
    (tab === "custom" && customOrder.length > 0);

  return (
    <div className="flex flex-col h-full p-5 gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search katas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered input-sm w-full bg-base-100 pr-7"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/80 transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {/* Sort dropdown — browse tab only */}
        {tab === "browse" && (
          <select
            value={diffSort ? `difficulty-${diffSort}` : sortMode}
            onChange={(e) => {
              const v = e.target.value as LibrarySortMode | "difficulty-asc" | "difficulty-desc";
              if (v === "difficulty-asc") { setSortMode("default"); setDiffSort("asc"); }
              else if (v === "difficulty-desc") { setSortMode("default"); setDiffSort("desc"); }
              else { setDiffSort(null); setSortMode(v as LibrarySortMode); }
            }}
            className="select select-bordered select-sm bg-base-100 text-xs"
          >
            <option value="default">Sort: Default</option>
            <option value="starred">Sort: Starred first</option>
            <option value="level">Sort: Level</option>
            <option value="level-difficulty">Sort: Level + Difficulty</option>
            <option value="category">Sort: Category A→Z</option>
            <option value="best-time">Sort: Best time</option>
            <option value="streak">Sort: Streak</option>
            <option value="difficulty-asc">Sort: Difficulty ↑</option>
            <option value="difficulty-desc">Sort: Difficulty ↓</option>
          </select>
        )}

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-base-300/40 rounded-lg p-1">
          <button onClick={() => setTab("browse")} className={tabClass("browse")}>Browse</button>
          <button onClick={() => setTab("daily")} className={tabClass("daily")}>Daily</button>
          <button onClick={() => setTab("random")} className={tabClass("random")}>Random</button>
          <button onClick={() => setTab("custom")} className={tabClass("custom")}>Custom</button>
        </div>

        {/* Max attempts selector + Start session button */}
        {isSessionMode && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Max</span>
              <div className="join">
                {([null, 3, 5, 10] as (number | null)[]).map((n) => (
                  <button
                    key={n ?? "none"}
                    onClick={() => setMaxTestRuns(n)}
                    className={`btn btn-xs join-item ${maxTestRuns === n ? "btn-primary" : "btn-ghost"}`}
                  >
                    {n === null ? "∞" : n}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleStart}
              disabled={starting || !canStart}
              className="btn btn-primary btn-sm gap-1.5 text-xs"
            >
              {starting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z" />
                </svg>
              )}
              {starting ? "Starting..." : "Start Session"}
            </button>
          </>
        )}
      </div>

      {/* Mode-specific controls */}
      {tab === "daily" && dailySelectedIds.size === 0 && (
        <div className="text-xs text-base-content/35">
          No daily katas set. Star katas in Browse to add them to your daily set.
        </div>
      )}

      {tab === "random" && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Count</span>
            <div className="join">
              {SIZE_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSize(n)}
                  className={`btn btn-sm join-item ${size === n ? "btn-primary" : "btn-ghost"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select select-bordered select-sm bg-base-100"
            >
              <option value="">All ({katas.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-base-content/30">
            Picks from {filteredKatas.length} katas
          </span>
        </div>
      )}

      {tab === "custom" && (
        <div className="flex items-center gap-3">
          {/* Load preset */}
          {presets.length > 0 && (
            <div className="flex items-center gap-1">
              <select
                value={activePresetId ?? ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val) loadPreset(val);
                }}
                className="select select-bordered select-xs bg-base-100"
              >
                <option value="" disabled>Load preset...</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.kataIds.length})</option>
                ))}
              </select>
              {activePresetId && (
                <button
                  onClick={() => {
                    deletePreset(activePresetId);
                    setActivePresetId(null);
                    setSelectedIds(new Set());
                    setCustomOrder([]);
                  }}
                  className="btn btn-ghost btn-xs btn-square text-error/50 hover:text-error"
                  title="Delete preset"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Save preset */}
          {customOrder.length > 0 && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Save as..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSavePreset(); }}
                className="input input-bordered input-xs w-32 bg-base-100"
              />
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="btn btn-primary btn-xs"
              >
                Save
              </button>
            </div>
          )}

          {customOrder.length > 0 && (
            <span className="text-xs text-base-content/30">{customOrder.length} selected</span>
          )}
        </div>
      )}

      {/* Kata table (hidden for random mode) */}
      {tab !== "random" && (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden bg-base-100 rounded-lg border border-base-300/50">
          <table className="table table-sm">
            <thead>
              <tr className="text-left text-[11px] text-base-content/35 uppercase tracking-wider">
                {tab === "custom" && <th className="w-8"></th>}
                {tab === "browse" && <th className="w-8"></th>}
                <th className="font-semibold">Name</th>
                <th className="font-semibold">Level</th>
                <th className="font-semibold">Category</th>
                <th
                  className="font-semibold cursor-pointer select-none hover:text-base-content/60 transition-colors"
                  onClick={() => setDiffSort(diffSort === null ? "asc" : diffSort === "asc" ? "desc" : null)}
                >
                  Difficulty {diffSort === "asc" ? "▲" : diffSort === "desc" ? "▼" : ""}
                </th>
                <th className="font-semibold">Tags</th>
                <th className="font-semibold text-right">Best</th>
                <th className="font-semibold text-right">Streak</th>
                {tab === "browse" && <th className="w-16"></th>}
              </tr>
            </thead>
            <tbody>
              {(tab === "daily"
                ? searchedKatas.filter((k) => dailySelectedIds.has(k.id))
                : searchedKatas
              ).map((kata) => {
                const isChecked =
                  tab === "custom" ? selectedIds.has(kata.id) :
                  false;

                return (
                  <tr
                    key={kata.id}
                    onClick={() => {
                      if (tab === "custom") toggleKata(kata.id);
                      else navigate(`/editor/${kata.id}`);
                    }}
                    className={`hover:bg-base-300/20 cursor-pointer transition-colors border-base-300/30 ${isChecked ? "bg-primary/5" : ""}`}
                  >
                    {/* Checkbox for custom mode */}
                    {tab === "custom" && (
                      <td className="w-8">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleKata(kata.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="checkbox checkbox-sm checkbox-primary"
                        />
                      </td>
                    )}
                    {/* Star for browse mode */}
                    {tab === "browse" && (
                      <td className="w-8">
                        <button
                          onClick={(e) => toggleDaily(kata.id, e)}
                          className={`btn btn-ghost btn-xs btn-square ${
                            dailyKataIds.includes(kata.id)
                              ? "text-warning"
                              : "text-base-content/20 hover:text-base-content/40"
                          }`}
                          title={dailyKataIds.includes(kata.id) ? "Remove from daily" : "Add to daily"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={dailyKataIds.includes(kata.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                          </svg>
                        </button>
                      </td>
                    )}
                    <td className="font-medium text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        {kata.name}
                        {kata.isCustom && (
                          <span className="badge badge-secondary badge-xs">Custom</span>
                        )}
                        <button
                          onClick={(e) => toggleDone(kata.id, e)}
                          className={`inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[10px] font-semibold transition-colors ${
                            doneKataIds.includes(kata.id)
                              ? "bg-success/15 text-success hover:bg-success/25"
                              : "text-base-content/15 hover:text-base-content/30 hover:bg-base-300/30"
                          }`}
                          title={doneKataIds.includes(kata.id) ? "Mark as not done" : "Mark as done"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    </td>
                    <td>
                      {CATEGORY_LEVEL[kata.category] !== undefined ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-base-300/60 text-base-content/50 tabular-nums">
                          Lv.{CATEGORY_LEVEL[kata.category]}
                        </span>
                      ) : (
                        <span className="text-base-content/20 text-xs">—</span>
                      )}
                    </td>
                    <td className="text-base-content/45 text-sm">{kata.category}</td>
                    <td>
                      <span className={`badge badge-sm ${diffColor(kata.difficulty)}`}>
                        {kata.difficulty ?? "-"}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {kata.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={(e) => { e.stopPropagation(); setSearch(tag); }}
                            className="badge badge-xs bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/25 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="text-right text-base-content/45 tabular-nums text-sm">
                      {bestTimes[kata.id] != null
                        ? `${(bestTimes[kata.id] / 1000).toFixed(1)}s`
                        : "-"}
                    </td>
                    <td className="text-right text-base-content/45 tabular-nums text-sm">
                      {streaks[kata.id] ? streaks[kata.id] : "-"}
                    </td>
                    {tab === "browse" && (
                      <td className="text-right">
                        {kata.isCustom && (
                          <div className="flex gap-0.5 justify-end">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/kata/${kata.id}/edit`); }}
                              className="btn btn-ghost btn-xs btn-square text-base-content/30 hover:text-base-content/60"
                              title="Edit kata"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (confirm("Delete this kata?")) deleteKata(kata.id); }}
                              className="btn btn-ghost btn-xs btn-square text-error/50 hover:text-error"
                              title="Delete kata"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 1 .7.798l-.2 4.5a.75.75 0 0 1-1.496-.066l.2-4.5a.75.75 0 0 1 .796-.731ZM11.42 7.72a.75.75 0 0 1 .796.731l.2 4.5a.75.75 0 1 1-1.497.066l-.2-4.5a.75.75 0 0 1 .7-.798Z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {(tab === "daily"
                ? searchedKatas.filter((k) => dailySelectedIds.has(k.id)).length === 0
                : searchedKatas.length === 0
              ) && (
                <tr>
                  <td colSpan={tab === "browse" ? 8 : 7} className="py-12 text-center text-base-content/25 text-sm">
                    No katas found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected order (custom tab) */}
      {tab === "custom" && customOrder.length > 0 && (
        <div className="bg-base-100 rounded-lg border border-base-300/50 p-3 max-h-36 overflow-y-auto shrink-0">
          <p className="text-[11px] font-semibold text-base-content/35 uppercase tracking-wider mb-2">
            Selected ({customOrder.length})
          </p>
          {customOrder.map((id, i) => {
            const k = katas.find((k) => k.id === id);
            if (!k) return null;
            return (
              <div key={id} className="flex items-center gap-2 py-1 text-sm">
                <span className="text-base-content/25 w-5 text-right tabular-nums">{i + 1}.</span>
                <span className="flex-1">{k.name}</span>
                <button onClick={() => moveUp(id)} className="btn btn-ghost btn-xs" disabled={i === 0}>Up</button>
                <button onClick={() => moveDown(id)} className="btn btn-ghost btn-xs" disabled={i === customOrder.length - 1}>Dn</button>
                <button onClick={() => toggleKata(id)} className="btn btn-ghost btn-xs text-error/60">X</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
