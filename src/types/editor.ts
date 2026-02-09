export type AppTheme = "dark" | "light";

export interface Kata {
  id: string;
  name: string;
  category: string;
  language: string;
  difficulty: string | null;
  description: string | null;
  code: string;
  testCode: string;
  solution: string | null;
  usage: string | null;
}

export type TimerStatus = "idle" | "running" | "paused" | "completed";

export interface EditorSettings {
  theme: AppTheme;
  vimMode: boolean;
  fontSize: number;
  currentKataId: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export type SessionType = "daily" | "random" | "custom";

export interface Session {
  id: number;
  sessionType: SessionType;
  startedAt: string;
  finishedAt: string | null;
  totalTimeMs: number | null;
  kataCount: number;
  passCount: number;
  presetName: string | null;
}

export interface Attempt {
  id: number;
  sessionId: number;
  kataId: string;
  kataIndex: number;
  startedAt: string;
  finishedAt: string | null;
  timeMs: number | null;
  passed: boolean;
  codeSnapshot: string | null;
}

export interface Preset {
  id: number;
  name: string;
  kataIds: string[];
}
