export interface RoadmapModuleDef {
  id: string;
  label: string;
  categories: readonly string[];
  tags: readonly string[];
}

export interface RoadmapKataLike {
  name: string;
  category: string;
  tags: readonly string[];
  leetcodeNumber?: number | null;
}

export type RoadmapListMode = "all" | "neetcode150" | "neetcode250";

export const NEETCODE_150_MODULE_NUMBERS = {
  "arrays-hashing": [217, 242, 1, 49, 347, 271, 238, 36, 128],
  "two-pointers": [125, 167, 15, 11, 42],
  "sliding-window": [121, 3, 424, 567, 76, 239],
  stack: [20, 155, 150, 739, 853, 84],
  "binary-search": [704, 74, 875, 153, 33, 981, 4],
  "linked-list": [206, 21, 141, 143, 19, 138, 2, 287, 146, 23, 25],
  trees: [226, 104, 543, 110, 100, 572, 235, 102, 199, 1448, 98, 230, 105, 124, 297],
  heap: [703, 1046, 973, 215, 621, 355, 295],
  backtracking: [78, 39, 40, 46, 90, 22, 79, 131, 17, 51],
  tries: [208, 211, 212],
  graphs: [200, 695, 133, 286, 994, 417, 130, 207, 210, 261, 323, 684, 127],
  "advanced-graphs": [743, 332, 1584, 778, 269, 787],
  "1-d-dp": [70, 746, 198, 213, 5, 647, 91, 322, 152, 139, 300, 416],
  "2-d-dp": [62, 1143, 309, 518, 494, 97, 329, 115, 72, 312, 10],
  greedy: [53, 55, 45, 134, 846, 1899, 763, 678],
  intervals: [57, 56, 435, 252, 253, 1851],
  "math-geometry": [48, 54, 73, 202, 66, 50, 43, 2013],
  "bit-manipulation": [136, 191, 338, 190, 268, 371, 7],
} as const;

export const NEETCODE_250_MODULE_NUMBERS = {
  "arrays-hashing": [1929, 217, 242, 1, 14, 49, 27, 169, 705, 706, 912, 75, 347, 271, 304, 238, 36, 128, 122, 229, 560, 41],
  "two-pointers": [344, 125, 680, 1768, 88, 26, 167, 15, 18, 189, 11, 881, 42],
  "sliding-window": [219, 121, 3, 424, 567, 209, 658, 76, 239],
  stack: [682, 20, 225, 232, 155, 150, 735, 739, 901, 853, 71, 394, 895, 84],
  "binary-search": [704, 35, 374, 69, 74, 875, 1011, 153, 33, 81, 981, 410, 4, 1095],
  "linked-list": [206, 21, 141, 143, 19, 138, 2, 287, 92, 622, 146, 460, 23, 25],
  trees: [94, 144, 145, 226, 104, 543, 110, 100, 572, 235, 701, 450, 102, 199, 427, 1448, 98, 230, 105, 337, 1325, 124, 297],
  heap: [703, 1046, 973, 215, 621, 355, 1834, 767, 1405, 1094, 295, 502],
  backtracking: [1863, 78, 39, 40, 77, 46, 90, 47, 22, 79, 131, 17, 473, 698, 51, 52, 140],
  tries: [208, 211, 2707, 212],
  graphs: [463, 953, 997, 200, 695, 133, 286, 994, 417, 130, 752, 207, 210, 261, 1462, 323, 684, 721, 399, 310, 127],
  "advanced-graphs": [1631, 743, 332, 1584, 778, 269, 787, 1489, 2392, 2709],
  "1-d-dp": [70, 746, 1137, 198, 213, 5, 647, 91, 322, 152, 139, 300, 416, 377, 279, 343, 1406],
  "2-d-dp": [62, 63, 64, 1143, 1049, 309, 518, 494, 97, 877, 1140, 329, 115, 72, 312, 10],
  greedy: [860, 53, 918, 978, 55, 45, 1871, 134, 846, 649, 1899, 763, 678, 135],
  intervals: [57, 56, 435, 252, 253, 2402, 1851],
  "math-geometry": [168, 1071, 2807, 867, 48, 54, 73, 202, 66, 13, 50, 43, 2013],
  "bit-manipulation": [136, 191, 338, 67, 190, 268, 371, 7, 201, 3133],
} as const;

const NEETCODE_150_NUMBERS = new Set<number>(Object.values(NEETCODE_150_MODULE_NUMBERS).flat());
const NEETCODE_250_NUMBERS = new Set<number>(Object.values(NEETCODE_250_MODULE_NUMBERS).flat());

export const ROADMAP_MODULES: readonly RoadmapModuleDef[] = [
  { id: "arrays-hashing", label: "Arrays & Hashing", categories: ["arrays", "hashing", "string", "strings"], tags: ["arrays-hashing"] },
  { id: "two-pointers", label: "Two Pointers", categories: ["two-pointers"], tags: ["two-pointers"] },
  { id: "sliding-window", label: "Sliding Window", categories: ["sliding-window"], tags: ["sliding-window"] },
  { id: "stack", label: "Stack", categories: ["stack"], tags: ["stack"] },
  { id: "binary-search", label: "Binary Search", categories: ["binary-search"], tags: ["binary-search"] },
  { id: "linked-list", label: "Linked List", categories: ["linked-list"], tags: ["linked-list"] },
  { id: "recursion", label: "Recursion", categories: ["recursion"], tags: ["recursion-call-flow"] },
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
] as const;

function neetcodeModuleNumbers(moduleId: string, listMode: RoadmapListMode): readonly number[] | null {
  const modules = listMode === "neetcode150" ? NEETCODE_150_MODULE_NUMBERS : NEETCODE_250_MODULE_NUMBERS;
  if (moduleId === "dynamic-programming") {
    return [...modules["1-d-dp"], ...modules["2-d-dp"]];
  }
  return modules[moduleId as keyof typeof modules] ?? null;
}

export function roadmapModuleTargetCount(moduleId: string, listMode: RoadmapListMode): number | null {
  if (listMode === "all") return null;
  return neetcodeModuleNumbers(moduleId, listMode)?.length ?? null;
}

export function isNeetcode150Kata(kata: RoadmapKataLike): boolean {
  return kata.leetcodeNumber != null && NEETCODE_150_NUMBERS.has(kata.leetcodeNumber);
}

export function isNeetcode250Kata(kata: RoadmapKataLike): boolean {
  return kata.leetcodeNumber != null && NEETCODE_250_NUMBERS.has(kata.leetcodeNumber);
}

export function matchesRoadmapModule(
  kata: RoadmapKataLike,
  module: RoadmapModuleDef,
  listMode: RoadmapListMode = "all",
): boolean {
  const officialNumbers = neetcodeModuleNumbers(module.id, listMode === "neetcode150" ? "neetcode150" : "neetcode250");
  if (officialNumbers) return kata.leetcodeNumber != null && officialNumbers.includes(kata.leetcodeNumber);

  const tags = new Set(kata.tags);
  return module.categories.includes(kata.category) || module.tags.some((tag) => tags.has(tag));
}

export function compareRoadmapModuleOrder(
  moduleId: string,
  a: RoadmapKataLike,
  b: RoadmapKataLike,
  listMode: RoadmapListMode = "all",
): number {
  const order = neetcodeModuleNumbers(moduleId, listMode === "neetcode150" ? "neetcode150" : "neetcode250");

  if (!order) return 0;

  const aIndex = a.leetcodeNumber == null ? -1 : order.indexOf(a.leetcodeNumber);
  const bIndex = b.leetcodeNumber == null ? -1 : order.indexOf(b.leetcodeNumber);

  if (aIndex === -1 && bIndex === -1) return 0;
  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;
  return aIndex - bIndex;
}
