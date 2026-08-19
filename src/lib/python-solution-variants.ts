import type { SeedKata, SolutionVariant } from "../types/editor";

type VariantMetadata = Pick<SolutionVariant, "complexity" | "explanation">;

const exactMetadata: Record<string, VariantMetadata> = {
  "Median of Two Sorted Arrays": {
    complexity: "Time: O(log(min(m,n))), Space: O(1)",
    explanation: "Binary-searches the partition in the smaller array so the merged median can be read from the partition boundaries.",
  },
  "Time Based Key-Value Store": {
    complexity: "Time: O(1) set, O(log n) get; Space: O(n)",
    explanation: "Stores each key's values in timestamp order and uses binary search to find the latest value not after the query time.",
  },
  "Koko Eating Bananas": {
    complexity: "Time: O(n log m), Space: O(1)",
    explanation: "Binary-searches the eating speed and scans the piles to test whether that speed finishes within the hour limit.",
  },
  "Find Median from Data Stream": {
    complexity: "Time: O(log n) add, O(1) median; Space: O(n)",
    explanation: "Maintains a max-heap for the lower half and a min-heap for the upper half so the median is always at the heap tops.",
  },
  "Design Twitter": {
    complexity: "Time: O(f log f) feed, O(1) post/follow; Space: O(t + f)",
    explanation: "Keeps tweets by user and merges the most recent followed-user streams with a heap when the feed is requested.",
  },
  "LRU Cache": {
    complexity: "Time: O(1) get/put, Space: O(capacity)",
    explanation: "Combines a hash map with recency ordering so reads and writes can move keys to the most-recent position.",
  },
  "Detect Squares": {
    complexity: "Time: O(y) count, O(1) add; Space: O(n)",
    explanation: "Counts points by coordinate and checks possible vertical partners to form axis-aligned squares with the query point.",
  },
};

const tagMetadata: Array<[string, VariantMetadata]> = [
  ["backtracking", {
    complexity: "Time: O(branches^depth), Space: O(depth)",
    explanation: "Uses depth-first backtracking to build candidates, abandon invalid branches, and restore state before trying the next choice.",
  }],
  ["2-d-dp", {
    complexity: "Time: O(m*n), Space: O(m*n)",
    explanation: "Builds dynamic-programming states over two dimensions so each state can reuse previously solved neighbors.",
  }],
  ["dynamic-programming", {
    complexity: "Time: O(n * state options), Space: O(state options)",
    explanation: "Stores reusable subproblem answers and advances the recurrence in an order that makes each dependency available.",
  }],
  ["binary-search", {
    complexity: "Time: O(log n), Space: O(1)",
    explanation: "Repeatedly discards half of the remaining search space using the sorted or monotonic structure of the input.",
  }],
  ["graphs", {
    complexity: "Time: O(V + E), Space: O(V + E)",
    explanation: "Builds or traverses graph state while tracking visited nodes so each reachable node and edge is processed a bounded number of times.",
  }],
  ["graph", {
    complexity: "Time: O(V + E), Space: O(V + E)",
    explanation: "Builds or traverses graph state while tracking visited nodes so each reachable node and edge is processed a bounded number of times.",
  }],
  ["trees", {
    complexity: "Time: O(n), Space: O(h)",
    explanation: "Traverses the tree once and keeps only the recursion or traversal frontier needed for the current path or level.",
  }],
  ["heap", {
    complexity: "Time: O(n log n), Space: O(n)",
    explanation: "Uses a heap to repeatedly access the next smallest or largest candidate without fully resorting after each update.",
  }],
  ["stack", {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Scans the input once while a stack stores unresolved items until the current value can settle them.",
  }],
  ["linked-list", {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Walks the list with pointer rewiring or pointer comparisons so nodes are processed without extra per-node storage.",
  }],
  ["two-pointers", {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Moves two indices or pointers through the input while preserving the invariant needed to decide the next move.",
  }],
  ["sliding-window", {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Expands and shrinks a window so each element enters and leaves the tracked range at most once.",
  }],
  ["intervals", {
    complexity: "Time: O(n log n), Space: O(n)",
    explanation: "Sorts intervals or queries first, then scans in order while keeping only active or merged ranges.",
  }],
  ["arrays-hashing", {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Scans the collection once while hash-based state records the values, counts, or indices needed for constant-time checks.",
  }],
  ["hash-map", {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Uses hash-table lookups to turn repeated membership or count checks into constant-time operations during the scan.",
  }],
  ["matrix", {
    complexity: "Time: O(m*n), Space: O(m*n)",
    explanation: "Visits grid cells in a controlled order while storing the frontier, visited state, or output matrix needed by the algorithm.",
  }],
  ["math-geometry", {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Applies arithmetic invariants directly and keeps only the running values needed to form the answer.",
  }],
  ["bit-manipulation", {
    complexity: "Time: O(1), Space: O(1)",
    explanation: "Uses fixed-width integer bit operations to derive the answer without auxiliary data structures.",
  }],
  ["sorting", {
    complexity: "Time: O(n log n), Space: O(n)",
    explanation: "Sorts the input to expose order, adjacency, or sweep-line structure before building the answer.",
  }],
];

const defaultMetadata: VariantMetadata = {
  complexity: "Time: O(n), Space: O(n)",
  explanation: "Uses the seed's canonical Python implementation and keeps the auxiliary state required by the problem while preserving the expected API.",
};

const canonicalMetadataFor = (kata: SeedKata): VariantMetadata => {
  const byName = exactMetadata[kata.name];
  if (byName) return byName;

  for (const [tag, metadata] of tagMetadata) {
    if (kata.category === tag || kata.tags.includes(tag)) return metadata;
  }

  return defaultMetadata;
};

export const canonicalPythonSolutionVariant = (kata: SeedKata): SolutionVariant | null => {
  if (kata.language !== "python" || !kata.solution?.trim()) return null;

  return {
    label: "Reference solution",
    code: kata.solution,
    ...canonicalMetadataFor(kata),
  };
};

export const enrichMissingPythonSolutionVariants = <T extends SeedKata>(katas: T[]): T[] => {
  for (const kata of katas) {
    const metadata = canonicalMetadataFor(kata);

    if (kata.solutionVariants?.length) {
      kata.solutionVariants = kata.solutionVariants.map((variant) => ({
        ...variant,
        complexity: variant.complexity ?? metadata.complexity,
        explanation: variant.explanation ?? metadata.explanation,
      }));
      continue;
    }

    const variant = canonicalPythonSolutionVariant(kata);
    if (variant) kata.solutionVariants = [variant];
  }

  return katas;
};
