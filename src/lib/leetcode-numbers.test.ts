import { describe, it, expect } from "vitest";
import type { SeedKata } from "../types/editor";
import {
  LEETCODE_NUMBERS,
  LEETCODE_SLUGS,
  leetcodeNumberFor,
  leetcodeSlugFor,
  leetcodeUrlFor,
} from "./leetcode-numbers";
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

// The full seed corpus, assembled the same way database.ts does. database.ts
// itself can't be imported here — it pulls in the SQL driver at module load.
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

// Mirrors the (private) key format of LEETCODE_NUMBERS: a plain space.
const lcKey = (k: { name: string; language: string }) => `${k.language} ${k.name}`;

describe("leetcode numbers", () => {
  it("resolves a number for known LeetCode katas", () => {
    expect(leetcodeNumberFor({ name: "Two Sum", language: "python" })).toBe(1);
    expect(leetcodeNumberFor({ name: "Valid Parentheses", language: "python" })).toBe(20);
    expect(leetcodeNumberFor({ name: "Clone Graph", language: "python" })).toBe(133);
  });

  it("resolves null for non-LeetCode katas", () => {
    expect(leetcodeNumberFor({ name: "Matrix Grid BFS", language: "python" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Nonexistent", language: "python" })).toBeNull();
  });

  // A kata is a LeetCode problem iff its description carries a `Ref: LeetCode #N`
  // line — this cleanly separates real problems from foundational/non-LeetCode
  // katas (the backtracking intros, the tree fundamentals), which share
  // categories with real problems and so can't be told apart by category.
  it("every kata with a 'Ref: LeetCode #N' line resolves to that number", () => {
    const REF = /Ref:\s*LeetCode\s*#(\d+)/;
    const mismatched = ALL_SEED_KATAS.flatMap((k) => {
      const m = k.description?.match(REF);
      if (!m) return [];
      const expected = Number(m[1]);
      const actual = leetcodeNumberFor(k);
      return actual === expected ? [] : [`${lcKey(k)}: ref #${expected}, map ${actual}`];
    });

    expect(mismatched).toEqual([]);
  });

  it("only maps numbers that belong to a real seed kata", () => {
    const seedKeys = new Set(ALL_SEED_KATAS.map(lcKey));
    const orphans = Object.keys(LEETCODE_NUMBERS).filter((key) => !seedKeys.has(key));

    expect(orphans).toEqual([]);
  });

  it("has a slug for every mapped LeetCode number", () => {
    const slugless = Object.values(LEETCODE_NUMBERS).filter((n) => LEETCODE_SLUGS[n] == null);

    expect(slugless).toEqual([]);
  });

  it("resolves a problem URL for a known LeetCode kata", () => {
    expect(leetcodeUrlFor({ name: "Two Sum", language: "python" })).toBe(
      "https://leetcode.com/problems/two-sum/",
    );
  });

  it("resolves null URL for a non-LeetCode kata", () => {
    expect(leetcodeUrlFor({ name: "Matrix Grid BFS", language: "python" })).toBeNull();
  });

  it("resolves the canonical slug for a hand-checked number", () => {
    expect(leetcodeSlugFor(20)).toBe("valid-parentheses");
  });
});
