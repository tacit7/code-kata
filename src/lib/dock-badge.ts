import { getCurrentWindow } from "@tauri-apps/api/window";

export async function updateDockBadge(dueCount: number): Promise<void> {
  try {
    await getCurrentWindow().setBadgeCount(dueCount === 0 ? undefined : dueCount);
  } catch {
    // no-op in browsers or when permission is unavailable
  }
}
