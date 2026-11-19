import type * as monacoNs from "monaco-editor";
// Theme data vendored from monaco-themes (MIT) — its exports map doesn't
// expose the JSON subpaths for direct import.
import dracula from "./themes/dracula.json";
import monokai from "./themes/monokai.json";
import githubDark from "./themes/github-dark.json";
import nightOwl from "./themes/night-owl.json";
import nord from "./themes/nord.json";
import tokyoNight from "./themes/tokyo-night.json";
import githubLight from "./themes/github-light.json";
import solarizedLight from "./themes/solarized-light.json";

// One theme drives BOTH the app chrome (daisyUI data-theme, defined in
// index.css with base-100 matching each Monaco editor.background) and the
// Monaco editor. "dark"/"light" are the built-in app themes.
export const APP_THEMES = [
  { id: "dark", label: "Dark", monaco: "vs-dark", scheme: "dark" },
  { id: "light", label: "Light", monaco: "vs", scheme: "light" },
  { id: "dracula", label: "Dracula", monaco: "dracula", scheme: "dark" },
  { id: "monokai", label: "Monokai", monaco: "monokai", scheme: "dark" },
  { id: "github-dark", label: "GitHub Dark", monaco: "github-dark", scheme: "dark" },
  { id: "night-owl", label: "Night Owl", monaco: "night-owl", scheme: "dark" },
  { id: "nord", label: "Nord", monaco: "nord", scheme: "dark" },
  { id: "tokyo-night", label: "Tokyo Night", monaco: "tokyo-night", scheme: "dark" },
  { id: "github-light", label: "GitHub Light", monaco: "github-light", scheme: "light" },
  { id: "solarized-light", label: "Solarized Light", monaco: "solarized-light", scheme: "light" },
] as const;

export type AppThemeId = (typeof APP_THEMES)[number]["id"];

export function isDarkScheme(theme: AppThemeId): boolean {
  return APP_THEMES.find((t) => t.id === theme)?.scheme === "dark";
}

const THEME_DATA: Record<string, unknown> = {
  dracula,
  monokai,
  "github-dark": githubDark,
  "night-owl": nightOwl,
  nord,
  "tokyo-night": tokyoNight,
  "github-light": githubLight,
  "solarized-light": solarizedLight,
};

export function isAppThemeId(v: unknown): v is AppThemeId {
  return typeof v === "string" && APP_THEMES.some((t) => t.id === v);
}

export function registerEditorThemes(monaco: typeof monacoNs): void {
  for (const [id, data] of Object.entries(THEME_DATA)) {
    monaco.editor.defineTheme(id, data as monacoNs.editor.IStandaloneThemeData);
  }
}

export function resolveMonacoTheme(theme: AppThemeId): string {
  return APP_THEMES.find((t) => t.id === theme)?.monaco ?? "vs-dark";
}
