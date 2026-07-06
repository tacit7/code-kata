import { describe, it, expect } from "vitest";
import { computeSrState, formatDue, SR_INTERVALS } from "./sr";

const DAY = 86_400_000;
const NOW = new Date("2026-07-06T12:00:00Z").getTime();
const at = (daysAgo: number) => new Date(NOW - daysAgo * DAY).toISOString();

describe("computeSrState", () => {
  it("never attempted -> new, max urgency", () => {
    const s = computeSrState(undefined, NOW);
    expect(s.status).toBe("new");
    expect(s.score).toBe(10);
  });
  it("last failed -> failed, due immediately", () => {
    const s = computeSrState([{ passed: 1, started_at: at(10) }, { passed: 0, started_at: at(2) }], NOW);
    expect(s.status).toBe("failed");
    expect(s.dueAt).toBeNull();
    expect(s.score).toBeGreaterThan(8);
  });
  it("streak of 1 pass -> 1-day interval", () => {
    const s = computeSrState([{ passed: 1, started_at: at(0.5) }], NOW);
    expect(s.intervalDays).toBe(1);
    expect(s.status).toBe("scheduled");
  });
  it("longer streaks climb the ladder", () => {
    const history = [3, 2, 1, 0.5].map((d) => ({ passed: 1, started_at: at(d) }));
    const s = computeSrState(history, NOW);
    expect(s.intervalDays).toBe(SR_INTERVALS[3]); // 4-pass streak -> 14d
  });
  it("fail resets the streak", () => {
    const history = [
      { passed: 1, started_at: at(30) },
      { passed: 1, started_at: at(20) },
      { passed: 0, started_at: at(10) },
      { passed: 1, started_at: at(0.2) },
    ];
    expect(computeSrState(history, NOW).intervalDays).toBe(1);
  });
  it("past due date -> due, score grows with overdue days", () => {
    const s = computeSrState([{ passed: 1, started_at: at(4) }], NOW); // 1d interval, 3d overdue
    expect(s.status).toBe("due");
    expect(s.overdueDays).toBe(3);
    expect(s.score).toBe(5);
  });
  it("scheduled scores below any due item", () => {
    const s = computeSrState([{ passed: 1, started_at: at(0.1) }], NOW);
    expect(s.score).toBeLessThan(0.5);
  });
});

describe("formatDue", () => {
  it("labels states", () => {
    expect(formatDue(computeSrState(undefined, NOW), NOW)).toBe("due now");
    expect(formatDue(computeSrState([{ passed: 1, started_at: at(4) }], NOW), NOW)).toBe("overdue 3d");
    expect(formatDue(computeSrState([{ passed: 1, started_at: at(0.1) }], NOW), NOW)).toBe("due in 1d");
  });
});
