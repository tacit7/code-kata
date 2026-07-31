import { describe, it, expect } from "vitest";
import type { SeedKata } from "../types/editor";
import {
  DP_MODULES,
  DP_PATTERNS,
  dpFamilyFor,
  dpPatternFor,
  type EvaluationOrder,
} from "./dp-patterns";
import { sampleKatas } from "./sample-katas";
import { sampleKatasPython } from "./sample-katas-python";
import { treeFundamentals } from "./tree-fundamentals";
import { dpFoundations } from "./dp-foundations";
import { blind75Part1 } from "./blind75-additions-part1";
import { blind75Part2 } from "./blind75-additions-part2";
import { blind75Part3 } from "./blind75-additions-part3";
import { blind75Part4 } from "./blind75-additions-part4";
import { blind75Part5 } from "./blind75-additions-part5";
import { blind75Part6 } from "./blind75-additions-part6";
import { blind75Part7 } from "./blind75-additions-part7";
import { blind75Part8 } from "./blind75-additions-part8";
import { neetcodeStack } from "./neetcode-stack";
import { neetcodeBinarySearch } from "./neetcode-binary-search";
import { neetcodeTrees } from "./neetcode-trees";
import { neetcodeBacktracking } from "./neetcode-backtracking";
import { neetcodeHeap } from "./neetcode-heap";
import { neetcodeGraphs } from "./neetcode-graphs";
import { neetcodeGreedy } from "./neetcode-greedy";
import { neetcodeAdvancedGraphs } from "./neetcode-advanced-graphs";
import { neetcode2dDp } from "./neetcode-2d-dp";
import { neetcodeMathBit } from "./neetcode-math-bit";

// Mirrors the seed assembly in leetcode-numbers.test.ts (database.ts can't be
// imported here — it pulls in the SQL driver at module load).
const ALL_SEED_KATAS: SeedKata[] = [
  ...sampleKatas,
  ...sampleKatasPython,
  ...treeFundamentals,
  ...dpFoundations,
  ...blind75Part1, ...blind75Part2, ...blind75Part3, ...blind75Part4,
  ...blind75Part5, ...blind75Part6, ...blind75Part7, ...blind75Part8,
  ...neetcodeStack, ...neetcodeBinarySearch, ...neetcodeTrees, ...neetcodeBacktracking,
  ...neetcodeHeap, ...neetcodeGraphs, ...neetcodeGreedy, ...neetcodeAdvancedGraphs,
  ...neetcode2dDp, ...neetcodeMathBit,
];

const VALID_MODULES = new Set<string>(DP_MODULES.map((m) => m.id));
const VALID_MODULES_WITH_EAC = new Set<string>([...VALID_MODULES, "expand-around-center"]);

const VALID_EVAL_ORDERS = new Set<EvaluationOrder>([
  "left-to-right",
  "right-to-left",
  "top-left-to-bottom-right",
  "bottom-up",
  "increasing-interval-length",
  "top-down-memoized",
  "custom",
]);

const FOUR_NEW_KATAS = ["Unique Paths II", "Triangle", "0/1 Knapsack", "Unbounded Knapsack"];

describe("dp patterns", () => {
  it("every DP_PATTERNS key matches a real seed kata name", () => {
    const seedNames = new Set(ALL_SEED_KATAS.map((k) => k.name));
    const orphans = Object.keys(DP_PATTERNS).filter((name) => !seedNames.has(name));
    expect(orphans).toEqual([]);
  });

  it("every DP_PATTERNS entry has a recognized primaryModule", () => {
    const invalid = Object.entries(DP_PATTERNS)
      .filter(([, p]) => !VALID_MODULES_WITH_EAC.has(p.primaryModule))
      .map(([name, p]) => `${name}: ${p.primaryModule}`);
    expect(invalid).toEqual([]);
  });

  it("every DP_PATTERNS entry has non-empty baseCases", () => {
    const missing = Object.entries(DP_PATTERNS)
      .filter(([, p]) => !p.baseCases || p.baseCases.length === 0)
      .map(([name]) => name);
    expect(missing).toEqual([]);
  });

  it("every DP_PATTERNS entry has a valid evaluationOrder kind", () => {
    const invalid = Object.entries(DP_PATTERNS)
      .filter(([, p]) => !VALID_EVAL_ORDERS.has(p.evaluationOrder.kind))
      .map(([name, p]) => `${name}: ${p.evaluationOrder.kind}`);
    expect(invalid).toEqual([]);
  });

  it("every DP_PATTERNS entry has a non-empty evaluationOrder explanation", () => {
    const missing = Object.entries(DP_PATTERNS)
      .filter(([, p]) => !p.evaluationOrder.explanation?.trim())
      .map(([name]) => name);
    expect(missing).toEqual([]);
  });

  it("relatedPatterns are valid curriculum modules and not equal to primaryModule", () => {
    const invalid = Object.entries(DP_PATTERNS).flatMap(([name, p]) => {
      if (!p.relatedPatterns) return [];
      return p.relatedPatterns.flatMap((r) => {
        if (!VALID_MODULES.has(r))
          return [`${name}: related '${r}' is not a curriculum module`];
        if (r === p.primaryModule)
          return [`${name}: related '${r}' equals primaryModule`];
        return [];
      });
    });
    expect(invalid).toEqual([]);
  });

  it("all four new gap katas are present in the seed set", () => {
    const seedNames = new Set(ALL_SEED_KATAS.map((k) => k.name));
    const missing = FOUR_NEW_KATAS.filter((name) => !seedNames.has(name));
    expect(missing).toEqual([]);
  });

  it("all four new gap katas have DP_PATTERNS entries", () => {
    const missing = FOUR_NEW_KATAS.filter((name) => !DP_PATTERNS[name]);
    expect(missing).toEqual([]);
  });

  it("resolves a known pattern by kata name", () => {
    const pattern = dpPatternFor({ name: "House Robber" });
    expect(pattern?.primaryModule).toBe("1d-sequence-dp");
    expect(pattern?.state).toContain("dp[i]");
    expect(pattern?.baseCases.length).toBeGreaterThan(0);
  });

  it("resolves null for a kata with no pattern", () => {
    expect(dpPatternFor({ name: "Two Sum" })).toBeNull();
  });

  it("dpFamilyFor resolves primaryModule by kata name (name-first, ignores stale tags)", () => {
    const result = dpFamilyFor({ name: "House Robber", tags: ["dp-decision"] });
    expect(result).toBe("1d-sequence-dp");
  });

  it("dpFamilyFor falls back to a recognized new module tag when name not in map", () => {
    const result = dpFamilyFor({ name: "Unknown Custom Kata", tags: ["grid-dp"] });
    expect(result).toBe("grid-dp");
  });

  it("dpFamilyFor returns null when neither name nor tag resolves", () => {
    const result = dpFamilyFor({ name: "Two Sum", tags: ["array"] });
    expect(result).toBeNull();
  });

  it("DP_MODULES has exactly 11 entries in the correct order", () => {
    const ids = DP_MODULES.map((m) => m.id);
    expect(ids).toEqual([
      "dp-foundations",
      "1d-sequence-dp",
      "grid-dp",
      "0-1-knapsack",
      "unbounded-knapsack",
      "string-dp",
      "subsequence-dp",
      "interval-dp",
      "state-machine-dp",
      "dfs-memo",
      "bitmask-dp",
    ]);
  });

  it("dp-foundations is the prerequisite tier; all others are problem-family", () => {
    const foundations = DP_MODULES.find((m) => m.id === "dp-foundations");
    expect(foundations?.tier).toBe("prerequisite");
    const families = DP_MODULES.filter((m) => m.id !== "dp-foundations");
    expect(families.every((m) => m.tier === "problem-family")).toBe(true);
  });
});
