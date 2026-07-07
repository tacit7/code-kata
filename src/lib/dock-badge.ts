import { getCurrentWindow } from "@tauri-apps/api/window";
import { getDb } from "./database";
import { computeSrState } from "./sr";

export async function updateDockBadge(dueCount: number): Promise<void> {
  try {
    await getCurrentWindow().setBadgeCount(dueCount === 0 ? undefined : dueCount);
  } catch {
    // no-op in browsers or when permission is unavailable
  }
}

// Recomputes the SR due count (failed + overdue among practiced katas) and
// updates the dock badge. Best-effort: callers may fire-and-forget.
export async function refreshDockBadge(): Promise<void> {
  try {
    const db = await getDb();
    const rows = await db.select<{ kata_id: number; passed: number; started_at: string }[]>(
      "SELECT kata_id, passed, started_at FROM attempts ORDER BY started_at ASC",
    );
    const byKata = new Map<number, { passed: number; started_at: string }[]>();
    for (const r of rows) {
      const list = byKata.get(r.kata_id) ?? [];
      list.push(r);
      byKata.set(r.kata_id, list);
    }
    let dueCount = 0;
    for (const history of byKata.values()) {
      if (computeSrState(history).status !== "scheduled") dueCount++;
    }
    await updateDockBadge(dueCount);
  } catch {
    // badge is best-effort
  }
}
