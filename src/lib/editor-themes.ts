import type * as monacoNs from "monaco-editor";
// Theme data vendored from monaco-themes (MIT) — its exports map doesn't
// expose the JSON subpaths for direct import.
import dracula from "./themes/dracula.json";
import monokai from "./themes/monokai.json";
import githubDark from "./themes/github-dark.json";
import nightOwl from "./themes/night-owl.json";
import nord from "./themes/nord.json";

// "auto" follows the app theme (vs-dark / vs); the rest are fixed looks.
export const EDITOR_THEMES = [
  { id: "auto", label: "Auto (match app)" },
  { id: "dracula", label: "Dracula" },
  { id: "monokai", label: "Monokai" },
  { id: "github-dark", label: "GitHub Dark" },
  { id: "night-owl", label: "Night Owl" },
  { id: "nord", label: "Nord" },
] as const;

export type EditorThemeId = (typeof EDITOR_THEMES)[number]["id"];

const THEME_DATA: Record<Exclude<EditorThemeId, "auto">, unknown> = {
  dracula,
  monokai,
  "github-dark": githubDark,
  "night-owl": nightOwl,
  nord,
};

export function isEditorThemeId(v: unknown): v is EditorThemeId {
  return typeof v === "string" && EDITOR_THEMES.some((t) => t.id === v);
}

export function registerEditorThemes(monaco: typeof monacoNs): void {
  for (const [id, data] of Object.entries(THEME_DATA)) {
    monaco.editor.defineTheme(id, data as monacoNs.editor.IStandaloneThemeData);
  }
}

export function resolveMonacoTheme(editorTheme: EditorThemeId, appTheme: "dark" | "light"): string {
  if (editorTheme === "auto") return appTheme === "dark" ? "vs-dark" : "vs";
  return editorTheme;
}
