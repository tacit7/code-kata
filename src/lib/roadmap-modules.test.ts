import { describe, expect, it } from "vitest";
import {
  NEETCODE_150_MODULE_NUMBERS,
  NEETCODE_250_MODULE_NUMBERS,
  ROADMAP_MODULES,
  compareRoadmapModuleOrder,
  isNeetcode150Kata,
  isNeetcode250Kata,
  matchesRoadmapModule,
  roadmapModuleTargetCount,
} from "./roadmap-modules";

const arraysHashing = ROADMAP_MODULES.find((module) => module.id === "arrays-hashing")!;
const twoPointers = ROADMAP_MODULES.find((module) => module.id === "two-pointers")!;

function kata(leetcodeNumber: number | null, name = `Problem ${leetcodeNumber}`, tags: string[] = [], category = "arrays") {
  return { name, category, tags, leetcodeNumber };
}

describe("roadmap modules", () => {
  it("keeps the official NeetCode 150 module counts", () => {
    expect(Object.values(NEETCODE_150_MODULE_NUMBERS).flat()).toHaveLength(150);
    expect(NEETCODE_150_MODULE_NUMBERS["arrays-hashing"]).toHaveLength(9);
    expect(NEETCODE_150_MODULE_NUMBERS["two-pointers"]).toHaveLength(5);
    expect(NEETCODE_150_MODULE_NUMBERS["sliding-window"]).toHaveLength(6);
    expect(NEETCODE_150_MODULE_NUMBERS.stack).toHaveLength(6);
    expect(NEETCODE_150_MODULE_NUMBERS["binary-search"]).toHaveLength(7);
    expect(NEETCODE_150_MODULE_NUMBERS["linked-list"]).toHaveLength(11);
    expect(NEETCODE_150_MODULE_NUMBERS.trees).toHaveLength(15);
    expect(NEETCODE_150_MODULE_NUMBERS.heap).toHaveLength(7);
    expect(NEETCODE_150_MODULE_NUMBERS.backtracking).toHaveLength(10);
    expect(NEETCODE_150_MODULE_NUMBERS.tries).toHaveLength(3);
    expect(NEETCODE_150_MODULE_NUMBERS.graphs).toHaveLength(13);
    expect(NEETCODE_150_MODULE_NUMBERS["advanced-graphs"]).toHaveLength(6);
    expect(NEETCODE_150_MODULE_NUMBERS["1-d-dp"]).toHaveLength(12);
    expect(NEETCODE_150_MODULE_NUMBERS["2-d-dp"]).toHaveLength(11);
    expect(NEETCODE_150_MODULE_NUMBERS.greedy).toHaveLength(8);
    expect(NEETCODE_150_MODULE_NUMBERS.intervals).toHaveLength(6);
    expect(NEETCODE_150_MODULE_NUMBERS["math-geometry"]).toHaveLength(8);
    expect(NEETCODE_150_MODULE_NUMBERS["bit-manipulation"]).toHaveLength(7);
  });

  it("keeps the official NeetCode 250 module count", () => {
    expect(Object.values(NEETCODE_250_MODULE_NUMBERS).flat()).toHaveLength(250);
    expect(roadmapModuleTargetCount("arrays-hashing", "neetcode250")).toBe(22);
    expect(roadmapModuleTargetCount("two-pointers", "neetcode250")).toBe(13);
    expect(roadmapModuleTargetCount("dynamic-programming", "neetcode250")).toBe(33);
    expect(roadmapModuleTargetCount("arrays-hashing", "all")).toBeNull();
  });

  it("matches every NeetCode 150 module by LeetCode number", () => {
    for (const [moduleId, numbers] of Object.entries(NEETCODE_150_MODULE_NUMBERS)) {
      const module = ROADMAP_MODULES.find((candidate) => candidate.id === moduleId);
      if (!module) continue;
      expect(numbers.filter((number) => matchesRoadmapModule(kata(number), module, "neetcode150"))).toEqual([...numbers]);
    }
  });

  it("does not pull generic array/hash-map extras into Arrays & Hashing", () => {
    expect(matchesRoadmapModule(kata(1480, "Running Sum of 1d Array", ["arrays-hashing"], "arrays"), arraysHashing)).toBe(false);
    expect(matchesRoadmapModule(kata(null, "Frequency Count", ["hash-map"], "arrays"), arraysHashing)).toBe(false);
    expect(matchesRoadmapModule(kata(981, "Time Based Key-Value Store", ["hash-map", "neetcode"], "binary-search"), arraysHashing)).toBe(false);
  });

  it("sorts Arrays & Hashing in NeetCode order", () => {
    const shuffled = [
      kata(238, "Product of Array Except Self"),
      kata(217, "Contains Duplicate"),
      kata(128, "Longest Consecutive Sequence"),
      kata(1, "Two Sum"),
    ];

    expect(shuffled.sort((a, b) => compareRoadmapModuleOrder("arrays-hashing", a, b, "neetcode150")).map((item) => item.name)).toEqual([
      "Contains Duplicate",
      "Two Sum",
      "Product of Array Except Self",
      "Longest Consecutive Sequence",
    ]);
  });

  it("recognizes NeetCode 150 and 250 membership by number", () => {
    expect(isNeetcode150Kata(kata(125))).toBe(true);
    expect(isNeetcode150Kata(kata(344))).toBe(false);
    expect(isNeetcode250Kata(kata(344))).toBe(true);
    expect(isNeetcode250Kata(kata(999999))).toBe(false);
  });

  it("does not pull generic two-pointer extras into Two Pointers", () => {
    expect(matchesRoadmapModule(kata(null, "Pointer Warmup", ["two-pointers"], "two-pointers"), twoPointers)).toBe(false);
    expect(matchesRoadmapModule(kata(283, "Move Zeroes", ["neetcode"], "two-pointers"), twoPointers)).toBe(false);
    expect(matchesRoadmapModule(kata(680, "Valid Palindrome II", ["neetcode"], "two-pointers"), twoPointers, "neetcode150")).toBe(false);
  });

  it("sorts Two Pointers in NeetCode order", () => {
    const shuffled = [
      kata(11, "Container With Most Water", ["neetcode"], "two-pointers"),
      kata(125, "Valid Palindrome", ["neetcode"], "two-pointers"),
      kata(42, "Trapping Rain Water", ["neetcode"], "two-pointers"),
      kata(15, "3Sum", ["neetcode"], "two-pointers"),
    ];

    expect(shuffled.sort((a, b) => compareRoadmapModuleOrder("two-pointers", a, b, "neetcode150")).map((item) => item.name)).toEqual([
      "Valid Palindrome",
      "3Sum",
      "Container With Most Water",
      "Trapping Rain Water",
    ]);
  });
});
