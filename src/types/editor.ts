import type { AppThemeId } from "../lib/editor-themes";

export type AppTheme = AppThemeId;

export interface Kata {
  id: number;
  name: string;
  category: string;
  language: string;
  difficulty: string | null;
  description: string | null;
  code: string;
  testCode: string;
  solution: string | null;
  solutionVariants?: SolutionVariant[] | null;
  usage: string | null;
  tags: string[];
  isCustom: boolean;
  /**
   * LeetCode problem number, or null for katas that are not LeetCode problems.
   * Resolved from src/lib/leetcode-numbers.ts at seed time — SeedKata source
   * objects do not carry it, so it is optional here.
   */
  leetcodeNumber?: number | null;
}

export type SeedKata = Omit<Kata, "id" | "isCustom">;

export interface SolutionVariant {
  label: string;
  complexity?: string;
  explanation?: string;
  code: string;
}

export type TimerStatus = "idle" | "running" | "paused" | "completed";

export interface EditorSettings {
  theme: AppTheme;
  vimMode: boolean;
  fontSize: number;
  currentKataId: number;
}

export interface TestResult {
  name: string;
  passed: boolean;
  errorKind?: "assertion" | "syntax" | "runtime" | "timeout" | "runner";
  error?: string;
  output?: string;
  expected?: string;
  got?: string;
  traceback?: string;
  errorSource?: "user" | "tests" | "runner";
  lineNumber?: number;
  /**
   * Source text of the assertion that failed, e.g.
   * `assertEqual(twoSum([2, 7, 11], 9), [0, 1])`. This is where the failing
   * inputs are written down, so it is the one thing you need to reproduce a
   * failure. Absent when the line cannot be resolved.
   */
  input?: string;
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
  maxTestRuns: number | null;
  kataIds?: number[] | null;
}

export interface Attempt {
  id: number;
  sessionId: number;
  kataId: number;
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
  kataIds: number[];
}
