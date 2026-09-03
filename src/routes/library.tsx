import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { invoke } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { open } from "@tauri-apps/plugin-shell";
import { Check, Info, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { useKataStore } from "../stores/kata-store";
import type { LibraryDifficultyFilter, LibrarySortMode } from "../stores/kata-store";
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

const LIBRARY_DIFFICULTIES: LibraryDifficultyFilter[] = ["easy", "medium", "hard"];

function isLibraryKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return true;
  if (target.isContentEditable) return false;
  return !target.closest("button, input, select, textarea, a, [role='button'], [role='menuitem']");
}

function filterPillClass(active: boolean) {
  return [
    "btn btn-sm rounded-md border px-4 font-semibold",
    active
      ? "kata-btn-selected"
      : "kata-btn-secondary",
  ].join(" ");
}

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
        className="pointer-events-none invisible absolute left-0 top-full z-50 mt-2 w-72 rounded-md border border-base-300 bg-base-100 px-3 py-2 text-left text-xs normal-case leading-5 tracking-normal text-base-content/75 opacity-0 shadow-xl shadow-black/20 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

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

type ModuleProgress = {
  completed: number;
  total: number;
  percent: number;
  nextKata: Kata | null;
  unstarted: number;
  needsReview: number;
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const contextCommandCleanupRef = useRef<(() => void) | null>(null);
  const TAG_PREVIEW_COUNT = 3;

  const librarySearch = useKataStore((s) => s.librarySearch);
  const libraryDiffSort = useKataStore((s) => s.libraryDiffSort);
  const librarySortMode = useKataStore((s) => s.librarySortMode);
  const leetcodeOnly = useKataStore((s) => s.libraryLeetcodeOnly);
  const blind75Only = useKataStore((s) => s.libraryBlind75Only);
  const neetcodeOnly = useKataStore((s) => s.libraryNeetcodeOnly);
  const neetcode250Only = useKataStore((s) => s.libraryNeetcode250Only);
  const difficultyFilters = useKataStore((s) => s.libraryDifficultyFilters);
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
  const hasActiveCollectionFilters =
    leetcodeOnly ||
    blind75Only ||
    neetcodeOnly ||
    neetcode250Only;
  const hasActiveLibraryFilters =
    search.trim().length > 0 ||
    hasActiveCollectionFilters ||
    difficultyFilters.length > 0 ||
    implementationSizeFilters.length > 0;
  const activeFilterCount =
    Number(leetcodeOnly) +
    Number(blind75Only) +
    Number(neetcodeOnly) +
    Number(neetcode250Only) +
    difficultyFilters.length +
    implementationSizeFilters.length;

  const clearLibraryFilters = () => {
    setLibraryUI({
      librarySearch: "",
      libraryLeetcodeOnly: false,
      libraryBlind75Only: false,
      libraryNeetcodeOnly: false,
      libraryNeetcode250Only: false,
      libraryDifficultyFilters: [],
      libraryImplementationSizeFilters: [],
    });
  };

  const clearCollectionFilters = () => {
    setLibraryUI({
      libraryLeetcodeOnly: false,
      libraryBlind75Only: false,
      libraryNeetcodeOnly: false,
      libraryNeetcode250Only: false,
    });
  };

  const toggleDifficultyFilter = (difficulty: LibraryDifficultyFilter) => {
    setLibraryUI({
      libraryDifficultyFilters: difficultyFilters.includes(difficulty)
        ? difficultyFilters.filter((item) => item !== difficulty)
        : [...difficultyFilters, difficulty],
    });
  };

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
      if (
        difficultyFilters.length > 0 &&
        (!k.difficulty || !difficultyFilters.includes(k.difficulty as LibraryDifficultyFilter))
      ) return false;
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
  }, [katas, search, diffSort, sortMode, leetcodeOnly, blind75Only, neetcodeOnly, neetcode250Only, difficultyFilters, implementationSizeFilters, dailyKataIds, bestTimes, streaks]);

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
  const visibleDoneCount = renderedKatas.filter((kata) => doneKataIds.includes(kata.id)).length;
  const visibleDailyCount = renderedKatas.filter((kata) => dailyKataIds.includes(kata.id)).length;
  const visibleMissingFromDaily = renderedKatas.filter((kata) => !dailyKataIds.includes(kata.id));
  const nextVisibleKata = renderedKatas.find((kata) => !doneKataIds.includes(kata.id)) ?? renderedKatas[0] ?? null;
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

  const addVisibleToDaily = () => {
    if (visibleMissingFromDaily.length === 0) return;
    const next = [...dailyKataIds, ...visibleMissingFromDaily.map((kata) => kata.id)];
    setSetting("dailyKataIds", next);
    toast.success(`Added ${visibleMissingFromDaily.length} visible problem${visibleMissingFromDaily.length === 1 ? "" : "s"} to daily`, 1800);
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

  const renderEmptyContent = () => (
    <div className="flex flex-col items-center gap-3">
      <p className="text-base-content/25">
        {hasActiveLibraryFilters ? "No matching problems" : "No katas found"}
      </p>
      <div className="flex items-center justify-center gap-2">
        {hasActiveLibraryFilters && (
          <button
            onClick={clearLibraryFilters}
            className="btn btn-sm btn-primary"
          >
            Clear filters
          </button>
        )}
        <button
          onClick={handleReseed}
          disabled={reseeding}
          className="btn btn-sm btn-ghost text-base-content/40 hover:text-base-content/70"
        >
          {reseeding ? "Reseeding…" : "Reload problem statements"}
        </button>
      </div>
    </div>
  );

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
        title: "Select Kata",
        hidden: true,
        run: () => setSelectedIndex(indexById.get(kata.id) ?? 0),
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

  const openKata = (kata: Kata) => {
    navigate(`/editor/${kata.id}`);
  };

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (filtersOpen) return;
      if (e.defaultPrevented || !isLibraryKeyboardTarget(e.target)) return;
      if (renderedKatas.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, renderedKatas.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const kata = renderedKatas[selectedIndex];
        if (kata) openKata(kata);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtersOpen, renderedKatas, selectedIndex, navigate]);

  useEffect(() => {
    if (!filtersOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setFiltersOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtersOpen]);

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
        onClick={() => openKata(kata)}
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
            aria-label={dailyKataIds.includes(kata.id) ? `Remove ${displayName} from daily` : `Add ${displayName} to daily`}
          >
            <Star className="h-4 w-4" fill={dailyKataIds.includes(kata.id) ? "currentColor" : "none"} />
          </button>
        </td>
        <td className="w-8">
          <button
            onClick={(e) => toggleDone(kata.id, e)}
            className={`btn btn-ghost btn-xs btn-square ${
              doneKataIds.includes(kata.id)
                ? "text-success"
                : "text-base-content/20 hover:text-base-content/40"
            }`}
            title={doneKataIds.includes(kata.id) ? "Mark as not done" : "Mark as done"}
            aria-label={doneKataIds.includes(kata.id) ? `Mark ${displayName} as not done` : `Mark ${displayName} as done`}
          >
            <Check className="h-4 w-4" />
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
          ) : null}
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
                  className="badge badge-xs cursor-pointer border-base-300/50 bg-base-300/30 text-base-content/45 transition-colors hover:bg-primary/15 hover:text-primary"
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

  const moduleProgress = (section: ModuleSection): ModuleProgress => {
    const sectionKatas = section.katas;
    const completed = sectionKatas.filter((kata) => doneKataIds.includes(kata.id)).length;
    const total = roadmapModuleTargetCount(section.id, roadmapListMode) ?? sectionKatas.length;
    const nextKata = sectionKatas.find((kata) => !doneKataIds.includes(kata.id)) ?? sectionKatas[0] ?? null;
    const unstarted = sectionKatas.filter((kata) => bestTimes[kata.id] == null).length;
    const needsReview = sectionKatas.filter((kata) => bestTimes[kata.id] != null && !doneKataIds.includes(kata.id) && (streaks[kata.id] ?? 0) < 2).length;
    return {
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      nextKata,
      unstarted,
      needsReview,
    };
  };

  const renderModuleTable = (section: ModuleSection) => (
    <table className="table table-sm">
      <thead>
        <tr className="border-base-300 bg-base-300/70 text-base-content/70">
          <th className="w-8"></th>
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
    const nextKata = progress.nextKata;
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
          <div className="min-w-0">
            <h2 className={moduleTitleClass(nested)}>{section.label}</h2>
            {nextKata && (
              <p className="mt-1 truncate text-xs text-base-content/45">
                Next: {dpDisplayNameFor(nextKata)}
              </p>
            )}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-3 text-xs text-base-content/50">
                <span className="tabular-nums">
                  {progress.completed}/{progress.total} complete
                </span>
                <span className="hidden truncate text-right sm:block">
                  {progress.unstarted > 0
                    ? `${progress.unstarted} unstarted`
                    : progress.needsReview > 0
                      ? `${progress.needsReview} to repeat`
                      : "ready to reinforce"}
                </span>
              </div>
              <progress className="progress progress-success h-2 w-full bg-base-content/20" value={progress.percent} max="100" />
            </div>
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
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold shrink-0">{modules ? "Modules" : "Problems"}</h1>
          <div className="relative min-w-64 flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/35" />
            <input
              type="text"
              placeholder="Search problems, tags, level, or #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered input-sm h-10 w-full rounded-md bg-base-100 pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="btn btn-ghost btn-xs btn-square absolute right-1.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/80"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
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
            className="select select-bordered select-sm ml-auto h-10 w-52 shrink-0 rounded-md bg-base-100 text-xs"
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
        </div>

        <div className="scrollbar-hidden flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={clearLibraryFilters}
            aria-pressed={!hasActiveLibraryFilters}
            className={filterPillClass(!hasActiveLibraryFilters)}
          >
            All
          </button>
          <button
            onClick={() => setLibraryUI({ libraryLeetcodeOnly: !leetcodeOnly })}
            title="Show only katas that map to a LeetCode problem"
            aria-pressed={leetcodeOnly}
            className={filterPillClass(leetcodeOnly)}
          >
            LeetCode
          </button>
          <button
            onClick={() => setLibraryUI({ libraryBlind75Only: !blind75Only })}
            title="Show only Blind 75 katas"
            aria-pressed={blind75Only}
            className={filterPillClass(blind75Only)}
          >
            Blind 75
          </button>
          <button
            onClick={() => setLibraryUI({ libraryNeetcodeOnly: !neetcodeOnly })}
            title="Show only NeetCode 150 katas"
            aria-pressed={neetcodeOnly}
            className={filterPillClass(neetcodeOnly)}
          >
            NeetCode 150
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={[
              "btn btn-sm rounded-md border px-4 font-semibold",
              activeFilterCount > 0
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
                : "border-base-300 bg-base-100 text-base-content/75 hover:border-base-content/25 hover:bg-base-100",
            ].join(" ")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="badge badge-primary badge-xs ml-1 h-5 min-w-5 rounded-md px-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/40 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={() => setFiltersOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-filters-title"
            className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="grid h-16 grid-cols-[3rem_1fr_3rem] items-center border-b border-base-300/70 px-4">
              <span />
              <h2 id="library-filters-title" className="text-center text-lg font-bold">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="btn btn-ghost btn-sm btn-square justify-self-end"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <section className="border-b border-base-300/70 pb-6">
                <h3 className="mb-4 text-base font-bold">Collections</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={clearCollectionFilters}
                    aria-pressed={!hasActiveCollectionFilters}
                    className={filterPillClass(!hasActiveCollectionFilters)}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setLibraryUI({ libraryLeetcodeOnly: !leetcodeOnly })}
                    aria-pressed={leetcodeOnly}
                    className={filterPillClass(leetcodeOnly)}
                  >
                    LeetCode
                  </button>
                  <button
                    type="button"
                    onClick={() => setLibraryUI({ libraryBlind75Only: !blind75Only })}
                    aria-pressed={blind75Only}
                    className={filterPillClass(blind75Only)}
                  >
                    Blind 75
                  </button>
                  <button
                    type="button"
                    onClick={() => setLibraryUI({ libraryNeetcodeOnly: !neetcodeOnly })}
                    aria-pressed={neetcodeOnly}
                    className={filterPillClass(neetcodeOnly)}
                  >
                    NeetCode 150
                  </button>
                  <button
                    type="button"
                    onClick={() => setLibraryUI({ libraryNeetcode250Only: !neetcode250Only })}
                    aria-pressed={neetcode250Only}
                    className={filterPillClass(neetcode250Only)}
                  >
                    NeetCode 250
                  </button>
                </div>
              </section>

              <section className="border-b border-base-300/70 py-6">
                <h3 className="mb-4 text-base font-bold">Difficulty</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => setLibraryUI({ libraryDifficultyFilters: [] })}
                    aria-pressed={difficultyFilters.length === 0}
                    className={filterPillClass(difficultyFilters.length === 0)}
                  >
                    Any
                  </button>
                  {LIBRARY_DIFFICULTIES.map((difficulty) => {
                    const active = difficultyFilters.includes(difficulty);
                    return (
                      <button
                        key={difficulty}
                        type="button"
                        onClick={() => toggleDifficultyFilter(difficulty)}
                        aria-pressed={active}
                        className={filterPillClass(active)}
                      >
                        {difficulty[0].toUpperCase() + difficulty.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="pt-6">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-base font-bold">Problem size</h3>
                  <TooltipHint
                    label="Problem size"
                    text="Estimated from executable lines in the reference solution. It describes how much code the solution usually takes, not the input size or Big-O complexity."
                  >
                    <Info className="h-3.5 w-3.5 text-base-content/35" aria-hidden="true" />
                  </TooltipHint>
                </div>
                <p className="mb-4 text-sm text-base-content/50">
                  Filter by how compact or involved the reference implementation is.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {IMPLEMENTATION_SIZES.map((size) => {
                    const active = implementationSizeFilters.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleImplementationSizeFilter(size)}
                        aria-pressed={active}
                        title={`Show ${size.toLowerCase()} problems by reference-solution code size`}
                        className={filterPillClass(active)}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-base-300/70 px-6 py-4">
              <button
                type="button"
                onClick={clearLibraryFilters}
                disabled={!hasActiveLibraryFilters}
                className="btn btn-ghost btn-sm"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="btn btn-primary btn-sm rounded-md px-6"
              >
                Show {renderedKatas.length} {renderedKatas.length === 1 ? "problem" : "problems"}
              </button>
            </footer>
          </section>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-base-300/70 bg-base-100/60 px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base-content/70">
          <span className="font-semibold text-base-content/75">
            {renderedKatas.length} {renderedKatas.length === 1 ? "problem" : "problems"}
          </span>
          {modules && familySections && (
            <span>
              {familySections.length} {familySections.length === 1 ? "module" : "modules"}
            </span>
          )}
          <span>
            {visibleDoneCount} done
          </span>
          <span>
            {visibleDailyCount} daily
          </span>
          {modules && nextVisibleKata && (
            <span className="min-w-0 max-w-full truncate text-base-content/70">
              Next: {dpDisplayNameFor(nextVisibleKata)}
            </span>
          )}
          {hasActiveLibraryFilters && (
            <span className="text-primary/80">
              filtered
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!modules && (
            <button
              type="button"
              onClick={addVisibleToDaily}
              disabled={visibleMissingFromDaily.length === 0}
              className="btn btn-primary btn-xs rounded-md px-3"
            >
              {visibleMissingFromDaily.length === 0 ? "Visible in daily" : "Add visible to daily"}
            </button>
          )}
          {hasActiveLibraryFilters && (
            <button
              type="button"
              onClick={clearLibraryFilters}
              className="btn btn-xs kata-btn-secondary"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Kata table / modules */}
      <div
        ref={listRef}
        onScroll={(e) => { savedScrollTopByPage[pageKey] = e.currentTarget.scrollTop; }}
        className={`flex-1 min-h-0 overflow-y-auto scrollbar-hidden ${
          modules ? "mx-auto w-full max-w-5xl space-y-1.5 pr-1" : "bg-base-100 rounded-lg border border-base-300 shadow-sm shadow-base-300/20"
        }`}
      >
        {modules ? (
          <>
            {familySections?.map((section) => renderModuleSection(section))}
            {searchedKatas.length === 0 && (
              <div className="rounded-2xl border border-base-300/50 bg-base-100 py-12 text-center text-sm">
                {renderEmptyContent()}
              </div>
            )}
          </>
        ) : (
          <table className="table table-sm">
            <thead>
              <tr className="border-base-300 bg-base-300/70 text-base-content/70">
                <th className="w-8"></th>
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
                  <td colSpan={12} className="py-12 text-center text-sm">
                    {renderEmptyContent()}
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
