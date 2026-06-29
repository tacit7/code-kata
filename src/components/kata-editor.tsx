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

type VizKataName =
  | "Kadane's Algorithm"
  | "Min Cost Climbing Stairs"
  | "House Robber"
  | "Median of Two Sorted Arrays"
  | "Merge Two Sorted Lists"
  | "Longest Palindromic Substring"
  | "Binary Tree BFS"
  | "Matrix BFS"
  | "Matrix Grid BFS"
  | "Linked List Cycle"
  | "Linked List Cycle Detection"
  | "Climbing Stairs"
  | "Single Number XOR"
  | "Missing Number"
  | "Plus One"
  | "Number of 1 Bits"
  | "Counting Bits"
  | "Jump Game"
  | "Invert Binary Tree"
  | "Max Depth of Binary Tree"
  | "Same Tree"
  | "Coin Change"
  | "Longest Increasing Subsequence"
  | "Number of Islands"
  | "Binary Tree Level Order"
  | "Binary Tree Right Side View"
  | "House Robber II"
  | "Balanced Binary Tree"
  | "Reverse Bits"
  | "Diameter of Binary Tree"
  | "Decode Ways"
  | "Validate BST"
  | "Max Area of Island"
  | "Rotting Oranges"
  | "Jump Game II"
  | "Merge Intervals"
  | "Unique Paths"
  | "Longest Common Subsequence"
  | "Word Break"
  | "Implement Trie"
  | "Course Schedule"
  | "Subsets"
  | "Generate Parentheses"
  | "Kth Largest Element in Array"
  | "Pacific Atlantic Water Flow"
  | "Insert Interval"
  | "Palindromic Substrings"
  | "Edit Distance"
  | "Rotate Image"
  | "Spiral Matrix"
  | "Combination Sum"
  | "Permutations"
  | "Letter Combinations of a Phone Number"
  | "Lowest Common Ancestor of a Binary Search Tree"
  | "Kth Smallest Element in a BST"
  | "Non-overlapping Intervals"
  | "Gas Station"
  | "Clone Graph"
  | "Maximum Product Subarray"
  | "Coin Change II"
  | "Network Delay Time"
  | "Subtree of Another Tree"
  | "Count Good Nodes In Binary Tree"
  | "K Closest Points to Origin"
  | "Task Scheduler"
  | "Course Schedule II"
  | "Partition Equal Subset Sum"
  | "Meeting Rooms"
  | "Sum of Two Integers"
  | "Happy Number"
  | "Partition Labels"
  | "Combination Sum II"
  | "Subsets II"
  | "Palindrome Partitioning"
  | "Last Stone Weight"
  | "Walls And Gates"
  | "Number of Connected Components in an Undirected Graph"
  | "Redundant Connection"
  | "Best Time to Buy and Sell Stock With Cooldown"
  | "Target Sum"
  | "Meeting Rooms II"
  | "Word Search"
  | "Binary Tree Maximum Path Sum"
  | "Serialize and Deserialize Binary Tree"
  | "Construct Binary Tree from Preorder and Inorder Traversal"
  | "Add and Search Word"
  | "Word Search II"
  | "Valid Parenthesis String"
  | "Reconstruct Itinerary"
  | "Interleaving String"
  | "Min Cost to Connect All Points"
  | "Swim In Rising Water"
  | "Alien Dictionary"
  | "Cheapest Flights Within K Stops"
  | "Kth Largest Element In a Stream"
  | "Minimum Interval to Include Each Query"
  | "Hand of Straights"
  | "Merge Triplets to Form Target Triplet"
  | "Burst Balloons"
  | "Distinct Subsequences"
  | "Longest Increasing Path In a Matrix"
  | "Reverse Integer"
  | "Surrounded Regions"
  | "N Queens"
  | "Graph Valid Tree"
  | "Word Ladder"
  | "Design Twitter"
  | "Find Median from Data Stream"
  | "Regular Expression Matching"
  | "Set Matrix Zeroes"
  | "Pow(x, n)"
  | "Multiply Strings"
  | "Detect Squares";

// Kata name → algo-viz subfolder served from /algo-viz/<folder>/index.html
const VIZ_MAP: Partial<Record<VizKataName, string>> = {
  "Kadane's Algorithm":           "kadanes",
  "Min Cost Climbing Stairs":     "min-cost-stairs",
  "House Robber":                 "house-robber",
  "Median of Two Sorted Arrays":  "median-sorted-arrays",
  "Merge Two Sorted Lists":       "merge-sorted-lists",
  "Longest Palindromic Substring":"manachers",
  "Binary Tree BFS":              "bfs",
  "Matrix BFS":                   "bfs-grid",
  "Matrix Grid BFS":              "bfs-traversal",
  "Linked List Cycle":            "floyd-cycle",
  "Linked List Cycle Detection":  "floyd-cycle",
  "Climbing Stairs":              "climbing-stairs",
  "Single Number XOR":            "single-number",
  "Missing Number":               "missing-number",
  "Plus One":                     "plus-one",
  "Number of 1 Bits":             "number-1-bits",
  "Counting Bits":                "counting-bits",
  "Jump Game":                    "jump-game",
  "Invert Binary Tree":           "invert-binary-tree",
  "Max Depth of Binary Tree":     "max-depth-tree",
  "Same Tree":                    "same-tree",
  "Coin Change":                  "coin-change",
  "Longest Increasing Subsequence": "lis",
  "Number of Islands":            "num-islands",
  "Binary Tree Level Order":      "level-order",
  "Binary Tree Right Side View":  "right-side-view",
  "House Robber II":              "house-robber-2",
  "Balanced Binary Tree":         "balanced-tree",
  "Reverse Bits":                 "reverse-bits",
  "Diameter of Binary Tree":      "diameter-tree",
  "Decode Ways":                  "decode-ways",
  "Validate BST":                 "validate-bst",
  "Max Area of Island":           "max-area-island",
  "Rotting Oranges":              "rotting-oranges",
  "Jump Game II":                 "jump-game-2",
  "Merge Intervals":              "merge-intervals",
  "Unique Paths":                 "unique-paths",
  "Longest Common Subsequence":   "lcs",
  "Word Break":                   "word-break",
  "Implement Trie":               "trie",
  "Course Schedule":              "course-schedule",
  "Subsets":                      "subsets",
  "Generate Parentheses":         "generate-parentheses",
  "Kth Largest Element in Array": "kth-largest",
  "Pacific Atlantic Water Flow":  "pacific-atlantic",
  "Insert Interval":              "insert-interval",
  "Palindromic Substrings":       "palindromic-substrings",
  "Edit Distance":                "edit-distance",
  "Rotate Image":                 "rotate-image",
  "Spiral Matrix":                "spiral-matrix",
  "Combination Sum":              "combination-sum",
  "Permutations":                 "permutations",
  "Letter Combinations of a Phone Number": "letter-combinations",
  "Lowest Common Ancestor of a Binary Search Tree": "lca-bst",
  "Kth Smallest Element in a BST": "kth-smallest-bst",
  "Non-overlapping Intervals":    "non-overlapping-intervals",
  "Gas Station":                  "gas-station",
  "Clone Graph":                  "clone-graph",
  "Maximum Product Subarray":     "max-product-subarray",
  "Coin Change II":               "coin-change-2",
  "Network Delay Time":           "network-delay",
  "Subtree of Another Tree":      "subtree-of-another-tree",
  "Count Good Nodes In Binary Tree": "count-good-nodes",
  "K Closest Points to Origin":   "k-closest-points",
  "Task Scheduler":               "task-scheduler",
  "Course Schedule II":           "course-schedule-2",
  "Partition Equal Subset Sum":   "partition-equal-subset",
  "Meeting Rooms":                "meeting-rooms",
  "Sum of Two Integers":          "sum-two-integers",
  "Happy Number":                 "happy-number",
  "Partition Labels":             "partition-labels",
  "Combination Sum II":           "combination-sum-2",
  "Subsets II":                   "subsets-2",
  "Palindrome Partitioning":      "palindrome-partitioning",
  "Last Stone Weight":            "last-stone-weight",
  "Walls And Gates":              "walls-and-gates",
  "Number of Connected Components in an Undirected Graph": "connected-components",
  "Redundant Connection":         "redundant-connection",
  "Best Time to Buy and Sell Stock With Cooldown": "stock-cooldown",
  "Target Sum":                   "target-sum",
  "Meeting Rooms II":             "meeting-rooms-2",
  "Word Search":                  "word-search",
  "Binary Tree Maximum Path Sum": "binary-tree-max-path",
  "Serialize and Deserialize Binary Tree": "serialize-deserialize-tree",
  "Construct Binary Tree from Preorder and Inorder Traversal": "construct-binary-tree",
  "Add and Search Word":          "add-search-words",
  "Word Search II":               "word-search-2",
  "Valid Parenthesis String":     "valid-parenthesis-string",
  "Reconstruct Itinerary":        "reconstruct-itinerary",
  "Interleaving String":          "interleaving-string",
  "Min Cost to Connect All Points": "min-cost-connect",
  "Swim In Rising Water":         "swim-rising-water",
  "Alien Dictionary":             "alien-dictionary",
  "Cheapest Flights Within K Stops": "cheapest-flights",
  "Kth Largest Element In a Stream": "kth-largest-stream",
  "Minimum Interval to Include Each Query": "min-interval-query",
  "Hand of Straights":            "hand-of-straights",
  "Merge Triplets to Form Target Triplet": "merge-triplets",
  "Burst Balloons":               "burst-balloons",
  "Distinct Subsequences":        "distinct-subsequences",
  "Longest Increasing Path In a Matrix": "longest-increasing-path",
  "Reverse Integer":              "reverse-integer",
  "Surrounded Regions":           "surrounded-regions",
  "N Queens":                     "n-queens",
  "Graph Valid Tree":             "graph-valid-tree",
  "Word Ladder":                  "word-ladder",
  "Design Twitter":               "design-twitter",
  "Find Median from Data Stream": "find-median-stream",
  "Regular Expression Matching":  "regex-matching",
  "Set Matrix Zeroes":            "set-matrix-zeroes",
  "Pow(x, n)":                    "pow-xn",
  "Multiply Strings":             "multiply-strings",
  "Detect Squares":               "detect-squares",
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

  const vizFolder = VIZ_MAP[kata.name as VizKataName] ?? null;

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

  const renderTabBar = (toggleMode: boolean) => (
    <div className="flex border-b border-base-300/60 shrink-0">
      {kata.description && (
        <button
          onClick={() => toggleMode
            ? setShowPanel((v) => v === "description" ? null : "description")
            : setShowPanel("description")}
          className={tabClass("description")}
        >
          Problem
        </button>
      )}
      {kata.solution && (
        <button
          onClick={() => toggleMode
            ? setShowPanel((v) => v === "solution" ? null : "solution")
            : setShowPanel("solution")}
          className={tabClass("solution")}
        >
          Solution
        </button>
      )}
      <button
        onClick={() => toggleMode
          ? setShowPanel((v) => v === "notes" ? null : "notes")
          : setShowPanel("notes")}
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
  );

  if (!codeLoaded) return null;

  const initialCode = savedCode ?? kata.code;

  if (showPanel === "viz" && vizFolder) {
    return (
      <div className="flex flex-col h-full">
        {renderTabBar(false)}
        <div className="flex-1 min-h-0">
          <iframe
            src={`/algo-viz/${vizFolder}/index.html`}
            className="w-full h-full border-0"
            title={`${kata.name} visualization`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Side panel: tabs + content (full height) */}
      {hasTabs && (
        <div
          className="shrink-0 flex flex-col border-r border-base-300/60 bg-base-200"
          style={showPanel ? { width: panelWidth } : undefined}
        >
          {/* Tab bar */}
          {renderTabBar(true)}

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
