import { useTimerTick } from "../hooks/use-timer-tick";
import { useTimerStore } from "../stores/timer-store";
import { formatTime } from "../lib/format";

const kataStatusColor = {
  idle: "text-zinc-400",
  running: "text-green-400",
  paused: "text-yellow-400",
  completed: "text-green-400",
} as const;

export function TimerDisplay() {
  const { kataElapsed, sessionElapsed } = useTimerTick();
  const kataStatus = useTimerStore((s) => s.kataStatus);
  const pauseKataTimer = useTimerStore((s) => s.pauseKataTimer);
  const resumeKataTimer = useTimerStore((s) => s.resumeKataTimer);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);

  return (
    <div className="flex items-center gap-3">
      {/* Kata timer */}
      <span className={`font-mono text-sm ${kataStatusColor[kataStatus]}`}>
        {formatTime(kataElapsed)}
      </span>

      {/* Session timer */}
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {formatTime(sessionElapsed)}
      </span>

      {/* Pause / Resume */}
      {(kataStatus === "running" || kataStatus === "paused") && (
        <button
          onClick={kataStatus === "running" ? pauseKataTimer : resumeKataTimer}
          className="px-2 py-0.5 text-xs rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
        >
          {kataStatus === "running" ? "Pause" : "Resume"}
        </button>
      )}

      {/* Reset */}
      {kataStatus !== "idle" && (
        <button
          onClick={resetKataTimer}
          className="px-2 py-0.5 text-xs rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}
