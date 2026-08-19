import type { Kata, SeedKata } from "../types/editor";

export type RecursionModule =
  | "recursion-call-flow"
  | "recursion-numeric"
  | "recursion-array"
  | "recursion-string"
  | "recursion-branching"
  | "recursion-binary-tree"
  | "recursion-backtracking";

export const RECURSION_MODULES: { id: RecursionModule; label: string }[] = [
  { id: "recursion-call-flow", label: "1. Call Flow" },
  { id: "recursion-numeric", label: "2. Numeric Recursion" },
  { id: "recursion-array", label: "3. Array Recursion" },
  { id: "recursion-string", label: "4. String Recursion" },
  { id: "recursion-branching", label: "5. Branching Recursion" },
  { id: "recursion-binary-tree", label: "6. Binary Tree Recursion" },
  { id: "recursion-backtracking", label: "7. Recursive Backtracking" },
];

const RECURSION_MODULE_IDS = new Set<string>(RECURSION_MODULES.map((module) => module.id));
const RECURSION_MODULE_ORDER = new Map<RecursionModule, number>(
  RECURSION_MODULES.map((module, index) => [module.id, index]),
);

export const RECURSION_CURRICULUM_ORDER: Record<RecursionModule, readonly string[]> = {
  "recursion-call-flow": [
    "Countdown",
    "Print Evens Down",
    "Print Stars Shrinking",
    "Print Array Forward Recursively",
    "Count Up",
    "Sum From 1 to N",
    "Factorial",
    "Power of Number",
  ],
  "recursion-numeric": [
    "Count Digits",
    "Sum Digits",
    "Product of Digits",
    "Reverse Number",
    "Multiply Using Addition",
    "Count Halvings to One",
    "Is Power of Two",
    "Steps to Reduce to Zero",
    "Greatest Common Divisor",
  ],
  "recursion-array": [
    "Count Items",
    "Sum Array",
    "Contains Target",
    "Count Target Occurrences",
    "Find Maximum",
    "Check If Sorted",
    "First Index of Target",
    "Last Index of Target",
    "All Indices of Target",
    "Reverse Array Recursively",
  ],
  "recursion-string": [
    "Count Characters",
    "Count Vowels",
    "Count Character Occurrences",
    "Reverse String",
    "Palindrome Check",
    "Remove Character",
    "Replace Character",
  ],
  "recursion-branching": [
    "Fibonacci Number (Recursive)",
    "Climbing Stairs (Recursive Choices)",
    "Count Ways to Reach N",
    "Generate Binary Strings (Recursive Choices)",
    "Generate Coin Flip Outcomes",
  ],
  "recursion-binary-tree": [
    "Count Nodes (Recursive)",
    "Sum Tree Values",
    "Find Max in Tree",
    "Count Leaves (Recursive)",
    "Tree Height",
    "Contains Value in Tree",
    "Invert Binary Tree (Recursive)",
    "Same Tree (Recursive)",
  ],
  "recursion-backtracking": [
    "Generate Subsets",
    "Generate Binary Strings of Length N",
    "Generate Permutations",
    "Letter Case Permutation",
    "Simple Maze Paths",
  ],
};

export function recursionFamilyFor(kata: Pick<Kata | SeedKata, "tags">): RecursionModule | null {
  const tag = kata.tags.find((candidate) => RECURSION_MODULE_IDS.has(candidate));
  return tag ? (tag as RecursionModule) : null;
}

export function recursionCurriculumOrderFor(kata: Pick<Kata | SeedKata, "name" | "tags">): number {
  const module = recursionFamilyFor(kata);
  if (!module) return Number.POSITIVE_INFINITY;
  const index = RECURSION_CURRICULUM_ORDER[module].indexOf(kata.name);
  if (index === -1) return Number.POSITIVE_INFINITY;
  return (RECURSION_MODULE_ORDER.get(module) ?? 99) * 1000 + index;
}

export function compareRecursionCurriculumOrder(
  a: Pick<Kata | SeedKata, "name" | "tags">,
  b: Pick<Kata | SeedKata, "name" | "tags">,
): number {
  const aOrder = recursionCurriculumOrderFor(a);
  const bOrder = recursionCurriculumOrderFor(b);
  if (!Number.isFinite(aOrder) && !Number.isFinite(bOrder)) return 0;
  return aOrder - bOrder;
}
