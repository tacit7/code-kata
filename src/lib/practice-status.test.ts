import { describe, expect, it } from "vitest";
import { isReviewStatus, queueStatusForSr } from "./practice-status";
import type { SrState } from "./sr";

function sr(status: SrState["status"]): SrState {
  return {
    status,
    score: 1,
    dueAt: null,
    intervalDays: 0,
    overdueDays: 0,
  };
}

describe("queueStatusForSr", () => {
  it("shows manually checked problems as done", () => {
    expect(queueStatusForSr(sr("new"), true)).toBe("done");
    expect(queueStatusForSr(sr("failed"), true)).toBe("done");
    expect(queueStatusForSr(sr("due"), true)).toBe("done");
    expect(queueStatusForSr(sr("scheduled"), true)).toBe("done");
  });

  it("keeps unchecked problems on their spaced-repetition status", () => {
    expect(queueStatusForSr(sr("new"), false)).toBe("new");
    expect(queueStatusForSr(sr("failed"), false)).toBe("failed");
    expect(queueStatusForSr(sr("due"), false)).toBe("due");
    expect(queueStatusForSr(sr("scheduled"), false)).toBe("ok");
  });
});

describe("isReviewStatus", () => {
  it("does not count done problems as due for review", () => {
    expect(isReviewStatus("done")).toBe(false);
    expect(isReviewStatus("ok")).toBe(false);
    expect(isReviewStatus("due")).toBe(true);
  });
});
