import { useRef, useEffect, useState, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { initVimMode, type VimAdapterInstance } from "monaco-vim";
import { useSettingsStore } from "../stores/settings-store";
import { useTimerStore } from "../stores/timer-store";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { runTests } from "../lib/test-runner";
import { saveUserCode, loadUserCode, deleteUserCode } from "../lib/database";
import { TestOutput } from "./test-output";
import type { Kata, TestResult } from "../types/editor";

interface KataEditorProps {
  kata: Kata;
  isSession?: boolean;
  onTestComplete?: (passed: boolean, codeSnapshot: string) => void;
}

export function KataEditor({ kata, isSession, onTestComplete }: KataEditorProps) {
  const { theme, vimMode, toggleVimMode, toggleTheme, fontSize, fontFamily, tabSize, hideDescriptionInSession, setSetting } = useSettingsStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const vimModeRef = useRef<VimAdapterInstance | null>(null);
  const statusBarRef = useRef<HTMLDivElement | null>(null);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [ranAt, setRanAt] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [showPanel, setShowPanel] = useState<"description" | "solution" | null>(
    isSession && hideDescriptionInSession ? null : kata.description ? "description" : null
  );
  const [editorReady, setEditorReady] = useState(false);
  const [panelWidth, setPanelWidth] = useState(380);
  const dragging = useRef(false);
  const [saved, setSaved] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [codeLoaded, setCodeLoaded] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monacoTheme = theme === "dark" ? "vs-dark" : "vs";

  // Load saved user code on mount; clean up autosave timer on unmount
  useEffect(() => {
    setCodeLoaded(false);
    loadUserCode(kata.id).then((code) => {
      setSavedCode(code);
      setCodeLoaded(true);
      setSaved(true);
    });
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [kata.id]);

  const handleEditorMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
    setEditorReady(true);
  };

  const { kataStatus, startKataTimer, completeKataTimer } =
    useTimerStore();

  const handleReset = useCallback(async () => {
    if (!editorRef.current) return;
    editorRef.current.setValue(kata.code);
    await deleteUserCode(kata.id);
    setSaved(true);
  }, [kata.id, kata.code]);

  const handleRun = useCallback(async () => {
    if (!editorRef.current || running) return;
    if (kataStatus === "idle") startKataTimer();
    setRunning(true);
    try {
      const code = editorRef.current.getValue();
      // Auto-save on run
      await saveUserCode(kata.id, code);
      setSaved(true);
      const testResults = await runTests(code, kata.testCode, kata.language);
      setResults(testResults);
      setRanAt(new Date().toLocaleTimeString());
      const allPassed = testResults.length > 0 && testResults.every((r) => r.passed);
      if (allPassed) {
        completeKataTimer();
      }
      if (onTestComplete) {
        onTestComplete(allPassed, code);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setResults([{ name: "Runner error", passed: false, error: msg }]);
      setRanAt(new Date().toLocaleTimeString());
    } finally {
      setRunning(false);
    }
  }, [kata.id, kata.testCode, kata.language, kataStatus, running, startKataTimer, completeKataTimer, onTestComplete]);

  const handleToggleSolution = useCallback(() => {
    setShowPanel((v) => (v === "solution" ? null : "solution"));
  }, []);

  useKeyboardShortcuts({
    runTests: handleRun,
    toggleSolution: handleToggleSolution,
  });

  // Vim mode lifecycle
  useEffect(() => {
    if (!editorReady || !editorRef.current || !statusBarRef.current) return;

    if (vimMode) {
      vimModeRef.current = initVimMode(editorRef.current, statusBarRef.current);
    }

    return () => {
      vimModeRef.current?.dispose();
      vimModeRef.current = null;
    };
  }, [vimMode, editorReady]);

  // Gutter drag to resize side panel
  const onGutterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const startX = e.clientX;
    const startWidth = panelWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX;
      setPanelWidth(Math.max(200, Math.min(800, startWidth + delta)));
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [panelWidth]);

  const hasTabs = !!(kata.description || kata.solution);

  const tabClass = (tab: typeof showPanel) =>
    `px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
      showPanel === tab
        ? "border-blue-500 text-blue-600 dark:text-blue-400"
        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
    }`;

  if (!codeLoaded) return null;

  const initialCode = savedCode ?? kata.code;

  return (
    <div className="flex h-full">
      {/* Side panel: tabs + content (full height) */}
      {hasTabs && (
        <div
          className="shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
          style={showPanel ? { width: panelWidth } : undefined}
        >
          {/* Tab bar */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-700 shrink-0">
            {kata.description && (
              <button
                onClick={() => setShowPanel((v) => v === "description" ? null : "description")}
                className={tabClass("description")}
              >
                Problem
              </button>
            )}
{kata.solution && (
              <button
                onClick={() => setShowPanel((v) => v === "solution" ? null : "solution")}
                className={tabClass("solution")}
              >
                Solution
              </button>
            )}
          </div>

          {/* Tab content */}
          {showPanel && showPanel !== "solution" && (
            <div className="flex-1 overflow-y-auto px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {showPanel === "description" && (kata.description || "No description available.")}
            </div>
          )}
          {showPanel === "solution" && kata.solution && (
            <div className="flex-1 min-h-0">
              <Editor
                value={kata.solution}
                language={kata.language}
                theme={monacoTheme}
                options={{
                  fontSize,
                  fontFamily,
                  tabSize,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  readOnly: true,
                  lineNumbers: "off",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Gutter (drag handle) */}
      {hasTabs && showPanel && (
        <div
          onMouseDown={onGutterMouseDown}
          className="w-1 shrink-0 cursor-col-resize bg-zinc-200 dark:bg-zinc-700 hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors"
        />
      )}

      {/* Editor + results column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Editor header */}
        <div className="flex items-center px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 shrink-0">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex-1">
            {kata.name}
          </span>
          <div className="flex items-center gap-1.5 ml-2 relative">
            <button
              onClick={handleReset}
              title="Reset to original"
              className="px-1.5 py-0.5 text-xs rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              ↻
            </button>
            <button
              onClick={() => setShowConfig((v) => !v)}
              title="Editor settings"
              className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                showConfig
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              ⚙
            </button>
            {showConfig && (
              <div className="absolute top-full right-0 mt-1 z-50 w-56 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg py-2 px-3 flex flex-col gap-2.5">
                {/* Font size */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">font size</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setSetting("fontSize", Math.max(10, fontSize - 1))} className="w-5 h-5 flex items-center justify-center rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600">−</button>
                    <span className="text-xs font-mono w-5 text-center">{fontSize}</span>
                    <button onClick={() => setSetting("fontSize", Math.min(28, fontSize + 1))} className="w-5 h-5 flex items-center justify-center rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600">+</button>
                  </div>
                </div>
                {/* Vim mode */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">vim mode</span>
                  <button
                    onClick={toggleVimMode}
                    className={`w-9 h-5 rounded-full relative transition-colors ${vimMode ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${vimMode ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                </div>
                {/* Dark mode */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">dark mode</span>
                  <button
                    onClick={toggleTheme}
                    className={`w-9 h-5 rounded-full relative transition-colors ${theme === "dark" ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monaco editor */}
        <div className={`${results ? "flex-[2]" : "flex-1"} min-h-0`}>
          <Editor
            key={kata.id}
            defaultValue={initialCode}
            language={kata.language}
            theme={monacoTheme}
            options={{
              fontSize,
              fontFamily,
              tabSize,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
            onMount={handleEditorMount}
            onChange={() => {
              setSaved(false);
              if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
              autosaveTimer.current = setTimeout(() => {
                const code = editorRef.current?.getValue();
                if (code != null) {
                  saveUserCode(kata.id, code).then(() => setSaved(true));
                }
              }, 1500);
            }}
          />
        </div>

        {/* Status bar: saved indicator + vim + run buttons */}
        <div className="flex items-center px-3 h-7 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0">
          <span className={`text-xs ${saved ? "text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}>
            {saved ? "• saved" : "• unsaved"}
          </span>
          <div
            ref={statusBarRef}
            className={`flex-1 px-4 text-xs font-mono text-zinc-600 dark:text-zinc-400 ${
              vimMode ? "" : "invisible"
            }`}
          />
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleVimMode}
              className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                vimMode
                  ? "bg-green-600 text-white"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              VIM
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="px-3 py-0.5 text-xs font-medium rounded bg-emerald-400 text-zinc-900 hover:bg-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? "..." : "▷ run"}
            </button>
          </div>
        </div>

        {/* Closable results pane */}
        {(results || running) && (
          <div className="flex-1 min-h-0 flex flex-col border-t border-zinc-200 dark:border-zinc-700">
            {/* Results header */}
            <div className="flex items-center px-3 py-1 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0">
              <button
                onClick={() => { if (!running) setResults(null); }}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors mr-2"
              >
                ✕
              </button>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {running ? "running..." : "results"}
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {running ? (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                  Running tests...
                </div>
              ) : results ? (
                <TestOutput results={results} ranAt={ranAt} />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
