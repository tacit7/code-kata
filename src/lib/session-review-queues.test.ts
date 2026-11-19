import { describe, expect, it } from "vitest";
import { buildSessionReviewQueues } from "./session-review-queues";
import type { Attempt, Kata } from "../types/editor";

const kata = (id: number, name: string): Kata => ({
  id,
  name,
  category: "arrays",
  language: "python",
  difficulty: "easy",
  description: null,
  code: "",
  testCode: "",
  solution: null,
  usage: null,
  tags: [],
  isCustom: false,
});

const attempt = (kataId: number, kataIndex: number, passed: boolean, timeMs: number | null): Attempt => ({
  id: kataIndex + 1,
  sessionId: 1,
  kataId,
  kataIndex,
  startedAt: "2026-08-16T00:00:00.000Z",
  finishedAt: "2026-08-16T00:00:01.000Z",
  timeMs,
  passed,
  codeSnapshot: "",
});

describe("buildSessionReviewQueues", () => {
  it("builds failed, slow, and repeat queues from session attempts", () => {
    const katas = [kata(1, "Fast Pass"), kata(2, "Slow Pass"), kata(3, "Failed"), kata(4, "Skipped")];
    const queues = buildSessionReviewQueues(katas, [
      attempt(1, 0, true, 20_000),
      attempt(2, 1, true, 80_000),
      attempt(3, 2, false, 10_000),
    ]);

    expect(queues.retryFailed.katas.map((row) => row.name)).toEqual(["Failed", "Skipped"]);
    expect(queues.reviewSlow.katas.map((row) => row.name)).toEqual(["Slow Pass"]);
    expect(queues.repeatAll.katas.map((row) => row.name)).toEqual(["Fast Pass", "Slow Pass", "Failed", "Skipped"]);
  });
});
