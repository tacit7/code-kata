import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { invoke } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { open } from "@tauri-apps/plugin-shell";
import { useKataStore } from "../stores/kata-store";
import type { LibrarySortMode } from "../stores/kata-store";
import { useSettingsStore } from "../stores/settings-store";
import { CATEGORY_LEVEL } from "../lib/levels";
import { confirmAction } from "../lib/confirm-action";
import { moduleBodyClass, moduleDetailsClass, moduleHeaderClass, moduleTitleClass } from "../lib/module-accordion";
import { reseedKatas, resetKataProgress } from "../lib/database";
import { compareDpCurriculumOrder, dpCategoryLabelFor, dpDisplayNameFor, dpFamilyFor, DP_MODULES } from "../lib/dp-patterns";
import { IMPLEMENTATION_SIZES, implementationComplexityFor, implementationSizeRank, type ImplementationSize } from "../lib/implementation-complexity";
import { leetcodeUrlFor } from "../lib/leetcode-numbers";
import { OPEN_MODULES_PARAM, parseOpenModuleIds, sameOpenModuleIds, withOpenModuleIds } from "../lib/module-page-state";
import { uniqueLeetcodeProblemKatas } from "../lib/problem-list-filter";
import { compareRecursionCurriculumOrder, recursionFamilyFor, RECURSION_MODULES } from "../lib/recursion-patterns";
import { ROADMAP_MODULES, compareRoadmapModuleOrder, isNeetcode150Kata, isNeetcode250Kata, matchesRoadmapModule, roadmapModuleTargetCount, type RoadmapListMode } from "../lib/roadmap-modules";
import { toast } from "../stores/toast-store";
import { useCommandPaletteStore } from "../stores/command-palette-store";
import type { Kata } from "../types/editor";

// Module-level so list positions survive navigating to a kata and back
// (resets only on full app reload).
const savedScrollTopByPage = {
  modules: 0,
  problems: 0,
};

type ModuleSection = {
  id: string;
  label: string;
  categories: readonly string[];
  tags: readonly string[];
  dpModule?: string;
  recursionModule?: string;
  katas: Kata[];
  children?: ModuleSection[];
};

const MODULE_DEFS: Omit<ModuleSection, "katas">[] = [...ROADMAP_MODULES];

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
  const registerCommand = useCommandPaletteStore((s) => s.registerCommand);
  const navigate = useNavigate();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const openModulesParam = modules ? urlSearchParams.get(OPEN_MODULES_PARAM) : null;
  const [expandedTagRows, setExpandedTagRows] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => (
    modules ? parseOpenModuleIds(openModulesParam) : new Set()
  ));
  const contextCommandCleanupRef = useRef<(() => void) | null>(null);
  const TAG_PREVIEW_COUNT = 3;

  const librarySearch = useKataStore((s) => s.librarySearch);
  const libraryDiffSort = useKataStore((s) => s.libraryDiffSort);
  const librarySortMode = useKataStore((s) => s.librarySortMode);
  const leetcodeOnly = useKataStore((s) => s.libraryLeetcodeOnly);
  const blind75Only = useKataStore((s) => s.libraryBlind75Only);
  const neetcodeOnly = useKataStore((s) => s.libraryNeetcodeOnly);
  const neetcode250Only = useKataStore((s) => s.libraryNeetcode250Only);
  const implementationSizeFilters = useKataStore((s) => s.libraryImplementationSizeFilters);
  const setLibraryUI = useKataStore((s) => s.setLibraryUI);
  const setBrowseOrder = useKataStore((s) => s.setBrowseOrder);

  const search = librarySearch;
  const setSearch = (v: string) => setLibraryUI({ librarySearch: v });
  const diffSort = libraryDiffSort;
  const setDiffSort = (v: "asc" | "desc" | null) => setLibraryUI({ libraryDiffSort: v });
  const sortMode = librarySortMode;
  const setSortMode = (v: LibrarySortMode) => setLibraryUI({ librarySortMode: v });
  const pageKey = modules ? "modules" : "problems";
  const roadmapListMode: RoadmapListMode = neetcodeOnly ? "neetcode150" : neetcode250Only ? "neetcode250" : "all";

  const diffRank: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

  const toggleImplementationSizeFilter = (size: ImplementationSize) => {
    setLibraryUI({
      libraryImplementationSizeFilters: implementationSizeFilters.includes(size)
        ? implementationSizeFilters.filter((item) => item !== size)
        : [...implementationSizeFilters, size],
    });
  };

  useEffect(() => {
    if (!modules) return;
    const next = parseOpenModuleIds(openModulesParam);
    setExpandedModules((prev) => (sameOpenModuleIds(prev, next) ? prev : next));
  }, [modules, openModulesParam]);

  const setModuleExpanded = (sectionId: string, isOpen: boolean) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (isOpen) next.add(sectionId);
      else next.delete(sectionId);
      if (modules) {
        setUrlSearchParams(withOpenModuleIds(urlSearchParams, next), { replace: true });
      }
      return next;
    });
  };

  const searchedKatas = useMemo(() => {
    const q = search.toLowerCase().trim();
    const levelMatch = q.match(/^(?:l|lv\.?|level\s*)(\d+)$/);
    const levelFilter = levelMatch ? parseInt(levelMatch[1], 10) : null;
    const filtered = katas.filter((k) => {
      if (leetcodeOnly && k.leetcodeNumber == null) return false;
      if (blind75Only && !k.tags.includes("blind75")) return false;
      if (neetcodeOnly && !isNeetcode150Kata(k)) return false;
      if (neetcode250Only && !isNeetcode250Kata(k)) return false;
      const implementationComplexity = implementationComplexityFor(k);
      if (implementationSizeFilters.length > 0 && (!implementationComplexity.size || !implementationSizeFilters.includes(implementationComplexity.size))) return false;
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
        (implementationComplexity.size?.toLowerCase().includes(q) ?? false) ||
        k.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
    if (diffSort) {
      const sorted = [...filtered].sort((a, b) => {
        const ra = diffRank[a.difficulty ?? ""] ?? 3;
        const rb = diffRank[b.difficulty ?? ""] ?? 3;
        return diffSort === "asc" ? ra - rb : rb - ra;
      });
      return blind75Only || neetcodeOnly || neetcode250Only ? uniqueLeetcodeProblemKatas(sorted) : sorted;
    }
    if (sortMode === "default") {
      return blind75Only || neetcodeOnly || neetcode250Only ? uniqueLeetcodeProblemKatas(filtered) : filtered;
    }
    const sorted = [...filtered].sort((a, b) => {
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
        case "implementation-complexity": {
          const aRank = implementationSizeRank(implementationComplexityFor(a).size);
          const bRank = implementationSizeRank(implementationComplexityFor(b).size);
          if (aRank !== bRank) return aRank - bRank;
          return a.name.localeCompare(b.name);
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

    return blind75Only || neetcodeOnly || neetcode250Only ? uniqueLeetcodeProblemKatas(sorted) : sorted;
  }, [katas, search, diffSort, sortMode, leetcodeOnly, blind75Only, neetcodeOnly, neetcode250Only, implementationSizeFilters, dailyKataIds, bestTimes, streaks]);

  // Modules page: group the visible rows into roadmap-style accordion sections.
  const familySections = useMemo(() => {
    if (!modules) return null;
    const sections = MODULE_DEFS.map((def) => ({ ...def, katas: [] as Kata[] }));
    const recursionSections = RECURSION_MODULES.map((module) => ({
      id: module.id,
      label: module.label,
      categories: [],
      tags: [],
      recursionModule: module.id,
      katas: [] as Kata[],
    }));
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
      const recursionModule = recursionFamilyFor(kata);
      if (section.dpModule) return dpModule === section.dpModule;
      if (section.recursionModule) return recursionModule === section.recursionModule;
      if (dpModule) return false;
      if (recursionModule) return false;
      return matchesRoadmapModule(kata, section, roadmapListMode);
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

      const recursionModule = recursionFamilyFor(kata);
      if (recursionModule) {
        const recursionSection = recursionSections.find((candidate) => candidate.recursionModule === recursionModule);
        if (recursionSection) {
          recursionSection.katas.push(kata);
          assigned.add(kata.id);
        }
        continue;
      }

      const section = sections.find((candidate) => candidate.id !== "dynamic-programming" && candidate.id !== "recursion" && matchesSection(kata, candidate));
      if (section) {
        section.katas.push(kata);
        assigned.add(kata.id);
      }
    }

    for (const section of recursionSections) section.katas.sort(compareRecursionCurriculumOrder);
    for (const section of dpSections) section.katas.sort(compareDpCurriculumOrder);
    for (const section of sections) {
      section.katas.sort((a, b) => compareRoadmapModuleOrder(section.id, a, b, roadmapListMode));
    }

    const visibleRecursionSections = recursionSections.filter((section) => section.katas.length > 0);
    const recursionParent = sections.find((section) => section.id === "recursion");
    if (recursionParent && visibleRecursionSections.length > 0) {
      recursionParent.children = visibleRecursionSections;
      recursionParent.katas = visibleRecursionSections.flatMap((section) => section.katas);
    }

    const visibleDpSections = dpSections.filter((section) => section.katas.length > 0);
    const dpParent = sections.find((section) => section.id === "dynamic-programming");
    if (dpParent && visibleDpSections.length > 0) {
      dpParent.children = visibleDpSections;
      dpParent.katas = visibleDpSections.flatMap((section) => section.katas);
    }

    const visible = sections.filter((section) => section.katas.length > 0);
    const other = searchedKatas.filter((kata) => !assigned.has(kata.id));
    if (other.length) visible.push({ id: "other", label: "Other", categories: [], tags: [], katas: other });
    return visible;
  }, [modules, searchedKatas, neetcodeOnly, neetcode250Only]);

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
    const kata = katas.find((item) => item.id === id);
    const removing = dailyKataIds.includes(id);
    const next = dailyKataIds.includes(id)
      ? dailyKataIds.filter((x) => x !== id)
      : [...dailyKataIds, id];
    setSetting("dailyKataIds", next);
    toast.success(kata ? `${removing ? "Removed from" : "Added to"} daily: ${kata.name}` : removing ? "Removed from daily" : "Added to daily", 1800);
  };

  const toggleDaily = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteById(id);
  };

  const toggleDone = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const kata = katas.find((item) => item.id === id);
    const removing = doneKataIds.includes(id);
    const next = doneKataIds.includes(id)
      ? doneKataIds.filter((x) => x !== id)
      : [...doneKataIds, id];
    setSetting("doneKataIds", next);
    toast.success(kata ? `${removing ? "Marked not done" : "Marked done"}: ${kata.name}` : removing ? "Marked not done" : "Marked done", 1800);
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
      const message = await reseedKatas();
      await useKataStore.getState().loadKatas(language);
      toast.success(message || "Problem statements reloaded");
    } catch (error) {
      console.error("[library] Failed to reload problem statements:", error);
      toast.error("Could not reload problem statements");
    } finally {
      setReseeding(false);
    }
  };

  const handleDeleteCustomKata = async (kataId: number) => {
    const kata = katas.find((item) => item.id === kataId);
    const ok = await confirmAction({
      message: kata ? `Delete "${kata.name}"?` : "Delete this kata?",
      title: "Delete Kata",
      kind: "warning",
      okLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    await deleteKata(kataId);
  };

  const resetProgressForKata = async (kata: Kata) => {
    const ok = await confirmAction({
      message: `Reset progress for "${kata.name}"? This clears its best time and streak.`,
      title: "Reset Progress",
      kind: "warning",
      okLabel: "Reset",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    try {
      await resetKataProgress(kata.id);
      await useKataStore.getState().loadKatas(language);
      toast.success(`Reset progress: ${kata.name}`);
    } catch (error) {
      console.error("[library] Failed to reset kata progress:", error);
      toast.error("Could not reset progress");
    }
  };

  const copyKataName = async (kata: Kata) => {
    try {
      await writeText(kata.name);
      toast.success("Problem name copied", 1500);
    } catch (error) {
      console.error("[library] Failed to copy kata name:", error);
      toast.error("Could not copy problem name");
    }
  };

  useEffect(() => {
    return () => contextCommandCleanupRef.current?.();
  }, []);

  const handleKataContextMenu = (e: React.MouseEvent, kataId: number) => {
    e.preventDefault();
    const kata = katas.find((item) => item.id === kataId);
    if (!kata) return;
    const leetcodeUrl = leetcodeUrlFor(kata);

    contextCommandCleanupRef.current?.();
    const unregister = [
      registerCommand({
        id: "library:context:open",
        title: "Open Kata",
        hidden: true,
        run: () => navigate(`/editor/${kata.id}`),
      }),
      registerCommand({
        id: "library:context:favorite",
        title: dailyKataIds.includes(kata.id) ? "Remove from Daily" : "Add to Daily",
        hidden: true,
        run: () => toggleFavoriteById(kata.id),
      }),
      registerCommand({
        id: "library:context:reset-progress",
        title: "Reset Progress",
        hidden: true,
        run: () => { void resetProgressForKata(kata); },
      }),
      registerCommand({
        id: "library:context:copy-name",
        title: "Copy Kata Name",
        hidden: true,
        run: () => { void copyKataName(kata); },
      }),
    ];

    if (leetcodeUrl) {
      unregister.push(
        registerCommand({
          id: "library:context:open-leetcode",
          title: "Open on LeetCode",
          hidden: true,
          run: () => { void open(leetcodeUrl); },
        }),
      );
    }

    if (kata.isCustom) {
      unregister.push(
        registerCommand({
          id: "library:context:edit",
          title: "Edit Kata",
          hidden: true,
          run: () => navigate(`/kata/${kata.id}/edit`),
        }),
        registerCommand({
          id: "library:context:delete",
          title: "Delete Kata",
          hidden: true,
          run: () => { void handleDeleteCustomKata(kata.id); },
        }),
      );
    }

    contextCommandCleanupRef.current = () => {
      unregister.forEach((fn) => fn());
      contextCommandCleanupRef.current = null;
    };

    void invoke("show_kata_context_menu", {
      kataId,
      isFavorite: dailyKataIds.includes(kataId),
      isCustom: kata.isCustom,
      hasLeetcode: Boolean(leetcodeUrl),
    });
  };

  const listRef = useRef<HTMLDivElement>(null);
  const restoredScroll = useRef(false);
  useEffect(() => {
    if (!restoredScroll.current && listRef.current && renderedKatas.length > 0) {
      listRef.current.scrollTop = savedScrollTopByPage[pageKey];
      restoredScroll.current = true;
    }
  }, [pageKey, renderedKatas.length]);

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
    const leetcodeUrl = leetcodeUrlFor(kata);
    const implementationComplexity = implementationComplexityFor(kata);
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
              <span className="text-base-content/40 tabular-nums">
                {kata.leetcodeNumber}.
              </span>
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
        <td className="w-10 text-center">
          {leetcodeUrl ? (
            <a
              href={leetcodeUrl}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void open(leetcodeUrl);
              }}
              className="btn btn-ghost btn-xs btn-square opacity-80 hover:opacity-100"
              title="Open on LeetCode"
              aria-label={`Open ${displayName} on LeetCode`}
            >
              <img
                src="/leetcode-dark.png"
                alt=""
                className="h-4 w-4 shrink-0 object-contain"
              />
            </a>
          ) : (
            <span className="text-base-content/15 text-xs">-</span>
          )}
        </td>
        {!modules && (
          <td>
            {CATEGORY_LEVEL[kata.category] !== undefined ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-base-300/60 text-base-content/50 tabular-nums">
                Lv.{CATEGORY_LEVEL[kata.category]}
              </span>
            ) : (
              <span className="text-base-content/20 text-xs">—</span>
            )}
          </td>
        )}
        {!modules && <td className="text-base-content/45 text-sm">{categoryLabel}</td>}
        <td>
          <span className={`badge badge-sm ${diffColor(kata.difficulty)}`}>
            {kata.difficulty ?? "-"}
          </span>
        </td>
        <td>
          <span
            className={`badge badge-sm ${implementationComplexity.badgeClass} font-mono`}
            title={implementationComplexity.title}
          >
            {implementationComplexity.label}
          </span>
        </td>
        {!modules && (
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
        )}
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
                onClick={(e) => { e.stopPropagation(); void handleDeleteCustomKata(kata.id); }}
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

  const moduleProgress = (section: ModuleSection) => {
    const sectionKatas = section.katas;
    const completed = sectionKatas.filter((kata) => doneKataIds.includes(kata.id)).length;
    const total = roadmapModuleTargetCount(section.id, roadmapListMode) ?? sectionKatas.length;
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
          <th className="w-10 text-center">
            <img src="/leetcode-dark.png" alt="LeetCode" className="mx-auto h-4 w-4 object-contain opacity-60" />
          </th>
          <th
            className="cursor-pointer select-none hover:text-base-content"
            onClick={() => setDiffSort(diffSort === null ? "asc" : diffSort === "asc" ? "desc" : null)}
          >
            Difficulty {diffSort === "asc" ? "▲" : diffSort === "desc" ? "▼" : ""}
          </th>
          <th title="Implementation size from executable reference-solution LOC">Complexity</th>
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
    const progress = moduleProgress(section);
    return (
      <details
        key={section.id}
        name={nested ? "dp-submodules-accordion" : "modules-accordion"}
        open={expanded}
        onToggle={(e) => {
          setModuleExpanded(section.id, e.currentTarget.open);
        }}
        data-testid={`family-section-${section.id}`}
        className={moduleDetailsClass(nested)}
      >
        <summary className={moduleHeaderClass(nested)}>
          <h2 className={moduleTitleClass(nested)}>{section.label}</h2>
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
          <option value="implementation-complexity">Sort: Complexity</option>
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
            title="Show only NeetCode 150 katas"
            aria-pressed={neetcodeOnly}
            className={`btn btn-sm ${neetcodeOnly ? "btn-primary" : "btn-ghost btn-outline"}`}
          >
            NeetCode 150
          </button>
          <button
            onClick={() => setLibraryUI({ libraryNeetcode250Only: !neetcode250Only })}
            title="Show only NeetCode 250 katas available in this app"
            aria-pressed={neetcode250Only}
            className={`btn btn-sm ${neetcode250Only ? "btn-primary" : "btn-ghost btn-outline"}`}
          >
            NeetCode 250
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-base-content/45">Complexity</span>
        {IMPLEMENTATION_SIZES.map((size) => {
          const active = implementationSizeFilters.includes(size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => toggleImplementationSizeFilter(size)}
              aria-pressed={active}
              className={`btn btn-xs ${active ? "btn-primary" : "btn-ghost btn-outline text-base-content/55"}`}
            >
              {size}
            </button>
          );
        })}
        {implementationSizeFilters.length > 0 && (
          <button
            type="button"
            onClick={() => setLibraryUI({ libraryImplementationSizeFilters: [] })}
            className="btn btn-ghost btn-xs text-base-content/40 hover:text-base-content/70"
          >
            Clear
          </button>
        )}
      </div>

      {/* Kata table / modules */}
      <div
        ref={listRef}
        onScroll={(e) => { savedScrollTopByPage[pageKey] = e.currentTarget.scrollTop; }}
        className={`flex-1 min-h-0 overflow-y-auto scrollbar-hidden ${
          modules ? "mx-auto w-full max-w-5xl space-y-1.5 pr-1" : "bg-base-100 rounded-2xl border border-base-300 shadow-md shadow-base-300/20"
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
                <th className="w-10 text-center">
                  <img src="/leetcode-dark.png" alt="LeetCode" className="mx-auto h-4 w-4 object-contain opacity-60" />
                </th>
                <th className="font-semibold">Level</th>
                <th className="font-semibold">Category</th>
                <th
                  className="font-semibold cursor-pointer select-none hover:text-base-content/60 transition-colors"
                  onClick={() => setDiffSort(diffSort === null ? "asc" : diffSort === "asc" ? "desc" : null)}
                >
                  Difficulty {diffSort === "asc" ? "▲" : diffSort === "desc" ? "▼" : ""}
                </th>
                <th className="font-semibold" title="Implementation size from executable reference-solution LOC">
                  Complexity
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
                  <td colSpan={11} className="py-12 text-center text-sm">
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
