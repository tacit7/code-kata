import { useRef, useEffect, useState, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { initVimMode, type VimAdapterInstance } from "monaco-vim";
import { useEditorStore } from "../stores/editor-store";
import { useTimerStore } from "../stores/timer-store";
import { runTests } from "../lib/test-runner";
import { TestOutput } from "./test-output";
import { TimerDisplay } from "./timer-display";
import type { Kata, TestResult } from "../types/editor";

interface KataEditorProps {
  kata: Kata;
}

export function KataEditor({ kata }: KataEditorProps) {
  const { theme, vimMode, fontSize } = useEditorStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const vimModeRef = useRef<VimAdapterInstance | null>(null);
  const statusBarRef = useRef<HTMLDivElement | null>(null);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const monacoTheme = theme === "dark" ? "vs-dark" : "vs";

  const handleEditorMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
  };

  const { kataStatus, startKataTimer, completeKataTimer, resetKataTimer } =
    useTimerStore();

  useEffect(() => {
    resetKataTimer();
  }, [kata.id, resetKataTimer]);

  const handleRun = useCallback(() => {
    if (!editorRef.current) return;
    if (kataStatus === "idle") startKataTimer();
    const code = editorRef.current.getValue();
    const testResults = runTests(code, kata.testCode);
    setResults(testResults);
    if (testResults.length > 0 && testResults.every((r) => r.passed)) {
      completeKataTimer();
    }
  }, [kata.testCode, kataStatus, startKataTimer, completeKataTimer]);

  // Vim mode lifecycle
  useEffect(() => {
    if (!editorRef.current || !statusBarRef.current) return;

    if (vimMode) {
      vimModeRef.current = initVimMode(editorRef.current, statusBarRef.current);
    }

    return () => {
      vimModeRef.current?.dispose();
      vimModeRef.current = null;
    };
  }, [vimMode]);

  return (
    <div className="flex flex-col h-full">
      {/* Editor + Solution side-by-side */}
      <div className={`flex ${results ? "h-[65%]" : "flex-1"} min-h-0`}>
        <div className={showSolution ? "w-1/2 min-w-0" : "w-full min-w-0"}>
          <Editor
            key={kata.id}
            defaultValue={kata.code}
            language={kata.language}
            theme={monacoTheme}
            options={{
              fontSize,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
            onMount={handleEditorMount}
          />
        </div>
        {showSolution && kata.solution && (
          <div className="w-1/2 min-w-0 border-l border-zinc-200 dark:border-zinc-700">
            <Editor
              value={kata.solution}
              language={kata.language}
              theme={monacoTheme}
              options={{
                fontSize,
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

      {/* Vim status bar */}
      <div
        ref={statusBarRef}
        className={`h-6 px-2 text-xs font-mono leading-6 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700 shrink-0 ${
          vimMode ? "" : "invisible"
        }`}
      />

      {/* Run toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0">
        <button
          onClick={handleRun}
          className="px-3 py-1 text-xs font-medium rounded bg-green-600 hover:bg-green-500 text-white transition-colors"
        >
          Run
        </button>
        {kata.solution && (
          <button
            onClick={() => setShowSolution((v) => !v)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              showSolution
                ? "bg-amber-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Solution
          </button>
        )}
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {kata.name}
        </span>
        <div className="ml-auto">
          <TimerDisplay />
        </div>
      </div>

      {/* Test output */}
      {results && (
        <div className="h-[25%] min-h-0 border-t border-zinc-200 dark:border-zinc-700">
          <TestOutput results={results} />
        </div>
      )}
    </div>
  );
}
