export const LEVELS = [
  {
    level: 1,
    label: "Arrays & Hashing",
    categories: ["arrays-and-hashing", "arrays", "string"],
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
    label: "Trees",
    categories: ["trees"],
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
