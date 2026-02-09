import { create } from "zustand";
import type { TimerStatus } from "../types/editor";

interface TimerState {
  kataStartTime: number | null;
  kataElapsed: number;
  kataStatus: TimerStatus;
  sessionStartTime: number | null;
  sessionElapsed: number;
  sessionActive: boolean;

  startKataTimer: () => void;
  pauseKataTimer: () => void;
  resumeKataTimer: () => void;
  completeKataTimer: () => void;
  resetKataTimer: () => void;
  startSessionTimer: () => void;
  stopSessionTimer: () => number;
}

const STORAGE_KEY = "kata-timer-state";

interface PersistedState {
  kataStartTime: number | null;
  kataElapsed: number;
  kataStatus: TimerStatus;
  sessionStartTime: number | null;
  sessionElapsed: number;
  sessionActive: boolean;
}

function loadState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedState;
  } catch {
    return {};
  }
}

function saveState(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function persistFrom(state: TimerState) {
  saveState({
    kataStartTime: state.kataStartTime,
    kataElapsed: state.kataElapsed,
    kataStatus: state.kataStatus,
    sessionStartTime: state.sessionStartTime,
    sessionElapsed: state.sessionElapsed,
    sessionActive: state.sessionActive,
  });
}

const saved = loadState();

export const useTimerStore = create<TimerState>((set) => ({
  kataStartTime: saved.kataStartTime ?? null,
  kataElapsed: saved.kataElapsed ?? 0,
  kataStatus: saved.kataStatus ?? "idle",
  sessionStartTime: saved.sessionStartTime ?? null,
  sessionElapsed: saved.sessionElapsed ?? 0,
  sessionActive: saved.sessionActive ?? false,

  startKataTimer: () =>
    set((state) => {
      const now = Date.now();
      const next = {
        ...state,
        kataStartTime: now,
        kataElapsed: 0,
        kataStatus: "running" as const,
        sessionStartTime: state.sessionActive ? state.sessionStartTime : now,
        sessionElapsed: state.sessionActive ? state.sessionElapsed : 0,
        sessionActive: true,
      };
      persistFrom(next);
      return next;
    }),

  pauseKataTimer: () =>
    set((state) => {
      if (state.kataStatus !== "running" || !state.kataStartTime) return state;
      const elapsed = state.kataElapsed + (Date.now() - state.kataStartTime);
      const next = {
        ...state,
        kataStartTime: null,
        kataElapsed: elapsed,
        kataStatus: "paused" as const,
      };
      persistFrom(next);
      return next;
    }),

  resumeKataTimer: () =>
    set((state) => {
      if (state.kataStatus !== "paused") return state;
      const next = {
        ...state,
        kataStartTime: Date.now(),
        kataStatus: "running" as const,
      };
      persistFrom(next);
      return next;
    }),

  completeKataTimer: () =>
    set((state) => {
      if (state.kataStatus !== "running" && state.kataStatus !== "paused")
        return state;
      const elapsed =
        state.kataStatus === "running" && state.kataStartTime
          ? state.kataElapsed + (Date.now() - state.kataStartTime)
          : state.kataElapsed;
      const next = {
        ...state,
        kataStartTime: null,
        kataElapsed: elapsed,
        kataStatus: "completed" as const,
      };
      persistFrom(next);
      return next;
    }),

  resetKataTimer: () =>
    set((state) => {
      const next = {
        ...state,
        kataStartTime: null,
        kataElapsed: 0,
        kataStatus: "idle" as const,
      };
      persistFrom(next);
      return next;
    }),

  startSessionTimer: () =>
    set((state) => {
      const now = Date.now();
      const next = {
        ...state,
        sessionStartTime: now,
        sessionElapsed: 0,
        sessionActive: true,
      };
      persistFrom(next);
      return next;
    }),

  stopSessionTimer: (): number => {
    let elapsed = 0;
    set((state) => {
      elapsed =
        state.sessionActive && state.sessionStartTime
          ? Date.now() - state.sessionStartTime
          : state.sessionElapsed;
      const next = {
        ...state,
        sessionStartTime: null,
        sessionElapsed: elapsed,
        sessionActive: false,
      };
      persistFrom(next);
      return next;
    });
    return elapsed;
  },
}));
