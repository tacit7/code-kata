import { useTimerTick } from "../hooks/use-timer-tick";
import { useTimerStore } from "../stores/timer-store";
import { formatTime } from "../lib/format";

const kataStatusColor = {
  idle: "text-base-content/40",
  running: "text-success",
  paused: "text-warning",
  completed: "text-success",
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
      <span className="font-mono text-xs text-base-content/35">
        {formatTime(sessionElapsed)}
      </span>

      {/* Pause / Resume */}
      {(kataStatus === "running" || kataStatus === "paused") && (
        <button
          onClick={kataStatus === "running" ? pauseKataTimer : resumeKataTimer}
          className="btn btn-ghost btn-xs"
        >
          {kataStatus === "running" ? "Pause" : "Resume"}
        </button>
      )}

      {/* Reset */}
      {kataStatus !== "idle" && (
        <button
          onClick={resetKataTimer}
          className="btn btn-ghost btn-xs text-base-content/40 hover:text-base-content/70"
        >
          Reset
        </button>
      )}
    </div>
  );
}
