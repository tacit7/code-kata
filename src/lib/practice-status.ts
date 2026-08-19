import type { SrState } from "./sr";

export type QueueKataStatus = "new" | "failed" | "slow" | "due" | "ok" | "done";

export function queueStatusForSr(sr: SrState, isDone: boolean): QueueKataStatus {
  if (isDone) return "done";
  if (sr.status === "new") return "new";
  if (sr.status === "failed") return "failed";
  if (sr.status === "due") return "due";
  return "ok";
}

export function isReviewStatus(status: QueueKataStatus): boolean {
  return status !== "ok" && status !== "done";
}
