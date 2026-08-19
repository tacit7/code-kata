export const LEVELS = [
  {
    level: 1,
    label: "Arrays & Hashing",
    categories: ["arrays", "hashing", "string"],
  },
  {
    level: 2,
    label: "Two Pointers · Stack",
    categories: ["two-pointers", "stack"],
  },
  {
    level: 3,
    label: "Binary Search · Sliding Window · Linked List",
    categories: ["binary-search", "sliding-window", "linked-list"],
  },
  {
    level: 4,
    label: "Recursion · Trees",
    categories: ["recursion", "trees"],
  },
  {
    level: 5,
    label: "Tries · Heap · Backtracking",
    categories: ["tries", "heap", "backtracking"],
  },
  {
    level: 6,
    label: "Intervals · Greedy · Graphs · 1-D DP",
    categories: ["intervals", "greedy", "graphs", "graph", "1-d-dp"],
  },
  {
    level: 7,
    label: "Advanced Graphs · 2-D DP · Bit Manipulation",
    categories: ["advanced-graphs", "2-d-dp", "binary", "bit-manipulation"],
  },
  {
    level: 8,
    label: "Math & Geometry",
    categories: ["math-and-geometry", "math", "matrix"],
  },
] as const;

export const CATEGORY_LEVEL: Record<string, number> = Object.fromEntries(
  LEVELS.flatMap(({ level, categories }) => categories.map((c) => [c, level])),
);

/**
 * The levels worth showing for a pool of katas: those that actually contain one.
 *
 * The kata pool is loaded per language, so a level whose katas exist in only one
 * language disappears under the others. Level 0 (Ruby Prelude) is the case this
 * was written for — it has no JavaScript katas, and an always-empty filter row
 * reads as a broken filter.
 */
export function levelsForKatas(katas: readonly { category: string }[]) {
  const present = new Set(katas.map((k) => CATEGORY_LEVEL[k.category]));
  return LEVELS.filter(({ level }) => present.has(level));
}

/**
 * The persisted selection, narrowed to what the current language can show. A
 * level selected under another language is inert here, never a filter that
 * silently empties the queue.
 */
export function visibleSelection(
  stored: readonly number[],
  visible: ReadonlySet<number>,
): Set<number> {
  return new Set(stored.filter((level) => visible.has(level)));
}

/**
 * The selection to persist after the user toggles a level. `next` holds only
 * visible levels, so selections made under another language must be carried
 * through explicitly — otherwise the first toggle here erases them.
 */
export function mergeSelection(
  stored: readonly number[],
  visible: ReadonlySet<number>,
  next: ReadonlySet<number>,
): number[] {
  const hidden = stored.filter((level) => !visible.has(level));
  return [...hidden, ...next].sort((a, b) => a - b);
}
