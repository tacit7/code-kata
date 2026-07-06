// SM-2-lite spaced repetition, derived entirely from attempt history — no
// extra state table. Consecutive trailing passes pick the interval; a fail
// resets to the start of the ladder.

export interface AttemptRow {
  passed: number;
  started_at: string;
}

export type SrStatus = "new" | "failed" | "due" | "scheduled";

export interface SrState {
  status: SrStatus;
  /** Sort key — higher is more urgent. */
  score: number;
  /** Epoch ms when the kata comes due; null = due immediately (new/failed). */
  dueAt: number | null;
  intervalDays: number;
  overdueDays: number;
}

export const SR_INTERVALS = [1, 3, 7, 14, 30, 60];

const DAY_MS = 86_400_000;

export function computeSrState(history: AttemptRow[] | undefined, now = Date.now()): SrState {
  if (!history || history.length === 0) {
    return { status: "new", score: 10, dueAt: null, intervalDays: 0, overdueDays: 0 };
  }

  const last = history[history.length - 1];
  const lastAt = new Date(last.started_at).getTime();
  const daysSince = (now - lastAt) / DAY_MS;

  if (!last.passed) {
    // Failed: due immediately, urgency grows slowly the longer it sits.
    return {
      status: "failed",
      score: 8 + Math.min(daysSince / 7, 2),
      dueAt: null,
      intervalDays: 0,
      overdueDays: Math.floor(daysSince),
    };
  }

  let streak = 0;
  for (let i = history.length - 1; i >= 0 && history[i].passed; i--) streak++;
  const intervalDays = SR_INTERVALS[Math.min(streak - 1, SR_INTERVALS.length - 1)];
  const dueAt = lastAt + intervalDays * DAY_MS;

  if (now >= dueAt) {
    const overdueDays = Math.floor((now - dueAt) / DAY_MS);
    return { status: "due", score: 2 + Math.min(overdueDays, 4), dueAt, intervalDays, overdueDays };
  }

  // Scheduled for later: score stays below every due/failed/new item and
  // rises smoothly toward 0.5 as the due date approaches.
  const progress = (now - lastAt) / (dueAt - lastAt);
  return { status: "scheduled", score: 0.5 * progress, dueAt, intervalDays, overdueDays: 0 };
}

export function formatDue(state: SrState, now = Date.now()): string {
  if (state.status === "new") return "due now";
  if (state.status === "failed") return "due now";
  if (state.status === "due")
    return state.overdueDays === 0 ? "due today" : `overdue ${state.overdueDays}d`;
  const days = Math.ceil(((state.dueAt ?? now) - now) / DAY_MS);
  return `due in ${days}d`;
}
