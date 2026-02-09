import { useEditorStore } from "../stores/editor-store";

export function TopBar() {
  const { theme, vimMode, toggleTheme, toggleVimMode } = useEditorStore();

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
      <span className="text-sm font-semibold tracking-tight">Kata Desktop</span>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleVimMode}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            vimMode
              ? "bg-green-600 text-white"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
          }`}
        >
          VIM
        </button>
        <button
          onClick={toggleTheme}
          className="px-2.5 py-1 text-xs font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}
