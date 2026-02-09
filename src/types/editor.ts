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
