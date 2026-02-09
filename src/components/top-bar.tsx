import { useNavigate, useLocation } from "react-router";
import { useEditorStore } from "../stores/editor-store";

export function TopBar() {
  const { theme, vimMode, toggleTheme, toggleVimMode } = useEditorStore();
  const navigate = useNavigate();
  const location = useLocation();
  const onLibrary = location.pathname === "/library";
  const onPractice = location.pathname.startsWith("/session");

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tracking-tight">Kata Desktop</span>
        <button
          onClick={() => navigate("/library")}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            onLibrary
              ? "bg-blue-600 text-white"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          }`}
        >
          Library
        </button>
        <button
          onClick={() => navigate("/session/setup")}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            onPractice
              ? "bg-blue-600 text-white"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          }`}
        >
          Practice
        </button>
      </div>
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
