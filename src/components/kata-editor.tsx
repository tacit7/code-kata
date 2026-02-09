import { useRef, useEffect, useState, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { initVimMode, type VimAdapterInstance } from "monaco-vim";
import { useEditorStore } from "../stores/editor-store";
import { sampleKatas } from "../lib/sample-katas";
import { runTests } from "../lib/test-runner";
import { TestOutput } from "./test-output";
import type { TestResult } from "../types/editor";

interface KataEditorProps {
  kataId: string;
}

export function KataEditor({ kataId }: KataEditorProps) {
  const { theme, vimMode, fontSize } = useEditorStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const vimModeRef = useRef<VimAdapterInstance | null>(null);
  const statusBarRef = useRef<HTMLDivElement | null>(null);
  const [results, setResults] = useState<TestResult[] | null>(null);

  const kata = sampleKatas[kataId] ?? sampleKatas["two-sum"];
  const monacoTheme = theme === "dark" ? "vs-dark" : "vs";

  const handleEditorMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
  };

  const handleRun = useCallback(() => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    setResults(runTests(code, kata.testCode));
  }, [kata.testCode]);

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
      {/* Editor */}
      <div className={results ? "h-[65%] min-h-0" : "flex-1 min-h-0"}>
        <Editor
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
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {kata.name}
        </span>
      </div>

      {/* Test output */}
      {results && (
        <div className="h-[30%] min-h-0 border-t border-zinc-200 dark:border-zinc-700">
          <TestOutput results={results} />
        </div>
      )}
    </div>
  );
}
