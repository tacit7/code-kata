import { DP_MODULES, dpFamilyFor } from "./dp-patterns";
import { computeSrState } from "./sr";

export type MasteryLevel = "strong" | "developing" | "needs-review";

export interface DashboardMetricKata {
  id: number;
  name: string;
  category: string;
  difficulty: string | null;
  tags: string[];
  leetcodeNumber?: number | null;
}

export interface DashboardMetricAttempt {
  kataId: number;
  startedAt: string;
  timeMs: number | null;
  passed: number;
}

export interface MasterySummary {
  attempted: number;
  strong: number;
  developing: number;
  needsReview: number;
  percent: number;
}

export interface ReviewQueueRow {
  kataId: number;
  kataName: string;
  category: string;
  difficulty: string | null;
  reason: string;
  failedAttempts: number;
  bestTimeMs: number | null;
  score: number;
}

export interface RecentlyImprovedRow {
  kataId: number;
  kataName: string;
  category: string;
  previousBestMs: number;
  currentBestMs: number;
  improvementPercent: number;
  improvedAt: string;
}

export interface DpModuleProgressRow {
  moduleId: string;
  moduleLabel: string;
  total: number;
  attempted: number;
  solved: number;
  strong: number;
  developing: number;
  needsReview: number;
  percentSolved: number;
}

export interface LeetcodeProgress {
  total: number;
  solved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  blind75Total: number;
  blind75Solved: number;
  neetcodeTotal: number;
  neetcodeSolved: number;
  recommendedUnattempted: number;
}

export interface HighValueDashboardMetrics {
  masterySummary: MasterySummary;
  reviewQueue: ReviewQueueRow[];
  recentlyImproved: RecentlyImprovedRow[];
  dpModuleProgress: DpModuleProgressRow[];
  leetcodeProgress: LeetcodeProgress;
}

interface KataAttemptStats {
  attempts: DashboardMetricAttempt[];
  passCount: number;
  failedAttempts: number;
  bestTimeMs: number | null;
  lastAttempt: DashboardMetricAttempt | null;
}

const REVIEW_QUEUE_LIMIT = 5;
const RECENTLY_IMPROVED_LIMIT = 5;
const RECENT_IMPROVEMENT_DAYS = 30;
const DAY_MS = 86_400_000;

function attemptsByKata(attempts: DashboardMetricAttempt[]): Map<number, DashboardMetricAttempt[]> {
  const grouped = new Map<number, DashboardMetricAttempt[]>();
  for (const attempt of attempts) {
    const list = grouped.get(attempt.kataId) ?? [];
    list.push(attempt);
    grouped.set(attempt.kataId, list);
  }

  for (const list of grouped.values()) {
    list.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  }

  return grouped;
}

function statsFor(attempts: DashboardMetricAttempt[] | undefined): KataAttemptStats {
  const rows = attempts ?? [];
  let passCount = 0;
  let failedAttempts = 0;
  let bestTimeMs: number | null = null;

  for (const attempt of rows) {
    if (attempt.passed) {
      passCount++;
      if (attempt.timeMs != null && (bestTimeMs == null || attempt.timeMs < bestTimeMs)) {
        bestTimeMs = attempt.timeMs;
      }
    } else {
      failedAttempts++;
    }
  }

  return {
    attempts: rows,
    passCount,
    failedAttempts,
    bestTimeMs,
    lastAttempt: rows.length > 0 ? rows[rows.length - 1] : null,
  };
}

function currentPassStreak(attempts: DashboardMetricAttempt[]): number {
  let streak = 0;
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (!attempts[i].passed) break;
    streak++;
  }
  return streak;
}

function masteryLevel(stats: KataAttemptStats, now: number): MasteryLevel | null {
  if (stats.attempts.length === 0) return null;

  const srState = computeSrState(
    stats.attempts.map((attempt) => ({
      passed: attempt.passed,
      started_at: attempt.startedAt,
    })),
    now,
  );

  if (srState.status === "failed" || srState.status === "due" || stats.passCount === 0) {
    return "needs-review";
  }

  if (stats.passCount >= 2 && currentPassStreak(stats.attempts) >= 2) {
    return "strong";
  }

  return "developing";
}

function reviewReason(stats: KataAttemptStats, now: number): string {
  const lastAttempt = stats.lastAttempt;
  if (!lastAttempt) return "Not attempted yet";
  if (!lastAttempt.passed) return "Last attempt failed";
  if (stats.passCount === 0) return "No successful pass yet";

  const srState = computeSrState(
    stats.attempts.map((attempt) => ({
      passed: attempt.passed,
      started_at: attempt.startedAt,
    })),
    now,
  );

  if (srState.status === "due") {
    return srState.overdueDays > 0 ? `Overdue ${srState.overdueDays}d` : "Due today";
  }

  const daysSince = Math.floor((now - new Date(lastAttempt.startedAt).getTime()) / DAY_MS);
  return daysSince >= 14 ? `${daysSince}d since practice` : "Review recommended";
}

export function computeHighValueDashboardMetrics(
  katas: DashboardMetricKata[],
  attempts: DashboardMetricAttempt[],
  now = Date.now(),
): HighValueDashboardMetrics {
  const groupedAttempts = attemptsByKata(attempts);
  const levelByKata = new Map<number, MasteryLevel>();
  const statsByKata = new Map<number, KataAttemptStats>();

  const masterySummary: MasterySummary = {
    attempted: 0,
    strong: 0,
    developing: 0,
    needsReview: 0,
    percent: 0,
  };

  for (const kata of katas) {
    const stats = statsFor(groupedAttempts.get(kata.id));
    statsByKata.set(kata.id, stats);
    const level = masteryLevel(stats, now);
    if (!level) continue;
    levelByKata.set(kata.id, level);
    masterySummary.attempted++;
    if (level === "strong") masterySummary.strong++;
    if (level === "developing") masterySummary.developing++;
    if (level === "needs-review") masterySummary.needsReview++;
  }

  masterySummary.percent =
    masterySummary.attempted > 0 ? Math.round((masterySummary.strong / masterySummary.attempted) * 100) : 0;

  const reviewQueue = katas
    .map((kata): ReviewQueueRow | null => {
      const stats = statsByKata.get(kata.id) ?? statsFor(undefined);
      if (levelByKata.get(kata.id) !== "needs-review") return null;
      const srState = computeSrState(
        stats.attempts.map((attempt) => ({
          passed: attempt.passed,
          started_at: attempt.startedAt,
        })),
        now,
      );
      return {
        kataId: kata.id,
        kataName: kata.name,
        category: kata.category,
        difficulty: kata.difficulty,
        reason: reviewReason(stats, now),
        failedAttempts: stats.failedAttempts,
        bestTimeMs: stats.bestTimeMs,
        score: srState.score + stats.failedAttempts * 0.2,
      };
    })
    .filter((row): row is ReviewQueueRow => row != null)
    .sort((a, b) => b.score - a.score || b.failedAttempts - a.failedAttempts || a.kataName.localeCompare(b.kataName))
    .slice(0, REVIEW_QUEUE_LIMIT);

  const recentCutoff = now - RECENT_IMPROVEMENT_DAYS * DAY_MS;
  const recentlyImproved = katas
    .map((kata): RecentlyImprovedRow | null => {
      const passedAttempts = (statsByKata.get(kata.id)?.attempts ?? []).filter(
        (attempt) => attempt.passed && attempt.timeMs != null,
      );
      let best = Infinity;
      let bestImprovement: RecentlyImprovedRow | null = null;

      for (const attempt of passedAttempts) {
        const timeMs = attempt.timeMs ?? Infinity;
        if (timeMs >= best) continue;
        if (best !== Infinity) {
          const improvedAt = new Date(attempt.startedAt).getTime();
          if (improvedAt >= recentCutoff) {
            bestImprovement = {
              kataId: kata.id,
              kataName: kata.name,
              category: kata.category,
              previousBestMs: best,
              currentBestMs: timeMs,
              improvementPercent: Math.round(((best - timeMs) / best) * 100),
              improvedAt: attempt.startedAt,
            };
          }
        }
        best = timeMs;
      }

      return bestImprovement;
    })
    .filter((row): row is RecentlyImprovedRow => row != null)
    .sort((a, b) => new Date(b.improvedAt).getTime() - new Date(a.improvedAt).getTime())
    .slice(0, RECENTLY_IMPROVED_LIMIT);

  const dpModuleProgress = DP_MODULES.map((module): DpModuleProgressRow => {
    const moduleKatas = katas.filter((kata) => dpFamilyFor(kata) === module.id);
    const row: DpModuleProgressRow = {
      moduleId: module.id,
      moduleLabel: module.label,
      total: moduleKatas.length,
      attempted: 0,
      solved: 0,
      strong: 0,
      developing: 0,
      needsReview: 0,
      percentSolved: 0,
    };

    for (const kata of moduleKatas) {
      const stats = statsByKata.get(kata.id) ?? statsFor(undefined);
      const level = levelByKata.get(kata.id);
      if (stats.attempts.length > 0) row.attempted++;
      if (stats.passCount > 0) row.solved++;
      if (level === "strong") row.strong++;
      if (level === "developing") row.developing++;
      if (level === "needs-review") row.needsReview++;
    }

    row.percentSolved = row.total > 0 ? Math.round((row.solved / row.total) * 100) : 0;
    return row;
  }).filter((row) => row.total > 0);

  const leetcodeProgress = katas.reduce<LeetcodeProgress>(
    (progress, kata) => {
      const isLeetcode = kata.leetcodeNumber != null;
      const solved = (statsByKata.get(kata.id)?.passCount ?? 0) > 0;
      const attempted = (statsByKata.get(kata.id)?.attempts.length ?? 0) > 0;
      const difficulty = kata.difficulty?.toLowerCase();
      const blind75 = kata.tags.includes("blind75");
      const neetcode = kata.tags.includes("neetcode");

      if (isLeetcode) {
        progress.total++;
        if (solved) progress.solved++;
        if (solved && difficulty === "easy") progress.easySolved++;
        if (solved && difficulty === "medium") progress.mediumSolved++;
        if (solved && difficulty === "hard") progress.hardSolved++;
      }

      if (blind75) {
        progress.blind75Total++;
        if (solved) progress.blind75Solved++;
      }

      if (neetcode) {
        progress.neetcodeTotal++;
        if (solved) progress.neetcodeSolved++;
      }

      if ((blind75 || neetcode) && !attempted) progress.recommendedUnattempted++;
      return progress;
    },
    {
      total: 0,
      solved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      blind75Total: 0,
      blind75Solved: 0,
      neetcodeTotal: 0,
      neetcodeSolved: 0,
      recommendedUnattempted: 0,
    },
  );

  return {
    masterySummary,
    reviewQueue,
    recentlyImproved,
    dpModuleProgress,
    leetcodeProgress,
  };
}
