import type { Attempt, Kata } from "../types/editor";

export interface ReviewQueue {
  label: string;
  description: string;
  katas: Kata[];
}

function attemptByIndex(attempts: Attempt[]): Map<number, Attempt> {
  return new Map(attempts.map((attempt) => [attempt.kataIndex, attempt]));
}

export function buildSessionReviewQueues(katas: Kata[], attempts: Attempt[]): {
  retryFailed: ReviewQueue;
  reviewSlow: ReviewQueue;
  repeatAll: ReviewQueue;
} {
  const byIndex = attemptByIndex(attempts);
  const failed = katas.filter((_, index) => byIndex.get(index)?.passed !== true);
  const passedWithTime = katas
    .map((kata, index) => ({ kata, attempt: byIndex.get(index) }))
    .filter((row): row is { kata: Kata; attempt: Attempt } => row.attempt?.passed === true && row.attempt.timeMs != null)
    .sort((a, b) => (b.attempt.timeMs ?? 0) - (a.attempt.timeMs ?? 0));

  const averagePassedTime = passedWithTime.length
    ? passedWithTime.reduce((sum, row) => sum + (row.attempt.timeMs ?? 0), 0) / passedWithTime.length
    : 0;
  const slow = passedWithTime
    .filter((row) => (row.attempt.timeMs ?? 0) >= averagePassedTime)
    .map((row) => row.kata);

  return {
    retryFailed: {
      label: "Retry failed",
      description: "Start a new queue with failed and skipped problems from this session.",
      katas: failed,
    },
    reviewSlow: {
      label: "Review slow solves",
      description: "Replay passed problems that took longer than your session average.",
      katas: slow,
    },
    repeatAll: {
      label: "Repeat session",
      description: "Run the same problem list again in the same order.",
      katas,
    },
  };
}
