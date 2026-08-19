import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Editor, { DiffEditor, type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { initVimMode, type VimAdapterInstance } from "monaco-vim";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import {
  ArrowLeft,
  ArrowRight,
  BotMessageSquare,
  GitCompareArrows,
  ListChecks,
  Maximize2,
  Minimize2,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Plus,
  RotateCcw,
  Settings,
  SquareSplitHorizontal,
  SquareSplitVertical,
  StepForward,
  Terminal,
  X,
} from "lucide-react";
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
import { TestcasePanel } from "./testcase-panel";
import { ReplPanel, type ReplSeed } from "./repl-panel";
import { AgentTerminalPanel, type AgentTerminalPanelHandle } from "./agent-terminal-panel";
import { extractTestCall } from "../lib/repl-seed";
import { monacoReady } from "../lib/monaco-setup";
import { useKataNavigation } from "../hooks/use-kata-navigation";
import { createAutosave } from "../lib/autosave";
import { confirmAction } from "../lib/confirm-action";
import { disposeVimMode, syncVimMode, type VimModeState } from "../lib/vim-mode";
import { toast } from "../stores/toast-store";
import { useCommandPaletteStore } from "../stores/command-palette-store";
import { leetcodeNumberFor, leetcodeUrlFor } from "../lib/leetcode-numbers";
import { dpPatternFor, DP_MODULES } from "../lib/dp-patterns";
import { visibleTestCasesFor } from "../lib/visible-testcases";
import { solutionNotesFor } from "../lib/solution-notes";
import { agentPromptFor, buildAgentEditorContext, writeAgentContext, type AgentEditorContext } from "../lib/agent-bridge";
import type { AgentTerminalKind } from "../lib/terminal-pty";
import type { EditorLayoutSettings } from "../stores/settings-store";
import type { Kata, TestResult } from "../types/editor";

type VizKataName =
  | "Kadane's Algorithm"
  | "Min Cost Climbing Stairs"
  | "House Robber"
  | "Median of Two Sorted Arrays"
  | "Merge Two Sorted Lists"
  | "Longest Palindromic Substring"
  | "Binary Tree BFS"
  | "Matrix BFS With Walls"
  | "Matrix Grid BFS"
  | "Shortest Path in Binary Matrix"
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
  | "Find First Occurrence in Sorted Array"
  | "Find Last Occurrence in Sorted Array"
  | "Find First and Last Position of Element in Sorted Array"
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
  | "Prefix Sum Table"
  | "Running Sum of 1d Array"
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
  "Matrix BFS With Walls":        "bfs-grid",
  "Matrix Grid BFS":              "bfs-traversal",
  "Shortest Path in Binary Matrix":"bfs-grid",
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
  "Find First Occurrence in Sorted Array": "binary-search",
  "Find Last Occurrence in Sorted Array": "binary-search",
  "Find First and Last Position of Element in Sorted Array": "binary-search",
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
  "Prefix Sum Table":                   "prefix-sum",
  "Running Sum of 1d Array":            "prefix-sum",
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

type EditorPanel = "description" | "solution" | "notes" | "viz" | "diff";
type ReplLayout = "horizontal" | "vertical";
type MaximizedPane = "repl" | "results" | "terminal" | null;
type OutputTab = "testcase" | "results";

const PYTHON_TEST_MARKER_OWNER = "kata-python-test-runner";
const AGENT_CONTEXT_SAVE_KEY = "current";

export function KataEditor({ kata, isSession, onTestComplete, onAdvance }: KataEditorProps) {
  const { theme, vimMode, toggleVimMode, shortcuts, fontSize, fontFamily, tabSize, hideDescriptionInSession, setSetting, editorAutocomplete, lineNumbersMode, wordWrap, autoClosingBrackets, fontLigatures, highlightOccurrences, bracketPairColorization, agentProvider, agentSystemPrompt } = useSettingsStore();
  const editorLayout = useSettingsStore((s) => s.editorLayout);
  const sessionMaxTestRuns = useSessionStore((s) => s.activeSession?.maxTestRuns ?? null);
  // Attempt limits only apply inside a practice session, never in the standalone editor
  const maxTestRuns = isSession ? sessionMaxTestRuns : null;
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const errorDecorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);
  const vimModeRef = useRef<VimModeState<editor.IStandaloneCodeEditor, VimAdapterInstance> | null>(null);
  const statusBarRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const agentTerminalRef = useRef<AgentTerminalPanelHandle | null>(null);
  const [vizSpeed, setVizSpeed] = useState<"900" | "500" | "200">("500");
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [ranAt, setRanAt] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [outputTab, setOutputTab] = useState<OutputTab>(editorLayout.outputTab);
  const [showTestcasePane, setShowTestcasePane] = useState(editorLayout.outputPaneVisible);
  const [activeTestcaseIndex, setActiveTestcaseIndex] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [kataPassed, setKataPassed] = useState(false);
  const initialPanel: EditorPanel | null = isSession && hideDescriptionInSession ? null : kata.description ? "description" : null;
  const [showPanel, setShowPanel] = useState<EditorPanel | null>(
    isSession && hideDescriptionInSession ? null : editorLayout.problemPanelVisible ? editorLayout.activePanel : null,
  );
  const lastPanelRef = useRef<EditorPanel>(showPanel ?? initialPanel ?? "description");
  const [panelWidth, setPanelWidth] = useState(editorLayout.problemPanelWidth);
  const dragging = useRef(false);
  const [outputPaneHeight, setOutputPaneHeight] = useState(editorLayout.outputPaneHeight);
  const [maximizedPane, setMaximizedPane] = useState<MaximizedPane>(null);
  const outputDragging = useRef(false);
  const [saved, setSaved] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showRepl, setShowRepl] = useState(editorLayout.replVisible);
  const [replLayout, setReplLayout] = useState<ReplLayout>(editorLayout.replLayout);
  const [replFocusNonce, setReplFocusNonce] = useState(0);
  const [showAgentTerminal, setShowAgentTerminal] = useState(false);
  const [agentTerminalKind, setAgentTerminalKind] = useState<AgentTerminalKind>(agentProvider);
  const [agentTerminalLaunchNonce, setAgentTerminalLaunchNonce] = useState(0);
  const [mountedEditor, setMountedEditor] = useState<editor.IStandaloneCodeEditor | null>(null);
  const [activeSolutionVariant, setActiveSolutionVariant] = useState(0);
  const [monacoUp, setMonacoUp] = useState(false);
  useEffect(() => {
    void monacoReady.then(() => setMonacoUp(true));
  }, []);
  const [replSeed, setReplSeed] = useState<ReplSeed | null>(null);
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [codeLoaded, setCodeLoaded] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(true);
  const registerCommand = useCommandPaletteStore((s) => s.registerCommand);

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

  const agentContextAutosave = useRef(
    createAutosave<string>({
      delayMs: 400,
      save: (_id, value) => {
        writeAgentContext(JSON.parse(value) as AgentEditorContext).catch((error) => {
          console.warn("[agent-bridge] Failed to export editor context", error);
        });
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
    bracketPairColorization,
  });

  useEffect(() => {
    prewarmRunner(kata.language);
  }, [kata.id, kata.language]);

  useEffect(() => {
    const current = useSettingsStore.getState().editorLayout;
    const hiddenBySessionSetting = isSession && hideDescriptionInSession;
    const next: EditorLayoutSettings = {
      ...current,
      problemPanelVisible: hiddenBySessionSetting ? current.problemPanelVisible : showPanel !== null,
      activePanel: hiddenBySessionSetting && showPanel === null ? current.activePanel : showPanel ?? lastPanelRef.current,
      replVisible: showRepl,
      replLayout,
      outputPaneVisible: showTestcasePane,
      outputTab,
    };
    void setSetting("editorLayout", next);
  }, [showPanel, showRepl, replLayout, showTestcasePane, outputTab, isSession, hideDescriptionInSession, setSetting]);

  const saveEditorLayout = useCallback((patch: Partial<EditorLayoutSettings>) => {
    void setSetting("editorLayout", {
      ...useSettingsStore.getState().editorLayout,
      ...patch,
    });
  }, [setSetting]);

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
      agentContextAutosave.flush();
    };
  }, [kata.id, autosave, notesAutosave, agentContextAutosave]);

  const vizFolder = VIZ_MAP[kata.name as VizKataName] ?? null;
  const leetcodeNumber = kata.leetcodeNumber ?? leetcodeNumberFor(kata);
  const leetcodeUrl = leetcodeUrlFor(kata);
  const problemTitle = leetcodeNumber != null ? `#${leetcodeNumber} ${kata.name}` : kata.name;
  const solutionVariants = kata.solutionVariants?.length
    ? kata.solutionVariants
    : kata.solution
      ? [{ label: "Standard", code: kata.solution }]
      : [];
  const visibleTestCases = useMemo(() => visibleTestCasesFor(kata), [kata]);
  const hasVisibleTestCases = visibleTestCases.length > 0;
  const replSupported = kata.language !== "java";
  const activeSolution = solutionVariants[Math.min(activeSolutionVariant, Math.max(solutionVariants.length - 1, 0))];
  const activeSolutionNotes = activeSolution ? solutionNotesFor(activeSolution) : null;
  const fallbackPanel: EditorPanel | null = kata.description
    ? "description"
    : solutionVariants.length > 0 && !isSession
      ? "solution"
      : !isSession
        ? "notes"
        : null;
  const hasReplPane = showRepl && replSupported;
  const hasAgentTerminalPane = showAgentTerminal;
  const hasResultsPane = (showTestcasePane && hasVisibleTestCases) || Boolean(results || running);
  const hasOutputPane = hasReplPane || hasResultsPane || hasAgentTerminalPane;
  const workAreaHidden =
    (maximizedPane === "repl" && hasReplPane) ||
    (maximizedPane === "terminal" && hasAgentTerminalPane);
  const editorHidden = workAreaHidden || (maximizedPane === "results" && hasResultsPane);
  const terminalPaneHeight = Math.max(outputPaneHeight, 380);

  const buildCurrentAgentContext = useCallback(() => {
    const editorInstance = editorRef.current;
    const model = editorInstance?.getModel();
    const selection = editorInstance?.getSelection() ?? null;
    const cursor = editorInstance?.getPosition() ?? null;
    const code = editorInstance?.getValue() ?? savedCode ?? kata.code;
    const selectedCode = model && selection ? model.getValueInRange(selection) : "";

    return buildAgentEditorContext({
      kata,
      code,
      selectedCode,
      selection: selection
        ? {
            startLineNumber: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLineNumber: selection.endLineNumber,
            endColumn: selection.endColumn,
          }
        : null,
      cursor: cursor
        ? {
            lineNumber: cursor.lineNumber,
            column: cursor.column,
          }
        : null,
      isSession: Boolean(isSession),
      leetcodeNumber,
      leetcodeUrl,
      visibleTestCases: visibleTestCases.map((testCase) => ({
        name: testCase.testName,
        inputs: Object.fromEntries(testCase.inputs.map((input) => [input.name, input.value])),
        expected: testCase.expected,
      })),
      notes,
      ranAt,
      results,
      hasReferenceSolution: solutionVariants.length > 0,
      activeVariantLabel: activeSolution?.label ?? null,
    });
  }, [
    activeSolution?.label,
    isSession,
    kata,
    leetcodeNumber,
    leetcodeUrl,
    notes,
    ranAt,
    results,
    savedCode,
    solutionVariants.length,
    visibleTestCases,
  ]);

  const scheduleAgentContextExport = useCallback(() => {
    agentContextAutosave.schedule(AGENT_CONTEXT_SAVE_KEY, () => JSON.stringify(buildCurrentAgentContext()));
  }, [agentContextAutosave, buildCurrentAgentContext]);

  const exportAgentContextNow = useCallback(async () => {
    agentContextAutosave.cancel();
    const path = await writeAgentContext(buildCurrentAgentContext());
    toast.success("Agent context exported", 1600);
    return path;
  }, [agentContextAutosave, buildCurrentAgentContext]);

  const copyAgentPrompt = useCallback(async () => {
    agentContextAutosave.cancel();
    const context = buildCurrentAgentContext();
    await writeAgentContext(context);
    await writeText(agentPromptFor(context, agentSystemPrompt));
    toast.success("Agent prompt copied", 1800);
  }, [agentContextAutosave, agentSystemPrompt, buildCurrentAgentContext]);

  const sendAgentPromptToTerminal = useCallback(async () => {
    if (!showAgentTerminal) {
      toast.error("Open the agent first", 1800);
      return;
    }
    agentContextAutosave.cancel();
    const context = buildCurrentAgentContext();
    await writeAgentContext(context);
    const pasted = await agentTerminalRef.current?.pasteText(agentPromptFor(context, agentSystemPrompt));
    if (pasted) {
      toast.success("Agent prompt pasted", 1800);
    } else {
      toast.error("Agent is still starting", 1800);
    }
  }, [agentContextAutosave, agentSystemPrompt, buildCurrentAgentContext, showAgentTerminal]);

  useEffect(() => {
    setActiveSolutionVariant(0);
    setActiveTestcaseIndex(0);
    const persistedLayout = useSettingsStore.getState().editorLayout;
    setShowTestcasePane(persistedLayout.outputPaneVisible);
    setOutputTab(persistedLayout.outputTab);
  }, [kata.id]);

  useEffect(() => {
    if (!hasOutputPane) setMaximizedPane(null);
  }, [hasOutputPane]);

  useEffect(() => {
    if (!showPanel) return;
    const available =
      showPanel === "description" ? Boolean(kata.description)
      : showPanel === "solution" || showPanel === "diff" ? solutionVariants.length > 0 && !isSession
      : showPanel === "viz" ? Boolean(vizFolder) && !isSession
      : showPanel === "notes" ? !isSession
      : false;
    if (!available) setShowPanel(fallbackPanel);
  }, [showPanel, kata.description, solutionVariants.length, vizFolder, isSession, fallbackPanel]);

  useEffect(() => {
    if (showPanel) lastPanelRef.current = showPanel;
  }, [showPanel]);

  const clearEditorErrorMarkers = useCallback(() => {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (monaco && model && !model.isDisposed()) {
      monaco.editor.setModelMarkers(model, PYTHON_TEST_MARKER_OWNER, []);
    }
    errorDecorationsRef.current?.clear();
  }, []);

  const handleEditorMount: OnMount = (editorInstance, monacoInstance) => {
    editorRef.current = editorInstance;
    monacoRef.current = monacoInstance;
    errorDecorationsRef.current = editorInstance.createDecorationsCollection();
    setMountedEditor(editorInstance);
  };

  const { kataStatus, startKataTimer, completeKataTimer } =
    useTimerStore();

  const handleReset = useCallback(async () => {
    if (!editorRef.current) return;
    const ok = await confirmAction({
      message: `Reset code for "${kata.name}"? This restores the starter code and clears your saved edits for this kata.`,
      title: "Reset Code",
      kind: "warning",
      okLabel: "Reset",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    editorRef.current.setValue(kata.code);
    await deleteUserCode(kata.id);
    setSaved(true);
  }, [kata.id, kata.code, kata.name]);

  const handleRun = useCallback(async () => {
    if (!editorRef.current || running) return;
    if (kataStatus === "idle") startKataTimer();
    clearEditorErrorMarkers();
    setOutputTab("results");
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
  }, [kata.id, kata.testCode, kata.language, kataStatus, running, startKataTimer, clearEditorErrorMarkers, completeKataTimer, onTestComplete, maxTestRuns, runCount, kataPassed, onAdvance]);

  const handleToggleSolution = useCallback(() => {
    setShowPanel((v) => (v === "solution" ? null : "solution"));
  }, []);

  const handleToggleRepl = useCallback(() => {
    if (!replSupported) return;
    if (!showRepl) {
      setShowAgentTerminal(false);
      setMaximizedPane(null);
      setReplFocusNonce((nonce) => nonce + 1);
    }
    setShowRepl((v) => !v);
  }, [replSupported, showRepl]);

  const handleOpenRepl = useCallback(() => {
    if (!replSupported) return;
    setShowAgentTerminal(false);
    setMaximizedPane(null);
    setShowRepl(true);
    setReplFocusNonce((nonce) => nonce + 1);
  }, [replSupported]);

  const openAgentTerminal = useCallback((kind: AgentTerminalKind = agentProvider) => {
    setShowRepl(false);
    setMaximizedPane("terminal");
    setAgentTerminalKind(kind);
    setAgentTerminalLaunchNonce(Date.now());
    setShowAgentTerminal(true);
  }, [agentProvider]);

  const handleToggleAgentTerminal = useCallback(() => {
    if (showAgentTerminal) {
      setShowAgentTerminal(false);
      if (maximizedPane === "terminal") setMaximizedPane(null);
      return;
    }
    openAgentTerminal(agentProvider);
  }, [agentProvider, maximizedPane, openAgentTerminal, showAgentTerminal]);

  const copySolutionToEditor = useCallback(() => {
    if (!editorRef.current || !activeSolution) return;
    editorRef.current.setValue(activeSolution.code);
    setSaved(false);
    autosave.schedule(kata.id, () => activeSolution.code);
    toast.success(`Copied ${activeSolution.label} to editor`, 1800);
  }, [activeSolution, autosave, kata.id]);

  const handleToggleProblemPanel = useCallback(() => {
    setShowPanel((panel) => panel === null ? lastPanelRef.current ?? fallbackPanel : null);
  }, [fallbackPanel]);

  const handleToggleOutputPane = useCallback(() => {
    if (hasResultsPane) {
      if (outputTab === "testcase") {
        setShowTestcasePane(false);
        if (results || running) setOutputTab("results");
      } else if (!running) {
        setResults(null);
        if (hasVisibleTestCases) {
          setShowTestcasePane(true);
          setOutputTab("testcase");
        }
      }
      if (maximizedPane === "results" && !results && !running) setMaximizedPane(null);
      return;
    }

    setMaximizedPane(null);
    if (results || running) {
      setOutputTab("results");
      return;
    }
    setShowTestcasePane(true);
    setOutputTab("testcase");
  }, [hasResultsPane, outputTab, results, running, hasVisibleTestCases, maximizedPane]);

  useEffect(() => {
    const testRunDisabled = running || (maxTestRuns !== null && runCount >= maxTestRuns && !kataPassed);
    const commands = [
      {
        id: "editor:run-tests",
        title: "Run Tests",
        section: "Editor",
        shortcut: shortcuts.runTests,
        keywords: ["test", "execute"],
        disabled: testRunDisabled,
        run: () => { void handleRun(); },
      },
      {
        id: "editor:toggle-problem-panel",
        title: showPanel ? "Hide Problem Panel" : "Show Problem Panel",
        section: "Editor",
        keywords: ["description", "left panel"],
        run: handleToggleProblemPanel,
      },
      {
        id: "editor:toggle-solution",
        title: showPanel === "solution" ? "Hide Solutions" : "Show Solutions",
        section: "Editor",
        shortcut: shortcuts.toggleSolution,
        keywords: ["answer", "reference"],
        disabled: solutionVariants.length === 0 || isSession,
        run: handleToggleSolution,
      },
      {
        id: "editor:toggle-repl",
        title: showRepl ? "Hide REPL" : "Open REPL",
        section: "Editor",
        shortcut: shortcuts.toggleRepl,
        keywords: ["terminal", "console"],
        disabled: !replSupported,
        run: handleToggleRepl,
      },
      {
        id: "editor:open-agent-terminal",
        title: showAgentTerminal ? "Hide Agent" : `Open ${agentProvider === "claude" ? "Claude" : "Codex"}`,
        subtitle: "Launch the configured coding agent",
        section: "Editor",
        keywords: ["terminal", "agent", "claude", "codex"],
        run: handleToggleAgentTerminal,
      },
      {
        id: "editor:copy-solution",
        title: "Copy Solution to Editor",
        section: "Editor",
        keywords: ["copy", "reference"],
        disabled: !activeSolution || isSession,
        run: copySolutionToEditor,
      },
      {
        id: "editor:export-agent-context",
        title: "Export Agent Context",
        subtitle: "Refresh current code, tests, and latest results for agents",
        section: "Editor",
        keywords: ["agent", "helper", "context", "debug"],
        run: () => { void exportAgentContextNow(); },
      },
      {
        id: "editor:ask-agent",
        title: "Ask Agent",
        subtitle: "Copy a tutoring prompt from the current problem",
        section: "Editor",
        keywords: ["agent", "help", "hint", "debug", "prompt"],
        run: () => { void copyAgentPrompt(); },
      },
      {
        id: "editor:send-agent-prompt-to-terminal",
        title: "Send Agent Prompt",
        subtitle: "Paste the current tutoring prompt into the open agent",
        section: "Editor",
        keywords: ["agent", "terminal", "prompt", "paste", "claude", "codex"],
        disabled: !showAgentTerminal,
        run: () => { void sendAgentPromptToTerminal(); },
      },
      {
        id: "editor:reset-code",
        title: "Reset Code",
        section: "Editor",
        keywords: ["restore", "starter"],
        run: () => { void handleReset(); },
      },
      {
        id: "editor:previous-kata",
        title: "Previous Kata",
        section: "Editor",
        shortcut: shortcuts.prevKata,
        disabled: !navigation.hasPrev,
        run: () => navigation.prev(),
      },
      {
        id: "editor:next-kata",
        title: "Next Kata",
        section: "Editor",
        shortcut: shortcuts.nextKata,
        disabled: !navigation.hasNext,
        run: () => navigation.next(),
      },
    ];

    if (leetcodeUrl) {
      commands.push({
        id: "editor:open-leetcode",
        title: "Open on LeetCode",
        section: "Editor",
        keywords: ["leetcode", "external"],
        run: () => { void open(leetcodeUrl); },
      });
    }

    const unregister = commands.map((command) => registerCommand(command));
    return () => unregister.forEach((fn) => fn());
  }, [
    activeSolution,
    agentProvider,
    copyAgentPrompt,
    copySolutionToEditor,
    exportAgentContextNow,
    handleReset,
    handleRun,
    handleToggleAgentTerminal,
    handleToggleProblemPanel,
    handleToggleRepl,
    handleToggleSolution,
    isSession,
    kataPassed,
    leetcodeUrl,
    maxTestRuns,
    navigation,
    registerCommand,
    replSupported,
    runCount,
    sendAgentPromptToTerminal,
    running,
    shortcuts.nextKata,
    shortcuts.prevKata,
    shortcuts.runTests,
    shortcuts.toggleRepl,
    shortcuts.toggleSolution,
    showPanel,
    showAgentTerminal,
    showRepl,
    solutionVariants.length,
  ]);

  useEffect(() => {
    if (!codeLoaded) return;
    scheduleAgentContextExport();
  }, [codeLoaded, scheduleAgentContextExport]);

  useEffect(() => {
    if (!mountedEditor) return;
    const disposable = mountedEditor.onDidChangeCursorSelection(() => {
      scheduleAgentContextExport();
    });
    return () => disposable.dispose();
  }, [mountedEditor, scheduleAgentContextExport]);

  // Memoized: useKeyboardShortcuts lists `handlers` in a useEffect dependency
  // array, and KataEditor re-renders on every keystroke. A fresh object literal
  // would tear down and rebind the window listener on each one.
  const shortcutHandlers = useMemo(
    () => ({
      runTests: handleRun,
      toggleSolution: handleToggleSolution,
      toggleRepl: handleOpenRepl,
      nextKata: () => (navigation.hasNext ? navigation.next() : nudge()),
      prevKata: () => (navigation.hasPrev ? navigation.prev() : nudge()),
    }),
    [handleRun, handleToggleSolution, handleOpenRepl, navigation.hasNext, navigation.hasPrev, navigation.next, navigation.prev, nudge],
  );

  useKeyboardShortcuts(shortcutHandlers);

  // When viz panel opens the Monaco editor unmounts; drop any editor-specific
  // Vim adapter so returning to code creates a fresh binding.
  useEffect(() => {
    if (showPanel === "viz") {
      editorRef.current = null;
      setMountedEditor(null);
      vimModeRef.current = disposeVimMode(vimModeRef.current);
    }
  }, [showPanel]);

  // Vim mode lifecycle
  useEffect(() => {
    vimModeRef.current = syncVimMode({
      enabled: vimMode,
      editor: mountedEditor,
      statusBar: statusBarRef.current,
      current: vimModeRef.current,
      init: initVimMode,
    });
  }, [vimMode, mountedEditor]);

  useEffect(() => {
    return () => {
      clearEditorErrorMarkers();
      vimModeRef.current = disposeVimMode(vimModeRef.current);
    };
  }, [clearEditorErrorMarkers]);

  useEffect(() => {
    const monaco = monacoRef.current;
    const editorInstance = mountedEditor;
    const model = editorInstance?.getModel();
    if (!monaco || !editorInstance || !model || model.isDisposed()) return;

    const failedUserError = results?.find(
      (result) => kata.language === "python" && !result.passed && result.errorSource === "user" && result.lineNumber != null,
    );

    if (!errorDecorationsRef.current) {
      errorDecorationsRef.current = editorInstance.createDecorationsCollection();
    }

    if (!failedUserError) {
      monaco.editor.setModelMarkers(model, PYTHON_TEST_MARKER_OWNER, []);
      errorDecorationsRef.current.clear();
      return;
    }

    const lineNumber = Math.max(1, Math.min(model.getLineCount(), failedUserError.lineNumber!));
    const endColumn = model.getLineMaxColumn(lineNumber);
    const message = failedUserError.error ?? "Python test failure";

    monaco.editor.setModelMarkers(model, PYTHON_TEST_MARKER_OWNER, [
      {
        severity: monaco.MarkerSeverity.Error,
        source: "Code Kata tests",
        message,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn,
      },
    ]);

    errorDecorationsRef.current.set([
      {
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn,
        },
        options: {
          isWholeLine: true,
          className: "kata-error-line",
          glyphMarginClassName: "kata-error-glyph",
          linesDecorationsClassName: "kata-error-line-decoration",
          hoverMessage: { value: message },
        },
      },
    ]);

    editorInstance.revealLineInCenterIfOutsideViewport(lineNumber);

    return () => {
      if (!model.isDisposed()) monaco.editor.setModelMarkers(model, PYTHON_TEST_MARKER_OWNER, []);
      errorDecorationsRef.current?.clear();
    };
  }, [kata.id, kata.language, mountedEditor, results]);

  // Gutter drag to resize side panel
  const onGutterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const startX = e.clientX;
    const startWidth = panelWidth;
    let nextWidth = startWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX;
      nextWidth = Math.max(200, Math.min(800, startWidth + delta));
      setPanelWidth(nextWidth);
    };

    const onMouseUp = () => {
      dragging.current = false;
      saveEditorLayout({ problemPanelWidth: nextWidth });
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [panelWidth, saveEditorLayout]);

  const onOutputResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (maximizedPane === "results" || maximizedPane === "terminal") return;
    e.preventDefault();
    outputDragging.current = true;
    const startY = e.clientY;
    const startHeight = outputPaneHeight;
    let nextHeight = startHeight;

    const onMouseMove = (ev: MouseEvent) => {
      if (!outputDragging.current) return;
      const delta = startY - ev.clientY;
      const maxHeight = Math.max(220, window.innerHeight - 180);
      nextHeight = Math.max(160, Math.min(maxHeight, startHeight + delta));
      setOutputPaneHeight(nextHeight);
    };

    const onMouseUp = () => {
      outputDragging.current = false;
      saveEditorLayout({ outputPaneHeight: nextHeight });
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [outputPaneHeight, maximizedPane, saveEditorLayout]);

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
    `px-3.5 py-2 text-sm font-medium border-b-2 transition-colors ${
      showPanel === tab
        ? "border-primary text-primary"
        : "border-transparent text-base-content/40 hover:text-base-content/70"
    }`;
  const toolbarButtonClass = "btn btn-sm h-7 min-h-7 px-2.5 text-xs";
  const toolbarIconButtonClass = "btn btn-sm btn-square h-7 min-h-7 w-8";

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
      {solutionVariants.length > 0 && !isSession && (
        <button
          onClick={() => toggleMode
            ? setShowPanel((v) => v === "solution" ? null : "solution")
            : setShowPanel("solution")}
          title={`Toggle solution (${fmtCombo(shortcuts.toggleSolution)})`}
          className={tabClass("solution")}
        >
          Solutions
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
      {leetcodeUrl && (
        <button
          onClick={() => open(leetcodeUrl)}
          title="Open on LeetCode"
          className="inline-flex items-center px-3.5 py-2 text-sm font-medium border-b-2 border-transparent text-base-content/40 transition-colors hover:text-base-content/70"
        >
          LeetCode
        </button>
      )}
      {vizFolder && !isSession && (
        <button
          onClick={() => setShowPanel((v) => v === "viz" ? null : "viz")}
          className={`${tabClass("viz")} inline-flex items-center`}
        >
          Viz
        </button>
      )}

      {fallbackPanel && (
        <button
          onClick={() => setShowPanel((panel) => panel ? null : lastPanelRef.current ?? fallbackPanel)}
          title={showPanel ? "Hide left panel" : "Show left panel"}
          className={`${toolbarIconButtonClass} btn-ghost self-center ml-1 text-base-content/35 hover:text-base-content/70`}
          aria-label={showPanel ? "Hide left panel" : "Show left panel"}
        >
          {showPanel ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Viz controls (viz tab only) */}
      {showPanel === "viz" && (
        <div className="flex items-center gap-1 px-2">
          <div className="join">
            <button onClick={() => sendVizMsg('prev')} title="Previous step" className={`${toolbarButtonClass} join-item gap-1.5 border-base-300/60 bg-base-100 text-base-content/70 hover:bg-base-300/40`}><ArrowLeft size={16} /><span>Prev</span></button>
            <button onClick={() => sendVizMsg('step')} title="Next step" className={`${toolbarButtonClass} join-item gap-1.5 border-base-300/60 bg-base-100 text-base-content/70 hover:bg-base-300/40`}><span>Step</span><StepForward size={16} /></button>
            <button onClick={() => sendVizMsg('play')} title="Play through remaining steps automatically" className={`${toolbarButtonClass} join-item gap-1.5 border-primary/50 bg-primary/10 text-primary hover:bg-primary/20`}><Play size={16} /><span>Play</span></button>
            <button onClick={() => sendVizMsg('reset')} title="Reset to the first step" className={`${toolbarButtonClass} join-item gap-1.5 border-base-300/60 bg-base-100 text-base-content/70 hover:bg-base-300/40`}><RotateCcw size={16} /><span>Reset</span></button>
          </div>
          <div className="w-px self-stretch bg-base-300/60 mx-1" />
          <div className="flex items-center gap-0.5">
            {(["900", "500", "200"] as const).map((s, i) => (
              <button
                key={s}
                onClick={() => { setVizSpeed(s); sendVizMsg({ type: 'speed', value: s }); }}
                title="Playback speed"
                className={`${toolbarButtonClass} px-2 ${vizSpeed === s ? "btn-primary" : "btn-ghost text-base-content/35"}`}
              >
                {["Slow", "Norm", "Fast"][i]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor controls (all other tabs) */}
      {showPanel !== "viz" && (
      <div className="flex items-center gap-2 px-2.5">
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
          className={`${toolbarIconButtonClass} btn-ghost text-base-content/35 hover:text-base-content/70`}
          aria-label="Reset to original"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => setShowConfig((v) => !v)}
          title="Editor settings"
          className={`${toolbarIconButtonClass} ${showConfig ? "btn-primary" : "btn-ghost text-base-content/35 hover:text-base-content/70"}`}
          aria-label="Editor settings"
        >
          <Settings size={16} />
        </button>
        {showConfig && (
          <div className="absolute top-full right-0 mt-1 z-50 w-56 rounded-lg border border-base-300/50 bg-base-100 shadow-lg py-2 px-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-base-content/45">font size</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setSetting("fontSize", Math.max(10, fontSize - 1))} className={toolbarIconButtonClass} aria-label="Decrease font size"><Minus size={16} /></button>
                <span className="text-xs font-mono w-5 text-center tabular-nums">{fontSize}</span>
                <button onClick={() => setSetting("fontSize", Math.min(28, fontSize + 1))} className={toolbarIconButtonClass} aria-label="Increase font size"><Plus size={16} /></button>
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
        {replSupported && (
          <button
            onClick={handleToggleRepl}
            title={`Toggle REPL. Shortcut opens and focuses it (${fmtCombo(shortcuts.toggleRepl)})`}
            className={`${toolbarIconButtonClass} ${showRepl ? "btn-info" : "btn-ghost text-base-content/40"}`}
            aria-label="Toggle REPL"
          >
            <Terminal size={16} />
          </button>
        )}
        <button
          onClick={handleToggleAgentTerminal}
          title={showAgentTerminal ? "Hide agent" : `Open ${agentProvider === "claude" ? "Claude" : "Codex"}`}
          className={`${toolbarIconButtonClass} ${showAgentTerminal ? "btn-info" : "btn-ghost text-base-content/40"}`}
          aria-label={showAgentTerminal ? "Hide agent" : `Open ${agentProvider === "claude" ? "Claude" : "Codex"}`}
        >
          <BotMessageSquare size={16} />
        </button>
        {showAgentTerminal && (
          <button
            onClick={() => { void sendAgentPromptToTerminal(); }}
            title="Paste agent prompt"
            className={`${toolbarButtonClass} btn-ghost gap-1.5 text-base-content/50 hover:text-base-content/80`}
          >
            <span>Send</span>
            <ArrowRight size={16} />
          </button>
        )}
        {(hasVisibleTestCases || results || running) && (
          <button
            onClick={handleToggleOutputPane}
            title={hasResultsPane ? "Hide testcase/test result" : results || running ? "Show test result" : "Show testcase"}
            className={`${toolbarIconButtonClass} ${
              hasResultsPane ? "btn-info" : "btn-ghost text-base-content/40"
            }`}
            aria-label={hasResultsPane ? "Hide testcase/test result" : results || running ? "Show test result" : "Show testcase"}
          >
            <ListChecks size={16} />
          </button>
        )}
        <button
          onClick={handleRun}
          disabled={running || (maxTestRuns !== null && runCount >= maxTestRuns && !kataPassed)}
          title={`Run tests (${fmtCombo(shortcuts.runTests)})`}
          className={`${toolbarButtonClass} btn-primary gap-1.5`}
        >
          {running ? "..." : <><Play size={16} /><span>run</span></>}
        </button>
      </div>
      )}
    </div>
  );

  const splitButtonClass = (active: boolean) =>
    `btn btn-ghost btn-sm btn-square h-7 min-h-7 ${
      active ? "text-primary bg-primary/10" : "text-base-content/35 hover:text-base-content/70"
    }`;

  const renderReplPane = () => (
    <div
      className={`min-h-0 flex flex-col bg-base-200 ${
        maximizedPane === "repl"
          ? "flex-1"
          : replLayout === "vertical"
            ? "flex-1 basis-0 border-l border-base-300/60"
            : "flex-1 basis-0 border-t border-base-300/60"
      }`}
    >
      <div className="flex items-center px-3 py-1 border-b border-base-300/60 bg-base-200 shrink-0">
        <button
          onClick={() => {
            setShowRepl(false);
            if (maximizedPane === "repl") setMaximizedPane(null);
          }}
          className="text-xs text-base-content/30 hover:text-base-content/60 transition-colors mr-2"
          title="Close REPL"
          aria-label="Close REPL"
        >
          <X size={16} />
        </button>
        <span className="text-xs text-base-content/45">repl · {kata.language}</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="join">
            <button
              onClick={() => {
                setReplLayout("vertical");
                setMaximizedPane(null);
                setReplFocusNonce((nonce) => nonce + 1);
              }}
              className={`${splitButtonClass(replLayout === "vertical" && maximizedPane !== "repl")} join-item`}
              title="Split problem and REPL side by side"
              aria-label="Split problem and REPL side by side"
            >
              <SquareSplitHorizontal size={16} />
            </button>
            <button
              onClick={() => {
                setReplLayout("horizontal");
                setMaximizedPane(null);
                setReplFocusNonce((nonce) => nonce + 1);
              }}
              className={`${splitButtonClass(replLayout === "horizontal" && maximizedPane !== "repl")} join-item`}
              title="Split problem and REPL stacked"
              aria-label="Split problem and REPL stacked"
            >
              <SquareSplitVertical size={16} />
            </button>
          </div>
          <button
            onClick={() => setMaximizedPane((pane) => (pane === "repl" ? null : "repl"))}
            className={`${toolbarIconButtonClass} btn-ghost text-base-content/35 hover:text-base-content/70`}
            title={maximizedPane === "repl" ? "Restore REPL split" : "Maximize REPL"}
            aria-label={maximizedPane === "repl" ? "Restore REPL split" : "Maximize REPL"}
          >
            {maximizedPane === "repl" ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      <ReplPanel
        key={kata.id}
        language={kata.language}
        getEditorCode={() => editorRef.current?.getValue() ?? null}
        seed={replSeed}
        focusNonce={replFocusNonce}
      />
    </div>
  );

  const renderAgentTerminalPane = () => (
    <div
      className={`min-h-0 flex flex-col bg-base-200 ${
        maximizedPane === "terminal"
          ? "flex-1"
          : replLayout === "vertical"
            ? "flex-1 basis-0 border-l border-base-300/60"
            : "shrink-0 border-t border-base-300/60"
      }`}
      style={maximizedPane === "terminal" || replLayout === "vertical" ? undefined : { height: terminalPaneHeight }}
    >
      {replLayout === "horizontal" && (
        <div
          onMouseDown={onOutputResizeMouseDown}
          className={`h-1 shrink-0 bg-base-300/60 transition-colors ${
            maximizedPane === "terminal" ? "cursor-default" : "cursor-row-resize hover:bg-primary"
          }`}
        />
      )}
      <AgentTerminalPanel
        ref={agentTerminalRef}
        launchKind={agentTerminalKind}
        launchNonce={agentTerminalLaunchNonce}
        theme={theme}
        fontFamily={fontFamily}
        fontSize={fontSize}
        layout={replLayout}
        maximized={maximizedPane === "terminal"}
        onClose={() => {
          setShowAgentTerminal(false);
          if (maximizedPane === "terminal") setMaximizedPane(null);
        }}
        onLayoutChange={(layout) => {
          setReplLayout(layout);
          setMaximizedPane(null);
        }}
        onToggleMaximized={() => setMaximizedPane((pane) => (pane === "terminal" ? null : "terminal"))}
      />
    </div>
  );

  const renderTitleBar = () => (
    <div className="shrink-0 border-b border-base-300/60 bg-base-100 px-4 py-2">
      <h1 className="truncate text-sm font-semibold text-base-content">
        {problemTitle}
      </h1>
    </div>
  );

  if (!codeLoaded || !monacoUp) return null;

  const initialCode = isSession ? kata.code : (savedCode ?? kata.code);

  if (showPanel === "viz" && vizFolder) {
    return (
      <div className="flex flex-col h-full">
        {renderTitleBar()}
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
      {renderTitleBar()}
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
            {showPanel === "solution" && activeSolution && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="border-b border-base-300/60 bg-base-100">
                  <div className="flex items-center gap-1 px-2 py-1.5">
                    {solutionVariants.length > 1 && (
                      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
                        {solutionVariants.map((variant, index) => (
                          <button
                            key={variant.label}
                          onClick={() => setActiveSolutionVariant(index)}
                          className={`${toolbarButtonClass} shrink-0 ${index === activeSolutionVariant ? "btn-primary" : "btn-ghost text-base-content/50"}`}
                          >
                            {variant.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {solutionVariants.length <= 1 && (
                      <div className="min-w-0 flex-1 text-xs font-semibold text-base-content/45">
                        Solution
                      </div>
                    )}
                    <button
                      onClick={copySolutionToEditor}
                      className={`${toolbarButtonClass} btn-ghost shrink-0 gap-1 text-base-content/45 hover:text-base-content/80`}
                      title="Copy solution to editor"
                    >
                      <span>copy</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  {activeSolutionNotes && (
                    <div className="space-y-2 border-t border-base-300/60 px-4 py-3 text-xs text-base-content/60">
                      <div>
                        <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/35">
                          Complexity
                        </div>
                        <div className="font-mono text-base-content/65">{activeSolutionNotes.complexity}</div>
                      </div>
                      <div className="leading-relaxed">{activeSolutionNotes.approach}</div>
                    </div>
                  )}
                </div>
                <Editor
                  value={activeSolution.code}
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

        {/* Editor/results area + REPL split */}
        <div
          className={`flex flex-1 min-w-0 min-h-0 ${
            ((hasAgentTerminalPane && replLayout === "horizontal") || (hasReplPane && replLayout === "horizontal")) &&
            maximizedPane !== "repl" &&
            maximizedPane !== "terminal"
              ? "flex-col"
              : "flex-row"
          }`}
        >
          {!workAreaHidden && (
            <div className={`flex flex-col min-w-0 min-h-0 ${hasOutputPane ? "flex-1 basis-0" : "flex-1"}`}>
              {/* Monaco editor */}
              <div className={`${editorHidden ? "hidden" : "flex-1"} min-h-0`}>
                <Editor
                  key={kata.id}
                  defaultValue={initialCode}
                  language={kata.language}
                  theme={monacoTheme}
                  options={sharedEditorOptions}
                  onMount={handleEditorMount}
                  onChange={() => {
                    clearEditorErrorMarkers();
                    setSaved(false);
                    autosave.schedule(kata.id, () => editorRef.current?.getValue());
                    scheduleAgentContextExport();
                  }}
                />
              </div>

              {hasResultsPane && (
                <div
                  className={`${maximizedPane === "results" ? "flex-1" : "shrink-0"} min-h-0 flex flex-col border-t border-base-300/60 bg-base-200`}
                  style={maximizedPane === "results" ? undefined : { height: outputPaneHeight }}
                >
                  <div
                    onMouseDown={onOutputResizeMouseDown}
                    className={`h-1 shrink-0 bg-base-300/60 transition-colors ${
                      maximizedPane === "results" ? "cursor-default" : "cursor-row-resize hover:bg-primary"
                    }`}
                  />

                  <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex items-center px-3 py-1 border-b border-base-300/60 bg-base-200 shrink-0">
                      <button
                        onClick={() => {
                          if (outputTab === "testcase") {
                            setShowTestcasePane(false);
                            if (results || running) setOutputTab("results");
                            if (maximizedPane === "results" && !results && !running) setMaximizedPane(null);
                            return;
                          }
                          if (!running) {
                            setResults(null);
                            if (hasVisibleTestCases) {
                              setShowTestcasePane(true);
                              setOutputTab("testcase");
                            }
                          }
                          if (maximizedPane === "results" && !hasVisibleTestCases) setMaximizedPane(null);
                        }}
                        disabled={outputTab === "results" && running}
                        className="text-xs text-base-content/30 hover:text-base-content/60 transition-colors mr-2 disabled:cursor-not-allowed disabled:opacity-30"
                        title={outputTab === "testcase" ? "Close testcases" : "Close results"}
                        aria-label={outputTab === "testcase" ? "Close testcases" : "Close results"}
                      >
                        <X size={16} />
                      </button>
                      <div className="join">
                        {hasVisibleTestCases && (
                          <button
                            onClick={() => {
                              setShowTestcasePane(true);
                              setOutputTab("testcase");
                            }}
                            className={`${toolbarButtonClass} join-item border-base-300/60 ${
                              outputTab === "testcase" ? "btn-primary" : "btn-ghost text-base-content/45"
                            }`}
                          >
                            Testcase
                          </button>
                        )}
                        <button
                          onClick={() => setOutputTab("results")}
                          disabled={!running && !results}
                          className={`${toolbarButtonClass} join-item border-base-300/60 ${
                            outputTab === "results" ? "btn-primary" : "btn-ghost text-base-content/45"
                          }`}
                        >
                          Test Result
                        </button>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        {outputTab === "results" && !running && results && results.length > 0 && results.every((r) => r.passed) && kata.solution && (
                          <button
                            onClick={() => setShowPanel((v) => (v === "diff" ? null : "diff"))}
                            className={`${toolbarButtonClass} btn-ghost gap-1.5 text-success/70 hover:text-success`}
                            title="Compare your code with the reference solution"
                          >
                            <GitCompareArrows size={16} />
                            <span>compare solution</span>
                          </button>
                        )}
                        <button
                          onClick={() => setMaximizedPane((pane) => (pane === "results" ? null : "results"))}
                          className={`${toolbarIconButtonClass} btn-ghost text-base-content/35 hover:text-base-content/70`}
                          title={maximizedPane === "results" ? "Restore results pane" : "Maximize results pane"}
                          aria-label={maximizedPane === "results" ? "Restore results pane" : "Maximize results pane"}
                        >
                          {maximizedPane === "results" ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      {outputTab === "testcase" && showTestcasePane && hasVisibleTestCases ? (
                        <TestcasePanel
                          cases={visibleTestCases}
                          activeIndex={activeTestcaseIndex}
                          onActiveIndexChange={setActiveTestcaseIndex}
                        />
                      ) : running ? (
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
                            setShowAgentTerminal(false);
                            setShowRepl(true);
                            setMaximizedPane(null);
                            setReplSeed({ expression, nonce: Date.now() });
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-base-content/35">
                          Run tests to see results.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasReplPane && renderReplPane()}
          {hasAgentTerminalPane && renderAgentTerminalPane()}
        </div>
      </div>
    </div>
  );
}
