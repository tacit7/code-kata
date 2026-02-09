export type AppTheme = "dark" | "light";

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
