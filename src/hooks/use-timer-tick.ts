import { useState, useEffect } from "react";
import { useTimerStore } from "../stores/timer-store";

export function useTimerTick(): { kataElapsed: number; sessionElapsed: number } {
  const [elapsed, setElapsed] = useState({ kataElapsed: 0, sessionElapsed: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useTimerStore.getState();

      const kataElapsed =
        state.kataStatus === "running" && state.kataStartTime
          ? state.kataElapsed + (Date.now() - state.kataStartTime)
          : state.kataElapsed;

      const sessionElapsed =
        state.sessionActive && state.sessionStartTime
          ? Date.now() - state.sessionStartTime
          : state.sessionElapsed;

      setElapsed({ kataElapsed, sessionElapsed });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return elapsed;
}
