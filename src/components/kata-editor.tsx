import { useRef, useEffect, useState, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { initVimMode, type VimAdapterInstance } from "monaco-vim";
import { open } from "@tauri-apps/plugin-shell";
import { useSettingsStore } from "../stores/settings-store";
import { useTimerStore } from "../stores/timer-store";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { runTests } from "../lib/test-runner";
import { saveUserCode, loadUserCode, deleteUserCode, saveKataNotes, loadKataNotes } from "../lib/database";
import { TestOutput } from "./test-output";
import type { Kata, TestResult } from "../types/editor";

// Matches "Ref: LeetCode #123 Problem Name" at the end of a description
const LC_REF_RE = /Ref:\s*LeetCode\s*#(\d+)\s+(.+)$/m;

// Kata name → algo-viz subfolder served from /algo-viz/<folder>/index.html
const VIZ_MAP: Record<string, string> = {
  "Kadane's Algorithm":           "kadanes",
  "Min Cost Climbing Stairs":       "min-cost-stairs",
  "House Robber":                   "house-robber",
  "Median of Two Sorted Arrays":    "median-sorted-arrays",
  "Merge Two Sorted Lists":         "merge-sorted-lists",
  "Longest Palindromic Substring":  "manachers",
};

// Overrides for slugs that can't be reliably derived from the display name
const LC_SLUG_OVERRIDES: Record<number, string> = {
  50: "powx-n",
  167: "two-sum-ii-input-array-is-sorted",
};

function lcSlug(problemNum: number, rawName: string): string {
  if (LC_SLUG_OVERRIDES[problemNum]) return LC_SLUG_OVERRIDES[problemNum];
  return rawName
    .replace(/\s*\(closest match\)\s*/gi, " ") // strip annotation, keep real parens like "Pow(x, n)"
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "")
    .replace(/^-+/, "");
}

function DescriptionWithLink({ text }: { text: string }) {
  const match = text.match(LC_REF_RE);
  if (!match) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }
  const [fullMatch, numStr, problemName] = match;
  const slug = lcSlug(parseInt(numStr, 10), problemName.trim());
  const url = `https://leetcode.com/problems/${slug}/`;
  const before = text.slice(0, match.index);
  return (
    <span className="whitespace-pre-wrap">
      {before}
      <button
        onClick={() => open(url)}
        className="text-primary underline hover:text-primary/80 cursor-pointer"
        title={url}
      >
        {fullMatch}
      </button>
    </span>
  );
}

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
  const [showPanel, setShowPanel] = useState<"description" | "solution" | "notes" | "viz" | null>(
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
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(true);
  const notesAutosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monacoTheme = theme === "dark" ? "vs-dark" : "vs";

  // Load saved user code and notes on mount; clean up autosave timers on unmount
  useEffect(() => {
    setCodeLoaded(false);
    loadUserCode(kata.id).then((code) => {
      setSavedCode(code);
      setCodeLoaded(true);
      setSaved(true);
    });
    loadKataNotes(kata.id).then((text) => {
      setNotes(text);
      setNotesSaved(true);
    });
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      if (notesAutosaveTimer.current) clearTimeout(notesAutosaveTimer.current);
    };
  }, [kata.id]);

  const vizFolder = VIZ_MAP[kata.name] ?? null;

  // Widen panel when switching to Viz tab; reset if kata has no viz
  useEffect(() => {
    if (showPanel === "viz") {
      if (!vizFolder) { setShowPanel(null); return; }
      setPanelWidth((w) => Math.max(w, 500));
    }
  }, [showPanel, vizFolder]);

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

  const hasTabs = true;

  const tabClass = (tab: typeof showPanel) =>
    `px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
      showPanel === tab
        ? "border-primary text-primary"
        : "border-transparent text-base-content/40 hover:text-base-content/70"
    }`;

  if (!codeLoaded) return null;

  const initialCode = savedCode ?? kata.code;

  return (
    <div className="flex h-full">
      {/* Side panel: tabs + content (full height) */}
      {hasTabs && (
        <div
          className="shrink-0 flex flex-col border-r border-base-300/60 bg-base-200"
          style={showPanel ? { width: panelWidth } : undefined}
        >
          {/* Tab bar */}
          <div className="flex border-b border-base-300/60 shrink-0">
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
            <button
              onClick={() => setShowPanel((v) => v === "notes" ? null : "notes")}
              className={tabClass("notes")}
            >
              Notes{!notesSaved && " •"}
            </button>
            {vizFolder && (
              <button
                onClick={() => setShowPanel((v) => v === "viz" ? null : "viz")}
                className={tabClass("viz")}
              >
                Viz ↗
              </button>
            )}
          </div>

          {/* Tab content */}
          {showPanel === "description" && (
            <div className="flex-1 overflow-y-auto px-4 py-3 text-sm text-base-content/70">
              <DescriptionWithLink text={kata.description || "No description available."} />
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
          {showPanel === "viz" && vizFolder && (
            <div className="flex-1 min-h-0">
              <iframe
                src={`/algo-viz/${vizFolder}/index.html`}
                className="w-full h-full border-0"
                title={`${kata.name} visualization`}
              />
            </div>
          )}
          {showPanel === "notes" && (
            <div className="flex-1 flex flex-col min-h-0">
              <textarea
                className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-base-content/80 placeholder:text-base-content/25 outline-none font-mono leading-relaxed"
                placeholder="Add notes, hints, patterns to remember..."
                value={notes}
                onChange={(e) => {
                  const val = e.target.value;
                  setNotes(val);
                  setNotesSaved(false);
                  if (notesAutosaveTimer.current) clearTimeout(notesAutosaveTimer.current);
                  notesAutosaveTimer.current = setTimeout(() => {
                    saveKataNotes(kata.id, val).then(() => setNotesSaved(true));
                  }, 1000);
                }}
              />
              <div className="px-4 pb-2 text-xs text-base-content/25">
                {notesSaved ? "saved" : "saving..."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gutter (drag handle) */}
      {hasTabs && showPanel && (
        <div
          onMouseDown={onGutterMouseDown}
          className="w-1 shrink-0 cursor-col-resize bg-base-300/60 hover:bg-primary transition-colors"
        />
      )}

      {/* Editor + results column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Editor header */}
        <div className="flex items-center px-3 py-1.5 border-b border-base-300/60 bg-base-200 shrink-0">
          <span className="text-xs text-base-content/45 truncate flex-1">
            {kata.name}
          </span>
          <div className="flex items-center gap-1.5 ml-2 relative">
            <button
              onClick={handleReset}
              title="Reset to original"
              className="btn btn-ghost btn-xs text-base-content/45 hover:text-base-content"
            >
              ↻
            </button>
            <button
              onClick={() => setShowConfig((v) => !v)}
              title="Editor settings"
              className={`btn btn-xs ${
                showConfig
                  ? "btn-primary"
                  : "btn-ghost text-base-content/45 hover:text-base-content"
              }`}
            >
              ⚙
            </button>
            {showConfig && (
              <div className="absolute top-full right-0 mt-1 z-50 w-56 rounded-lg border border-base-300/50 bg-base-100 shadow-lg py-2 px-3 flex flex-col gap-2.5">
                {/* Font size */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-base-content/45">font size</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setSetting("fontSize", Math.max(10, fontSize - 1))} className="btn btn-ghost btn-xs btn-square">−</button>
                    <span className="text-xs font-mono w-5 text-center tabular-nums">{fontSize}</span>
                    <button onClick={() => setSetting("fontSize", Math.min(28, fontSize + 1))} className="btn btn-ghost btn-xs btn-square">+</button>
                  </div>
                </div>
                {/* Vim mode */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-base-content/45">vim mode</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-sm toggle-success"
                    checked={vimMode}
                    onChange={toggleVimMode}
                  />
                </div>
                {/* Dark mode */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-base-content/45">dark mode</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-sm toggle-success"
                    checked={theme === "dark"}
                    onChange={toggleTheme}
                  />
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
        <div className="flex items-center px-3 h-7 border-t border-base-300/60 bg-base-200 shrink-0">
          <span className={`text-xs ${saved ? "text-success" : "text-base-content/40"}`}>
            {saved ? "• saved" : "• unsaved"}
          </span>
          <div
            ref={statusBarRef}
            className={`flex-1 px-4 text-xs font-mono text-base-content/40 ${
              vimMode ? "" : "invisible"
            }`}
          />
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleVimMode}
              className={`btn btn-xs ${
                vimMode
                  ? "btn-success"
                  : "btn-ghost text-base-content/40"
              }`}
            >
              VIM
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="btn btn-xs btn-primary"
            >
              {running ? "..." : "▷ run"}
            </button>
          </div>
        </div>

        {/* Closable results pane */}
        {(results || running) && (
          <div className="flex-1 min-h-0 flex flex-col border-t border-base-300/60">
            {/* Results header */}
            <div className="flex items-center px-3 py-1 border-b border-base-300/60 bg-base-200 shrink-0">
              <button
                onClick={() => { if (!running) setResults(null); }}
                className="text-xs text-base-content/30 hover:text-base-content/60 transition-colors mr-2"
              >
                ✕
              </button>
              <span className="text-xs text-base-content/45">
                {running ? "running..." : "results"}
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {running ? (
                <div className="flex items-center justify-center h-full text-base-content/30 text-sm">
                  <span className="loading loading-spinner loading-sm text-primary mr-2" />
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
