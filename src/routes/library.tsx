import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useKataStore } from "../stores/kata-store";
import { useSettingsStore } from "../stores/settings-store";
import { useSessionStore } from "../stores/session-store";
import { useTimerStore } from "../stores/timer-store";

export function LibraryPage() {
  const katas = useKataStore((s) => s.katas);
  const bestTimes = useKataStore((s) => s.bestTimes);
  const streaks = useKataStore((s) => s.streaks);
  const deleteKata = useKataStore((s) => s.deleteKata);
  const dailyKataIds = useSettingsStore((s) => s.dailyKataIds);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const startSession = useSessionStore((s) => s.startSession);
  const startSessionTimer = useTimerStore((s) => s.startSessionTimer);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const [search, setSearch] = useState("");
  const [launching, setLaunching] = useState(false);
  const [diffSort, setDiffSort] = useState<"asc" | "desc" | null>(null);
  const navigate = useNavigate();

  const kataIdSet = new Set(katas.map((k) => k.id));
  const dailyCount = dailyKataIds.filter((id) => kataIdSet.has(id)).length;

  const toggleDaily = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = dailyKataIds.includes(id)
      ? dailyKataIds.filter((x) => x !== id)
      : [...dailyKataIds, id];
    setSetting("dailyKataIds", next);
  };

  const handleStartDaily = useCallback(async () => {
    if (dailyCount === 0) {
      navigate("/session/setup");
      return;
    }
    if (launching) return;
    setLaunching(true);
    const kataMap = new Map(katas.map((k) => [k.id, k]));
    const resolved = dailyKataIds.map((id) => kataMap.get(id)).filter(Boolean) as typeof katas;
    if (resolved.length === 0) {
      setLaunching(false);
      navigate("/session/setup");
      return;
    }
    resetKataTimer();
    startSessionTimer();
    const sessionId = await startSession("daily", resolved);
    navigate(`/session/${sessionId}`);
  }, [dailyKataIds, dailyCount, launching, katas, resetKataTimer, startSessionTimer, startSession, navigate]);

  const diffRank: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

  const q = search.toLowerCase();
  const filtered = katas.filter(
    (k) =>
      k.name.toLowerCase().includes(q) ||
      k.category.toLowerCase().includes(q) ||
      (k.difficulty?.toLowerCase().includes(q) ?? false) ||
      k.tags.some((t) => t.toLowerCase().includes(q))
  );

  const sorted = diffSort
    ? [...filtered].sort((a, b) => {
        const ra = diffRank[a.difficulty ?? ""] ?? 3;
        const rb = diffRank[b.difficulty ?? ""] ?? 3;
        return diffSort === "asc" ? ra - rb : rb - ra;
      })
    : filtered;

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search katas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 dark:focus:border-blue-400"
        />
        {/* TODO: premium feature — uncomment when ready
        <button
          onClick={() => navigate("/kata/new")}
          className="px-4 py-1.5 text-sm font-medium rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          + New Kata
        </button>
        */}
        <button
          onClick={handleStartDaily}
          disabled={launching}
          className="px-4 py-1.5 text-sm font-medium rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 transition-colors"
        >
          {launching
            ? "Launching..."
            : dailyCount > 0
              ? `Practice Daily (${dailyCount})`
              : "Set Up Daily Katas"}
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <th className="pb-2 w-8"></th>
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Category</th>
              <th
                className="pb-2 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                onClick={() => setDiffSort((v) => v === null ? "asc" : v === "asc" ? "desc" : null)}
              >
                Difficulty {diffSort === "asc" ? "▲" : diffSort === "desc" ? "▼" : ""}
              </th>
              <th className="pb-2 font-medium">Tags</th>
              <th className="pb-2 font-medium text-right">Best</th>
              <th className="pb-2 font-medium text-right">Streak</th>
              <th className="pb-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((kata) => (
              <tr
                key={kata.id}
                onClick={() => navigate(`/editor/${kata.id}`)}
                className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
              >
                <td className="py-2 w-8">
                  <button
                    onClick={(e) => toggleDaily(kata.id, e)}
                    className={`p-0.5 rounded transition-colors ${
                      dailyKataIds.includes(kata.id)
                        ? "text-amber-500"
                        : "text-zinc-300 dark:text-zinc-600 hover:text-amber-400"
                    }`}
                    title={dailyKataIds.includes(kata.id) ? "Remove from daily" : "Add to daily"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={dailyKataIds.includes(kata.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={dailyKataIds.includes(kata.id) ? 0 : 1.5} className={dailyKataIds.includes(kata.id) ? "w-5 h-5" : "w-4 h-4"}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                  </button>
                </td>
                <td className="py-2 font-medium">
                  {kata.name}
                  {kata.isCustom && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      Custom
                    </span>
                  )}
                </td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">{kata.category}</td>
                <td className="py-2">
                  <span className="px-1.5 py-0.5 text-xs rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {kata.difficulty ?? "—"}
                  </span>
                </td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {kata.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-2 text-right text-zinc-500 dark:text-zinc-400 tabular-nums">
                  {bestTimes[kata.id] != null
                    ? `${(bestTimes[kata.id] / 1000).toFixed(1)}s`
                    : "—"}
                </td>
                <td className="py-2 text-right text-zinc-500 dark:text-zinc-400 tabular-nums">
                  {streaks[kata.id] ? streaks[kata.id] : "—"}
                </td>
                <td className="py-2 text-right">
                  {kata.isCustom && (
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/kata/${kata.id}/edit`); }}
                        className="p-1 rounded text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit kata"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm("Delete this kata?")) deleteKata(kata.id); }}
                        className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Delete kata"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 1 .7.798l-.2 4.5a.75.75 0 0 1-1.496-.066l.2-4.5a.75.75 0 0 1 .796-.731ZM11.42 7.72a.75.75 0 0 1 .796.731l.2 4.5a.75.75 0 1 1-1.497.066l-.2-4.5a.75.75 0 0 1 .7-.798Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-400">
                  No katas found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
