import { describe, it, expect } from "vitest";
import type { SeedKata } from "../types/editor";
import { DP_FAMILIES, DP_PATTERNS, dpFamilyFor, dpPatternFor } from "./dp-patterns";
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

const FAMILY_TAGS = new Set(DP_FAMILIES.map((f) => f.id));

describe("dp patterns", () => {
  it("every kata carrying a dp family tag has a DP_PATTERNS entry", () => {
    const missing = ALL_SEED_KATAS.filter(
      (k) => k.tags.some((t) => FAMILY_TAGS.has(t as (typeof DP_FAMILIES)[number]["id"])) && !DP_PATTERNS[k.name],
    ).map((k) => k.name);

    expect(missing).toEqual([]);
  });

  it("every DP_PATTERNS key matches a real seed kata name", () => {
    const seedNames = new Set(ALL_SEED_KATAS.map((k) => k.name));
    const orphans = Object.keys(DP_PATTERNS).filter((name) => !seedNames.has(name));

    expect(orphans).toEqual([]);
  });

  it("every DP_PATTERNS entry's family matches the kata's actual family tag", () => {
    const byName = new Map(ALL_SEED_KATAS.map((k) => [k.name, k] as const));
    const mismatched = Object.entries(DP_PATTERNS).flatMap(([name, pattern]) => {
      const kata = byName.get(name);
      if (!kata) return [];
      const actual = dpFamilyFor(kata);
      return actual === pattern.family ? [] : [`${name}: tagged ${actual}, mapped ${pattern.family}`];
    });

    expect(mismatched).toEqual([]);
  });

  it("resolves a known pattern by kata name", () => {
    const pattern = dpPatternFor({ name: "House Robber" });
    expect(pattern?.family).toBe("dp-decision");
    expect(pattern?.state).toContain("dp[i]");
  });

  it("resolves null for a kata with no pattern", () => {
    expect(dpPatternFor({ name: "Two Sum" })).toBeNull();
  });
});
