import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useKataStore } from "../stores/kata-store";
import type { LibrarySortMode } from "../stores/kata-store";
import { useSettingsStore } from "../stores/settings-store";
import { CATEGORY_LEVEL } from "../lib/levels";
import { moduleBodyClass } from "../lib/module-accordion";
import { reseedKatas, resetKataProgress } from "../lib/database";
import { compareDpCurriculumOrder, dpCategoryLabelFor, dpDisplayNameFor, dpFamilyFor, DP_MODULES } from "../lib/dp-patterns";
import type { Kata } from "../types/editor";

// Module-level so the list position survives navigating to a kata and back
// (resets only on full app reload).
let savedScrollTop = 0;

type ModuleSection = {
  id: string;
  label: string;
  categories: string[];
  tags?: string[];
  dpModule?: string;
  katas: Kata[];
  children?: ModuleSection[];
};

const MODULE_DEFS: Omit<ModuleSection, "katas">[] = [
  { id: "arrays-hashing", label: "Arrays & Hashing", categories: ["arrays", "hashing", "string", "strings"], tags: ["arrays-hashing", "hash-map"] },
  { id: "two-pointers", label: "Two Pointers", categories: ["two-pointers"], tags: ["two-pointers"] },
  { id: "sliding-window", label: "Sliding Window", categories: ["sliding-window"], tags: ["sliding-window"] },
  { id: "stack", label: "Stack", categories: ["stack"], tags: ["stack"] },
  { id: "binary-search", label: "Binary Search", categories: ["binary-search"], tags: ["binary-search"] },
  { id: "linked-list", label: "Linked List", categories: ["linked-list"], tags: ["linked-list"] },
  { id: "trees", label: "Trees", categories: ["trees"], tags: ["trees"] },
  { id: "heap", label: "Heap / Priority Queue", categories: ["heap"], tags: ["heap", "priority-queue"] },
  { id: "backtracking", label: "Backtracking", categories: ["backtracking"], tags: ["backtracking"] },
  { id: "tries", label: "Tries", categories: ["tries"], tags: ["trie", "tries"] },
  { id: "graphs", label: "Graphs", categories: ["graphs", "graph"], tags: ["graphs", "graph"] },
  { id: "advanced-graphs", label: "Advanced Graphs", categories: ["advanced-graphs"], tags: ["advanced-graphs"] },
  { id: "intervals", label: "Intervals", categories: ["intervals"], tags: ["intervals"] },
  { id: "greedy", label: "Greedy", categories: ["greedy"], tags: ["greedy"] },
  { id: "dynamic-programming", label: "Dynamic Programming", categories: [], tags: [] },
  { id: "bit-manipulation", label: "Bit Manipulation", categories: ["binary", "bit-manipulation"], tags: ["bit-manipulation"] },
  { id: "math-geometry", label: "Math & Geometry", categories: ["math-and-geometry", "math", "matrix"], tags: ["math", "matrix"] },
];

export function PracticePage() {
  return <LibraryPage modules={false} />;
}

export function ModulesPage() {
  return <LibraryPage modules />;
}

function LibraryPage({ modules }: { modules: boolean }) {
  const katas = useKataStore((s) => s.katas);
  const bestTimes = useKataStore((s) => s.bestTimes);
  const streaks = useKataStore((s) => s.streaks);
  const deleteKata = useKataStore((s) => s.deleteKata);
  const dailyKataIds = useSettingsStore((s) => s.dailyKataIds);
  const doneKataIds = useSettingsStore((s) => s.doneKataIds);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const navigate = useNavigate();
  const [expandedTagRows, setExpandedTagRows] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set());
  const TAG_PREVIEW_COUNT = 3;

  const librarySearch = useKataStore((s) => s.librarySearch);
  const libraryDiffSort = useKataStore((s) => s.libraryDiffSort);
  const librarySortMode = useKataStore((s) => s.librarySortMode);
  const leetcodeOnly = useKataStore((s) => s.libraryLeetcodeOnly);
  const blind75Only = useKataStore((s) => s.libraryBlind75Only);
  const neetcodeOnly = useKataStore((s) => s.libraryNeetcodeOnly);
  const setLibraryUI = useKataStore((s) => s.setLibraryUI);
  const setBrowseOrder = useKataStore((s) => s.setBrowseOrder);

  const search = librarySearch;
  const setSearch = (v: string) => setLibraryUI({ librarySearch: v });
  const diffSort = libraryDiffSort;
  const setDiffSort = (v: "asc" | "desc" | null) => setLibraryUI({ libraryDiffSort: v });
  const sortMode = librarySortMode;
  const setSortMode = (v: LibrarySortMode) => setLibraryUI({ librarySortMode: v });

  const diffRank: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

  const searchedKatas = useMemo(() => {
    const q = search.toLowerCase().trim();
    const levelMatch = q.match(/^(?:l|lv\.?|level\s*)(\d+)$/);
    const levelFilter = levelMatch ? parseInt(levelMatch[1], 10) : null;
    const filtered = katas.filter((k) => {
      if (leetcodeOnly && k.leetcodeNumber == null) return false;
      if (blind75Only && !k.tags.includes("blind75")) return false;
      if (neetcodeOnly && !k.tags.includes("neetcode")) return false;
      if (levelFilter !== null) return (CATEGORY_LEVEL[k.category] ?? -1) === levelFilter;
      const digits = q.replace(/^#/, "");
      const numberMatch =
        digits.length > 0 &&
        /^\d+$/.test(digits) &&
        k.leetcodeNumber != null &&
        String(k.leetcodeNumber).includes(digits);
      return (
        numberMatch ||
        k.name.toLowerCase().includes(q) ||
        k.category.toLowerCase().includes(q) ||
        (k.difficulty?.toLowerCase().includes(q) ?? false) ||
        k.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
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
        case "leetcode": {
          // Ascending by problem number; katas without a LeetCode number
          // always sink to the bottom.
          const aN = a.leetcodeNumber;
          const bN = b.leetcodeNumber;
          if (aN == null && bN == null) return 0;
          if (aN == null) return 1;
          if (bN == null) return -1;
          return aN - bN;
        }
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
  }, [katas, search, diffSort, sortMode, leetcodeOnly, blind75Only, neetcodeOnly, dailyKataIds, bestTimes, streaks]);

  // Modules page: group the visible rows into roadmap-style accordion sections.
  const familySections = useMemo(() => {
    if (!modules) return null;
    const sections = MODULE_DEFS.map((def) => ({ ...def, katas: [] as Kata[] }));
    const dpSections = DP_MODULES.map((module) => ({
      id: module.id,
      label: module.label,
      categories: [],
      tags: [],
      dpModule: module.id,
      katas: [] as Kata[],
    }));
    const assigned = new Set<number>();

    const matchesSection = (kata: Kata, section: Omit<ModuleSection, "katas">) => {
      const dpModule = dpFamilyFor(kata);
      if (section.dpModule) return dpModule === section.dpModule;
      if (dpModule) return false;
      const tags = kata.tags;
      if (section.id === "arrays-hashing") {
        if (kata.category === "arrays" || kata.category === "hashing") return true;
        if (tags.some((tag) => section.tags?.includes(tag))) return true;
        if ((kata.category === "string" || kata.category === "strings") &&
            !tags.some((tag) => ["sliding-window", "two-pointers", "stack", "dynamic-programming", "1d-dp", "2d-dp", "grid-dp", "expand-around-center"].includes(tag))) {
          return true;
        }
        return false;
      }
      return section.categories.includes(kata.category) || tags.some((tag) => section.tags?.includes(tag));
    };

    for (const kata of searchedKatas) {
      const dpModule = dpFamilyFor(kata);
      if (dpModule) {
        const dpSection = dpSections.find((candidate) => candidate.dpModule === dpModule);
        if (dpSection) {
          dpSection.katas.push(kata);
          assigned.add(kata.id);
        }
        continue;
      }

      const section = sections.find((candidate) => candidate.id !== "dynamic-programming" && matchesSection(kata, candidate));
      if (section) {
        section.katas.push(kata);
        assigned.add(kata.id);
      }
    }

    for (const section of dpSections) section.katas.sort(compareDpCurriculumOrder);

    const visibleDpSections = dpSections.filter((section) => section.katas.length > 0);
    const dpParent = sections.find((section) => section.id === "dynamic-programming");
    if (dpParent && visibleDpSections.length > 0) {
      dpParent.children = visibleDpSections;
      dpParent.katas = visibleDpSections.flatMap((section) => section.katas);
    }

    const visible = sections.filter((section) => section.katas.length > 0);
    const other = searchedKatas.filter((kata) => !assigned.has(kata.id));
    if (other.length) visible.push({ id: "other", label: "Other", categories: [], katas: other });
    return visible;
  }, [modules, searchedKatas]);

  const renderedKatas = useMemo(
    () => familySections?.flatMap((section) => section.children?.flatMap((child) => child.katas) ?? section.katas) ?? searchedKatas,
    [familySections, searchedKatas],
  );

  // Publish the RENDERED order. Publishing the raw store list would look like
  // an optimization and would silently break next/prev in the editor.
  useEffect(() => {
    setBrowseOrder(renderedKatas.map((k) => k.id));
  }, [renderedKatas, setBrowseOrder]);

  const toggleFavoriteById = (id: number) => {
    const next = dailyKataIds.includes(id)
      ? dailyKataIds.filter((x) => x !== id)
      : [...dailyKataIds, id];
    setSetting("dailyKataIds", next);
  };

  const toggleDaily = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteById(id);
  };

  const toggleDone = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = doneKataIds.includes(id)
      ? doneKataIds.filter((x) => x !== id)
      : [...doneKataIds, id];
    setSetting("doneKataIds", next);
  };

  const diffColor = (d: string | null) => {
    if (d === "easy") return "badge-success";
    if (d === "medium") return "badge-warning";
    if (d === "hard") return "badge-error";
    return "badge-ghost";
  };

  const language = useSettingsStore((s) => s.language);
  const [reseeding, setReseeding] = useState(false);

  const handleReseed = async () => {
    setReseeding(true);
    try {
      await reseedKatas();
      await useKataStore.getState().loadKatas(language);
    } finally {
      setReseeding(false);
    }
  };

  // Native right-click menu on a kata row (see show_kata_context_menu in
  // src-tauri/src/lib.rs) — Rust just shows the OS menu and relays which
  // item fired; this owns navigation/store state/clipboard.
  useEffect(() => {
    const unlisten = listen<{ action: string; kataId: number }>("kata-context-action", (event) => {
      const { action, kataId } = event.payload;
      const kata = katas.find((k) => k.id === kataId);
      if (!kata) return;
      switch (action) {
        case "start":
          navigate(`/editor/${kataId}`);
          break;
        case "favorite":
          toggleFavoriteById(kataId);
          break;
        case "reset":
          if (confirm(`Reset progress for "${kata.name}"? This clears its best time and streak.`)) {
            void resetKataProgress(kataId).then(() => useKataStore.getState().loadKatas(language));
          }
          break;
        case "copy":
          void writeText(kata.name);
          break;
      }
    });
    return () => { void unlisten.then((fn) => fn()); };
  }, [katas, dailyKataIds, language, navigate]);

  const handleKataContextMenu = (e: React.MouseEvent, kataId: number) => {
    e.preventDefault();
    void invoke("show_kata_context_menu", { kataId, isFavorite: dailyKataIds.includes(kataId) });
  };

  const listRef = useRef<HTMLDivElement>(null);
  const restoredScroll = useRef(false);
  useEffect(() => {
    if (!restoredScroll.current && listRef.current && renderedKatas.length > 0) {
      listRef.current.scrollTop = savedScrollTop;
      restoredScroll.current = true;
    }
  }, [renderedKatas.length]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    setSelectedIndex(0);
  }, [search, sortMode, diffSort]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, renderedKatas.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const kata = renderedKatas[selectedIndex];
        if (kata) navigate(`/editor/${kata.id}`);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [renderedKatas, selectedIndex, navigate]);

  useEffect(() => {
    const kata = renderedKatas[selectedIndex];
    if (!kata) return;
    document.getElementById(`kata-row-${kata.id}`)?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, renderedKatas]);

  // Selection/keyboard-nav indexes into the flat rendered order even when rows
  // are displayed under module section headings.
  const indexById = useMemo(() => {
    const m = new Map<number, number>();
    renderedKatas.forEach((k, i) => m.set(k.id, i));
    return m;
  }, [renderedKatas]);

  const renderKataRow = (kata: Kata) => {
    const idx = indexById.get(kata.id) ?? -1;
    const displayName = dpDisplayNameFor(kata);
    const categoryLabel = dpCategoryLabelFor(kata);
    return (
      <tr
        key={kata.id}
        id={`kata-row-${kata.id}`}
        onClick={() => { setSelectedIndex(idx); navigate(`/editor/${kata.id}`); }}
        onMouseEnter={() => setSelectedIndex(idx)}
        onContextMenu={(e) => handleKataContextMenu(e, kata.id)}
        className={`cursor-pointer transition-colors border-base-300/30 ${
          idx === selectedIndex ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-base-300/20"
        }`}
      >
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
        <td className="font-medium text-sm">
          <span className="inline-flex items-center gap-1.5">
            {kata.leetcodeNumber != null && (
              <>
                <img
                  src="/leetcode-dark.png"
                  alt="LeetCode"
                  className="h-4 w-4 shrink-0 object-contain opacity-85"
                />
                <span className="text-base-content/40 tabular-nums">
                  {kata.leetcodeNumber}.
                </span>
              </>
            )}
            {displayName}
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
        <td className="text-base-content/45 text-sm">{categoryLabel}</td>
        <td>
          <span className={`badge badge-sm ${diffColor(kata.difficulty)}`}>
            {kata.difficulty ?? "-"}
          </span>
        </td>
        <td>
          <div className="flex flex-wrap items-center gap-1">
            {(expandedTagRows.has(kata.id) ? kata.tags : kata.tags.slice(0, TAG_PREVIEW_COUNT)).map((tag) => (
              <button
                key={tag}
                onClick={(e) => { e.stopPropagation(); setSearch(tag); }}
                className="badge badge-xs bg-primary/10 text-primary/70 border-primary/10 cursor-pointer hover:bg-primary/25 hover:text-primary transition-colors"
              >
                {tag}
              </button>
            ))}
            {!expandedTagRows.has(kata.id) && kata.tags.length > TAG_PREVIEW_COUNT && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedTagRows((prev) => new Set(prev).add(kata.id));
                }}
                className="badge badge-xs bg-base-300/40 text-base-content/40 border-transparent cursor-pointer hover:bg-base-300/70 hover:text-base-content/70 transition-colors"
                title="Show all tags"
              >
                +{kata.tags.length - TAG_PREVIEW_COUNT}
              </button>
            )}
          </div>
        </td>
        <td className="text-right text-base-content/45 tabular-nums text-sm">
          {bestTimes[kata.id] != null ? `${(bestTimes[kata.id] / 1000).toFixed(1)}s` : "-"}
        </td>
        <td className="text-right text-base-content/45 tabular-nums text-sm">
          {streaks[kata.id] ? streaks[kata.id] : "-"}
        </td>
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
      </tr>
    );
  };

  const moduleProgress = (sectionKatas: Kata[]) => {
    const completed = sectionKatas.filter((kata) => doneKataIds.includes(kata.id)).length;
    const total = sectionKatas.length;
    return {
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  };

  const renderModuleTable = (section: ModuleSection) => (
    <table className="table table-sm">
      <thead>
        <tr className="border-base-300 bg-base-300/70 text-base-content/70">
          <th className="w-8"></th>
          <th>Problem</th>
          <th>Level</th>
          <th>Category</th>
          <th
            className="cursor-pointer select-none hover:text-base-content"
            onClick={() => setDiffSort(diffSort === null ? "asc" : diffSort === "asc" ? "desc" : null)}
          >
            Difficulty {diffSort === "asc" ? "▲" : diffSort === "desc" ? "▼" : ""}
          </th>
          <th>Tags</th>
          <th className="text-right">Best</th>
          <th className="text-right">Streak</th>
          <th className="text-right"></th>
        </tr>
      </thead>
      <tbody>{section.katas.map((kata) => renderKataRow(kata))}</tbody>
    </table>
  );

  const renderModuleSection = (section: ModuleSection, nested = false) => {
    const expanded = expandedModules.has(section.id);
    const progress = moduleProgress(section.katas);
    return (
      <details
        key={section.id}
        name={nested ? "dp-submodules-accordion" : "modules-accordion"}
        open={expanded}
        onToggle={(e) => {
          const isOpen = e.currentTarget.open;
          setExpandedModules((prev) => {
            const next = new Set(prev);
            if (isOpen) next.add(section.id);
            else next.delete(section.id);
            return next;
          });
        }}
        data-testid={`family-section-${section.id}`}
        className={`collapse collapse-arrow overflow-hidden border border-base-300 bg-base-100 shadow-md shadow-base-300/20 ${
          nested ? "rounded-xl shadow-none" : "rounded-2xl"
        }`}
      >
        <summary className={`collapse-title grid w-full grid-cols-[minmax(0,1fr)_24rem] items-center gap-5 pr-12 text-left hover:bg-base-300/20 transition-colors ${
          nested ? "px-4 py-3" : "px-5 py-4"
        }`}>
          <h2 className={`truncate text-lg text-base-content ${nested ? "font-semibold" : "font-bold"}`}>{section.label}</h2>
          <div className="grid grid-cols-[3.5rem_1fr] items-center gap-4">
            <span className="text-right text-sm tabular-nums text-base-content/55">
              {progress.completed}/{progress.total}
            </span>
            <progress className="progress progress-success h-2 w-full bg-base-content/20" value={progress.percent} max="100" />
          </div>
        </summary>
        <div className={moduleBodyClass(Boolean(section.children))}>
          {section.children ? (
            <div className="space-y-1.5 p-2">
              {section.children.map((child) => renderModuleSection(child, true))}
            </div>
          ) : (
            renderModuleTable(section)
          )}
        </div>
      </details>
    );
  };

  return (
    <div className="flex flex-col h-full p-5 gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold shrink-0">{modules ? "Modules" : "Problems"}</h1>
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
        <select
          value={diffSort ? `difficulty-${diffSort}` : sortMode}
          onChange={(e) => {
            const v = e.target.value as LibrarySortMode | "difficulty-asc" | "difficulty-desc";
            if (v === "difficulty-asc") { setSortMode("default"); setDiffSort("asc"); }
            else if (v === "difficulty-desc") { setSortMode("default"); setDiffSort("desc"); }
            else { setDiffSort(null); setSortMode(v as LibrarySortMode); }
          }}
          className="select select-bordered select-sm bg-base-100 text-xs w-52 shrink-0"
        >
          <option value="default">Sort: Default</option>
          <option value="starred">Sort: Starred first</option>
          <option value="level">Sort: Level</option>
          <option value="level-difficulty">Sort: Level + Difficulty</option>
          <option value="category">Sort: Category A→Z</option>
          <option value="leetcode">Sort: LeetCode #</option>
          <option value="best-time">Sort: Best time</option>
          <option value="streak">Sort: Streak</option>
          <option value="difficulty-asc">Sort: Difficulty ↑</option>
          <option value="difficulty-desc">Sort: Difficulty ↓</option>
        </select>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLibraryUI({ libraryLeetcodeOnly: !leetcodeOnly })}
            title="Show only katas that map to a LeetCode problem"
            aria-pressed={leetcodeOnly}
            className={`btn btn-sm ${leetcodeOnly ? "btn-primary" : "btn-ghost btn-outline"}`}
          >
            LeetCode
          </button>
          <button
            onClick={() => setLibraryUI({ libraryBlind75Only: !blind75Only })}
            title="Show only Blind 75 katas"
            aria-pressed={blind75Only}
            className={`btn btn-sm ${blind75Only ? "btn-primary" : "btn-ghost btn-outline"}`}
          >
            Blind 75
          </button>
          <button
            onClick={() => setLibraryUI({ libraryNeetcodeOnly: !neetcodeOnly })}
            title="Show only NeetCode katas"
            aria-pressed={neetcodeOnly}
            className={`btn btn-sm ${neetcodeOnly ? "btn-primary" : "btn-ghost btn-outline"}`}
          >
            NeetCode
          </button>
        </div>
      </div>

      {/* Kata table / modules */}
      <div
        ref={listRef}
        onScroll={(e) => { savedScrollTop = e.currentTarget.scrollTop; }}
        className={`flex-1 min-h-0 overflow-y-auto scrollbar-hidden ${
          modules ? "space-y-1.5 pr-1" : "bg-base-100 rounded-2xl border border-base-300 shadow-md shadow-base-300/20"
        }`}
      >
        {modules ? (
          <>
            {familySections?.map((section) => renderModuleSection(section))}
            {searchedKatas.length === 0 && (
              <div className="rounded-2xl border border-base-300/50 bg-base-100 py-12 text-center text-sm">
                <p className="text-base-content/25 mb-3">No katas found</p>
                <button
                  onClick={handleReseed}
                  disabled={reseeding}
                  className="btn btn-sm btn-ghost text-base-content/40 hover:text-base-content/70"
                >
                  {reseeding ? "Reseeding…" : "Reload problem statements"}
                </button>
              </div>
            )}
          </>
        ) : (
          <table className="table table-sm">
            <thead>
              <tr className="border-base-300 bg-base-300/70 text-base-content/70">
                <th className="w-8"></th>
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
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {searchedKatas.map((kata) => renderKataRow(kata))}
              {searchedKatas.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm">
                    <p className="text-base-content/25 mb-3">No katas found</p>
                    <button
                      onClick={handleReseed}
                      disabled={reseeding}
                      className="btn btn-sm btn-ghost text-base-content/40 hover:text-base-content/70"
                    >
                      {reseeding ? "Reseeding…" : "Reload problem statements"}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
