import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Editor, { DiffEditor, type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { initVimMode, type VimAdapterInstance } from "monaco-vim";
import { open } from "@tauri-apps/plugin-shell";
import { useSettingsStore } from "../stores/settings-store";
import { resolveMonacoTheme, APP_THEMES } from "../lib/editor-themes";
import { monacoEditorOptions } from "../lib/editor-settings";
import { useTimerStore } from "../stores/timer-store";
import { useSessionStore } from "../stores/session-store";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { runTests, prewarmRunner } from "../lib/test-runner";
import { saveUserCode, loadUserCode, deleteUserCode, saveKataNotes, loadKataNotes } from "../lib/database";
import { TestOutput } from "./test-output";
import { ReplPanel, type ReplSeed } from "./repl-panel";
import { extractTestCall } from "../lib/repl-seed";
import { monacoReady } from "../lib/monaco-setup";
import { useKataNavigation } from "../hooks/use-kata-navigation";
import { createAutosave } from "../lib/autosave";
import { toast } from "../stores/toast-store";
import { leetcodeUrlFor } from "../lib/leetcode-numbers";
import { dpPatternFor, DP_MODULES } from "../lib/dp-patterns";
import type { Kata, TestResult } from "../types/editor";

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
  | "Best Time to Buy and Sell Stock"
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
  | "Detect Squares"
  | "Two Sum"
  | "Contains Duplicate"
  | "Valid Anagram"
  | "Valid Palindrome"
  | "Container With Most Water"
  | "3Sum"
  | "Product of Array Except Self"
  | "Longest Consecutive Sequence"
  | "Valid Parentheses"
  | "Binary Search"
  | "Group Anagrams"
  | "Top K Frequent Elements"
  | "Encode and Decode Strings"
  | "Valid Sudoku"
  | "Trapping Rain Water"
  | "Largest Rectangle In Histogram"
  | "Min Stack"
  | "Evaluate Reverse Polish Notation"
  | "Daily Temperatures"
  | "Reverse Linked List"
  | "Longest Substring Without Repeating Characters"
  | "Longest Repeating Character Replacement"
  | "Minimum Window Substring"
  | "Sliding Window Maximum"
  | "Two Sum II - Input Array Is Sorted"
  | "Search in Rotated Sorted Array"
  | "Find Minimum in Rotated Sorted Array"
  | "Koko Eating Bananas"
  | "Reorder List"
  | "Car Fleet"
  | "Permutation in String"
  | "Search a 2D Matrix"
  | "Time Based Key-Value Store"
  | "Remove Nth Node From End of List"
  | "Copy List With Random Pointer"
  | "Add Two Numbers"
  | "Find the Duplicate Number"
  | "Copy List with Random Pointer"
  | "Trie"
  | "Kth Largest Element In An Array"
  | "Validate Binary Search Tree"
  | "Maximum Depth of Binary Tree"
  | "Binary Tree Level Order Traversal"
  | "Reverse Linked List (Iterative)"
  | "Reverse Linked List (Recursive)"
  | "Binary Search (Iterative)"
  | "Binary Search (Recursive)"
  | "Binary Search Find First"
  | "Binary Search Find Last"
  | "Climbing Stairs (Iterative)"
  | "Climbing Stairs (Recursive)"
  | "Sliding Window Max Sum"
  | "Merge Sorted Arrays"
  | "Merge Two Sorted Arrays"
  | "Linked List Traversal"
  | "Linked List Traversal (Iterative)"
  | "Linked List Traversal (Recursive)"
  | "Balanced Parentheses"
  | "Count Set Bits"
  | "Topological Sort"
  | "Combination Sum IV"
  | "Build Adjacency List Drill"
  | "Most Frequent Element"
  | "Graph DFS"
  | "Graph DFS (Iterative)"
  | "Graph DFS (Recursive)"
  | "Matrix DFS"
  | "Matrix DFS (Iterative)"
  | "Matrix DFS (Recursive)"
  | "Binary Tree Inorder (Iterative)"
  | "Binary Tree Inorder (Recursive)"
  | "Binary Tree Preorder (Iterative)"
  | "Binary Tree Preorder (Recursive)"
  | "Binary Tree Postorder (Iterative)"
  | "Binary Tree Postorder (Recursive)"
  | "DFS Inorder Traversal"
  | "DFS Preorder Traversal"
  | "DFS Postorder Traversal"
  | "Monotonic Stack"
  | "Merge Sort"
  | "Quick Sort"
  | "Lomuto Partition"
  | "Min Heap"
  | "Union Find"
  | "Build Prefix Sum"
  | "Range Sum Query"
  | "Two Pointer Remove Dupes"
  | "Two Pointer Remove Duplicates"
  | "Queue from Stacks"
  | "Queue from Two Stacks"
  | "Frequency Count"
  | "Merge K Sorted Lists"
  | "FizzBuzz";

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
  "Best Time to Buy and Sell Stock": "best-time-buy-sell",
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
  "Two Sum":                      "two-sum",
  "Contains Duplicate":           "contains-duplicate",
  "Valid Anagram":                "valid-anagram",
  "Valid Palindrome":             "valid-palindrome",
  "Container With Most Water":    "container-most-water",
  "3Sum":                         "three-sum",
  "Product of Array Except Self": "product-except-self",
  "Longest Consecutive Sequence": "longest-consecutive",
  "Valid Parentheses":            "valid-parentheses",
  "Binary Search":                "binary-search",
  "Group Anagrams":               "group-anagrams",
  "Top K Frequent Elements":      "top-k-frequent",
  "Encode and Decode Strings":    "encode-decode-strings",
  "Valid Sudoku":                 "valid-sudoku",
  "Trapping Rain Water":          "trapping-rain-water",
  "Largest Rectangle In Histogram": "largest-rectangle-histogram",
  "Min Stack":                    "min-stack",
  "Evaluate Reverse Polish Notation": "evaluate-rpn",
  "Daily Temperatures":           "daily-temperatures",
  "Reverse Linked List":          "reverse-linked-list",
  "Longest Substring Without Repeating Characters": "longest-substring-no-repeat",
  "Longest Repeating Character Replacement": "longest-repeating-char-replacement",
  "Minimum Window Substring":     "minimum-window-substring",
  "Sliding Window Maximum":       "sliding-window-max",
  "Two Sum II - Input Array Is Sorted": "two-sum-ii",
  "Search in Rotated Sorted Array": "search-rotated-array",
  "Find Minimum in Rotated Sorted Array": "find-min-rotated",
  "Koko Eating Bananas":          "koko-eating-bananas",
  "Reorder List":                 "reorder-list",
  "Car Fleet":                    "car-fleet",
  "Permutation in String":        "permutation-in-string",
  "Search a 2D Matrix":           "search-2d-matrix",
  "Time Based Key-Value Store":   "time-based-key-value",
  "Remove Nth Node From End of List": "remove-nth-node",
  "Copy List With Random Pointer": "copy-list-random-pointer",
  "Add Two Numbers":              "add-two-numbers",
  "Find the Duplicate Number":    "find-duplicate",
  // Name variants — point to same viz folder as canonical name
  "Copy List with Random Pointer":      "copy-list-random-pointer",
  "Trie":                               "trie",
  "Kth Largest Element In An Array":    "kth-largest",
  "Validate Binary Search Tree":        "validate-bst",
  "Maximum Depth of Binary Tree":       "max-depth-tree",
  "Binary Tree Level Order Traversal":  "level-order",
  "Reverse Linked List (Iterative)":    "reverse-linked-list",
  "Reverse Linked List (Recursive)":    "reverse-linked-list",
  "Binary Search (Iterative)":          "binary-search",
  "Binary Search (Recursive)":          "binary-search",
  "Binary Search Find First":           "binary-search",
  "Binary Search Find Last":            "binary-search",
  "Climbing Stairs (Iterative)":        "climbing-stairs",
  "Climbing Stairs (Recursive)":        "climbing-stairs",
  "Sliding Window Max Sum":             "sliding-window-max",
  "Merge Sorted Arrays":                "merge-sorted-lists",
  "Merge Two Sorted Arrays":            "merge-sorted-lists",
  "Linked List Traversal":              "reverse-linked-list",
  "Linked List Traversal (Iterative)":  "reverse-linked-list",
  "Linked List Traversal (Recursive)":  "reverse-linked-list",
  // Semantically equivalent — reuse existing viz
  "Balanced Parentheses":               "valid-parentheses",
  "Count Set Bits":                     "number-1-bits",
  "Topological Sort":                   "course-schedule",
  "Combination Sum IV":                 "combination-sum",
  "Most Frequent Element":              "top-k-frequent",
  // New viz folders (built separately)
  "Graph DFS":                          "graph-dfs",
  "Graph DFS (Iterative)":              "graph-dfs",
  "Graph DFS (Recursive)":              "graph-dfs",
  "Matrix DFS":                         "matrix-dfs",
  "Matrix DFS (Iterative)":             "matrix-dfs",
  "Matrix DFS (Recursive)":             "matrix-dfs",
  "Binary Tree Inorder (Iterative)":    "dfs-traversal",
  "Binary Tree Inorder (Recursive)":    "dfs-traversal",
  "Binary Tree Preorder (Iterative)":   "dfs-traversal",
  "Binary Tree Preorder (Recursive)":   "dfs-traversal",
  "Binary Tree Postorder (Iterative)":  "dfs-traversal",
  "Binary Tree Postorder (Recursive)":  "dfs-traversal",
  "DFS Inorder Traversal":              "dfs-traversal",
  "DFS Preorder Traversal":             "dfs-traversal",
  "DFS Postorder Traversal":            "dfs-traversal",
  "Monotonic Stack":                    "monotonic-stack",
  "Merge Sort":                         "merge-sort",
  "Quick Sort":                         "quick-sort",
  "Lomuto Partition":                   "quick-sort",
  "Min Heap":                           "min-heap",
  "Union Find":                         "union-find",
  "Build Prefix Sum":                   "prefix-sum",
  "Range Sum Query":                    "prefix-sum",
  "Two Pointer Remove Dupes":           "two-pointer",
  "Two Pointer Remove Duplicates":      "two-pointer",
  "Queue from Stacks":                  "queue-from-stacks",
  "Queue from Two Stacks":              "queue-from-stacks",
  "Frequency Count":                    "frequency-count",
  "Merge K Sorted Lists":               "merge-k-sorted",
  "FizzBuzz":                           "fizzbuzz",
};

// Renders the kata description as-is. The "Ref: LeetCode #N" line stays as plain
// text; the authoritative "Open on LeetCode" affordance is the header button
// (leetcodeUrlFor), so the description no longer carries its own link.
function DescriptionWithLink({ text }: { text: string }) {
  return <span className="whitespace-pre-wrap">{text}</span>;
}

// Compact, read-only recurrence summary for DP-tagged katas (see
// src/lib/dp-patterns.ts). Renders nothing for katas without a pattern.
function DpPatternCard({ kata }: { kata: Kata }) {
  const pattern = dpPatternFor(kata);
  if (!pattern) return null;
  const primaryLabel =
    DP_MODULES.find((m) => m.id === pattern.primaryModule)?.label ??
    (pattern.primaryModule === "expand-around-center" ? "Not DP · expand-around-center" : pattern.primaryModule);
  const relatedLabels = pattern.relatedPatterns?.map(
    (r) => DP_MODULES.find((m) => m.id === r)?.label ?? r,
  );
  return (
    <div data-testid="dp-pattern-card" className="mb-3 rounded-lg border border-base-300/50 bg-base-100 px-3 py-2.5 text-xs">
      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className="badge badge-sm badge-primary/20 text-primary border-primary/20">
          {primaryLabel}
        </span>
        {relatedLabels?.map((label) => (
          <span key={label} className="badge badge-sm text-base-content/40 border-base-300/50 bg-transparent">
            Related: {label}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1 text-base-content/70">
        <div><span className="font-semibold text-base-content/50">State:</span> {pattern.state}</div>
        <div><span className="font-semibold text-base-content/50">Transition:</span> {pattern.transition}</div>
        <div>
          <span className="font-semibold text-base-content/50">Base cases:</span>
          <ul className="list-disc ml-4 mt-0.5 flex flex-col gap-0.5">
            {pattern.baseCases.map((bc, i) => <li key={i}>{bc}</li>)}
          </ul>
        </div>
        <div>
          <span className="font-semibold text-base-content/50">Evaluation order: </span>
          <code className="text-primary text-[10px]">{pattern.evaluationOrder.kind}</code>
          {" · "}
          {pattern.evaluationOrder.explanation}
        </div>
      </div>
    </div>
  );
}

interface KataEditorProps {
  kata: Kata;
  isSession?: boolean;
  onTestComplete?: (passed: boolean, codeSnapshot: string) => void;
  onAdvance?: () => void;
}

export function KataEditor({ kata, isSession, onTestComplete, onAdvance }: KataEditorProps) {
  const { theme, vimMode, toggleVimMode, shortcuts, fontSize, fontFamily, tabSize, hideDescriptionInSession, setSetting, editorAutocomplete, lineNumbersMode, wordWrap, autoClosingBrackets, fontLigatures, highlightOccurrences } = useSettingsStore();
  const sessionMaxTestRuns = useSessionStore((s) => s.activeSession?.maxTestRuns ?? null);
  // Attempt limits only apply inside a practice session, never in the standalone editor
  const maxTestRuns = isSession ? sessionMaxTestRuns : null;
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const vimModeRef = useRef<VimAdapterInstance | null>(null);
  const statusBarRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [vizSpeed, setVizSpeed] = useState<"900" | "500" | "200">("500");
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [ranAt, setRanAt] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [kataPassed, setKataPassed] = useState(false);
  const [showPanel, setShowPanel] = useState<"description" | "solution" | "notes" | "viz" | "diff" | null>(
    isSession && hideDescriptionInSession ? null : kata.description ? "description" : null
  );
  const [editorReady, setEditorReady] = useState(false);
  const [panelWidth, setPanelWidth] = useState(380);
  const dragging = useRef(false);
  const [saved, setSaved] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showRepl, setShowRepl] = useState(false);
  const [monacoUp, setMonacoUp] = useState(false);
  useEffect(() => {
    void monacoReady.then(() => setMonacoUp(true));
  }, []);
  const [replSeed, setReplSeed] = useState<ReplSeed | null>(null);
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [codeLoaded, setCodeLoaded] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(true);

  const autosave = useRef(
    createAutosave<number>({
      delayMs: 1500,
      save: (id, value) => {
        saveUserCode(id, value).then(() => setSaved(true));
      },
    }),
  ).current;

  const notesAutosave = useRef(
    createAutosave<number>({
      delayMs: 1000,
      save: (id, value) => {
        saveKataNotes(id, value).then(() => setNotesSaved(true));
      },
    }),
  ).current;

  const [nudging, setNudging] = useState(false);
  const navigation = useKataNavigation(kata.id);

  const nudge = useCallback(() => {
    setNudging(true);
    setTimeout(() => setNudging(false), 200);
  }, []);

  const monacoTheme = resolveMonacoTheme(theme);
  const fmtCombo = (combo: string) =>
    combo.replace("Meta", "⌘").replace("Shift", "⇧").replace("Alt", "⌥").replace("Ctrl", "⌃").replace("Enter", "↩").replace("+", "").replace("+", "");
  const sharedEditorOptions = monacoEditorOptions({
    fontSize,
    fontFamily,
    tabSize,
    lineNumbersMode,
    editorAutocomplete,
    autoClosingBrackets,
    wordWrap,
    fontLigatures,
    highlightOccurrences,
  });

  useEffect(() => {
    prewarmRunner(kata.language);
  }, [kata.id, kata.language]);

  // Load saved user code and notes on mount; clean up autosave timers on unmount
  useEffect(() => {
    setCodeLoaded(false);
    setRunCount(0);
    setKataPassed(false);
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
      // Flush, do not drop: this runs when the kata changes and on unmount, and
      // the pending save belongs to the OUTGOING kata. createAutosave captured
      // its id at schedule time, so it cannot be written under the new kata.
      autosave.flush();
      notesAutosave.flush();
    };
  }, [kata.id, autosave, notesAutosave]);

  const vizFolder = VIZ_MAP[kata.name as VizKataName] ?? null;
  const leetcodeUrl = leetcodeUrlFor(kata);

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
        setKataPassed(true);
      }
      if (onTestComplete) {
        onTestComplete(allPassed, code);
      }
      if (maxTestRuns !== null && !allPassed && !kataPassed) {
        const newCount = runCount + 1;
        setRunCount(newCount);
        if (newCount >= maxTestRuns) {
          toast.error("Max attempts reached — moving to next problem", 1500);
          setTimeout(() => { onAdvance?.(); }, 1500);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setResults([{ name: "Runner error", passed: false, error: msg }]);
      setRanAt(new Date().toLocaleTimeString());
      if (maxTestRuns !== null && !kataPassed) {
        const newCount = runCount + 1;
        setRunCount(newCount);
        if (newCount >= maxTestRuns) {
          toast.error("Max attempts reached — moving to next problem", 1500);
          setTimeout(() => { onAdvance?.(); }, 1500);
        }
      }
    } finally {
      setRunning(false);
    }
  }, [kata.id, kata.testCode, kata.language, kataStatus, running, startKataTimer, completeKataTimer, onTestComplete, maxTestRuns, runCount, kataPassed, onAdvance]);

  const handleToggleSolution = useCallback(() => {
    setShowPanel((v) => (v === "solution" ? null : "solution"));
  }, []);

  // Memoized: useKeyboardShortcuts lists `handlers` in a useEffect dependency
  // array, and KataEditor re-renders on every keystroke. A fresh object literal
  // would tear down and rebind the window listener on each one.
  const shortcutHandlers = useMemo(
    () => ({
      runTests: handleRun,
      toggleSolution: handleToggleSolution,
      nextKata: () => (navigation.hasNext ? navigation.next() : nudge()),
      prevKata: () => (navigation.hasPrev ? navigation.prev() : nudge()),
    }),
    [handleRun, handleToggleSolution, navigation.hasNext, navigation.hasPrev, navigation.next, navigation.prev, nudge],
  );

  useKeyboardShortcuts(shortcutHandlers);

  // When viz panel opens the Monaco editor unmounts. Reset editorReady so the
  // transition back triggers the vim mode effect with a real state change.
  useEffect(() => {
    if (showPanel === "viz") {
      setEditorReady(false);
      vimModeRef.current?.dispose();
      vimModeRef.current = null;
    }
  }, [showPanel]);

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

  const sendVizMsg = useCallback((msg: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  }, []);

  const handleIframeLoad = useCallback(() => {
    try {
      (iframeRef.current?.contentWindow as Window & { eval: (s: string) => void } | null)?.eval(`
        document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)});
        if (!window.__vizBridge) {
          window.__vizBridge = true;
          var style = document.createElement('style');
          style.textContent = '.controls, .input-row, .step-nav, .nav-bar, .nav-row, .nav-strip, .nav-box, .nav-panel, .bottom-bar, .ctrl-row, .controls-row, #nav-bar, #nav-controls, .control-group { display: none !important; }';
          document.head.appendChild(style);
          // Also hide whatever element directly wraps prevBtn+playBtn (catches inline-style containers)
          var prevBtn = document.getElementById('prevBtn');
          var playBtn = document.getElementById('playBtn');
          if (prevBtn && playBtn) {
            var el = prevBtn.parentElement;
            while (el && el !== document.body) {
              if (el.contains(playBtn)) { el.style.setProperty('display', 'none', 'important'); break; }
              el = el.parentElement;
            }
          }
          window.addEventListener('message', function(e) {
            var d = e.data;
            if (d === 'prev') document.getElementById('prevBtn')?.click();
            else if (d === 'play') document.getElementById('playBtn')?.click();
            else if (d === 'step') document.getElementById('stepBtn')?.click();
            else if (d === 'reset') document.getElementById('resetBtn')?.click();
            else if (d && d.type === 'speed') {
              var sel = document.getElementById('speedSel');
              if (sel) { sel.value = d.value; }
            }
            else if (d && d.type === 'theme') {
              document.documentElement.setAttribute('data-theme', d.value);
            }
          });
        }
      `);
    } catch (_) { /* cross-origin guard, no-op */ }
  }, [theme]);

  // Keep an already-loaded viz iframe's colors in sync when the user
  // switches themes without navigating away (handleIframeLoad only runs
  // once per iframe load, so live changes need the postMessage path too).
  useEffect(() => {
    sendVizMsg({ type: "theme", value: theme });
  }, [theme, sendVizMsg]);

  const tabClass = (tab: typeof showPanel) =>
    `px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
      showPanel === tab
        ? "border-primary text-primary"
        : "border-transparent text-base-content/40 hover:text-base-content/70"
    }`;

  const renderTabBar = (toggleMode: boolean) => (
    <div className="flex items-stretch border-b border-base-300/60 shrink-0 bg-base-200 relative">
      {/* Tabs */}
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
      {kata.solution && !isSession && (
        <button
          onClick={() => toggleMode
            ? setShowPanel((v) => v === "solution" ? null : "solution")
            : setShowPanel("solution")}
          title={`Toggle solution (${fmtCombo(shortcuts.toggleSolution)})`}
          className={tabClass("solution")}
        >
          Solution
        </button>
      )}
      {!isSession && (
        <button
          onClick={() => toggleMode
            ? setShowPanel((v) => v === "notes" ? null : "notes")
            : setShowPanel("notes")}
          className={tabClass("notes")}
        >
          Notes{!notesSaved && " •"}
        </button>
      )}
      {vizFolder && !isSession && (
        <button
          onClick={() => setShowPanel((v) => v === "viz" ? null : "viz")}
          className={tabClass("viz")}
        >
          Viz ↗
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Open the problem on LeetCode (only for LeetCode-backed katas) */}
      {leetcodeUrl && (
        <button
          onClick={() => open(leetcodeUrl)}
          title="Open on LeetCode"
          className="btn btn-ghost btn-xs self-center mr-1 text-base-content/40 hover:text-base-content/70"
        >
          LeetCode ↗
        </button>
      )}

      {/* Viz controls (viz tab only) */}
      {showPanel === "viz" && (
        <div className="flex items-center gap-1 px-2">
          <div className="join">
            <button onClick={() => sendVizMsg('prev')} title="Previous step" className="btn btn-xs join-item border-base-300/60 bg-base-100 text-base-content/70 hover:bg-base-300/40">← Prev</button>
            <button onClick={() => sendVizMsg('step')} title="Next step" className="btn btn-xs join-item border-base-300/60 bg-base-100 text-base-content/70 hover:bg-base-300/40">Step →</button>
            <button onClick={() => sendVizMsg('play')} title="Play through remaining steps automatically" className="btn btn-xs join-item border-primary/50 bg-primary/10 text-primary hover:bg-primary/20">▷ Play</button>
            <button onClick={() => sendVizMsg('reset')} title="Reset to the first step" className="btn btn-xs join-item border-base-300/60 bg-base-100 text-base-content/70 hover:bg-base-300/40">↺ Reset</button>
          </div>
          <div className="w-px self-stretch bg-base-300/60 mx-1" />
          <div className="flex items-center gap-0.5">
            {(["900", "500", "200"] as const).map((s, i) => (
              <button
                key={s}
                onClick={() => { setVizSpeed(s); sendVizMsg({ type: 'speed', value: s }); }}
                title="Playback speed"
                className={`btn btn-xs px-2 ${vizSpeed === s ? "btn-primary" : "btn-ghost text-base-content/35"}`}
              >
                {["Slow", "Norm", "Fast"][i]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor controls (all other tabs) */}
      {showPanel !== "viz" && (
      <div className="flex items-center gap-1.5 px-2">
        <span className={`text-xs ${saved ? "text-success/60" : "text-base-content/30"}`}>
          {saved ? "•" : "○"}
        </span>
        <div
          ref={statusBarRef}
          className={`text-xs font-mono text-base-content/40 max-w-[120px] truncate ${vimMode ? "" : "invisible w-0"}`}
        />
        <button
          onClick={handleReset}
          title="Reset to original"
          className="btn btn-ghost btn-xs text-base-content/35 hover:text-base-content/70 px-1.5"
        >
          ↻
        </button>
        <button
          onClick={() => setShowConfig((v) => !v)}
          title="Editor settings"
          className={`btn btn-xs px-1.5 ${showConfig ? "btn-primary" : "btn-ghost text-base-content/35 hover:text-base-content/70"}`}
        >
          ⚙
        </button>
        {showConfig && (
          <div className="absolute top-full right-0 mt-1 z-50 w-56 rounded-lg border border-base-300/50 bg-base-100 shadow-lg py-2 px-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-base-content/45">font size</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setSetting("fontSize", Math.max(10, fontSize - 1))} className="btn btn-ghost btn-xs btn-square">−</button>
                <span className="text-xs font-mono w-5 text-center tabular-nums">{fontSize}</span>
                <button onClick={() => setSetting("fontSize", Math.min(28, fontSize + 1))} className="btn btn-ghost btn-xs btn-square">+</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-base-content/45">vim mode</span>
              <input type="checkbox" className="toggle toggle-sm toggle-success" checked={vimMode} onChange={toggleVimMode} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-base-content/45">theme</span>
              <select
                value={theme}
                onChange={(e) => setSetting("theme", e.target.value)}
                className="select select-bordered select-xs bg-base-100 text-xs"
              >
                {APP_THEMES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        {maxTestRuns !== null && (
          <span className={`text-xs font-mono tabular-nums ${
            !kataPassed && maxTestRuns - runCount === 1 ? "text-warning" : "text-base-content/35"
          }`}>
            {runCount}/{maxTestRuns}
          </span>
        )}
        <button
          onClick={() => setShowRepl((v) => !v)}
          title="Toggle REPL"
          className={`btn btn-xs ${showRepl ? "btn-info" : "btn-ghost text-base-content/40"}`}
        >
          &gt;_
        </button>
        <button
          onClick={toggleVimMode}
          title="Toggle vim keybindings"
          className={`btn btn-xs ${vimMode ? "btn-success" : "btn-ghost text-base-content/40"}`}
        >
          VIM
        </button>
        <button
          onClick={handleRun}
          disabled={running || (maxTestRuns !== null && runCount >= maxTestRuns && !kataPassed)}
          title={`Run tests (${fmtCombo(shortcuts.runTests)})`}
          className="btn btn-xs btn-primary"
        >
          {running ? "..." : "▷ run"}
        </button>
      </div>
      )}
    </div>
  );

  if (!codeLoaded || !monacoUp) return null;

  const initialCode = isSession ? kata.code : (savedCode ?? kata.code);

  if (showPanel === "viz" && vizFolder) {
    return (
      <div className="flex flex-col h-full">
        {renderTabBar(false)}
        <div className="flex-1 min-h-0">
          <iframe
            ref={iframeRef}
            src={`/algo-viz/${vizFolder}/index.html`}
            className="w-full h-full border-0"
            title={`${kata.name} visualization`}
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${nudging ? "animate-nudge" : ""}`}>
      {/* Full-width bar: tabs left, controls right */}
      {renderTabBar(true)}

      {/* Content row: side panel + editor */}
      <div className="flex flex-1 min-h-0">
        {/* Side panel: tab content only */}
        {hasTabs && showPanel && (
          <div
            className="shrink-0 flex flex-col border-r border-base-300/60 bg-base-200"
            style={{ width: panelWidth }}
          >
            {showPanel === "description" && (
              <div className="flex-1 overflow-y-auto px-4 py-3 text-sm text-base-content/70">
                <DpPatternCard kata={kata} />
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
                    ...sharedEditorOptions,
                    readOnly: true,
                    lineNumbers: "off",
                  }}
                />
              </div>
            )}
            {showPanel === "diff" && kata.solution && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="px-4 pt-2 pb-1 text-[11px] text-base-content/40 shrink-0">
                  reference solution (left) vs your code (right)
                </div>
                <div className="flex-1 min-h-0">
                  <DiffEditor
                    original={kata.solution}
                    modified={editorRef.current?.getValue() ?? ""}
                    language={kata.language}
                    theme={monacoTheme}
                    options={{
                      readOnly: true,
                      renderSideBySide: true,
                      minimap: { enabled: false },
                      fontSize,
                      fontFamily,
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      lineNumbers: "off",
                    }}
                  />
                </div>
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
                    notesAutosave.schedule(kata.id, () => val);
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
          {/* Monaco editor */}
          <div className={`${results || showRepl ? "flex-[2]" : "flex-1"} min-h-0`}>
            <Editor
              key={kata.id}
              defaultValue={initialCode}
              language={kata.language}
              theme={monacoTheme}
              options={sharedEditorOptions}
              onMount={handleEditorMount}
              onChange={() => {
                setSaved(false);
                autosave.schedule(kata.id, () => editorRef.current?.getValue());
              }}
            />
          </div>

          {/* REPL pane — keyed by kata so switching katas drops the session */}
          {showRepl && (
            <div className="flex-1 min-h-0 flex flex-col border-t border-base-300/60">
              <div className="flex items-center px-3 py-1 border-b border-base-300/60 bg-base-200 shrink-0">
                <button
                  onClick={() => setShowRepl(false)}
                  className="text-xs text-base-content/30 hover:text-base-content/60 transition-colors mr-2"
                >
                  ✕
                </button>
                <span className="text-xs text-base-content/45">repl · {kata.language}</span>
              </div>
              <ReplPanel
                key={kata.id}
                language={kata.language}
                getEditorCode={() => editorRef.current?.getValue() ?? null}
                seed={replSeed}
              />
            </div>
          )}

          {/* Closable results pane */}
          {(results || running) && (
            <div className="flex-1 min-h-0 flex flex-col border-t border-base-300/60">
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
                {!running && results && results.length > 0 && results.every((r) => r.passed) && kata.solution && (
                  <button
                    onClick={() => setShowPanel((v) => (v === "diff" ? null : "diff"))}
                    className="ml-auto btn btn-ghost btn-xs h-5 min-h-0 px-1.5 text-[10px] text-success/70 hover:text-success"
                    title="Compare your code with the reference solution"
                  >
                    ⇄ compare solution
                  </button>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                {running ? (
                  <div className="flex items-center justify-center h-full text-base-content/30 text-sm">
                    <span className="loading loading-spinner loading-sm text-primary mr-2" />
                    Running tests...
                  </div>
                ) : results ? (
                  <TestOutput
                    results={results}
                    ranAt={ranAt}
                    onSendToRepl={(testName) => {
                      const expression = extractTestCall(kata.testCode, testName, kata.language) ?? "";
                      setShowRepl(true);
                      setReplSeed({ expression, nonce: Date.now() });
                    }}
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
