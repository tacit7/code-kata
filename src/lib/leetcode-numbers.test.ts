import { describe, it, expect } from "vitest";
import type { SeedKata } from "../types/editor";
import {
  LEETCODE_NUMBERS,
  LEETCODE_SLUGS,
  leetcodeNumberFor,
  leetcodeSlugFor,
  leetcodeUrlFor,
} from "./leetcode-numbers";
import { composeScript, extractTestNames } from "./js-exec-core";
import { sampleKatas } from "./sample-katas";
import { sampleKatasPython } from "./sample-katas-python";
import { treeFundamentals } from "./tree-fundamentals";
import { dpFoundations } from "./dp-foundations";
import { dpFoundationsJs } from "./dp-foundations-js";
import { dpProblemsJs } from "./dp-problems-js";
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
  ...dpFoundationsJs,
  ...dpProblemsJs,
  ...blind75Part1, ...blind75Part2, ...blind75Part3, ...blind75Part4,
  ...blind75Part5, ...blind75Part6, ...blind75Part7, ...blind75Part8,
  ...neetcodeStack, ...neetcodeBinarySearch, ...neetcodeTrees, ...neetcodeBacktracking,
  ...neetcodeHeap, ...neetcodeGraphs, ...neetcodeGreedy, ...neetcodeAdvancedGraphs,
  ...neetcode2dDp, ...neetcodeMathBit,
];

// Mirrors the (private) key format of LEETCODE_NUMBERS: a plain space.
const lcKey = (k: { name: string; language: string }) => `${k.language} ${k.name}`;

const auditedNeetcodeAdditions = [
  ["Add Two Numbers", 2],
  ["Reverse Nodes in k-Group", 25],
  ["Copy List with Random Pointer", 138],
  ["LRU Cache", 146],
  ["Sliding Window Maximum", 239],
  ["Find the Duplicate Number", 287],
  ["Permutation in String", 567],
] as const;

const NEETCODE_150_NUMBERS = [
  1, 2, 3, 4, 5, 518, 7, 1448, 10, 11, 994, 15,
  17, 19, 20, 21, 22, 23, 25, 543, 33, 36, 39, 40,
  42, 43, 45, 46, 48, 49, 50, 51, 53, 54, 55, 56,
  57, 567, 572, 62, 66, 70, 72, 73, 74, 76, 78, 79,
  84, 90, 91, 2013, 97, 98, 100, 102, 1046, 104, 105, 621,
  110, 115, 121, 124, 125, 127, 128, 130, 131, 133, 134, 647,
  136, 138, 139, 141, 143, 146, 150, 152, 153, 155, 678, 167,
  1584, 684, 695, 190, 191, 198, 199, 200, 202, 206, 207, 208,
  210, 211, 212, 213, 215, 217, 226, 739, 1143, 230, 743, 235,
  746, 238, 239, 242, 252, 253, 763, 261, 268, 269, 271, 703,
  704, 778, 286, 287, 787, 295, 297, 300, 309, 312, 322, 323,
  329, 332, 338, 347, 355, 846, 371, 853, 875, 416, 417, 424,
  435, 1851, 1899, 494, 973, 981,
] as const;

describe("leetcode numbers", () => {
  it("resolves a number for known LeetCode katas", () => {
    expect(leetcodeNumberFor({ name: "Two Sum", language: "python" })).toBe(1);
    expect(leetcodeNumberFor({ name: "Valid Parentheses", language: "python" })).toBe(20);
    expect(leetcodeNumberFor({ name: "Clone Graph", language: "python" })).toBe(133);
    expect(leetcodeNumberFor({ name: "Clone Graph", language: "javascript" })).toBe(133);
  });

  it("resolves null for non-LeetCode katas", () => {
    expect(leetcodeNumberFor({ name: "Matrix Grid BFS", language: "python" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Matrix Grid BFS", language: "javascript" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Matrix BFS With Walls", language: "python" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Matrix BFS With Walls", language: "javascript" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Prefix Sum Table", language: "python" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Prefix Sum Table", language: "javascript" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Build Adjacency List Drill", language: "python" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Build Adjacency List Drill", language: "javascript" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Nonexistent", language: "python" })).toBeNull();
  });

  it("maps LeetCode 34 only to the range-returning problem", () => {
    const title = "Find First and Last Position of Element in Sorted Array";
    expect(leetcodeNumberFor({ name: title, language: "python" })).toBe(34);
    expect(leetcodeNumberFor({ name: title, language: "javascript" })).toBe(34);
    expect(leetcodeNumberFor({ name: "Find First Occurrence in Sorted Array", language: "python" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Find Last Occurrence in Sorted Array", language: "python" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Find First Occurrence in Sorted Array", language: "javascript" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Find Last Occurrence in Sorted Array", language: "javascript" })).toBeNull();
  });

  it("keeps the old adjacency-list drill name out of seed content", () => {
    expect(ALL_SEED_KATAS.filter((k) => k.name === "Build Adjacency List")).toEqual([]);
  });

  it("keeps the old Matrix BFS name out of seed content", () => {
    expect(ALL_SEED_KATAS.filter((k) => k.name === "Matrix BFS")).toEqual([]);
  });

  it("keeps the old Build Prefix Sum name out of seed content", () => {
    expect(ALL_SEED_KATAS.filter((k) => k.name === "Build Prefix Sum")).toEqual([]);
  });

  it("maps LeetCode 1480 only to Running Sum of 1d Array", () => {
    const title = "Running Sum of 1d Array";
    expect(leetcodeNumberFor({ name: title, language: "python" })).toBe(1480);
    expect(leetcodeNumberFor({ name: title, language: "javascript" })).toBe(1480);
    expect(leetcodeNumberFor({ name: "Prefix Sum Table", language: "python" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Prefix Sum Table", language: "javascript" })).toBeNull();
  });

  it("maps LeetCode 1091 only to the shortest-path problem", () => {
    const title = "Shortest Path in Binary Matrix";
    expect(leetcodeNumberFor({ name: title, language: "python" })).toBe(1091);
    expect(leetcodeNumberFor({ name: title, language: "javascript" })).toBe(1091);
    expect(leetcodeNumberFor({ name: "Matrix Grid BFS", language: "python" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Matrix Grid BFS", language: "javascript" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Matrix BFS With Walls", language: "python" })).toBeNull();
    expect(leetcodeNumberFor({ name: "Matrix BFS With Walls", language: "javascript" })).toBeNull();
  });

  it("covers the NeetCode audit additions with canonical Python titles", () => {
    for (const [name, number] of auditedNeetcodeAdditions) {
      expect(ALL_SEED_KATAS.some((kata) => kata.language === "python" && kata.name === name)).toBe(true);
      expect(leetcodeNumberFor({ name, language: "python" })).toBe(number);
    }
  });

  it("ships two Product of Array Except Self variants", () => {
    const kata = blind75Part1.find((k) => k.name === "Product of Array Except Self" && k.language === "python");

    expect(kata?.solutionVariants?.map((variant) => variant.label)).toEqual([
      "Two prefix arrays",
      "Output array plus suffix",
    ]);
    expect(kata?.solutionVariants?.every((variant) => variant.complexity && variant.explanation)).toBe(true);
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

  it("keeps Blind 75 mapped to exactly 75 unique LeetCode problems", () => {
    const blind75Katas = ALL_SEED_KATAS.filter((kata) => kata.tags.includes("blind75"));
    const unmapped = blind75Katas.filter((kata) => leetcodeNumberFor(kata) == null).map(lcKey);
    const uniqueProblemNumbers = new Set(blind75Katas.map((kata) => leetcodeNumberFor(kata)));

    expect(unmapped).toEqual([]);
    expect(uniqueProblemNumbers.size).toBe(75);
  });

  it("keeps NeetCode mapped to exactly the 150 source-list problems", () => {
    const neetcodeKatas = ALL_SEED_KATAS.filter((kata) => kata.tags.includes("neetcode"));
    const unmapped = neetcodeKatas.filter((kata) => leetcodeNumberFor(kata) == null).map(lcKey);
    const uniqueProblemNumbers = [...new Set(neetcodeKatas.map((kata) => leetcodeNumberFor(kata)))].sort((a, b) => a! - b!);

    expect(unmapped).toEqual([]);
    expect(uniqueProblemNumbers).toEqual([...NEETCODE_150_NUMBERS].sort((a, b) => a - b));
  });

  it("resolves a problem URL for a known LeetCode kata", () => {
    expect(leetcodeUrlFor({ name: "Two Sum", language: "python" })).toBe(
      "https://leetcode.com/problems/two-sum/",
    );
  });

  it("resolves null URL for a non-LeetCode kata", () => {
    expect(leetcodeUrlFor({ name: "Matrix Grid BFS", language: "python" })).toBeNull();
    expect(leetcodeUrlFor({ name: "Prefix Sum Table", language: "python" })).toBeNull();
  });

  it("resolves the canonical slug for a hand-checked number", () => {
    expect(leetcodeSlugFor(20)).toBe("valid-parentheses");
  });

  it("ships an executable JavaScript Clone Graph solution for LeetCode 133", () => {
    const kata = sampleKatas.find((k) => k.name === "Clone Graph" && k.language === "javascript");
    expect(kata?.solution).toBeTruthy();

    for (const testName of extractTestNames(kata!.testCode)) {
      expect(() => new Function(composeScript(kata!.solution!, kata!.testCode, testName))()).not.toThrow();
    }
  });

  it("ships an executable JavaScript solution for LeetCode 1091", () => {
    const kata = sampleKatas.find((k) => k.name === "Shortest Path in Binary Matrix" && k.language === "javascript");
    expect(kata?.solution).toBeTruthy();

    for (const testName of extractTestNames(kata!.testCode)) {
      expect(() => new Function(composeScript(kata!.solution!, kata!.testCode, testName))()).not.toThrow();
    }
  });

  it("ships an executable JavaScript solution for LeetCode 1480", () => {
    const kata = sampleKatas.find((k) => k.name === "Running Sum of 1d Array" && k.language === "javascript");
    expect(kata?.solution).toBeTruthy();

    for (const testName of extractTestNames(kata!.testCode)) {
      expect(() => new Function(composeScript(kata!.solution!, kata!.testCode, testName))()).not.toThrow();
    }
  });
});
