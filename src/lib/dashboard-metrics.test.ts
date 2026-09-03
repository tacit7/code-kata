import { describe, expect, it } from "vitest";
import {
  DASHBOARD_MODULES,
  computeHighValueDashboardMetrics,
  type DashboardMetricAttempt,
  type DashboardMetricKata,
} from "./dashboard-metrics";

const DAY = 86_400_000;
const NOW = new Date("2026-08-10T12:00:00Z").getTime();
const at = (daysAgo: number) => new Date(NOW - daysAgo * DAY).toISOString();

function kata(partial: Partial<DashboardMetricKata> & Pick<DashboardMetricKata, "id" | "name">): DashboardMetricKata {
  return {
    category: "dynamic-programming",
    language: "javascript",
    difficulty: "medium",
    tags: [],
    leetcodeNumber: null,
    ...partial,
  };
}

function attempt(partial: Partial<DashboardMetricAttempt> & Pick<DashboardMetricAttempt, "kataId" | "passed" | "startedAt">): DashboardMetricAttempt {
  return {
    timeMs: 10_000,
    ...partial,
  };
}

describe("computeHighValueDashboardMetrics", () => {
  it("classifies attempted katas into strong, developing, and needs-review", () => {
    const metrics = computeHighValueDashboardMetrics(
      [
        kata({ id: 1, name: "House Robber" }),
        kata({ id: 2, name: "Coin Change" }),
        kata({ id: 3, name: "Word Break" }),
        kata({ id: 4, name: "Unattempted" }),
      ],
      [
        attempt({ kataId: 1, passed: 1, startedAt: at(3) }),
        attempt({ kataId: 1, passed: 1, startedAt: at(1) }),
        attempt({ kataId: 2, passed: 1, startedAt: at(0.5) }),
        attempt({ kataId: 3, passed: 1, startedAt: at(6) }),
        attempt({ kataId: 3, passed: 0, startedAt: at(1) }),
      ],
      NOW,
    );

    expect(metrics.masterySummary).toMatchObject({
      attempted: 3,
      strong: 1,
      developing: 1,
      needsReview: 1,
      percent: 33,
    });
    expect(metrics.reviewQueue[0].kataName).toBe("Word Break");
    expect(metrics.reviewQueue[0].reason).toBe("Last attempt failed");
  });

  it("reports recent best-time improvements", () => {
    const metrics = computeHighValueDashboardMetrics(
      [kata({ id: 1, name: "House Robber" })],
      [
        attempt({ kataId: 1, passed: 1, startedAt: at(12), timeMs: 12_000 }),
        attempt({ kataId: 1, passed: 1, startedAt: at(4), timeMs: 8_000 }),
      ],
      NOW,
    );

    expect(metrics.recentlyImproved).toEqual([
      {
        kataId: 1,
        kataName: "House Robber",
        category: "dynamic-programming",
        language: "javascript",
        previousBestMs: 12_000,
        currentBestMs: 8_000,
        improvementPercent: 33,
        improvedAt: at(4),
      },
    ]);
  });

  it("summarizes module progress and LeetCode coverage", () => {
    const metrics = computeHighValueDashboardMetrics(
      [
        kata({ id: 1, name: "House Robber", leetcodeNumber: 198, tags: ["neetcode", "blind75"] }),
        kata({ id: 2, name: "Unique Paths", leetcodeNumber: 62, tags: ["neetcode"], difficulty: "medium" }),
        kata({ id: 3, name: "Two Sum", category: "arrays", difficulty: "easy", leetcodeNumber: 1, tags: ["neetcode", "blind75"] }),
      ],
      [
        attempt({ kataId: 1, passed: 1, startedAt: at(3) }),
        attempt({ kataId: 1, passed: 1, startedAt: at(1) }),
        attempt({ kataId: 3, passed: 1, startedAt: at(1) }),
      ],
      NOW,
    );

    const arrays = metrics.moduleProgress.find((row) => row.moduleId === "arrays-hashing");
    const oneD = metrics.moduleProgress.find((row) => row.moduleId === "1-d-dp");
    const twoD = metrics.moduleProgress.find((row) => row.moduleId === "2-d-dp");

    expect(arrays).toMatchObject({ total: 1, solved: 1, percentSolved: 100 });
    expect(oneD).toMatchObject({ total: 1, solved: 1, strong: 1, percentSolved: 100 });
    expect(twoD).toMatchObject({ total: 1, solved: 0, percentSolved: 0 });
    expect(metrics.leetcodeProgress).toMatchObject({
      total: 3,
      solved: 2,
      percentSolved: 67,
      easySolved: 1,
      mediumSolved: 1,
      blind75Total: 2,
      blind75Solved: 2,
      blind75PercentSolved: 100,
      neetcodeTotal: 3,
      neetcodeSolved: 2,
      neetcodePercentSolved: 67,
      recommendedUnattempted: 1,
    });
  });

  it("counts Blind 75 progress by unique LeetCode problem, not seed rows", () => {
    const metrics = computeHighValueDashboardMetrics(
      [
        kata({ id: 1, name: "Climbing Stairs", leetcodeNumber: 70, tags: ["blind75", "neetcode"] }),
        kata({ id: 2, name: "Climbing Stairs (Recursive)", leetcodeNumber: 70, tags: ["blind75", "neetcode"] }),
        kata({ id: 3, name: "House Robber", leetcodeNumber: 198, tags: ["blind75", "neetcode"] }),
      ],
      [
        attempt({ kataId: 2, passed: 1, startedAt: at(1) }),
      ],
      NOW,
    );

    expect(metrics.leetcodeProgress).toMatchObject({
      total: 2,
      solved: 1,
      blind75Total: 2,
      blind75Solved: 1,
      blind75PercentSolved: 50,
      neetcodeTotal: 2,
      neetcodeSolved: 1,
      neetcodePercentSolved: 50,
      recommendedUnattempted: 1,
    });
  });

  it("orders module progress in roadmap order", () => {
    const metrics = computeHighValueDashboardMetrics(
      [
        kata({ id: 1, name: "Contains Duplicate", category: "arrays", leetcodeNumber: 217, tags: ["neetcode", "arrays-hashing"] }),
        kata({ id: 2, name: "Valid Palindrome", category: "two-pointers", leetcodeNumber: 125, tags: ["two-pointers"] }),
        kata({ id: 3, name: "Valid Parentheses", category: "stack", leetcodeNumber: 20, tags: ["stack"] }),
        kata({ id: 4, name: "Binary Search", category: "binary-search", leetcodeNumber: 704, tags: ["binary-search"] }),
        kata({ id: 5, name: "Best Time to Buy and Sell Stock", category: "sliding-window", leetcodeNumber: 121, tags: ["sliding-window"] }),
        kata({ id: 6, name: "Reverse Linked List", category: "linked-list", leetcodeNumber: 206, tags: ["linked-list"] }),
        kata({ id: 7, name: "Recursion Drill", category: "recursion", tags: ["recursion", "recursion-call-flow"] }),
        kata({ id: 8, name: "Invert Binary Tree", category: "trees", leetcodeNumber: 226, tags: ["trees"] }),
        kata({ id: 9, name: "Implement Trie Prefix Tree", category: "tries", leetcodeNumber: 208, tags: ["tries"] }),
        kata({ id: 10, name: "Subsets", category: "backtracking", leetcodeNumber: 78, tags: ["backtracking"] }),
        kata({ id: 11, name: "Kth Largest Element in a Stream", category: "heap", leetcodeNumber: 703, tags: ["heap"] }),
        kata({ id: 12, name: "Number of Islands", category: "graphs", leetcodeNumber: 200, tags: ["graphs"] }),
        kata({ id: 13, name: "House Robber", category: "1-d-dp", leetcodeNumber: 198, tags: ["dynamic-programming", "1d-dp"] }),
        kata({ id: 14, name: "Insert Interval", category: "intervals", leetcodeNumber: 57, tags: ["intervals"] }),
        kata({ id: 15, name: "Maximum Subarray", category: "greedy", leetcodeNumber: 53, tags: ["greedy"] }),
        kata({ id: 16, name: "Network Delay Time", category: "advanced-graphs", leetcodeNumber: 743, tags: ["advanced-graphs"] }),
        kata({ id: 17, name: "Unique Paths", category: "2-d-dp", leetcodeNumber: 62, tags: ["dynamic-programming", "2d-dp"] }),
        kata({ id: 18, name: "Single Number", category: "binary", leetcodeNumber: 136, tags: ["bit-manipulation"] }),
        kata({ id: 19, name: "Rotate Image", category: "math", leetcodeNumber: 48, tags: ["math"] }),
      ],
      [],
      NOW,
    );

    expect(metrics.moduleProgress.map((row) => row.moduleLabel)).toEqual(
      DASHBOARD_MODULES.map((module) => module.label),
    );
  });
});
