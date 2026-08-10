import { describe, expect, it } from "vitest";
import { computeHighValueDashboardMetrics, type DashboardMetricAttempt, type DashboardMetricKata } from "./dashboard-metrics";

const DAY = 86_400_000;
const NOW = new Date("2026-08-10T12:00:00Z").getTime();
const at = (daysAgo: number) => new Date(NOW - daysAgo * DAY).toISOString();

function kata(partial: Partial<DashboardMetricKata> & Pick<DashboardMetricKata, "id" | "name">): DashboardMetricKata {
  return {
    category: "dynamic-programming",
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
        previousBestMs: 12_000,
        currentBestMs: 8_000,
        improvementPercent: 33,
        improvedAt: at(4),
      },
    ]);
  });

  it("summarizes DP modules and LeetCode coverage", () => {
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

    const oneD = metrics.dpModuleProgress.find((row) => row.moduleId === "1d-sequence-dp");
    const grid = metrics.dpModuleProgress.find((row) => row.moduleId === "grid-dp");

    expect(oneD).toMatchObject({ total: 1, solved: 1, strong: 1, percentSolved: 100 });
    expect(grid).toMatchObject({ total: 1, solved: 0, percentSolved: 0 });
    expect(metrics.leetcodeProgress).toMatchObject({
      total: 3,
      solved: 2,
      easySolved: 1,
      mediumSolved: 1,
      blind75Total: 2,
      blind75Solved: 2,
      neetcodeTotal: 3,
      neetcodeSolved: 2,
      recommendedUnattempted: 1,
    });
  });
});
