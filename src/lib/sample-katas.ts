import type { SeedKata } from "../types/editor";

export const sampleKatas: SeedKata[] = [
  {
    name: "Maximum Subarray",
    category: "1-d-dp",
    language: "javascript",
    difficulty: "medium",
    description:
      "Find the contiguous subarray within an array of integers which has the largest sum. Track a running current sum and a global max. If current sum drops below zero, reset it to zero and start fresh from the next element.\n\nExample 1:\n  Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\n  Output: 6  (subarray [4, -1, 2, 1])\n\nExample 2:\n  Input: nums = [1]\n  Output: 1\n\nExample 3:\n  Input: nums = [5, 4, -1, 7, 8]\n  Output: 23  (subarray [5, 4, -1, 7, 8])\n\nRef: LeetCode #53 Maximum Subarray",
    code: `function maxSubarraySum(nums) {
  // your code here
}`,
    testCode: `function test_mixed_array() {
  assertEqual(maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6, "max subarray of mixed array");
}

function test_all_negative() {
  assertEqual(maxSubarraySum([-3, -1, -2]), -1, "max subarray of all negatives");
}

function test_all_positive() {
  assertEqual(maxSubarraySum([1, 2, 3]), 6, "max subarray of all positives");
}

function test_single_positive() {
  assertEqual(maxSubarraySum([5]), 5, "single positive element");
}

function test_single_negative() {
  assertEqual(maxSubarraySum([-5]), -5, "single negative element");
}

function test_mixed_with_positive_end() {
  assertEqual(maxSubarraySum([-1, 2, 3, -4, 5]), 6, "mixed array ending with positive");
}`,
    solution: `function maxSubarraySum(nums) {
  let maxSum = nums[0];
  let current = nums[0];

  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    maxSum = Math.max(maxSum, current);
  }

  return maxSum;
}`,
    usage: `Maximum Subarray solves the maximum subarray problem in O(n) time by maintaining a running sum and resetting it when it drops below zero. Its most direct real-world application is in quantitative finance: traders use the maximum subarray pattern on daily profit/loss arrays to identify the most profitable contiguous trading window, which is exactly how you determine the optimal buy and sell dates for a stock. Signal processing systems apply the same logic to find the strongest contiguous signal burst in noisy data. Genomic analysis tools use maximum subarray variants to locate regions of a DNA sequence with the highest concentration of a particular nucleotide pattern. In interviews at trading firms like Jane Street, Citadel, and Two Sigma, Maximum Subarray frequently appears both in its pure form and as the core idea behind more complex problems involving 2D matrices or circular arrays.`,
    tags: ["dynamic-programming", "greedy", "neetcode"],
  },
  {
    name: "Climbing Stairs",
    category: "1-d-dp",
    language: "javascript",
    difficulty: "easy",
    description:
      "You are climbing a staircase with n steps. Each time you can climb either 1 or 2 steps. Count how many distinct ways you can reach the top. This follows the Fibonacci pattern: ways(n) = ways(n-1) + ways(n-2), with base cases ways(1) = 1 and ways(2) = 2.\n\nExample 1:\n  Input: n = 2\n  Output: 2  (1+1 or 2)\n\nExample 2:\n  Input: n = 3\n  Output: 3  (1+1+1, 1+2, 2+1)\n\nExample 3:\n  Input: n = 5\n  Output: 8\n\nRef: LeetCode #70 Climbing Stairs",
    code: `function climbStairs(n) {
  // your code here
}`,
    testCode: `function test_one_step() {
  assertEqual(climbStairs(1), 1, "1 step has 1 way");
}

function test_two_steps() {
  assertEqual(climbStairs(2), 2, "2 steps has 2 ways");
}

function test_three_steps() {
  assertEqual(climbStairs(3), 3, "3 steps has 3 ways");
}

function test_four_steps() {
  assertEqual(climbStairs(4), 5, "4 steps has 5 ways");
}

function test_five_steps() {
  assertEqual(climbStairs(5), 8, "5 steps has 8 ways");
}

function test_ten_steps() {
  assertEqual(climbStairs(10), 89, "10 steps has 89 ways");
}`,
    solution: `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1;
  let b = 2;
  for (let i = 3; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`,
    usage: `Climbing Stairs is the canonical introduction to dynamic programming: the number of ways to reach step n equals the sum of ways to reach steps n-1 and n-2, which is exactly the Fibonacci recurrence. While the staircase framing is abstract, the underlying recurrence relation models real systems. Fibonacci heaps, named for this sequence, provide amortized O(1) insert and decrease-key operations and are used in Dijkstra's shortest path algorithm implementations in network routing protocols like OSPF. Resource allocation systems use Fibonacci-based scaling to progressively distribute load across servers without overloading any single node. The problem is the entry point for understanding memoization and tabulation, the two pillars of dynamic programming, and it generalizes to problems with k step sizes, variable costs, and constraints. Every major tech company, from Google to Amazon to Microsoft, uses Climbing Stairs or a direct variant as an interview warm-up to verify that candidates can recognize overlapping subproblems, avoid the exponential O(2^n) recursive blowup, and optimize down to O(n) time with O(1) space.`,
    tags: ["dynamic-programming", "memoization", "neetcode", "1d-dp"],
  },
  {
    name: "Longest Common Subsequence",
    category: "2-d-dp",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given two strings, return the length of their longest common subsequence. A subsequence is derived by deleting zero or more characters without changing the relative order. Use a 2D DP table where dp[i][j] represents the LCS length for the first i characters of text1 and first j characters of text2.\n\nExample 1:\n  Input: text1 = \"abcde\", text2 = \"ace\"\n  Output: 3  (LCS is \"ace\")\n\nExample 2:\n  Input: text1 = \"abc\", text2 = \"abc\"\n  Output: 3\n\nExample 3:\n  Input: text1 = \"abc\", text2 = \"def\"\n  Output: 0\n\nRef: LeetCode #1143 Longest Common Subsequence",
    code: `function lcs(text1, text2) {
  // your code here
}`,
    testCode: `function test_basic_lcs() {
  assertEqual(lcs("abcde", "ace"), 3, "LCS of abcde and ace is 3");
}

function test_identical_strings() {
  assertEqual(lcs("abc", "abc"), 3, "identical strings have LCS = length");
}

function test_no_common() {
  assertEqual(lcs("abc", "def"), 0, "no common characters");
}

function test_one_empty() {
  assertEqual(lcs("abc", ""), 0, "one empty string");
}

function test_both_empty() {
  assertEqual(lcs("", ""), 0, "both empty strings");
}

function test_longer_strings() {
  assertEqual(lcs("abcba", "abcbcba"), 5, "LCS of abcba and abcbcba");
}`,
    solution: `function lcs(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}`,
    usage: `Longest Common Subsequence is the 2D dynamic programming problem that powers the diff tools developers use every day. Git's diff engine is built on the Myers diff algorithm, which is fundamentally an optimization of the LCS problem: finding the longest common subsequence between two file versions is equivalent to finding the minimal edit script (the fewest insertions and deletions) to transform one into the other. GNU diff, Google's diff-match-patch library, and every code review tool from GitHub's pull request view to VS Code's inline diff all rely on LCS variants. Beyond version control, LCS is used in bioinformatics to align DNA and protein sequences, measuring genetic similarity between organisms; tools like BLAST and FASTA use heuristic versions of sequence alignment rooted in LCS. Plagiarism detection systems compare document subsequences to identify copied passages. In interviews at companies like Google, Microsoft, and Palantir, LCS is a standard 2D DP problem that tests whether candidates can define the recurrence relation, build the DP table, and optionally reconstruct the actual subsequence via backtracking through the table.`,
    tags: ["dynamic-programming", "string", "neetcode"],
  },
  {
    name: "Topological Sort",
    category: "advanced-graphs",
    language: "javascript",
    difficulty: "hard",
    description:
      "Given a directed acyclic graph (DAG) as an adjacency list (object mapping each node to an array of nodes it points to), return a valid topological ordering of all nodes using Kahn's algorithm. Start by computing in-degrees for all nodes, enqueue nodes with in-degree 0, and process the queue by removing edges and enqueueing newly zero-in-degree nodes.\n\nExample 1:\n  Input: graph = { \"a\": [\"b\", \"c\"], \"b\": [\"d\"], \"c\": [\"d\"], \"d\": [] }\n  Output: [\"a\", \"b\", \"c\", \"d\"] (or [\"a\", \"c\", \"b\", \"d\"])\n\nExample 2:\n  Input: graph = { \"math\": [\"physics\"], \"physics\": [\"quantum\"], \"quantum\": [], \"art\": [] }\n  Output: [\"math\", \"art\", \"physics\", \"quantum\"] (any valid ordering where prerequisites come first)\n\nExample 3:\n  Input: graph = { \"a\": [] }\n  Output: [\"a\"]\n\nRef: LeetCode #210 Course Schedule II",
    code: `function topologicalSort(graph) {
  // your code here
}`,
    testCode: `function test_diamond_dag() {
  const graph = { a: ["b", "c"], b: ["d"], c: ["d"], d: [] };
  const result = topologicalSort(graph);
  const idxA = result.indexOf("a");
  const idxB = result.indexOf("b");
  const idxC = result.indexOf("c");
  const idxD = result.indexOf("d");
  assert(idxA < idxB, "a should come before b");
  assert(idxA < idxC, "a should come before c");
  assert(idxB < idxD, "b should come before d");
  assert(idxC < idxD, "c should come before d");
  assertEqual(result.length, 4, "should contain all 4 nodes");
}

function test_linear_chain() {
  const graph = { a: ["b"], b: ["c"], c: [] };
  assertEqual(topologicalSort(graph), ["a", "b", "c"], "linear chain a->b->c");
}

function test_no_edges() {
  const graph = { x: [], y: [], z: [] };
  const result = topologicalSort(graph);
  assertEqual(result.length, 3, "should contain all 3 nodes");
  assert(result.includes("x"), "should include x");
  assert(result.includes("y"), "should include y");
  assert(result.includes("z"), "should include z");
}`,
    solution: `function topologicalSort(graph) {
  const visited = new Set();
  const order = [];

  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);
    for (const neighbor of (graph[node] || [])) {
      dfs(neighbor);
    }
    order.push(node);
  }

  for (const node of Object.keys(graph)) {
    dfs(node);
  }

  order.reverse();
  return order;
}`,
    usage: `Topological sort is the algorithm that makes modern software build systems, package managers, and data pipelines possible by resolving dependency order in directed acyclic graphs. Build tools like Make, Bazel, Gradle, and webpack use topological sort to determine compilation order: webpack builds a module dependency graph from import statements and topologically sorts it to ensure every module is bundled after its dependencies. Package managers including npm, pip, apt, and Homebrew topologically sort package dependency graphs to compute a valid installation order, and they use cycle detection (a byproduct of topological sort) to reject circular dependencies that would make installation impossible. Apache Airflow and other workflow orchestrators topologically sort task DAGs to schedule data pipeline stages, ensuring that ETL extraction completes before transformation, and transformation before loading. Spreadsheet engines like Excel and Google Sheets use topological sort on cell dependency graphs to determine recalculation order when a cell value changes, propagating updates only to downstream dependents. University course prerequisite systems, CI/CD pipeline stages, and database migration runners all rely on topological ordering. In interviews, topological sort appears in course-schedule and alien-dictionary problems, tested heavily at Google, Amazon, and Uber, where both Kahn's algorithm (BFS-based) and DFS-based approaches are expected.`,
    tags: ["graph", "topological-sort", "neetcode"],
  },
  {
    name: "Union Find",
    category: "advanced-graphs",
    language: "javascript",
    difficulty: "medium",
    description:
      "Implement a Union-Find (disjoint set) data structure with path compression and union by rank. Support find(x) to locate the root representative, union(x, y) to merge two sets, and connected(x, y) to check if two elements share the same root.\n\nExample 1:\n  Operations: union(0, 1), union(2, 3), connected(0, 1), connected(0, 2)\n  Result: connected(0,1) returns true, connected(0,2) returns false\n\nExample 2:\n  Operations: union(0, 1), union(1, 2), connected(0, 2)\n  Result: connected(0,2) returns true (transitive)\n\nExample 3:\n  Operations: find(5)\n  Result: returns 5 (element is its own root initially)\n\nRef: LeetCode #684 Redundant Connection (closest match)",
    code: `class UnionFind {
  constructor(n) {
    // your code here
  }

  find(x) {
    // your code here
  }

  union(x, y) {
    // your code here
  }

  connected(x, y) {
    // your code here
  }
}`,
    testCode: `function test_initially_disconnected() {
  const uf = new UnionFind(5);
  assertEqual(uf.connected(0, 1), false, "0 and 1 start disconnected");
  assertEqual(uf.connected(2, 3), false, "2 and 3 start disconnected");
}

function test_union_connects() {
  const uf = new UnionFind(5);
  uf.union(0, 1);
  assertEqual(uf.connected(0, 1), true, "0 and 1 connected after union");
}

function test_transitive() {
  const uf = new UnionFind(5);
  uf.union(0, 1);
  uf.union(1, 2);
  assertEqual(uf.connected(0, 2), true, "transitive connection 0-1-2");
}

function test_separate_components() {
  const uf = new UnionFind(5);
  uf.union(0, 1);
  uf.union(3, 4);
  assertEqual(uf.connected(0, 4), false, "separate components");
}

function test_merge_components() {
  const uf = new UnionFind(5);
  uf.union(0, 1);
  uf.union(3, 4);
  uf.union(1, 3);
  assertEqual(uf.connected(0, 4), true, "merged components");
}

function test_self_connected() {
  const uf = new UnionFind(3);
  assertEqual(uf.connected(0, 0), true, "element connected to itself");
}`,
    solution: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x, y) {
    let rx = this.find(x);
    let ry = this.find(y);
    if (rx === ry) return;
    if (this.rank[rx] < this.rank[ry]) [rx, ry] = [ry, rx];
    this.parent[ry] = rx;
    if (this.rank[rx] === this.rank[ry]) this.rank[rx]++;
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}`,
    usage: `Union-Find, also called disjoint set union, is the go-to data structure for dynamic connectivity queries, and it powers algorithms across networking, image processing, and physics simulation. Kruskal's minimum spanning tree algorithm, used by cable and telecom companies to design cost-optimal network topologies, relies on Union-Find to check whether adding an edge would create a cycle. In image processing, connected-component labeling for object detection in OpenCV uses union-find to group adjacent pixels of similar color into regions. Percolation simulation, used in materials science and epidemiology to model how substances or diseases spread through porous media or populations, is classically solved with union-find as taught in Princeton's Algorithms course by Sedgewick. Social network platforms use union-find to compute connected components for friend-of-friend suggestions and community detection. The near-constant amortized time per operation via path compression and union by rank makes it practical for graphs with millions of nodes. Interviewers at Google, Meta, and Uber ask union-find problems to test whether candidates can recognize connectivity patterns and apply the right data structure instead of brute-force BFS/DFS.`,
    tags: ["graph", "disjoint-set", "neetcode"],
  },
  {
    name: "Two Sum",
    category: "arrays",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given an array of integers and a target value, return the indices of the two numbers that add up to the target. Each input has exactly one solution, and you may not use the same element twice.\n\nExample 1:\n  Input: nums = [2, 7, 11, 15], target = 9\n  Output: [0, 1]\n  Explanation: nums[0] + nums[1] = 2 + 7 = 9\n\nExample 2:\n  Input: nums = [3, 2, 4], target = 6\n  Output: [1, 2]\n  Explanation: nums[1] + nums[2] = 2 + 4 = 6\n\nExample 3:\n  Input: nums = [3, 3], target = 6\n  Output: [0, 1]\n\nRef: LeetCode #1 Two Sum",
    code: `// Given an array of integers and a target,
// return indices of the two numbers that add up to target.
// Each input has exactly one solution; don't reuse the same element.

function twoSum(nums, target) {
  // your code here
}
`,
    testCode: `function test_basic_case() {
  const result = twoSum([2, 7, 11, 15], 9);
  assertEqual(result.sort(), [0, 1], "twoSum([2,7,11,15], 9) should return [0,1]");
}

function test_middle_elements() {
  const result = twoSum([3, 2, 4], 6);
  assertEqual(result.sort(), [1, 2], "twoSum([3,2,4], 6) should return [1,2]");
}

function test_negative_numbers() {
  const result = twoSum([-1, -2, -3, -4, -5], -8);
  assertEqual(result.sort(), [2, 4], "twoSum([-1,-2,-3,-4,-5], -8) should return [2,4]");
}

function test_first_and_last() {
  const result = twoSum([1, 4, 3, 7], 8);
  assertEqual(result.sort(), [0, 3], "twoSum([1,4,3,7], 8) should return [0,3]");
}
`,
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`,
    usage: `The two-sum pattern, using a hash map for O(1) complement lookups, is the foundation of virtually every key-value matching problem you will encounter in production systems. Financial platforms use this exact pattern to match buy and sell orders in trading engines, where you need to find two transactions that sum to a target settlement amount. CDNs and API gateways rely on hash map lookups for request deduplication, ensuring the same request is not processed twice. Database engines like PostgreSQL use hash-based indexing internally to accelerate joins and WHERE clause evaluations against indexed columns. The pattern extends to compiler symbol tables, where variable names are stored in hash maps for constant-time resolution during compilation. In interviews, two-sum is the single most frequently asked LeetCode problem and serves as a gateway to three-sum, four-sum, and subarray-sum variants; if you cannot solve it cleanly with a hash map, interviewers will question your ability to handle any lookup-optimization problem.`,
    tags: ["hash-map", "blind75", "neetcode", "arrays-hashing"],
  },
  {
    name: "FizzBuzz",
    category: "arrays",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given an integer n, return an array of strings from 1 to n where: multiples of 3 are replaced with \"Fizz\", multiples of 5 with \"Buzz\", multiples of both 3 and 5 with \"FizzBuzz\", and all other numbers are converted to their string representation.\n\nExample 1:\n  Input: n = 5\n  Output: [\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"]\n\nExample 2:\n  Input: n = 15\n  Output: [\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\", \"Fizz\", \"7\", \"8\", \"Fizz\", \"Buzz\", \"11\", \"Fizz\", \"13\", \"14\", \"FizzBuzz\"]\n\nExample 3:\n  Input: n = 3\n  Output: [\"1\", \"2\", \"Fizz\"]\n\nRef: LeetCode #412 Fizz Buzz",
    code: `// Return an array of strings from 1 to n:
// - "Fizz" for multiples of 3
// - "Buzz" for multiples of 5
// - "FizzBuzz" for multiples of both 3 and 5
// - The number as a string otherwise

function fizzBuzz(n) {
  // your code here
}
`,
    testCode: `function test_returns_array() {
  const result = fizzBuzz(1);
  assert(Array.isArray(result), "fizzBuzz should return an array");
}

function test_simple_numbers() {
  const result = fizzBuzz(2);
  assertEqual(result, ["1", "2"], "fizzBuzz(2) should return ['1','2']");
}

function test_fizz() {
  const result = fizzBuzz(3);
  assertEqual(result[2], "Fizz", "Third element should be 'Fizz'");
}

function test_buzz() {
  const result = fizzBuzz(5);
  assertEqual(result[4], "Buzz", "Fifth element should be 'Buzz'");
}

function test_fizzbuzz() {
  const result = fizzBuzz(15);
  assertEqual(result[14], "FizzBuzz", "15th element should be 'FizzBuzz'");
}

function test_full_sequence() {
  const result = fizzBuzz(5);
  assertEqual(result, ["1", "2", "Fizz", "4", "Buzz"], "fizzBuzz(5) should match expected sequence");
}
`,
    solution: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return result;
}`,
    usage: `FizzBuzz tests modular arithmetic and conditional branching, two operations that appear constantly in scheduling systems, round-robin load balancers, and event-loop tick handlers. The modulo operator drives real systems: Linux's Completely Fair Scheduler uses modular arithmetic to distribute CPU time slices, Kafka partition assignment uses key hashing with modulo to route messages to partitions, and cron job scheduling fundamentally depends on modular time checks. The multithreaded FizzBuzz variant, now asked at companies like Amazon and Google, tests condition-based thread dispatch, a pattern that maps directly to worker-pool architectures, event routing in Node.js clusters, and protocol handler selection in network servers. Despite its reputation as a trivial problem, FizzBuzz remains the most widely used initial screening question in software engineering interviews because an estimated 40-60% of candidates who apply for developer roles cannot write a working solution. Mastering it means you understand control flow, operator precedence, and edge-case ordering, which are the same skills needed for writing correct business-logic predicates in production code.`,
    tags: ["math"],
  },
  {
    name: "Frequency Count",
    category: "arrays",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given an array of items, return an object (map) where each key is a unique item from the array and each value is the number of times that item appears. Note that in JavaScript, object keys are coerced to strings.\n\nExample 1:\n  Input: [\"a\", \"b\", \"a\", \"c\", \"b\", \"a\"]\n  Output: { \"a\": 3, \"b\": 2, \"c\": 1 }\n\nExample 2:\n  Input: [1, 2, 2, 3, 3, 3]\n  Output: { \"1\": 1, \"2\": 2, \"3\": 3 }\n\nExample 3:\n  Input: [\"x\"]\n  Output: { \"x\": 1 }\n\nRef: LeetCode #1207 Unique Number of Occurrences (closest match)",
    code: `function frequencyCount(items) {
  // your code here
}`,
    testCode: `function test_strings() {
  assertEqual(frequencyCount(["a", "b", "a", "c", "a", "b"]), {"a": 3, "b": 2, "c": 1}, "string frequency count");
}

function test_single() {
  assertEqual(frequencyCount(["x"]), {"x": 1}, "single element");
}

function test_numbers() {
  assertEqual(frequencyCount([1, 2, 2, 3, 3, 3]), {"1": 1, "2": 2, "3": 3}, "number keys become strings");
}

function test_empty() {
  assertEqual(frequencyCount([]), {}, "empty array");
}`,
    solution: `function frequencyCount(items) {
  const counts = {};
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
  }
  return counts;
}`,
    usage: `Hash-map-based frequency counting is one of the most universally applied patterns in software engineering, forming the computational core of analytics pipelines, NLP systems, and observability tools. Elasticsearch's terms aggregation, which powers dashboards across thousands of companies, is fundamentally a frequency count over field values in document indices. In NLP, term-frequency calculations drive TF-IDF scoring, bag-of-words models, and the tokenization statistics used to train BPE tokenizers for large language models like GPT and Claude. Web analytics platforms such as Google Analytics and Mixpanel use frequency maps to count page views, event occurrences, and unique user actions in real time. MapReduce's canonical word-count example, the "hello world" of distributed computing at Google and Hadoop shops, is a distributed frequency count. The pattern appears in virtually every coding interview because it reduces naive O(n^2) comparison loops to O(n) single-pass solutions, and interviewers at every major tech company expect candidates to reach for it instinctively.`,
    tags: ["hash-map","counting"],
  },
  {
    name: "Most Frequent Element",
    category: "arrays",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given an array of items, return the item that appears most frequently. If there is a tie, return the item that reaches the highest count first during iteration.\n\nExample 1:\n  Input: [\"a\", \"b\", \"a\", \"c\", \"b\", \"a\"]\n  Output: \"a\"\n\nExample 2:\n  Input: [3, 1, 3, 2, 1, 3]\n  Output: 3\n\nExample 3:\n  Input: [\"cat\", \"dog\", \"cat\"]\n  Output: \"cat\"\n\nRef: LeetCode #347 Top K Frequent Elements (closest match)",
    code: `function mostFrequent(items) {
  // your code here
}`,
    testCode: `function test_basic() {
  assertEqual(mostFrequent(["a", "b", "a", "c", "a", "b"]), "a", "most frequent is a");
}

function test_single() {
  assertEqual(mostFrequent(["z"]), "z", "single element is most frequent");
}

function test_tie_returns_any() {
  const result = mostFrequent(["a", "b"]);
  assert(result === "a" || result === "b", "should return one of the tied elements");
}

function test_numbers() {
  assertEqual(mostFrequent([1, 2, 2, 3, 3, 3]), "3", "most frequent number as string key");
}`,
    solution: `function mostFrequent(items) {
  const counts = {};
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
  }
  let maxKey = null;
  let maxVal = -Infinity;
  for (const [key, val] of Object.entries(counts)) {
    if (val > maxVal) {
      maxVal = val;
      maxKey = key;
    }
  }
  return maxKey;
}`,
    usage: `Finding the most frequent element, the statistical mode, is a core operation in recommendation engines, anomaly detection, and business intelligence. Amazon's "customers also bought" feature and Spotify's genre-classification logic both start with frequency analysis of user interaction events to surface the dominant patterns. In network monitoring, identifying the most frequent source IP in a traffic log is a standard technique for detecting scanning attacks or misconfigured clients. Log aggregation tools like Splunk and Datadog surface the most frequent error messages, status codes, and endpoint paths to help engineers triage incidents quickly. In machine learning, mode imputation fills missing categorical values with the most frequent observed category, a preprocessing step used in scikit-learn's SimpleImputer. This problem tests whether a candidate can combine hash-map counting with a single-pass max-tracking step, and it appears regularly at companies like Meta and Google where analytics-heavy codebases make frequency analysis second nature.`,
    tags: ["hash-map", "counting", "neetcode"],
  },
  {
    name: "Merge Sort",
    category: "arrays",
    language: "javascript",
    difficulty: "medium",
    description:
      "Implement merge sort. Recursively split the array into two halves until each subarray has one or zero elements, then merge the sorted halves back together by comparing elements from each half in order. Return a new sorted array without mutating the original.\n\nExample 1:\n  Input: [38, 27, 43, 3, 9, 82, 10]\n  Output: [3, 9, 10, 27, 38, 43, 82]\n\nExample 2:\n  Input: [5, 1, 4, 2, 3]\n  Output: [1, 2, 3, 4, 5]\n\nExample 3:\n  Input: [1]\n  Output: [1]\n\nRef: LeetCode #912 Sort an Array",
    code: `function mergeSort(arr) {
  // your code here
}`,
    testCode: `function test_basic() {
  assertEqual(mergeSort([3, 1, 2]), [1, 2, 3], "basic sort");
}

function test_already_sorted() {
  assertEqual(mergeSort([1, 2, 3, 4]), [1, 2, 3, 4], "already sorted");
}

function test_reversed() {
  assertEqual(mergeSort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5], "reversed array");
}

function test_duplicates() {
  assertEqual(mergeSort([3, 1, 2, 1, 3]), [1, 1, 2, 3, 3], "with duplicates");
}

function test_single() {
  assertEqual(mergeSort([42]), [42], "single element");
}

function test_empty() {
  assertEqual(mergeSort([]), [], "empty array");
}

function test_negatives() {
  assertEqual(mergeSort([3, -1, 0, -5, 2]), [-5, -1, 0, 2, 3], "with negatives");
}`,
    solution: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}`,
    usage: `Merge sort is the only comparison-based sort that guarantees O(n log n) worst-case performance with stability, which is why it underpins the default sorting algorithms in multiple major language runtimes. Python's built-in sorted() and list.sort() use Timsort, a hybrid of merge sort and insertion sort designed by Tim Peters specifically to exploit partially-ordered runs common in real-world data. Java's Arrays.sort() for objects also uses a Timsort variant for the same stability and worst-case guarantees. The external merge sort variant is the standard technique for sorting datasets that exceed available memory: database engines like PostgreSQL use it for ORDER BY queries on large tables, reading chunks into memory, sorting them, writing sorted runs to disk, and then performing a k-way merge. Git's diff algorithm, the rendering of sorted results in Elasticsearch, and the merge phase of MapReduce all use merge-sort logic. Interviewers ask merge sort to test divide-and-conquer reasoning, recursion comfort, and understanding of stability, a property that matters whenever you sort records by multiple keys sequentially.`,
    tags: ["divide-and-conquer","sorting","recursion"],
  },
  {
    name: "Lomuto Partition",
    category: "arrays",
    language: "javascript",
    difficulty: "medium",
    description:
      "Implement the Lomuto partition scheme. Choose the last element as the pivot. Walk through the array maintaining a boundary index i; whenever an element is less than or equal to the pivot, swap it to the boundary and advance i. Finally place the pivot at the boundary. Return the pivot's final index. The array is modified in-place.\n\nExample 1:\n  Input: [3, 8, 2, 5, 1, 4], lo = 0, hi = 5\n  Output: 3  (pivot 4 lands at index 3, array becomes [3, 2, 1, 4, 8, 5] or similar valid partition)\n\nExample 2:\n  Input: [10, 7, 8, 9, 1, 5], lo = 0, hi = 5\n  Output: 1  (pivot 5 lands at index 1)\n\nExample 3:\n  Input: [1, 2, 3], lo = 0, hi = 2\n  Output: 2  (pivot 3 is already in correct position)\n\nRef: LeetCode #912 Sort an Array (closest match)",
    code: `function partition(arr, lo, hi) {
  // your code here
}`,
    testCode: `function test_basic_partition() {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6];
  const p = partition(arr, 0, arr.length - 1);
  const pivot = arr[p];
  for (let i = 0; i < p; i++) {
    assert(arr[i] <= pivot, "left of pivot should be <= pivot");
  }
  for (let i = p + 1; i < arr.length; i++) {
    assert(arr[i] > pivot, "right of pivot should be > pivot");
  }
}

function test_sorted_input() {
  const arr = [1, 2, 3, 4, 5];
  const p = partition(arr, 0, 4);
  assertEqual(arr[p], 5, "pivot is last element (5)");
  assertEqual(p, 4, "pivot stays at end when already sorted");
}

function test_two_elements() {
  const arr = [5, 1];
  const p = partition(arr, 0, 1);
  assertEqual(arr[p], 1, "pivot is 1");
  assert(arr[0] <= arr[1], "should be sorted after partition");
}

function test_all_same() {
  const arr = [3, 3, 3];
  const p = partition(arr, 0, 2);
  assertEqual(arr[p], 3, "pivot is 3");
}`,
    solution: `function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}`,
    usage: `The Lomuto partition scheme is the most widely taught partitioning algorithm for quicksort, popularized by Bentley in Programming Pearls and by Cormen, Leiserson, Rivest, and Stein in Introduction to Algorithms (CLRS). Its value is primarily pedagogical: the single-scan, swap-with-boundary approach is easier to prove correct than Hoare's bidirectional scheme, making it the standard choice for teaching partitioning, Dutch National Flag variants, and quickselect for order-statistics problems. In practice, Lomuto performs roughly three times more swaps than Hoare's scheme on average and degrades to O(n^2) when all elements are equal, which is why production sort implementations like C++'s std::sort and glibc's qsort use Hoare-based or three-way partitioning instead. Understanding Lomuto is still essential because it is the basis for the quickselect algorithm used in numpy's median computation and in database query optimizers that need to find the k-th smallest value for percentile calculations. Interviewers at companies like Google and Facebook use Lomuto-based partition questions to test in-place rearrangement skills and to set up follow-up questions about pivot selection strategies, three-way partitioning for duplicates, and worst-case mitigation via randomization.`,
    tags: ["sorting","partitioning"],
  },
  {
    name: "Quick Sort",
    category: "arrays",
    language: "javascript",
    difficulty: "medium",
    description:
      "Implement quick sort using the Lomuto partition scheme. Partition the array around the last element as pivot, then recursively sort the subarrays to the left and right of the pivot. Sort in-place and return the array. A partition helper function is provided.\n\nExample 1:\n  Input: [10, 7, 8, 9, 1, 5]\n  Output: [1, 5, 7, 8, 9, 10]\n\nExample 2:\n  Input: [3, 0, 2, 5, -1, 4, 1]\n  Output: [-1, 0, 1, 2, 3, 4, 5]\n\nExample 3:\n  Input: [1]\n  Output: [1]\n\nRef: LeetCode #912 Sort an Array",
    code: `function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}

function quickSort(arr) {
  // your code here
}`,
    testCode: `function test_basic() {
  assertEqual(quickSort([3, 1, 2]), [1, 2, 3], "basic sort");
}

function test_reversed() {
  assertEqual(quickSort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5], "reversed array");
}

function test_duplicates() {
  assertEqual(quickSort([3, 1, 2, 1, 3]), [1, 1, 2, 3, 3], "with duplicates");
}

function test_single() {
  assertEqual(quickSort([7]), [7], "single element");
}

function test_empty() {
  assertEqual(quickSort([]), [], "empty array");
}`,
    solution: `function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}

function quickSort(arr) {
  function qs(lo, hi) {
    if (lo < hi) {
      const p = partition(arr, lo, hi);
      qs(lo, p - 1);
      qs(p + 1, hi);
    }
  }
  qs(0, arr.length - 1);
  return arr;
}`,
    usage: `Quicksort is the dominant in-memory sorting algorithm in systems programming, and its partitioning idea has influenced everything from standard library implementations to database query execution. C++'s std::sort uses introsort, a hybrid that starts with quicksort's partitioning, switches to heapsort if recursion depth exceeds 2*log(n) to guarantee O(n log n) worst case, and finishes small subarrays with insertion sort; this design, adopted by GCC's libstdc++ and LLVM's libc++, means quicksort's partition logic runs on virtually every C++ sort call worldwide. The C standard library's qsort(), used throughout the Linux kernel and system utilities, historically implemented quicksort and still does in many libc variants. Beyond sorting, the partition step alone powers quickselect for O(n) average-case selection of the k-th element, used in percentile computation, median-of-medians for database statistics, and reservoir sampling. Quicksort's cache-friendly sequential access pattern gives it a practical speed advantage over merge sort for in-memory data despite sharing the same O(n log n) average complexity. This is the most important sorting algorithm to understand for interviews at any systems-focused company because it tests recursion, partitioning, randomization strategy, and the ability to analyze both average and worst-case behavior.`,
    tags: ["divide-and-conquer","sorting","recursion"],
  },
  {
    name: "Prefix Sum Table",
    category: "arrays",
    language: "javascript",
    difficulty: "easy",
    description:
      "Build a prefix sum table from an input array of numbers. The table has length n+1 where prefix[0] = 0 and prefix[i+1] = prefix[i] + nums[i]. This enables O(1) range sum queries.\n\nExample 1:\n  Input: nums = [1, 2, 3, 4]\n  Output: [0, 1, 3, 6, 10]\n\nExample 2:\n  Input: nums = [5, -1, 3]\n  Output: [0, 5, 4, 7]\n\nExample 3:\n  Input: nums = []\n  Output: [0]",
    code: `function buildPrefixSum(nums) {
  // your code here
}`,
    testCode: `function test_basic() {
  assertEqual(buildPrefixSum([1, 2, 3, 4]), [0, 1, 3, 6, 10], "prefix sum of [1,2,3,4]");
}

function test_empty() {
  assertEqual(buildPrefixSum([]), [0], "prefix sum of empty array");
}

function test_single() {
  assertEqual(buildPrefixSum([5]), [0, 5], "prefix sum of single element");
}

function test_negatives() {
  assertEqual(buildPrefixSum([-1, 2, -3]), [0, -1, 1, -2], "prefix sum with negatives");
}`,
    solution: `function buildPrefixSum(nums) {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
  }
  return prefix;
}`,
    usage: `Building a prefix sum array is a preprocessing technique that trades O(n) setup time for O(1) range sum queries, and it is one of the most broadly applied patterns in production systems. Database engines like ClickHouse and Apache Druid use prefix sum structures internally to accelerate aggregate queries over time-series data. Analytics dashboards that display cumulative metrics, such as running revenue totals or cumulative user counts, compute prefix sums over their underlying datasets. In competitive programming and USACO-style contests, prefix sums are considered a fundamental silver-level technique. Game engines use 2D prefix sums for fast region queries in tile-based maps. The pattern also appears in image processing as integral images (summed-area tables), a technique used in OpenCV's Viola-Jones face detection algorithm to rapidly compute Haar-like features over arbitrary rectangular regions.`,
    tags: ["prefix-sum"],
  },
  {
    name: "Running Sum of 1d Array",
    category: "arrays",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given an array of integers, return a new array where each position contains the sum of all input values from index 0 through that position.\n\nExample 1:\n  Input: nums = [1, 2, 3, 4]\n  Output: [1, 3, 6, 10]\n\nExample 2:\n  Input: nums = [1, 1, 1, 1, 1]\n  Output: [1, 2, 3, 4, 5]\n\nExample 3:\n  Input: nums = [3, 1, 2, 10, 1]\n  Output: [3, 4, 6, 16, 17]\n\nRef: LeetCode #1480 Running Sum of 1d Array",
    code: `function runningSum(nums) {
  // your code here
}`,
    testCode: `function test_basic() {
  assertEqual(runningSum([1, 2, 3, 4]), [1, 3, 6, 10]);
}

function test_all_ones() {
  assertEqual(runningSum([1, 1, 1, 1, 1]), [1, 2, 3, 4, 5]);
}

function test_mixed_values() {
  assertEqual(runningSum([3, 1, 2, 10, 1]), [3, 4, 6, 16, 17]);
}

function test_with_negatives() {
  assertEqual(runningSum([4, -2, 7]), [4, 2, 9]);
}`,
    solution: `function runningSum(nums) {
  const result = [];
  let total = 0;
  for (const num of nums) {
    total += num;
    result.push(total);
  }
  return result;
}`,
    usage: `Running sums are the direct cumulative form of prefix sums. They show up in dashboards, financial reports, telemetry counters, and streaming metrics where each point represents the total so far rather than an independent value.`,
    tags: ["prefix-sum", "arrays-hashing"],
  },
  {
    name: "Range Sum Query",
    category: "arrays",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given a prefix sum array (built by buildPrefixSum), compute the sum of elements from index l to index r inclusive in O(1) time. The formula is prefix[r+1] - prefix[l]. A buildPrefixSum helper is provided.\n\nExample 1:\n  Input: nums = [1, 2, 3, 4, 5], l = 1, r = 3\n  Output: 9  (2 + 3 + 4)\n\nExample 2:\n  Input: nums = [10, 20, 30], l = 0, r = 2\n  Output: 60  (10 + 20 + 30)\n\nExample 3:\n  Input: nums = [3, 7, 2, 5], l = 2, r = 2\n  Output: 2  (single element at index 2)\n\nRef: LeetCode #303 Range Sum Query - Immutable",
    code: `function buildPrefixSum(nums) {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
  }
  return prefix;
}

function rangeSum(prefix, l, r) {
  // your code here
}`,
    testCode: `function test_full_range() {
  const prefix = buildPrefixSum([1, 2, 3, 4]);
  assertEqual(rangeSum(prefix, 0, 3), 10, "full range sum");
}

function test_middle() {
  const prefix = buildPrefixSum([1, 2, 3, 4]);
  assertEqual(rangeSum(prefix, 1, 2), 5, "middle range sum");
}

function test_single_element() {
  const prefix = buildPrefixSum([1, 2, 3, 4]);
  assertEqual(rangeSum(prefix, 2, 2), 3, "single element range sum");
}

function test_first_element() {
  const prefix = buildPrefixSum([5, 2, 3, 4]);
  assertEqual(rangeSum(prefix, 0, 0), 5, "range sum of first element");
}`,
    solution: `function buildPrefixSum(nums) {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
  }
  return prefix;
}

function rangeSum(prefix, l, r) {
  return prefix[r + 1] - prefix[l];
}`,
    usage: `Range Sum Query is the direct application of the prefix sum array: after O(n) preprocessing, answer any sum(i, j) query in O(1) by computing prefix[j+1] - prefix[i]. This is the backbone of any system that serves repeated aggregation queries over static data. Time-series databases and OLAP engines use this pattern to serve dashboard queries without rescanning raw data. Financial reporting systems that compute quarter-to-date or year-to-date totals over immutable ledger entries rely on the same principle. When the data is mutable, the pattern extends to segment trees and Binary Indexed Trees (Fenwick trees), which maintain O(log n) updates and queries; these power real-time leaderboard systems at companies like Riot Games and competitive programming judges like Codeforces. In interviews, Range Sum Query is a gateway problem that tests whether candidates understand the prefix sum technique before moving to harder variants like 2D range queries or mutable arrays.`,
    tags: ["prefix-sum"],
  },
  {
    name: "Permutations",
    category: "backtracking",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given an array of distinct integers, return all possible permutations in any order. Use backtracking to swap elements into each position and recurse on the remaining.\n\nExample 1:\n  Input: nums = [1, 2, 3]\n  Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]\n\nExample 2:\n  Input: nums = [0, 1]\n  Output: [[0,1],[1,0]]\n\nExample 3:\n  Input: nums = [1]\n  Output: [[1]]\n\nRef: LeetCode #46 Permutations",
    code: `function permutations(nums) {
  // your code here
}`,
    testCode: `function test_three_elements() {
  const result = permutations([1, 2, 3]);
  assertEqual(result.length, 6, "3 elements produce 6 permutations");
  const strs = result.map(p => JSON.stringify(p)).sort();
  assert(strs.includes(JSON.stringify([1, 2, 3])), "contains [1,2,3]");
  assert(strs.includes(JSON.stringify([3, 2, 1])), "contains [3,2,1]");
}

function test_two_elements() {
  const result = permutations([1, 2]);
  assertEqual(result.length, 2, "2 elements produce 2 permutations");
  const strs = result.map(p => JSON.stringify(p)).sort();
  assertEqual(strs, [JSON.stringify([1, 2]), JSON.stringify([2, 1])].sort(), "correct permutations of [1,2]");
}

function test_single() {
  assertEqual(permutations([1]), [[1]], "single element");
}

function test_empty() {
  assertEqual(permutations([]), [[]], "empty array produces one empty permutation");
}

function test_four_elements_count() {
  const result = permutations([1, 2, 3, 4]);
  assertEqual(result.length, 24, "4 elements produce 24 permutations");
}`,
    solution: `function permutations(nums) {
  const result = [];

  function backtrack(path, remaining) {
    if (remaining.length === 0) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      path.push(remaining[i]);
      backtrack(path, [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
      path.pop();
    }
  }

  backtrack([], nums);
  return result;
}`,
    usage: `Permutation generation via backtracking is foundational in systems that must evaluate all possible orderings of a set. The most concrete industrial application is in relational database query optimizers: PostgreSQL's planner exhaustively evaluates all join-order permutations for queries involving up to about 12 tables using dynamic programming, switching to a genetic algorithm only when the combinatorial explosion becomes prohibitive. Beyond databases, permutation enumeration powers the AES cipher's internal substitution-permutation network, scheduling engines that must find optimal task orderings, and evolutionary algorithms for combinatorial optimization problems like the Traveling Salesman Problem. In interviews at companies like Google, Meta, and Amazon, generating permutations is a canonical backtracking problem that tests whether a candidate can manage state correctly during recursive exploration and prune the search space when constraints are added.`,
    tags: ["backtracking", "recursion", "neetcode"],
  },
  {
    name: "Subsets",
    category: "backtracking",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given an array of distinct integers, return all possible subsets (the power set). The solution must include the empty set and the full array. Do not include duplicate subsets.\n\nExample 1:\n  Input: nums = [1, 2, 3]\n  Output: [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]\n\nExample 2:\n  Input: nums = [0]\n  Output: [[], [0]]\n\nExample 3:\n  Input: nums = []\n  Output: [[]]\n\nRef: LeetCode #78 Subsets",
    code: `function subsets(nums) {
  // your code here
}`,
    testCode: `function test_basic_subsets() {
  const result = subsets([1, 2, 3]);
  assertEqual(result.length, 8, "should have 8 subsets for 3 elements");
}

function test_two_elements() {
  const result = subsets([1, 2]);
  const sorted = result.map(s => JSON.stringify(s.slice().sort())).sort();
  const expected = [[], [1], [2], [1, 2]].map(s => JSON.stringify(s.slice().sort())).sort();
  assertEqual(sorted, expected, "subsets of [1,2]");
}

function test_single_element() {
  const result = subsets([1]);
  const sorted = result.map(s => JSON.stringify(s)).sort();
  const expected = [[], [1]].map(s => JSON.stringify(s)).sort();
  assertEqual(sorted, expected, "subsets of [1]");
}

function test_empty_input() {
  const result = subsets([]);
  assertEqual(result.length, 1, "empty input should return [[]]");
  assertEqual(result[0].length, 0, "the single subset should be empty");
}

function test_four_elements_count() {
  const result = subsets([1, 2, 3, 4]);
  assertEqual(result.length, 16, "should have 16 subsets for 4 elements");
}`,
    solution: `function subsets(nums) {
  const result = [];

  function backtrack(start, path) {
    result.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  }

  backtrack(0, []);
  return result;
}`,
    usage: `Subset generation, also known as power set construction, appears wherever a system must evaluate every possible combination of elements. In compiler design and automata theory, the subset construction algorithm (also called powerset construction) converts nondeterministic finite automata into deterministic ones, a step that underpins regex engines in languages like Python, Java, and Go. Machine learning feature selection relies on evaluating subsets of input features to find the combination that yields the best model performance; scikit-learn's exhaustive feature selection does exactly this. Database query planners similarly consider subsets of indexes and columns when optimizing execution plans. The pattern also drives combinatorial optimization problems like the 0/1 knapsack. In coding interviews, subsets is a high-frequency problem at companies like Amazon and Microsoft because it tests the candidate's understanding of recursion, bit manipulation (the bitmask approach maps each integer from 0 to 2^n-1 to a unique subset), and backtracking.`,
    tags: ["backtracking", "recursion", "neetcode"],
  },
  {
    name: "Combination Sum II",
    category: "backtracking",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given an array of candidate numbers and a target, return every unique combination where the chosen numbers sum to the target. Each input number may be used at most once. The input can contain duplicates, but the output must not contain duplicate combinations.\n\nExample 1:\n  Input: candidates = [10,1,2,7,6,1,5], target = 8\n  Output: [[1,1,6],[1,2,5],[1,7],[2,6]]\n\nExample 2:\n  Input: candidates = [2,5,2,1,2], target = 5\n  Output: [[1,2,2],[5]]\n\nConstraints:\n- 1 <= candidates.length <= 100\n- 1 <= candidates[i] <= 50\n- 1 <= target <= 30\n\nRef: LeetCode #40 Combination Sum II",
    code: `function combinationSum2(candidates, target) {
  // your code here
}`,
    testCode: `function normalize(combinations) {
  return combinations
    .map((combo) => JSON.stringify([...combo].sort((a, b) => a - b)))
    .sort();
}

function test_basic() {
  const result = combinationSum2([10, 1, 2, 7, 6, 1, 5], 8);
  const expected = [[1,1,6], [1,2,5], [1,7], [2,6]];
  assertEqual(normalize(result), normalize(expected), "returns all unique combinations");
}

function test_duplicates() {
  const result = combinationSum2([2, 5, 2, 1, 2], 5);
  const expected = [[1,2,2], [5]];
  assertEqual(normalize(result), normalize(expected), "handles duplicate candidates");
}

function test_no_result() {
  assertEqual(combinationSum2([1, 1], 5), [], "returns empty array when no combination works");
}

function test_single() {
  assertEqual(combinationSum2([1], 1), [[1]], "single exact match");
}`,
    solution: `function combinationSum2(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];

  function backtrack(start, current, remaining) {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }

    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break;
      if (i > start && candidates[i] === candidates[i - 1]) continue;

      current.push(candidates[i]);
      backtrack(i + 1, current, remaining - candidates[i]);
      current.pop();
    }
  }

  backtrack(0, [], target);
  return result;
}`,
    solutionVariants: [
      {
        label: "Sorted loop + skip duplicates",
        code: `function combinationSum2(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];

  function backtrack(start, current, remaining) {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }

    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break;
      if (i > start && candidates[i] === candidates[i - 1]) continue;

      current.push(candidates[i]);
      backtrack(i + 1, current, remaining - candidates[i]);
      current.pop();
    }
  }

  backtrack(0, [], target);
  return result;
}`,
        complexity: "Time O(2^n * n), Space O(n)",
        explanation:
          "Sorts first, then skips equal candidates at the same recursion depth so each unique combination is emitted once.",
      },
      {
        label: "Frequency counts",
        code: `function combinationSum2(candidates, target) {
  const counts = [...candidates.reduce((map, value) => {
    map.set(value, (map.get(value) ?? 0) + 1);
    return map;
  }, new Map()).entries()].sort((a, b) => a[0] - b[0]);
  const result = [];

  function backtrack(index, current, remaining) {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    if (index === counts.length || remaining < 0) return;

    const [value, count] = counts[index];
    const maxTake = Math.min(count, Math.floor(remaining / value));
    for (let take = 0; take <= maxTake; take++) {
      for (let i = 0; i < take; i++) current.push(value);
      backtrack(index + 1, current, remaining - value * take);
      for (let i = 0; i < take; i++) current.pop();
    }
  }

  backtrack(0, [], target);
  return result;
}`,
        complexity: "Time O(Π(countᵢ + 1) * n), Space O(u + n)",
        explanation:
          "Groups duplicates first, then chooses how many copies of each distinct value to take.",
      },
      {
        label: "Include/exclude duplicates",
        code: `function combinationSum2(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];

  function dfs(index, current, remaining) {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    if (index === candidates.length || remaining < 0) return;

    const value = candidates[index];
    current.push(value);
    dfs(index + 1, current, remaining - value);
    current.pop();

    let nextIndex = index + 1;
    while (nextIndex < candidates.length && candidates[nextIndex] === value) {
      nextIndex++;
    }
    dfs(nextIndex, current, remaining);
  }

  dfs(0, [], target);
  return result;
}`,
        complexity: "Time O(2^n * n), Space O(n)",
        explanation:
          "Branches into take-current or skip-all-copies-of-current; skipping all duplicates prevents repeated combinations.",
      },
    ],
    usage: null,
    tags: ["backtracking", "recursion", "neetcode"],
  },
  {
    name: "Binary Search",
    category: "binary-search",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given a sorted array of integers and a target value, return the index of the target if found, or -1 if not present. Use classic binary search by maintaining low and high pointers and checking the midpoint each iteration.\n\nExample 1:\n  Input: nums = [-1, 0, 3, 5, 9, 12], target = 9\n  Output: 4\n\nExample 2:\n  Input: nums = [-1, 0, 3, 5, 9, 12], target = 2\n  Output: -1\n\nExample 3:\n  Input: nums = [5], target = 5\n  Output: 0\n\nRef: LeetCode #704 Binary Search",
    code: `function binarySearch(nums, target) {
  // your code here
}`,
    testCode: `function test_found_middle() {
  assertEqual(binarySearch([1, 3, 5, 7, 9], 5), 2, "target in middle");
}

function test_found_first() {
  assertEqual(binarySearch([1, 3, 5, 7, 9], 1), 0, "target at first index");
}

function test_found_last() {
  assertEqual(binarySearch([1, 3, 5, 7, 9], 9), 4, "target at last index");
}

function test_not_found() {
  assertEqual(binarySearch([1, 3, 5, 7, 9], 4), -1, "target not in array");
}

function test_empty_array() {
  assertEqual(binarySearch([], 5), -1, "empty array returns -1");
}

function test_single_found() {
  assertEqual(binarySearch([7], 7), 0, "single element found");
}

function test_single_not_found() {
  assertEqual(binarySearch([7], 3), -1, "single element not found");
}`,
    solution: `function binarySearch(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] === target) return mid;
    if (nums[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return -1;
}`,
    usage: `Binary search is one of the most practically important algorithms in all of computing, operating silently inside nearly every sorted data structure and search system you use daily. PostgreSQL and MySQL use B-tree indexes, which are a generalization of binary search, to locate rows among millions of records in O(log n) disk accesses; without this, every database query would require a full table scan. Git's \`bisect\` command uses binary search to identify the exact commit that introduced a bug, cutting a 1000-commit search space down to roughly 10 steps. Python's standard library includes the \`bisect\` module, and Java's \`Arrays.binarySearch\` and C++'s \`std::lower_bound\` are used constantly in production for insertion-point lookups in sorted arrays. Financial systems use binary search to locate price thresholds in sorted order books, and machine learning pipelines use it to find optimal hyperparameter boundaries during grid search. In interviews, binary search is asked at every major tech company, often in disguised forms like search-in-rotated-array, find-peak-element, or median-of-two-sorted-arrays, where the challenge is recognizing that binary search applies despite the problem not explicitly mentioning sorting.`,
    tags: ["binary-search", "divide-and-conquer", "neetcode"],
  },
  {
    name: "Find First Occurrence in Sorted Array",
    category: "binary-search",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given a sorted array that may contain duplicates, find the index of the first occurrence of the target value. Use binary search; when the target is found, record the index and continue searching left to find an earlier occurrence. Return -1 if the target is not in the array.\n\nExample 1:\n  Input: nums = [1, 2, 2, 2, 3, 4], target = 2\n  Output: 1\n\nExample 2:\n  Input: nums = [1, 1, 1, 1], target = 1\n  Output: 0\n\nExample 3:\n  Input: nums = [1, 3, 5, 7], target = 4\n  Output: -1",
    code: `function findFirst(nums, target) {
  // your code here
}`,
    testCode: `function test_basic() {
  assertEqual(findFirst([1, 2, 2, 2, 3], 2), 1, "first occurrence of 2");
}

function test_all_same() {
  assertEqual(findFirst([2, 2, 2], 2), 0, "first in all-same array");
}

function test_not_found() {
  assertEqual(findFirst([1, 2, 3], 5), -1, "target not found");
}

function test_single_match() {
  assertEqual(findFirst([1, 3, 5, 7], 3), 1, "single match");
}

function test_empty() {
  assertEqual(findFirst([], 1), -1, "empty array");
}

function test_at_start() {
  assertEqual(findFirst([1, 2, 3, 4, 5], 1), 0, "target at start");
}`,
    solution: `function findFirst(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  let result = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) {
      result = mid;
      hi = mid - 1;
    } else if (nums[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return result;
}`,
    usage: `Finding the first (leftmost) occurrence of a target in a sorted array using binary search is the boundary-search variant that underpins range lookups in nearly every sorted data structure. Database indexes, B-trees, and sorted file systems all need to locate the first key that matches a predicate; PostgreSQL's btree index scan uses exactly this kind of lower-bound binary search when executing range queries like WHERE timestamp >= '2024-01-01'. The C++ STL exposes this as std::lower_bound, and Java's Collections.binarySearch documents this boundary behavior. Search engines use left-boundary binary search to find the first document in a posting list that matches a term within a given document-ID range. In interviews, the left-boundary variant is more commonly asked than basic binary search because it tests whether candidates can handle the subtle off-by-one logic of continuing the search after finding a match, a skill that directly transfers to production work with sorted indexes and partitioned data.`,
    tags: ["binary-search"],
  },
  {
    name: "Find Last Occurrence in Sorted Array",
    category: "binary-search",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given a sorted array that may contain duplicates, find the index of the last occurrence of the target value. Use binary search; when the target is found, record the index and continue searching right to find a later occurrence. Return -1 if the target is not in the array.\n\nExample 1:\n  Input: nums = [1, 2, 2, 2, 3, 4], target = 2\n  Output: 3\n\nExample 2:\n  Input: nums = [1, 1, 1, 1], target = 1\n  Output: 3\n\nExample 3:\n  Input: nums = [1, 3, 5, 7], target = 6\n  Output: -1",
    code: `function findLast(nums, target) {
  // your code here
}`,
    testCode: `function test_basic() {
  assertEqual(findLast([1, 2, 2, 2, 3], 2), 3, "last occurrence of 2");
}

function test_all_same() {
  assertEqual(findLast([2, 2, 2], 2), 2, "last in all-same array");
}

function test_not_found() {
  assertEqual(findLast([1, 2, 3], 5), -1, "target not found");
}

function test_single_match() {
  assertEqual(findLast([1, 3, 5, 7], 3), 1, "single match same index");
}

function test_empty() {
  assertEqual(findLast([], 1), -1, "empty array");
}

function test_at_end() {
  assertEqual(findLast([1, 2, 3, 4, 5], 5), 4, "target at end");
}`,
    solution: `function findLast(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  let result = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) {
      result = mid;
      lo = mid + 1;
    } else if (nums[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return result;
}`,
    usage: `Finding the last (rightmost) occurrence complements the left-boundary search and together they define the complete range of matching elements in sorted data. This is the upper-bound search, exposed as std::upper_bound in C++ and used internally by database engines to determine the end of an index range scan. Combined with find-first, it answers the classic problem of finding the first and last position of an element in O(log n), which is how database query executors determine the exact set of rows matching an equality predicate on an indexed column. Load balancers use right-boundary search to find the last server in a sorted capacity list that can handle a given request size. Version control systems performing bisect operations (like git bisect) use boundary searches to narrow down the last good commit and first bad commit. In coding interviews, this problem is often paired with find-first as a single question, testing whether the candidate can adapt the binary search loop condition and return logic for both boundaries without introducing bugs.`,
    tags: ["binary-search"],
  },
  {
    name: "Find First and Last Position of Element in Sorted Array",
    category: "binary-search",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given an integer array nums sorted in non-decreasing order, return the starting and ending index of target. If target does not appear, return [-1, -1]. Your algorithm must run in O(log n) time.\n\nExample 1:\n  Input: nums = [5,7,7,8,8,10], target = 8\n  Output: [3,4]\n\nExample 2:\n  Input: nums = [1], target = 1\n  Output: [0,0]\n\nExample 3:\n  Input: nums = [5,7,7,8,8,10], target = 6\n  Output: [-1,-1]\n\nConstraints:\n- 0 <= nums.length <= 100000\n- -1000000000 <= nums[i], target <= 1000000000\n- nums is sorted in non-decreasing order.\n\nRef: LeetCode #34 Find First and Last Position of Element in Sorted Array",
    code: `function searchRange(nums, target) {
  // your code here
}`,
    testCode: `function test_duplicate_range() {
  assertEqual(searchRange([5, 7, 7, 8, 8, 10], 8), [3, 4], "finds first and last duplicate positions");
}

function test_single_element_found() {
  assertEqual(searchRange([1], 1), [0, 0], "single matching element");
}

function test_not_found() {
  assertEqual(searchRange([5, 7, 7, 8, 8, 10], 6), [-1, -1], "target missing");
}

function test_empty() {
  assertEqual(searchRange([], 1), [-1, -1], "empty array");
}

function test_single_occurrence_inside_duplicates() {
  assertEqual(searchRange([1, 2, 2, 3, 4, 4, 5], 3), [3, 3], "single occurrence in the middle");
}`,
    solution: `function searchRange(nums, target) {
  function boundary(findFirst) {
    let lo = 0;
    let hi = nums.length - 1;
    let result = -1;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (nums[mid] === target) {
        result = mid;
        if (findFirst) {
          hi = mid - 1;
        } else {
          lo = mid + 1;
        }
      } else if (nums[mid] < target) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return result;
  }

  return [boundary(true), boundary(false)];
}`,
    solutionVariants: [
      {
        label: "Two boundary searches",
        code: `function searchRange(nums, target) {
  function boundary(findFirst) {
    let lo = 0;
    let hi = nums.length - 1;
    let result = -1;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (nums[mid] === target) {
        result = mid;
        if (findFirst) {
          hi = mid - 1;
        } else {
          lo = mid + 1;
        }
      } else if (nums[mid] < target) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return result;
  }

  return [boundary(true), boundary(false)];
}`,
        complexity: "Time: O(log n), Space: O(1)",
        explanation: "Runs one modified binary search for the left boundary and one for the right boundary.",
      },
      {
        label: "Lower bounds",
        code: `function searchRange(nums, target) {
  function lowerBound(value) {
    let lo = 0;
    let hi = nums.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (nums[mid] < value) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  const first = lowerBound(target);
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  return [first, lowerBound(target + 1) - 1];
}`,
        complexity: "Time: O(log n), Space: O(1)",
        explanation: "Finds the first index >= target and the first index > target, then converts them into the closed range.",
      },
    ],
    usage: `Finding both boundaries of a target value is the range-query form of binary search. Databases use equivalent lower-bound and upper-bound searches to turn an equality predicate on a sorted index into the exact contiguous span of matching rows. The key interview skill is keeping the runtime logarithmic while handling missing targets, singleton matches, and duplicate runs without scanning outward linearly.`,
    tags: ["binary-search"],
  },
  {
    name: "Single Number",
    category: "bit-manipulation",
    language: "javascript",
    difficulty: "easy",
    description:
      "Every element in the array appears exactly twice except for one element which appears once. Find that unique element using XOR. The key insight is that a ^ a = 0 and a ^ 0 = a, so XORing all elements cancels out the duplicates.\n\nExample 1:\n  Input: nums = [2, 2, 1]\n  Output: 1\n\nExample 2:\n  Input: nums = [4, 1, 2, 1, 2]\n  Output: 4\n\nExample 3:\n  Input: nums = [1]\n  Output: 1\n\nRef: LeetCode #136 Single Number",
    code: `function singleNumber(nums) {
  // your code here
}`,
    testCode: `function test_basic() {
  assertEqual(singleNumber([2, 2, 1]), 1, "single number in [2,2,1]");
}

function test_longer_array() {
  assertEqual(singleNumber([4, 1, 2, 1, 2]), 4, "single number in [4,1,2,1,2]");
}

function test_single_element() {
  assertEqual(singleNumber([1]), 1, "single element array");
}

function test_larger_values() {
  assertEqual(singleNumber([10, 20, 10, 30, 20]), 30, "single number with larger values");
}`,
    solution: `function singleNumber(nums) {
  let result = 0;
  for (const num of nums) {
    result ^= num;
  }
  return result;
}`,
    usage: `XOR-based duplicate detection exploits the property that a XOR a equals zero and a XOR 0 equals a, meaning XORing all elements in an array where every number appears twice except one will isolate the unique number in O(n) time and O(1) space. This bit manipulation technique is not merely an interview curiosity; it has deep practical roots. RAID 5 and RAID 6 storage systems use XOR to compute parity across disk stripes, enabling data reconstruction when a drive fails. Network protocols use XOR-based checksums for error detection in transmitted packets; TCP and UDP both incorporate XOR in their checksum computations. Hamming error-correcting codes use XOR to both detect and pinpoint single-bit errors in memory (ECC RAM). The pattern also appears in simple stream ciphers where plaintext is XORed with a key stream. In interviews at systems-focused companies like Apple, Nvidia, and embedded-systems firms, the single-number XOR problem tests whether candidates understand bitwise operations and can reason about algebraic properties of XOR.`,
    tags: ["bit-manipulation", "xor", "neetcode"],
  },
  {
    name: "Number of 1 Bits",
    category: "bit-manipulation",
    language: "javascript",
    difficulty: "easy",
    description:
      "Count the number of 1-bits (set bits) in the binary representation of a non-negative integer. Use bitwise AND with 1 to check the last bit, then right-shift the number. Repeat until the number becomes zero.\n\nExample 1:\n  Input: n = 11  (binary: 1011)\n  Output: 3\n\nExample 2:\n  Input: n = 128  (binary: 10000000)\n  Output: 1\n\nExample 3:\n  Input: n = 255  (binary: 11111111)\n  Output: 8\n\nRef: LeetCode #191 Number of 1 Bits",
    code: `function countBits(n) {
  // your code here
}`,
    testCode: `function test_zero() {
  assertEqual(countBits(0), 0, "0 has no set bits");
}

function test_one() {
  assertEqual(countBits(1), 1, "1 has one set bit");
}

function test_three() {
  assertEqual(countBits(3), 2, "3 (11) has 2 set bits");
}

function test_seven() {
  assertEqual(countBits(7), 3, "7 (111) has 3 set bits");
}

function test_power_of_two() {
  assertEqual(countBits(8), 1, "8 (1000) has 1 set bit");
}

function test_all_ones_byte() {
  assertEqual(countBits(255), 8, "255 (11111111) has 8 set bits");
}

function test_ten_bits() {
  assertEqual(countBits(1023), 10, "1023 (10 ones) has 10 set bits");
}`,
    solution: `function countBits(n) {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}`,
    usage: `Counting set bits, also called Hamming weight or population count, determines how many 1-bits are in an integer's binary representation. Modern CPUs provide hardware instructions for this: Intel's POPCNT (introduced with Nehalem in 2008), AMD's equivalent in SSE4a, and ARM's VCNT in NEON extensions. The NSA reportedly requested Cray add a population count instruction to early supercomputers specifically for cryptanalysis. In chess engines like Stockfish, bitboards represent the board state as 64-bit integers, and popcount calculates the number of pieces, attacked squares, or mobility from these bitboards, making it a performance-critical operation called millions of times per second. In networking, Hamming weight computes the number of hosts in a subnet from a subnet mask. RSA encryption implementations choose public exponents with low Hamming weight (like 65537, which has only two set bits) to minimize the number of modular multiplications during encryption. Biometric systems compute Hamming distance between IrisCodes by XORing two codes and counting the set bits in the result. In interviews, this problem tests knowledge of Brian Kernighan's bit trick (n & (n-1) clears the lowest set bit) and whether candidates are aware of hardware-level optimizations.`,
    tags: ["bit-manipulation", "neetcode"],
  },
  {
    name: "Matrix BFS With Walls",
    category: "graphs",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given a 2D grid of 0s and 1s and a starting [row, col] position, return an array of [row, col] positions visited in BFS order. 0 means passable, 1 means wall. Only move in the four cardinal directions (up, down, left, right). Do not revisit cells or pass through walls.\n\nExample 1:\n  Input: grid = [\n    [0, 0, 0],\n    [0, 1, 0],\n    [0, 0, 0]\n  ], start = [0, 0]\n  Output: [[0,0], [0,1], [1,0], [0,2], [2,0], [1,2], [2,1], [2,2]]\n\nExample 2:\n  Input: grid = [\n    [0, 1],\n    [0, 0]\n  ], start = [0, 0]\n  Output: [[0,0], [1,0], [1,1]]\n\nExample 3:\n  Input: grid = [[0]], start = [0, 0]\n  Output: [[0,0]]",
    code: `function matrixBfs(grid, start) {
  // your code here
}`,
    testCode: `function test_3x3_with_center_wall() {
  const grid = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ];
  const result = matrixBfs(grid, [0, 0]);
  assertEqual(result.length, 8, "should visit 8 cells (center is wall)");
  assertEqual(result[0], [0, 0], "should start at [0,0]");
}

function test_blocked_start() {
  const grid = [
    [0, 1],
    [1, 0]
  ];
  const result = matrixBfs(grid, [0, 0]);
  assertEqual(result.length, 1, "blocked start should only visit start cell");
  assertEqual(result[0], [0, 0], "should contain start position");
}

function test_single_cell() {
  const grid = [[0]];
  const result = matrixBfs(grid, [0, 0]);
  assertEqual(result, [[0, 0]], "single cell grid");
}

function test_all_open_2x2() {
  const grid = [
    [0, 0],
    [0, 0]
  ];
  const result = matrixBfs(grid, [0, 0]);
  assertEqual(result.length, 4, "all open 2x2 should visit 4 cells");
}`,
    solution: `function matrixBfs(grid, start) {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set();
  const queue = [start];
  const result = [];
  const key = (r, c) => r + "," + c;

  visited.add(key(start[0], start[1]));

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    result.push([r, c]);

    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nr = r + dr;
      const nc = c + dc;
      const k = key(nr, nc);
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(k) && grid[nr][nc] === 0) {
        visited.add(k);
        queue.push([nr, nc]);
      }
    }
  }

  return result;
}`,
    usage: `Matrix BFS finds the shortest path in unweighted grids and is the backbone of pathfinding in games, robotics, and geographic information systems. Game engines use grid-based BFS for NPC pathfinding in tile-based games; Unity and Unreal provide navigation mesh systems that decompose 3D space into grid-like cells and apply BFS or A* for character movement. Warehouse robotics companies like Amazon Robotics (formerly Kiva Systems) use grid BFS to route thousands of robots through fulfillment center floors, treating each floor tile as a cell and computing collision-free shortest paths. Google Maps and Waze use Dijkstra's algorithm and A*, both of which generalize BFS to weighted graphs; understanding BFS on a grid is the prerequisite for grasping these production-grade algorithms. Emergency evacuation planning software uses grid BFS to compute shortest exits from building floor plans, propagating outward from exit points to determine evacuation routes. In coding interviews, matrix BFS appears as shortest-path-in-maze, rotting-oranges, and walls-and-gates problems, all of which test your ability to manage a queue, track visited cells, and handle four-directional neighbors correctly.`,
    tags: ["bfs","matrix"],
  },
  {
    name: "Shortest Path in Binary Matrix",
    category: "graphs",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given an n x n binary grid, find the length of the shortest clear path from the top-left cell to the bottom-right cell. A clear cell has value 0. A blocked cell has value 1. You may move in any of the 8 directions, including diagonals. The path length counts both the starting and ending cells. Return -1 if no clear path exists.\n\nExample 1:\n  Input: grid = [[0,1],[1,0]]\n  Output: 2\n\nExample 2:\n  Input: grid = [[0,0,0],[1,1,0],[1,1,0]]\n  Output: 4\n\nExample 3:\n  Input: grid = [[1,0],[0,0]]\n  Output: -1\n\nConstraints:\n- n == grid.length == grid[i].length\n- 1 <= n <= 100\n- grid[i][j] is 0 or 1\n\nRef: LeetCode #1091 Shortest Path in Binary Matrix",
    code: `function shortestPathBinaryMatrix(grid) {
  // your code here
}`,
    testCode: `function test_diagonal_two_by_two() {
  assertEqual(shortestPathBinaryMatrix([[0, 1], [1, 0]]), 2);
}

function test_turning_path() {
  assertEqual(shortestPathBinaryMatrix([[0, 0, 0], [1, 1, 0], [1, 1, 0]]), 4);
}

function test_blocked_start() {
  assertEqual(shortestPathBinaryMatrix([[1, 0], [0, 0]]), -1);
}

function test_blocked_end() {
  assertEqual(shortestPathBinaryMatrix([[0, 0], [0, 1]]), -1);
}

function test_single_open_cell() {
  assertEqual(shortestPathBinaryMatrix([[0]]), 1);
}`,
    solution: `function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (n === 0 || grid[0][0] !== 0 || grid[n - 1][n - 1] !== 0) return -1;

  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];
  const queue = [[0, 0, 1]];
  const seen = new Set(["0,0"]);
  let head = 0;

  while (head < queue.length) {
    const [row, col, dist] = queue[head++];
    if (row === n - 1 && col === n - 1) return dist;

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      const key = nr + "," + nc;
      if (nr < 0 || nr >= n || nc < 0 || nc >= n || grid[nr][nc] !== 0 || seen.has(key)) continue;
      seen.add(key);
      queue.push([nr, nc, dist + 1]);
    }
  }

  return -1;
}`,
    usage: `Shortest Path in Binary Matrix is a compact shortest-path problem for unweighted grids. It tests whether you can model each open cell as a graph node, include diagonal neighbors, and use BFS levels to return the first distance that reaches the target. The same pattern appears in routing, game maps, robotics grids, and maze-style interview problems where every move has equal cost.`,
    tags: ["bfs","matrix"],
  },
  {
    name: "Graph DFS",
    category: "graphs",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given an adjacency list (an object mapping each node to an array of its neighbors) and a start node, return an array of all reachable nodes visited in depth-first search order. Use a stack or recursion. Track visited nodes to avoid cycles.\n\nExample 1:\n  Input: graph = { \"a\": [\"b\", \"c\"], \"b\": [\"d\"], \"c\": [\"e\"], \"d\": [], \"e\": [] }, start = \"a\"\n  Output: [\"a\", \"b\", \"d\", \"c\", \"e\"]\n\nExample 2:\n  Input: graph = { \"a\": [\"b\"], \"b\": [\"a\"] }, start = \"a\"\n  Output: [\"a\", \"b\"]\n\nExample 3:\n  Input: graph = { \"x\": [] }, start = \"x\"\n  Output: [\"x\"]\n\nRef: LeetCode #323 Number of Connected Components in an Undirected Graph (closest match)",
    code: `function graphDfs(graph, start) {
  // your code here
}`,
    testCode: `function test_basic_graph() {
  const graph = { a: ["b", "c"], b: ["d"], c: [], d: [] };
  const result = graphDfs(graph, "a");
  assertEqual(result[0], "a", "should start with 'a'");
  assertEqual(result.length, 4, "should visit all 4 nodes");
  assert(result.includes("b"), "should include 'b'");
  assert(result.includes("c"), "should include 'c'");
  assert(result.includes("d"), "should include 'd'");
}

function test_single_node() {
  const graph = { x: [] };
  assertEqual(graphDfs(graph, "x"), ["x"], "single node graph");
}

function test_disconnected() {
  const graph = { a: ["b"], b: [], c: ["d"], d: [] };
  const result = graphDfs(graph, "a");
  assertEqual(result.length, 2, "should only visit reachable nodes from 'a'");
  assert(result.includes("a"), "should include 'a'");
  assert(result.includes("b"), "should include 'b'");
  assert(!result.includes("c"), "should not include unreachable 'c'");
}`,
    solution: `function graphDfs(graph, start) {
  const visited = new Set();
  const result = [];
  const stack = [start];

  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    result.push(node);

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return result;
}`,
    usage: `Graph DFS is the workhorse algorithm behind cycle detection, topological ordering, and connectivity analysis in production systems. Deadlock detectors in operating systems and database transaction managers use DFS with back-edge detection to find cycles in resource-allocation graphs; PostgreSQL's lock manager does exactly this when checking for deadlock among concurrent transactions. Web crawlers like Googlebot use DFS-based strategies to explore link structures deeply before moving laterally, which is more memory-efficient than BFS for the scale of the web (trillions of pages). Tarjan's and Kosaraju's algorithms, both DFS-based, find strongly connected components in directed graphs, which is used by compilers to identify mutually recursive function groups, by social network platforms to detect tightly-knit communities, and by search engines to identify link-farm spam clusters. Version control systems use DFS to traverse commit DAGs when computing merge bases and reachability. In coding interviews, graph DFS is tested constantly at Google, Meta, and Amazon in problems like number-of-provinces, course-schedule (cycle detection), and clone-graph, where the key challenge is tracking visited nodes correctly across recursive calls.`,
    tags: ["dfs", "recursion", "neetcode"],
  },
  {
    name: "Build Adjacency List Drill",
    category: "graphs",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given an array of edges (each edge is a pair [a, b]) and a boolean directed flag, build and return an adjacency list as an object mapping each node to an array of its neighbors. If directed is false, add edges in both directions (a->b and b->a). If directed is true, add only a->b.\n\nExample 1:\n  Input: edges = [[\"a\", \"b\"], [\"b\", \"c\"], [\"a\", \"c\"]], directed = false\n  Output: { \"a\": [\"b\", \"c\"], \"b\": [\"a\", \"c\"], \"c\": [\"b\", \"a\"] }\n\nExample 2:\n  Input: edges = [[\"a\", \"b\"], [\"b\", \"c\"]], directed = true\n  Output: { \"a\": [\"b\"], \"b\": [\"c\"], \"c\": [] }\n\nExample 3:\n  Input: edges = [], directed = false\n  Output: {}",
    code: `function buildAdjacencyList(edges, directed = false) {
  // your code here
}`,
    testCode: `function test_undirected() {
  const edges = [["a", "b"], ["b", "c"]];
  const result = buildAdjacencyList(edges);
  assert(result["a"].includes("b"), "a should connect to b");
  assert(result["b"].includes("a"), "b should connect to a (undirected)");
  assert(result["b"].includes("c"), "b should connect to c");
  assert(result["c"].includes("b"), "c should connect to b (undirected)");
}

function test_directed() {
  const edges = [["a", "b"], ["b", "c"]];
  const result = buildAdjacencyList(edges, true);
  assert(result["a"].includes("b"), "a -> b in directed");
  assertEqual(result["b"].includes("a"), false, "b should NOT connect to a in directed");
  assert(result["b"].includes("c"), "b -> c in directed");
}

function test_empty_edges() {
  const result = buildAdjacencyList([]);
  assertEqual(JSON.stringify(result), "{}", "empty edges should return empty object");
}

function test_multiple_neighbors() {
  const edges = [["a", "b"], ["a", "c"], ["a", "d"]];
  const result = buildAdjacencyList(edges);
  assertEqual(result["a"].length, 3, "a should have 3 neighbors");
}`,
    solution: `function buildAdjacencyList(edges, directed = false) {
  const graph = {};

  for (const [a, b] of edges) {
    if (!(a in graph)) graph[a] = [];
    if (!(b in graph)) graph[b] = [];
    graph[a].push(b);
    if (!directed) {
      graph[b].push(a);
    }
  }

  return graph;
}`,
    usage: `Building an adjacency list from an edge list is the first step in virtually every graph algorithm, and getting this conversion right is a prerequisite for solving any graph problem in an interview or production system. Social networks like Facebook and LinkedIn store friendship graphs as adjacency lists because real-world social graphs are sparse (the average user has a few hundred connections out of billions of possible edges), making adjacency lists far more space-efficient than adjacency matrices at O(V + E) versus O(V squared). Package managers like npm, pip, and apt internally build adjacency lists from dependency declarations to represent the dependency graph before running topological sort for installation ordering. Network routing protocols like OSPF (Open Shortest Path First) construct adjacency lists from router link-state advertisements to build a map of the network topology, which is then fed into Dijkstra's algorithm for shortest-path routing. Recommendation engines at companies like Netflix and Spotify model user-item interactions as bipartite graphs stored as adjacency lists, enabling collaborative filtering traversals. In interviews, you are almost never given a pre-built adjacency list; you receive an edge list or a matrix and must construct the adjacency list yourself, so this conversion step is a practical skill tested in every graph problem at every major tech company.`,
    tags: ["graph"],
  },
  {
    name: "Clone Graph",
    category: "graphs",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given a reference to a node in a connected undirected graph, return a deep copy of the graph. Each node has a numeric value and a list of neighboring nodes. The clone must preserve the same connections while using entirely new node objects.\n\nExample 1:\n  Input: adjList = [[2,4],[1,3],[2,4],[1,3]]\n  Output: a separate graph with the same adjacency structure\n\nExample 2:\n  Input: adjList = [[]]\n  Output: one cloned node with no neighbors\n\nExample 3:\n  Input: adjList = []\n  Output: null\n\nRef: LeetCode #133 Clone Graph",
    code: `class Node {
  constructor(val = 0, neighbors = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

function cloneGraph(node) {
  // your code here
}`,
    testCode: `function serializeGraph(node) {
  if (node === null) return [];
  const seen = new Set([node]);
  const queue = [node];
  const byValue = {};

  while (queue.length > 0) {
    const curr = queue.shift();
    byValue[curr.val] = curr.neighbors.map((neighbor) => neighbor.val).sort((a, b) => a - b);

    for (const neighbor of curr.neighbors) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return Object.keys(byValue)
    .map(Number)
    .sort((a, b) => a - b)
    .map((value) => byValue[value]);
}

function collectNodes(node) {
  if (node === null) return new Set();
  const seen = new Set([node]);
  const queue = [node];

  while (queue.length > 0) {
    const curr = queue.shift();
    for (const neighbor of curr.neighbors) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return seen;
}

function test_empty_graph() {
  assertEqual(cloneGraph(null), null, "empty graph should clone to null");
}

function test_single_node() {
  const node = new Node(1);
  const cloned = cloneGraph(node);
  assert(cloned !== node, "clone must be a new object");
  assertEqual(cloned.val, 1, "single node value should match");
  assertEqual(cloned.neighbors.length, 0, "single node should have no neighbors");
}

function test_four_node_cycle_structure() {
  const n1 = new Node(1);
  const n2 = new Node(2);
  const n3 = new Node(3);
  const n4 = new Node(4);
  n1.neighbors = [n2, n4];
  n2.neighbors = [n1, n3];
  n3.neighbors = [n2, n4];
  n4.neighbors = [n1, n3];

  const cloned = cloneGraph(n1);
  assertEqual(serializeGraph(cloned), [[2, 4], [1, 3], [2, 4], [1, 3]], "adjacency structure should match");
}

function test_deep_copy_uses_no_original_nodes() {
  const n1 = new Node(1);
  const n2 = new Node(2);
  const n3 = new Node(3);
  n1.neighbors = [n2, n3];
  n2.neighbors = [n1];
  n3.neighbors = [n1];

  const originalNodes = collectNodes(n1);
  const clonedNodes = collectNodes(cloneGraph(n1));
  for (const node of clonedNodes) {
    assert(!originalNodes.has(node), "cloned graph must not reuse original nodes");
  }
}`,
    solution: `class Node {
  constructor(val = 0, neighbors = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

function cloneGraph(node) {
  if (node === null) return null;

  const clones = new Map();

  function dfs(curr) {
    if (clones.has(curr)) return clones.get(curr);

    const copy = new Node(curr.val);
    clones.set(curr, copy);

    for (const neighbor of curr.neighbors) {
      copy.neighbors.push(dfs(neighbor));
    }

    return copy;
  }

  return dfs(node);
}`,
    solutionVariants: [
      {
        label: "DFS clone",
        complexity: "O(V + E) time, O(V) space",
        explanation: "Recursively clone each node once and use an old-to-new map to preserve cycles without revisiting nodes.",
        code: `class Node {
  constructor(val = 0, neighbors = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

function cloneGraph(node) {
  if (node === null) return null;

  const clones = new Map();

  function dfs(curr) {
    if (clones.has(curr)) return clones.get(curr);

    const copy = new Node(curr.val);
    clones.set(curr, copy);

    for (const neighbor of curr.neighbors) {
      copy.neighbors.push(dfs(neighbor));
    }

    return copy;
  }

  return dfs(node);
}`,
      },
      {
        label: "BFS clone",
        complexity: "O(V + E) time, O(V) space",
        explanation: "Create nodes level by level with a queue, wiring each cloned node to the cloned versions of its neighbors.",
        code: `class Node {
  constructor(val = 0, neighbors = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

function cloneGraph(node) {
  if (node === null) return null;

  const clones = new Map([[node, new Node(node.val)]]);
  const queue = [node];

  while (queue.length > 0) {
    const curr = queue.shift();

    for (const neighbor of curr.neighbors) {
      if (!clones.has(neighbor)) {
        clones.set(neighbor, new Node(neighbor.val));
        queue.push(neighbor);
      }
      clones.get(curr).neighbors.push(clones.get(neighbor));
    }
  }

  return clones.get(node);
}`,
      },
    ],
    usage: `Cloning a graph is the same reference-preserving deep-copy problem behind scene duplication in game engines, object graph serialization, undo snapshots, and cache-safe state transforms. The important idea is the old-to-new map: without it, cycles recurse forever and shared neighbors accidentally become duplicated instead of shared in the clone.`,
    tags: ["graph", "dfs", "bfs", "blind75", "neetcode"],
  },
  {
    name: "Matrix DFS",
    category: "graphs",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given a 2D grid of 0s and 1s and a starting [row, col] position, return an array of [row, col] positions visited in DFS order. 0 means passable, 1 means wall. Only move in the four cardinal directions (up, down, left, right). Do not revisit cells or pass through walls.\n\nExample 1:\n  Input: grid = [\n    [0, 0, 0],\n    [0, 1, 0],\n    [0, 0, 0]\n  ], start = [0, 0]\n  Output: [[0,0], [0,1], [0,2], [1,2], [2,2], [2,1], [2,0], [1,0]]\n\nExample 2:\n  Input: grid = [\n    [0, 1],\n    [0, 0]\n  ], start = [0, 0]\n  Output: [[0,0], [1,0], [1,1]]\n\nExample 3:\n  Input: grid = [[0]], start = [0, 0]\n  Output: [[0,0]]\n\nRef: LeetCode #200 Number of Islands",
    code: `function matrixDfs(grid, start) {
  // your code here
}`,
    testCode: `function test_3x3_center_wall() {
  const grid = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ];
  const result = matrixDfs(grid, [0, 0]);
  assertEqual(result.length, 8, "should visit 8 cells (center is wall)");
  assertEqual(result[0], [0, 0], "should start at [0,0]");
}

function test_blocked() {
  const grid = [
    [0, 1],
    [1, 0]
  ];
  const result = matrixDfs(grid, [0, 0]);
  assertEqual(result.length, 1, "blocked should only visit start");
}

function test_single_cell() {
  const grid = [[0]];
  assertEqual(matrixDfs(grid, [0, 0]), [[0, 0]], "single cell");
}

function test_all_open_2x2() {
  const grid = [
    [0, 0],
    [0, 0]
  ];
  const result = matrixDfs(grid, [0, 0]);
  assertEqual(result.length, 4, "all open 2x2 should visit 4 cells");
}`,
    solution: `function matrixDfs(grid, start) {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set();
  const result = [];

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const key = r + "," + c;
    if (visited.has(key) || grid[r][c] === 1) return;

    visited.add(key);
    result.push([r, c]);

    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      dfs(r + dr, c + dc);
    }
  }

  dfs(start[0], start[1]);
  return result;
}`,
    usage: `Matrix DFS, commonly known as flood fill, is the algorithm behind the paint bucket tool in every image editor from Photoshop to GIMP, where clicking a pixel fills all connected same-colored pixels by recursively visiting neighbors. Beyond graphics, geographic information systems (GIS) like QGIS and ArcGIS use flood fill to calculate land parcel areas, delineate watershed boundaries, and measure forest coverage by treating satellite imagery pixels as grid cells and propagating through connected regions of similar classification. The island-counting variant of matrix DFS is used in medical imaging to identify and count distinct tumors or lesions in MRI scans, where each connected region of abnormal tissue intensity represents a separate finding. Game engines use matrix DFS for terrain analysis, such as determining which tiles are reachable from a given position (fog-of-war calculation) or identifying enclosed regions for area-of-effect spells. Minesweeper's cascade-reveal mechanic, where clicking an empty cell reveals all connected empty cells, is a direct implementation of matrix DFS flood fill. In interviews, matrix DFS appears as number-of-islands, surrounded-regions, and flood-fill problems, and is asked frequently at Amazon, Google, and Meta, testing your ability to handle grid boundaries, visited tracking, and four-directional or eight-directional neighbor enumeration.`,
    tags: ["dfs", "matrix", "recursion", "neetcode"],
  },
  {
    name: "Best Time to Buy and Sell Stock",
    category: "greedy",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given an array of prices where prices[i] is the price of a stock on day i, find the maximum profit from one buy and one sell. You must buy before you sell. If no profit is possible, return 0.\n\nExample 1:\n  Input: prices = [7, 1, 5, 3, 6, 4]\n  Output: 5\n  Explanation: Buy on day 2 (price = 1), sell on day 5 (price = 6). Profit = 6 - 1 = 5.\n\nExample 2:\n  Input: prices = [7, 6, 4, 3, 1]\n  Output: 0\n  Explanation: Prices only decrease, so no profitable transaction exists.\n\nRef: LeetCode #121 Best Time to Buy and Sell Stock",
    code: `// Given an array of stock prices, find the maximum profit
// from a single buy-sell transaction.
// You must buy before you sell. Return 0 if no profit is possible.

function maxProfit(prices) {
  // your code here
}
`,
    testCode: `function test_basic_profit() {
  assertEqual(maxProfit([7, 1, 5, 3, 6, 4]), 5, "Buy at 1, sell at 6 = profit 5");
}

function test_no_profit() {
  assertEqual(maxProfit([7, 6, 4, 3, 1]), 0, "Decreasing prices = no profit");
}

function test_single_day() {
  assertEqual(maxProfit([5]), 0, "Single price = no transaction possible");
}

function test_profit_at_end() {
  assertEqual(maxProfit([2, 4, 1, 7]), 6, "Buy at 1, sell at 7 = profit 6");
}

function test_same_prices() {
  assertEqual(maxProfit([3, 3, 3, 3]), 0, "All same prices = no profit");
}

function test_two_days() {
  assertEqual(maxProfit([1, 5]), 4, "Buy day 1, sell day 2 = profit 4");
}
`,
    solution: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;

  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else {
      maxProfit = Math.max(maxProfit, price - minPrice);
    }
  }

  return maxProfit;
}`,
    usage: `Best Time to Buy and Sell Stock is the quintessential greedy algorithm problem: track the minimum price seen so far and compute the maximum profit at each step, making the locally optimal choice without revisiting past decisions. This greedy single-pass approach runs in O(n) time and O(1) space, making it practical for real-time financial systems. Quantitative trading firms like Jane Street, Citadel, and Two Sigma use this exact pattern to compute maximum drawdown and optimal entry/exit points on streaming price data. Robinhood and other retail trading platforms display "best possible trade" metrics using the same logic. The pattern generalizes to any problem where you need to find the maximum difference between two elements where the smaller one comes first, which appears in temperature analysis, inventory pricing, and time-series anomaly detection. In interviews, this is LeetCode problem #121 and one of the most frequently asked questions at Amazon, Google, Meta, and Goldman Sachs; it tests whether candidates can recognize a greedy approach instead of reaching for O(n^2) brute force.`,
    tags: ["greedy", "neetcode"],
  },
  {
    name: "Min Heap",
    category: "heap",
    language: "javascript",
    difficulty: "medium",
    description:
      "Implement a MinHeap class backed by an array. The smallest element is always at the root. For a node at index i, its left child is at 2i+1 and right child is at 2i+2, and its parent is at floor((i-1)/2). Support insert, extractMin, peek, and size operations.\n\nExample 1:\n  Operations: insert(5), insert(3), insert(8), peek()\n  Result: peek() returns 3\n\nExample 2:\n  Operations: insert(10), insert(4), insert(15), extractMin(), extractMin()\n  Result: first extractMin() returns 4, second returns 10\n\nExample 3:\n  Operations: insert(1), insert(2), size(), extractMin(), size()\n  Result: first size() returns 2, extractMin() returns 1, second size() returns 1\n\nRef: LeetCode #703 Kth Largest Element in a Stream (closest match)",
    code: `class MinHeap {
  constructor() {
    this.data = [];
  }

  insert(val) {
    // your code here
  }

  extractMin() {
    // your code here
  }

  peek() {
    // your code here
  }

  get size() {
    // your code here
  }

  _bubbleUp(i) {
    // your code here
  }

  _bubbleDown(i) {
    // your code here
  }

  _swap(i, j) {
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
  }
}`,
    testCode: `function test_insert_and_peek() {
  const h = new MinHeap();
  h.insert(5);
  h.insert(3);
  h.insert(7);
  assertEqual(h.peek(), 3, "peek returns min after inserts");
  assertEqual(h.size, 3, "size is 3");
}

function test_extract_order() {
  const h = new MinHeap();
  [5, 3, 7, 1, 4].forEach(v => h.insert(v));
  const result = [];
  while (h.size > 0) result.push(h.extractMin());
  assertEqual(result, [1, 3, 4, 5, 7], "extractMin returns ascending order");
}

function test_extract_empty_throws() {
  const h = new MinHeap();
  try {
    h.extractMin();
    assert(false, "should have thrown on empty extract");
  } catch (e) {
    assert(true, "throws on empty extract");
  }
}

function test_duplicates() {
  const h = new MinHeap();
  [3, 1, 3, 1, 2].forEach(v => h.insert(v));
  const result = [];
  while (h.size > 0) result.push(h.extractMin());
  assertEqual(result, [1, 1, 2, 3, 3], "handles duplicates");
}`,
    solution: `class MinHeap {
  constructor() {
    this.data = [];
  }

  insert(val) {
    this.data.push(val);
    this._bubbleUp(this.data.length - 1);
  }

  extractMin() {
    if (this.data.length === 0) throw new Error("extract from empty heap");
    this._swap(0, this.data.length - 1);
    const val = this.data.pop();
    if (this.data.length > 0) this._bubbleDown(0);
    return val;
  }

  peek() {
    if (this.data.length === 0) throw new Error("peek at empty heap");
    return this.data[0];
  }

  get size() {
    return this.data.length;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[i] < this.data[parent]) {
        this._swap(i, parent);
        i = parent;
      } else {
        break;
      }
    }
  }

  _bubbleDown(i) {
    const size = this.data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < size && this.data[left] < this.data[smallest]) smallest = left;
      if (right < size && this.data[right] < this.data[smallest]) smallest = right;

      if (smallest === i) break;

      this._swap(i, smallest);
      i = smallest;
    }
  }

  _swap(i, j) {
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
  }
}`,
    usage: `The min-heap is the standard implementation behind priority queues, and it is embedded in some of the most performance-critical systems in computing. Dijkstra's shortest-path algorithm, which powers routing in Google Maps, Apple Maps, and OSPF network routing protocols, requires a min-heap to efficiently extract the next closest vertex. Operating system schedulers like Linux's Completely Fair Scheduler use red-black trees (a heap-like priority structure) to pick the next process to run, and timer wheels in the kernel use min-heaps to fire the soonest-expiring timer. In event-driven simulations, discrete-event frameworks like SimPy and DESMO-J use heaps to manage the event calendar. Huffman coding for data compression in gzip and zlib builds its optimal prefix tree using a min-heap to repeatedly extract the two lowest-frequency symbols. Python's heapq module and Java's PriorityQueue are both array-backed min-heaps, and interviewers expect candidates to know the O(log n) insertion and extraction costs, plus how to use them for top-k problems, median-finding, and stream processing.`,
    tags: ["heap", "neetcode"],
  },
  {
    name: "Merge Intervals",
    category: "intervals",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given an array of intervals where each interval is [start, end], merge all overlapping intervals and return an array of non-overlapping intervals that cover all the ranges in the input. Sort by start time first, then merge greedily.\n\nExample 1:\n  Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\n  Output: [[1,6],[8,10],[15,18]]\n\nExample 2:\n  Input: intervals = [[1,4],[4,5]]\n  Output: [[1,5]]\n\nExample 3:\n  Input: intervals = [[1,4],[0,4]]\n  Output: [[0,4]]\n\nRef: LeetCode #56 Merge Intervals",
    code: `function mergeIntervals(intervals) {
  // your code here
}`,
    testCode: `function test_overlapping_intervals() {
  assertEqual(
    mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]),
    [[1, 6], [8, 10], [15, 18]],
    "merge overlapping intervals"
  );
}

function test_adjacent_intervals() {
  assertEqual(
    mergeIntervals([[1, 4], [4, 5]]),
    [[1, 5]],
    "adjacent intervals should merge"
  );
}

function test_no_overlap() {
  assertEqual(
    mergeIntervals([[1, 2], [4, 5]]),
    [[1, 2], [4, 5]],
    "non-overlapping intervals stay separate"
  );
}

function test_single_interval() {
  assertEqual(mergeIntervals([[1, 3]]), [[1, 3]], "single interval");
}

function test_empty_input() {
  assertEqual(mergeIntervals([]), [], "empty input");
}

function test_all_overlapping() {
  assertEqual(
    mergeIntervals([[1, 4], [2, 3], [3, 6]]),
    [[1, 6]],
    "all overlapping merge into one"
  );
}

function test_unsorted_input() {
  assertEqual(
    mergeIntervals([[3, 4], [1, 2], [2, 3]]),
    [[1, 4]],
    "unsorted input should still merge correctly"
  );
}`,
    solution: `function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];

  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const [start, end] = intervals[i];
    const last = merged[merged.length - 1];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  return merged;
}`,
    usage: `Merge Intervals is the go-to algorithm for any system that manages overlapping time ranges, and it shows up in production code far more often than most interview problems. Google Calendar, Outlook, and every scheduling application must merge overlapping meeting blocks to compute free/busy times; this is literally the merge intervals algorithm. Operating system CPU schedulers merge overlapping process time slices to optimize resource allocation. Network bandwidth managers merge overlapping allocation windows to prevent oversubscription. In genomics, tools like BEDTools merge overlapping genomic coordinate ranges when analyzing sequencing data. Airport systems merge overlapping gate-usage intervals for conflict detection. The algorithm itself is straightforward: sort intervals by start time, then iterate and merge, yielding O(n log n) overall. It appears constantly in interviews at companies like Google, Uber, and Airbnb because it tests sorting, iteration logic, and edge-case handling with adjacent and nested intervals.`,
    tags: ["sorting", "intervals", "neetcode"],
  },
  {
    name: "Linked List Traversal",
    category: "linked-list",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given the head of a singly linked list (where each Node has val and next properties), return an array containing all the values in the list from head to tail.\n\nExample 1:\n  Input: list = 1 -> 2 -> 3 -> 4 -> null\n  Output: [1, 2, 3, 4]\n\nExample 2:\n  Input: list = 10 -> null\n  Output: [10]\n\nExample 3:\n  Input: list = null (empty list)\n  Output: []\n\nRef: LeetCode #234 Palindrome Linked List (closest match)",
    code: `class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function traverse(head) {
  // your code here
}`,
    testCode: `function test_three_nodes() {
  const c = new Node(3);
  const b = new Node(2, c);
  const a = new Node(1, b);
  assertEqual(traverse(a), [1, 2, 3], "three node list");
}

function test_single_node() {
  const a = new Node(42);
  assertEqual(traverse(a), [42], "single node list");
}

function test_empty_list() {
  assertEqual(traverse(null), [], "null head should return []");
}`,
    solution: `class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function traverse(head) {
  const result = [];
  let current = head;

  while (current !== null) {
    result.push(current.val);
    current = current.next;
  }

  return result;
}`,
    usage: `Linked list traversal is the operation underlying memory management in operating systems, where the kernel maintains a free list of available memory blocks and traverses it on every malloc call to find a suitable chunk. The Linux kernel's slab allocator uses linked lists to manage pools of fixed-size memory objects, and the FAT (File Allocation Table) file system represents file block chains as linked lists that the OS traverses to read a file from disk. Java's garbage collector traverses linked structures during the mark phase to identify reachable objects, and Python's cyclic garbage collector walks reference chains to detect and collect circular references. Browser engines maintain linked lists of DOM nodes for sibling traversal, and undo/redo stacks in editors like VS Code are implemented as doubly-linked lists that are traversed forward and backward. In professional interviews, linked list traversal is the entry point to harder problems; if you cannot walk a list cleanly, handling the null-termination and pointer advancement, you will struggle with cycle detection, merge operations, and in-place reversal problems that companies like Amazon and Microsoft ask regularly.`,
    tags: ["linked-list","iteration"],
  },
  {
    name: "Reverse Linked List",
    category: "linked-list",
    language: "javascript",
    difficulty: "medium",
    description:
      "Reverse a singly linked list iteratively and return the new head. Use three pointers: prev (starts null), current (starts at head), and next (temp reference). At each step, save current.next, point current.next to prev, advance prev to current, and advance current to next.\n\nExample 1:\n  Input: list = 1 -> 2 -> 3 -> 4 -> 5 -> null\n  Output: 5 -> 4 -> 3 -> 2 -> 1 -> null (return node with val 5)\n\nExample 2:\n  Input: list = 1 -> 2 -> null\n  Output: 2 -> 1 -> null (return node with val 2)\n\nExample 3:\n  Input: list = null (empty list)\n  Output: null\n\nRef: LeetCode #206 Reverse Linked List",
    code: `class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseIterative(head) {
  // your code here
}`,
    testCode: `function buildList(vals) {
  let head = null;
  for (let i = vals.length - 1; i >= 0; i--) {
    head = new Node(vals[i], head);
  }
  return head;
}

function toList(head) {
  const result = [];
  let current = head;
  while (current !== null) {
    result.push(current.val);
    current = current.next;
  }
  return result;
}

function test_multiple() {
  const head = buildList([1, 2, 3, 4]);
  assertEqual(toList(reverseIterative(head)), [4, 3, 2, 1], "reverse [1,2,3,4]");
}

function test_single() {
  const head = buildList([1]);
  assertEqual(toList(reverseIterative(head)), [1], "single node");
}

function test_null() {
  assertEqual(reverseIterative(null), null, "null head");
}

function test_two_nodes() {
  const head = buildList([1, 2]);
  assertEqual(toList(reverseIterative(head)), [2, 1], "reverse two nodes");
}`,
    solution: `class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseIterative(head) {
  let prev = null;
  let current = head;

  while (current !== null) {
    const nxt = current.next;
    current.next = prev;
    prev = current;
    current = nxt;
  }

  return prev;
}`,
    usage: `The iterative approach to reversing a linked list is the most space-efficient method at O(1) extra memory, using only three pointers (previous, current, next) to rewire links in a single pass. This matters in production systems where memory is constrained: the Linux kernel's linked list reversal operations in network packet processing, where millions of packets per second flow through linked buffer chains, must be iterative to avoid stack overflow and minimize latency. LRU cache evictions in systems like Redis and Memcached involve pointer manipulation on doubly-linked lists that mirrors the iterative reversal pattern, moving nodes from one position to another by relinking previous and next pointers. Transaction rollback mechanisms in database engines like InnoDB reverse chains of undo log entries iteratively to restore previous row states during ROLLBACK. The iterative approach is the version interviewers at Amazon, Google, and Microsoft expect you to write first, because it demonstrates that you understand pointer manipulation without the crutch of the call stack; being able to walk through the three-pointer swap on a whiteboard is considered a baseline competency for any systems or backend engineering role.`,
    tags: ["linked-list", "iteration", "neetcode"],
  },
  {
    name: "Reverse Linked List (Recursive)",
    category: "linked-list",
    language: "javascript",
    difficulty: "medium",
    description:
      "Reverse a singly linked list recursively and return the new head. The base case is when head is null or head.next is null. Recurse on head.next to get the new head, then set head.next.next to head and head.next to null to reverse the link.\n\nExample 1:\n  Input: list = 1 -> 2 -> 3 -> 4 -> 5 -> null\n  Output: 5 -> 4 -> 3 -> 2 -> 1 -> null (return node with val 5)\n\nExample 2:\n  Input: list = 10 -> 20 -> null\n  Output: 20 -> 10 -> null (return node with val 20)\n\nExample 3:\n  Input: list = 42 -> null\n  Output: 42 -> null (single node, already reversed)\n\nRef: LeetCode #206 Reverse Linked List",
    code: `class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseRecursive(head) {
  // your code here
}`,
    testCode: `function buildList(vals) {
  let head = null;
  for (let i = vals.length - 1; i >= 0; i--) {
    head = new Node(vals[i], head);
  }
  return head;
}

function toList(head) {
  const result = [];
  let current = head;
  while (current !== null) {
    result.push(current.val);
    current = current.next;
  }
  return result;
}

function test_multiple() {
  const head = buildList([1, 2, 3, 4]);
  assertEqual(toList(reverseRecursive(head)), [4, 3, 2, 1], "reverse [1,2,3,4]");
}

function test_single() {
  const head = buildList([1]);
  assertEqual(toList(reverseRecursive(head)), [1], "single node");
}

function test_null() {
  assertEqual(reverseRecursive(null), null, "null head");
}

function test_two_nodes() {
  const head = buildList([1, 2]);
  assertEqual(toList(reverseRecursive(head)), [2, 1], "reverse two nodes");
}`,
    solution: `class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseRecursive(head) {
  if (head === null || head.next === null) return head;

  const newHead = reverseRecursive(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}`,
    usage: `The recursive approach to reversing a linked list demonstrates mastery of recursive thinking and call-stack mechanics, which is why interviewers at companies like Google and Meta ask for both solutions. While the iterative version is more memory-efficient, the recursive approach teaches a mental model that transfers directly to harder recursive problems: reverse-nodes-in-k-group, swap-nodes-in-pairs, and reorder-list all build on the recursive reversal pattern. In functional programming languages like Haskell, Erlang, and Clojure, list reversal is inherently recursive because these languages lack mutable state and iterative loops; understanding recursive reversal is essential for working in any functional codebase. Compilers and interpreters for languages like Lisp process S-expressions (nested linked structures) recursively, and internal transformations on these structures often involve recursive reversal of sublists. The recursive approach also illustrates tail-call optimization: languages that support TCO (like Scheme and Kotlin) can compile recursive reversal into iterative machine code, eliminating the O(n) stack overhead, which is a concept tested in systems design interviews. Understanding the trade-off, O(1) space iterative versus O(n) stack space recursive, and being able to articulate when each is appropriate, signals to interviewers that you think about production constraints, not just algorithmic correctness.`,
    tags: ["linked-list", "recursion", "neetcode"],
  },
  {
    name: "Linked List Cycle",
    category: "linked-list",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given the head of a linked list, determine whether the list contains a cycle using Floyd's tortoise and hare algorithm. A cycle exists when a node's next pointer points back to a previous node, creating an infinite loop. Return true if a cycle is detected, false otherwise.\n\nExample 1:\n  Input: 1 -> 2 -> 3 -> 4 -> 2 (node 4 points back to node 2)\n  Output: true\n\nExample 2:\n  Input: 1 -> 2 -> 3 -> null\n  Output: false\n\nExample 3:\n  Input: 1 -> 1 (node points to itself)\n  Output: true\n\nRef: LeetCode #141 Linked List Cycle",
    code: `class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function hasCycle(head) {
  // your code here
}`,
    testCode: `function test_no_cycle() {
  const c = new Node(3);
  const b = new Node(2, c);
  const a = new Node(1, b);
  assertEqual(hasCycle(a), false, "no cycle in 3-node list");
}

function test_cycle_at_start() {
  const a = new Node(1);
  const b = new Node(2);
  const c = new Node(3);
  a.next = b;
  b.next = c;
  c.next = a;
  assertEqual(hasCycle(a), true, "cycle: c -> a");
}

function test_self_cycle() {
  const a = new Node(1);
  a.next = a;
  assertEqual(hasCycle(a), true, "self-cycle: a -> a");
}

function test_null_head() {
  assertEqual(hasCycle(null), false, "null head has no cycle");
}

function test_single_no_cycle() {
  const a = new Node(1);
  assertEqual(hasCycle(a), false, "single node without cycle");
}`,
    solution: `class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }

  return false;
}`,
    usage: `Floyd's tortoise and hare algorithm is the standard O(1)-space technique for detecting cycles in linked structures, and it shows up far beyond textbook exercises. Garbage collectors in managed runtimes like CPython's reference-counting collector use cycle detection to identify and reclaim circular reference chains that simple reference counting cannot free. The same pattern applies to deadlock detection in database transaction managers, where wait-for graphs are checked for cycles to decide which transaction to abort. Pseudorandom number generator testing relies on cycle detection to measure period length and assess generator quality, a concern for cryptographic libraries and Monte Carlo simulations alike. In distributed systems, cycle detection helps identify infinite routing loops in network protocols. This is one of the most frequently asked linked-list problems at companies like Google, Meta, and Amazon, precisely because it tests whether a candidate can move beyond the naive O(n) hash-set approach to the elegant constant-space two-pointer solution.`,
    tags: ["linked-list", "fast-slow-pointer", "neetcode"],
  },
  {
    name: "Rotate Image",
    category: "math-and-geometry",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given an n x n 2D matrix representing an image, rotate the image 90 degrees clockwise in-place. Do not allocate another 2D matrix.\n\nExample 1:\n  Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]\n  Output: [[7,4,1],[8,5,2],[9,6,3]]\n\nExample 2:\n  Input: matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]\n  Output: [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]\n\nExample 3:\n  Input: matrix = [[1]]\n  Output: [[1]]\n\nRef: LeetCode #48 Rotate Image",
    code: `// Rotate an n x n matrix 90 degrees clockwise in-place.
// Do not allocate another 2D matrix.

function rotate(matrix) {
  // your code here
}
`,
    testCode: `function test_3x3() {
  const m = [[1,2,3],[4,5,6],[7,8,9]];
  rotate(m);
  assertEqual(m, [[7,4,1],[8,5,2],[9,6,3]], "3x3 rotation");
}

function test_4x4() {
  const m = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]];
  rotate(m);
  assertEqual(m, [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]], "4x4 rotation");
}

function test_1x1() {
  const m = [[1]];
  rotate(m);
  assertEqual(m, [[1]], "1x1 stays the same");
}

function test_2x2() {
  const m = [[1,2],[3,4]];
  rotate(m);
  assertEqual(m, [[3,1],[4,2]], "2x2 rotation");
}
`,
    solution: `function rotate(matrix) {
  const n = matrix.length;

  // Step 1: Transpose (swap rows and columns)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }

  // Step 2: Reverse each row
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }
}`,
    usage: `Rotate Image is the classic math and geometry problem that tests in-place matrix manipulation using the transpose-then-reverse technique. Image processing libraries like OpenCV, Pillow, and browser Canvas APIs implement rotation as a composition of transpose and flip operations on pixel matrices, which is exactly this algorithm. Game engines like Unity and Unreal perform 2D sprite rotation and tile map transformations using matrix operations that decompose into transposition and reflection. Mobile operating systems rotate screen content when the device orientation changes, applying affine transformations that are mathematically equivalent to this 90-degree rotation. Computer vision pipelines in self-driving car systems at Waymo and Tesla apply rotation augmentations to training images to make models orientation-invariant. The transpose-then-reverse approach is optimal at O(n^2) time and O(1) extra space since every element must be moved and no auxiliary matrix is needed. In interviews at companies like Google, Amazon, and Apple, this problem tests whether candidates can decompose a complex transformation into simpler steps and manipulate 2D indices correctly without off-by-one errors.`,
    tags: ["matrix", "in-place", "neetcode"],
  },
  {
    name: "Sliding Window Max Sum",
    category: "sliding-window",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given an array of numbers and a window size k, find the maximum sum of any contiguous subarray of exactly size k. Slide a window across the array, adding the new element and removing the trailing element at each step.\n\nExample 1:\n  Input: nums = [2, 1, 5, 1, 3, 2], k = 3\n  Output: 9  (subarray [5, 1, 3])\n\nExample 2:\n  Input: nums = [2, 3, 4, 1, 5], k = 2\n  Output: 7  (subarray [3, 4])\n\nExample 3:\n  Input: nums = [1, 1, 1, 1, 1], k = 3\n  Output: 3\n\nRef: LeetCode #2461 Maximum Sum of Distinct Subarrays With Length K",
    code: `function maxSum(nums, k) {
  // your code here
}`,
    testCode: `function test_basic() {
  assertEqual(maxSum([1, 4, 2, 10, 2, 3, 1, 0, 20], 4), 24, "max sum window of 4");
}

function test_full_array() {
  assertEqual(maxSum([1, 2, 3], 3), 6, "window equals array length");
}

function test_window_one() {
  assertEqual(maxSum([5, 1, 8, 3], 1), 8, "window of 1 returns max element");
}

function test_negatives() {
  assertEqual(maxSum([-1, -2, -3, -4], 2), -3, "negative numbers");
}

function test_mixed() {
  assertEqual(maxSum([2, -1, 5, -3, 4], 3), 6, "mixed positive and negative");
}`,
    solution: `function maxSum(nums, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += nums[i];
  }
  let best = windowSum;

  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k];
    best = Math.max(best, windowSum);
  }

  return best;
}`,
    usage: `The sliding window technique is fundamental to any system that processes streaming or sequential data under a fixed-size constraint. TCP's flow control literally uses a sliding window to manage how many unacknowledged bytes a sender can transmit, adjusting the window size based on the receiver's buffer availability. Netflix and Spotify use sliding-window analytics over user activity streams to compute rolling engagement metrics, detect binge-watching sessions, and trigger real-time recommendations. In network intrusion detection systems like Snort, sliding windows over packet streams identify burst patterns indicative of DDoS attacks. Financial trading platforms compute moving averages, VWAP, and Bollinger Bands using sliding windows over price tick streams, where the O(1) incremental update per slide is critical for low-latency execution. Rate limiters in API gateways at companies like Cloudflare and Stripe use sliding-window counters to enforce request quotas without scanning the entire request history on each call.`,
    tags: ["sliding-window"],
  },
  {
    name: "Balanced Parentheses",
    category: "stack",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given a string containing the characters ()[]{}  determine whether every opening bracket has a corresponding closing bracket in the correct nesting order. An empty string is considered balanced. Characters other than brackets should not appear in the input.\n\nExample 1:\n  Input: \"({[]})\"\n  Output: true\n\nExample 2:\n  Input: \"([)]\"\n  Output: false\n\nExample 3:\n  Input: \"{[]}\"\n  Output: true\n\nRef: LeetCode #20 Valid Parentheses",
    code: `function isBalanced(s) {
  // your code here
}`,
    testCode: `function test_simple_pairs() {
  assertEqual(isBalanced("()"), true, "simple parens");
  assertEqual(isBalanced("[]"), true, "simple brackets");
  assertEqual(isBalanced("{}"), true, "simple braces");
}

function test_nested() {
  assertEqual(isBalanced("({[]})"), true, "nested brackets");
  assertEqual(isBalanced("{[()]}[{}]"), true, "complex nested");
}

function test_sequential() {
  assertEqual(isBalanced("()[]{}"), true, "sequential pairs");
}

function test_mismatched() {
  assertEqual(isBalanced("(]"), false, "mismatched pair");
  assertEqual(isBalanced("("), false, "unclosed paren");
  assertEqual(isBalanced("())"), false, "extra closing");
}

function test_empty() {
  assertEqual(isBalanced(""), true, "empty string is balanced");
}`,
    solution: `function isBalanced(s) {
  const stack = [];
  const pairs = { ")": "(", "}": "{", "]": "[" };

  for (const ch of s) {
    if ("({[".includes(ch)) {
      stack.push(ch);
    } else if (ch in pairs) {
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[ch]) {
        return false;
      }
      stack.pop();
    }
  }

  return stack.length === 0;
}`,
    usage: `The balanced-parentheses stack pattern is the simplest instance of recursive-descent scope tracking, and it is the core logic inside every parser, compiler, and syntax validator you depend on. Every compiler's lexer and parser, from GCC to the V8 JavaScript engine, uses stack-based matching to validate that braces, brackets, and parentheses are properly nested before attempting to build an AST. JSON validators like JSONLint and XML parsers check that opening and closing delimiters are balanced before accepting a payload, rejecting malformed data that could crash downstream processors. IDEs like VS Code, IntelliJ, and Vim highlight matching brackets in real time using the same stack-based algorithm, and linters flag unbalanced delimiters as errors before code is even compiled. The pattern extends to HTML tag validation, template engine parsing in frameworks like Jinja2 and Handlebars, and math-expression evaluation in calculators. This is among the top-five most frequently asked interview questions across all companies because it cleanly tests stack fluency, edge-case handling for empty inputs and mismatched types, and the ability to generalize from parentheses to arbitrary delimiter pairs.`,
    tags: ["stack", "string", "neetcode"],
  },
  {
    name: "Queue from Stacks",
    category: "stack",
    language: "javascript",
    difficulty: "medium",
    description:
      "Implement a FIFO queue using two stacks (arrays with push/pop only). Use a lazy transfer strategy: push new elements onto the input stack, and only move elements to the output stack when the output stack is empty and a dequeue or peek is requested. Support enqueue, dequeue, peek, and isEmpty.\n\nExample 1:\n  Operations: enqueue(1), enqueue(2), dequeue()\n  Result: dequeue() returns 1\n\nExample 2:\n  Operations: enqueue(\"a\"), enqueue(\"b\"), enqueue(\"c\"), dequeue(), peek()\n  Result: dequeue() returns \"a\", peek() returns \"b\"\n\nExample 3:\n  Operations: isEmpty(), enqueue(5), isEmpty(), dequeue(), isEmpty()\n  Result: true, false, 5 from dequeue, true\n\nRef: LeetCode #232 Implement Queue using Stacks",
    code: `class Queue {
  constructor() {
    this.inStack = [];
    this.outStack = [];
  }

  enqueue(val) {
    // your code here
  }

  dequeue() {
    // your code here
  }

  peek() {
    // your code here
  }

  isEmpty() {
    // your code here
  }
}`,
    testCode: `function test_basic_fifo() {
  const q = new Queue();
  q.enqueue(1);
  q.enqueue(2);
  assertEqual(q.dequeue(), 1, "first dequeue returns 1");
  assertEqual(q.dequeue(), 2, "second dequeue returns 2");
}

function test_fifo_order() {
  const q = new Queue();
  q.enqueue(10);
  q.enqueue(20);
  q.enqueue(30);
  assertEqual(q.dequeue(), 10, "FIFO order 10");
  assertEqual(q.dequeue(), 20, "FIFO order 20");
  assertEqual(q.dequeue(), 30, "FIFO order 30");
}

function test_peek() {
  const q = new Queue();
  q.enqueue(5);
  q.enqueue(10);
  assertEqual(q.peek(), 5, "peek returns front");
  assertEqual(q.dequeue(), 5, "dequeue still returns front after peek");
}

function test_isEmpty() {
  const q = new Queue();
  assertEqual(q.isEmpty(), true, "new queue is empty");
  q.enqueue(1);
  assertEqual(q.isEmpty(), false, "not empty after enqueue");
  q.dequeue();
  assertEqual(q.isEmpty(), true, "empty after dequeue");
}

function test_interleaved() {
  const q = new Queue();
  q.enqueue(1);
  q.enqueue(2);
  assertEqual(q.dequeue(), 1, "interleaved dequeue 1");
  q.enqueue(3);
  assertEqual(q.dequeue(), 2, "interleaved dequeue 2");
  assertEqual(q.dequeue(), 3, "interleaved dequeue 3");
}`,
    solution: `class Queue {
  constructor() {
    this.inStack = [];
    this.outStack = [];
  }

  enqueue(val) {
    this.inStack.push(val);
  }

  _transfer() {
    if (this.outStack.length === 0) {
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop());
      }
    }
  }

  dequeue() {
    this._transfer();
    return this.outStack.pop();
  }

  peek() {
    this._transfer();
    return this.outStack[this.outStack.length - 1];
  }

  isEmpty() {
    return this.inStack.length === 0 && this.outStack.length === 0;
  }
}`,
    usage: `Implementing a queue from two stacks is a foundational exercise in amortized analysis and data-structure composition that has direct parallels in production systems. The core insight, that lazily transferring elements between an input stack and an output stack yields amortized O(1) enqueue and dequeue, is the same principle behind batched I/O in write-ahead logs and lazy evaluation in functional data structures used in languages like Haskell and Clojure. Okasaki's purely functional queue, used in Erlang's and Scala's standard libraries, is essentially this two-stack construction with persistence guarantees. In message-passing architectures, producer-consumer patterns often buffer incoming messages in one structure and drain from another, mirroring the two-stack flip. The problem is a favorite at companies like Amazon, Microsoft, and Bloomberg because it tests whether a candidate truly understands amortized complexity rather than just memorizing worst-case bounds, and it reveals whether they can reason about state transitions between two cooperating data structures.`,
    tags: ["stack","queue"],
  },
  {
    name: "Monotonic Stack",
    category: "stack",
    language: "javascript",
    difficulty: "medium",
    description:
      "For each element in an array, find the next element that is strictly greater. Return an array where result[i] is the next greater element for nums[i], or -1 if no greater element exists to the right. Use a stack of indices to solve in O(n).\n\nExample 1:\n  Input: nums = [2, 1, 2, 4, 3]\n  Output: [4, 2, 4, -1, -1]\n\nExample 2:\n  Input: nums = [1, 3, 2, 4]\n  Output: [3, 4, 4, -1]\n\nExample 3:\n  Input: nums = [5, 4, 3, 2, 1]\n  Output: [-1, -1, -1, -1, -1]\n\nRef: LeetCode #496 Next Greater Element I",
    code: `function nextGreaterElement(nums) {
  // your code here
}`,
    testCode: `function test_mixed_array() {
  assertEqual(
    nextGreaterElement([2, 1, 2, 4, 3]),
    [4, 2, 4, -1, -1],
    "next greater for [2,1,2,4,3]"
  );
}

function test_descending() {
  assertEqual(
    nextGreaterElement([5, 4, 3, 2, 1]),
    [-1, -1, -1, -1, -1],
    "descending array has no next greater elements"
  );
}

function test_ascending() {
  assertEqual(
    nextGreaterElement([1, 2, 3, 4, 5]),
    [2, 3, 4, 5, -1],
    "ascending array: each next element is greater"
  );
}

function test_single_element() {
  assertEqual(nextGreaterElement([1]), [-1], "single element");
}

function test_duplicates() {
  assertEqual(
    nextGreaterElement([1, 1, 1, 2]),
    [2, 2, 2, -1],
    "duplicates followed by a greater element"
  );
}`,
    solution: `function nextGreaterElement(nums) {
  const result = new Array(nums.length).fill(-1);
  const stack = [];

  for (let i = 0; i < nums.length; i++) {
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      result[stack.pop()] = nums[i];
    }
    stack.push(i);
  }

  return result;
}`,
    usage: `A monotonic stack maintains elements in strictly increasing or decreasing order and solves a family of problems centered on finding the next greater or next smaller element in O(n) time, down from the naive O(n^2). The stock span problem, used in financial trading platforms like Bloomberg Terminal, calculates how many consecutive previous days had a price less than or equal to today's price; a monotonic stack solves this in a single pass. Weather applications use the same pattern for the Daily Temperatures problem: how many days until a warmer day. The Largest Rectangle in Histogram problem, solvable via monotonic stack, has direct applications in image analysis (computing maximal rectangular regions in binary images) and memory allocators (finding the largest contiguous free block). The trapping rain water problem, another monotonic stack classic, models real drainage calculations. In interviews at companies like Amazon, Google, and Bloomberg, monotonic stack problems are considered medium-to-hard difficulty and test whether candidates can recognize when a stack-based invariant eliminates redundant comparisons.`,
    tags: ["stack","monotonic"],
  },
  {
    name: "Binary Tree BFS",
    category: "trees",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given the root of a binary tree (where each Node has val, left, and right properties), return an array of all node values in level-order (breadth-first) traversal. Visit nodes level by level, left to right.\n\nExample 1:\n  Input: tree =\n        3\n       / \\\n      9   20\n         / \\\n        15   7\n  Output: [3, 9, 20, 15, 7]\n\nExample 2:\n  Input: tree =\n      1\n       \\\n        2\n  Output: [1, 2]\n\nExample 3:\n  Input: tree = (empty, root is null)\n  Output: []\n\nRef: LeetCode #102 Binary Tree Level Order Traversal",
    code: `class Node {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function bfs(root) {
  // your code here
}`,
    testCode: `function test_single_node() {
  const root = new Node(1);
  assertEqual(bfs(root), [1], "single node should return [1]");
}

function test_complete_tree() {
  const a = new Node(1);
  const b = new Node(2);
  const c = new Node(3);
  const d = new Node(4);
  const e = new Node(5);
  a.left = b;
  a.right = c;
  b.left = d;
  b.right = e;
  assertEqual(bfs(a), [1, 2, 3, 4, 5], "complete tree level-order");
}

function test_left_skewed() {
  const a = new Node(1);
  const b = new Node(2);
  const c = new Node(3);
  a.left = b;
  b.left = c;
  assertEqual(bfs(a), [1, 2, 3], "left-skewed tree");
}

function test_empty_tree() {
  assertEqual(bfs(null), [], "null root should return []");
}`,
    solution: `class Node {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function bfs(root) {
  if (root === null) return [];

  const queue = [root];
  const result = [];

  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node.val);

    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }

  return result;
}`,
    usage: `Level-order traversal using BFS is how real systems process hierarchical data when depth matters. The DOM in web browsers is traversed level-by-level when computing CSS inheritance and layout reflow; React's reconciliation algorithm (the fiber tree diffing) walks the component tree in a BFS-like manner to batch updates by depth. Database query planners in systems like PostgreSQL and MySQL traverse B-tree indexes level by level to locate records, which is why B-tree lookups are O(log n) with each level representing a disk page access. Social network platforms like LinkedIn use BFS to compute degrees of connection; when LinkedIn shows you are a 2nd-degree connection to someone, that is a BFS bounded at depth 2 over their social graph. File system utilities like the Unix \`find\` command with \`-maxdepth\` use BFS to scan directory trees without descending too deep. In interviews, BFS is tested heavily at Meta, Google, and Amazon, often in variants like zigzag level-order, right-side view, or level averages, all of which require the same queue-based template with minor modifications.`,
    tags: ["bfs", "tree", "neetcode"],
  },
  {
    name: "DFS Preorder Traversal",
    category: "trees",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given the root of a binary tree, return an array of node values in preorder traversal order: visit the root first, then recursively traverse the left subtree, then the right subtree.\n\nExample 1:\n  Input: tree =\n        1\n       / \\\n      2   3\n     / \\\n    4   5\n  Output: [1, 2, 4, 5, 3]\n\nExample 2:\n  Input: tree =\n      1\n       \\\n        2\n         \\\n          3\n  Output: [1, 2, 3]\n\nExample 3:\n  Input: tree = (empty, root is null)\n  Output: []\n\nRef: LeetCode #144 Binary Tree Preorder Traversal",
    code: `class Node {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function preorder(root) {
  // your code here
}`,
    testCode: `function test_complete_tree() {
  const a = new Node(1);
  const b = new Node(2);
  const c = new Node(3);
  const d = new Node(4);
  const e = new Node(5);
  a.left = b;
  a.right = c;
  b.left = d;
  b.right = e;
  assertEqual(preorder(a), [1, 2, 4, 5, 3], "preorder traversal");
}

function test_empty() {
  assertEqual(preorder(null), [], "empty tree");
}

function test_single() {
  assertEqual(preorder(new Node(42)), [42], "single node");
}

function test_left_skewed() {
  const a = new Node(1);
  const b = new Node(2);
  const c = new Node(3);
  a.left = b;
  b.left = c;
  assertEqual(preorder(a), [1, 2, 3], "left-skewed tree");
}`,
    solution: `class Node {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function preorder(root) {
  if (root === null) return [];
  return [root.val, ...preorder(root.left), ...preorder(root.right)];
}`,
    usage: `Preorder traversal, where you process the root before its children, is the natural traversal for serializing and copying tree structures. When you serialize a binary tree to a string or file for network transmission or storage, preorder traversal preserves the structure so the tree can be reconstructed without ambiguity; this is how Protocol Buffers and other serialization frameworks handle nested message types internally. Compilers use preorder traversal to generate prefix notation (Polish notation) from abstract syntax trees, which is the intermediate representation used in some stack-based virtual machines and calculator interpreters. File system backup tools traverse directory trees in preorder, processing the directory entry itself before descending into its contents, which is necessary to create the directory on the destination before copying files into it. React's component rendering follows a preorder pattern: a parent component renders before its children, establishing context and props that flow downward. In interviews, preorder is tested through tree serialization/deserialization problems and construct-tree-from-traversal problems, frequently asked at Google and Amazon.`,
    tags: ["dfs","tree","recursion"],
  },
  {
    name: "DFS Inorder Traversal",
    category: "trees",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given the root of a binary tree, return an array of node values in inorder traversal order: recursively traverse the left subtree, visit the root, then recursively traverse the right subtree. For a binary search tree, this produces values in sorted ascending order.\n\nExample 1:\n  Input: tree =\n        4\n       / \\\n      2   6\n     / \\ / \\\n    1  3 5  7\n  Output: [1, 2, 3, 4, 5, 6, 7]\n\nExample 2:\n  Input: tree =\n        1\n       / \\\n      2   3\n     / \\\n    4   5\n  Output: [4, 2, 5, 1, 3]\n\nExample 3:\n  Input: tree = (empty, root is null)\n  Output: []\n\nRef: LeetCode #94 Binary Tree Inorder Traversal",
    code: `class Node {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function inorder(root) {
  // your code here
}`,
    testCode: `function test_complete_tree() {
  const a = new Node(1);
  const b = new Node(2);
  const c = new Node(3);
  const d = new Node(4);
  const e = new Node(5);
  a.left = b;
  a.right = c;
  b.left = d;
  b.right = e;
  assertEqual(inorder(a), [4, 2, 5, 1, 3], "inorder traversal");
}

function test_empty() {
  assertEqual(inorder(null), [], "empty tree");
}

function test_single() {
  assertEqual(inorder(new Node(42)), [42], "single node");
}

function test_right_skewed() {
  const a = new Node(1);
  const b = new Node(2);
  const c = new Node(3);
  a.right = b;
  b.right = c;
  assertEqual(inorder(a), [1, 2, 3], "right-skewed tree");
}`,
    solution: `class Node {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function inorder(root) {
  if (root === null) return [];
  return [...inorder(root.left), root.val, ...inorder(root.right)];
}`,
    usage: `Inorder traversal is the canonical way to retrieve sorted data from a binary search tree, which makes it foundational to database internals and search engine indexing. When a database engine needs to return results in sorted order from a BST-based index, it performs an inorder traversal, visiting left subtree, node, then right subtree, yielding keys in ascending sequence without any additional sorting step. The kth-smallest-element problem, commonly asked at companies like Facebook and Microsoft, is solved by running an inorder traversal and stopping at the kth node, which runs in O(h + k) time on a balanced BST. BST validation, another frequent interview problem, uses inorder traversal to verify that values appear in strictly increasing order; any violation means the tree is not a valid BST. Expression tree evaluation in compilers uses inorder traversal to produce infix notation (the human-readable form like \`a + b * c\`), which is how debuggers and code formatters reconstruct source expressions from AST nodes. Understanding inorder traversal is also a prerequisite for working with self-balancing trees like AVL trees and Red-Black trees, which are used in the C++ STL (\`std::map\`, \`std::set\`) and Java's \`TreeMap\`.`,
    tags: ["dfs","tree","recursion"],
  },
  {
    name: "DFS Postorder Traversal",
    category: "trees",
    language: "javascript",
    difficulty: "medium",
    description:
      "Given the root of a binary tree, return an array of node values in postorder traversal order: recursively traverse the left subtree, then the right subtree, then visit the root. Leaf nodes appear before their parents.\n\nExample 1:\n  Input: tree =\n        1\n       / \\\n      2   3\n     / \\\n    4   5\n  Output: [4, 5, 2, 3, 1]\n\nExample 2:\n  Input: tree =\n      1\n       \\\n        2\n         \\\n          3\n  Output: [3, 2, 1]\n\nExample 3:\n  Input: tree = (empty, root is null)\n  Output: []\n\nRef: LeetCode #145 Binary Tree Postorder Traversal",
    code: `class Node {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function postorder(root) {
  // your code here
}`,
    testCode: `function test_complete_tree() {
  const a = new Node(1);
  const b = new Node(2);
  const c = new Node(3);
  const d = new Node(4);
  const e = new Node(5);
  a.left = b;
  a.right = c;
  b.left = d;
  b.right = e;
  assertEqual(postorder(a), [4, 5, 2, 3, 1], "postorder traversal");
}

function test_empty() {
  assertEqual(postorder(null), [], "empty tree");
}

function test_single() {
  assertEqual(postorder(new Node(42)), [42], "single node");
}

function test_left_skewed() {
  const a = new Node(1);
  const b = new Node(2);
  const c = new Node(3);
  a.left = b;
  b.left = c;
  assertEqual(postorder(a), [3, 2, 1], "left-skewed tree");
}`,
    solution: `class Node {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function postorder(root) {
  if (root === null) return [];
  return [...postorder(root.left), ...postorder(root.right), root.val];
}`,
    usage: `Postorder traversal processes children before the parent, making it the correct traversal for any operation where you need to aggregate or clean up from the bottom of a tree upward. Compilers use postorder traversal to generate postfix notation (Reverse Polish Notation) from expression trees, which maps directly to stack-based machine instructions; when GCC or LLVM emits assembly for an arithmetic expression, the code generation phase walks the AST in postorder so operands are pushed onto the stack before the operator is applied. Memory deallocation in languages without garbage collection (C, C++, Rust's drop semantics) must follow postorder: you free child nodes before the parent to avoid dangling pointers and memory leaks, which is why destructors in tree structures are called in postorder. Build systems like Make and Bazel effectively perform postorder evaluation of dependency trees, compiling leaf dependencies before the targets that depend on them. The \`rm -rf\` command deletes directory contents (children) before the directory itself (parent), which is postorder deletion. In interviews, postorder appears in problems like maximum-path-sum, tree diameter, and lowest-common-ancestor, where you need information from both subtrees before making a decision at the current node.`,
    tags: ["dfs","tree","recursion"],
  },
  {
    name: "Implement Trie (Prefix Tree)",
    category: "tries",
    language: "javascript",
    difficulty: "medium",
    description:
      "Implement a Trie (prefix tree) that supports three operations: insert(word) adds a word to the trie, search(word) returns true only if the exact word exists, and startsWith(prefix) returns true if any inserted word begins with the given prefix. Each node stores children and a flag marking end-of-word.\n\nExample 1:\n  Operations: insert(\"apple\"), search(\"apple\"), search(\"app\")\n  Result: search(\"apple\") returns true, search(\"app\") returns false\n\nExample 2:\n  Operations: insert(\"apple\"), startsWith(\"app\"), startsWith(\"ban\")\n  Result: startsWith(\"app\") returns true, startsWith(\"ban\") returns false\n\nExample 3:\n  Operations: insert(\"car\"), insert(\"card\"), search(\"car\"), search(\"card\")\n  Result: both return true\n\nRef: LeetCode #208 Implement Trie (Prefix Tree)",
    code: `class Trie {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }

  insert(word) {
    // your code here
  }

  search(word) {
    // your code here
  }

  startsWith(prefix) {
    // your code here
  }

  _find(prefix) {
    // your code here
  }
}`,
    testCode: `function test_insert_and_search() {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.search("apple"), true, "search finds inserted word");
}

function test_search_prefix_not_word() {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.search("app"), false, "prefix alone is not a word");
}

function test_starts_with() {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.startsWith("app"), true, "startsWith finds prefix");
  assertEqual(t.startsWith("ban"), false, "startsWith rejects missing prefix");
}

function test_insert_prefix_as_word() {
  const t = new Trie();
  t.insert("apple");
  t.insert("app");
  assertEqual(t.search("app"), true, "app found after explicit insert");
  assertEqual(t.search("apple"), true, "apple still found");
}

function test_empty_trie() {
  const t = new Trie();
  assertEqual(t.search("anything"), false, "empty trie search returns false");
}`,
    solution: `class Trie {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }

  insert(word) {
    let node = this;
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = new Trie();
      }
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  search(word) {
    const node = this._find(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix) {
    return this._find(prefix) !== null;
  }

  _find(prefix) {
    let node = this;
    for (const ch of prefix) {
      if (!node.children[ch]) return null;
      node = node.children[ch];
    }
    return node;
  }
}`,
    usage: `The trie, or prefix tree, is the data structure behind autocomplete, spell-checking, and IP routing, making it one of the most commercially impactful structures in computing. Google Search processes billions of autocomplete queries daily using trie-variant structures augmented with frequency scores and personalization layers to rank prefix-matched suggestions in milliseconds. IDE code-completion engines in VS Code, IntelliJ, and Xcode maintain tries over symbol tables to offer instant suggestions as developers type. Spell-checkers in browsers, word processors, and mobile keyboards use tries to look up dictionary words and suggest corrections by exploring nearby branches for edit-distance matches. In networking, longest-prefix-match lookups in IP routing tables, the operation every router performs on every packet, are implemented with compressed tries (Patricia tries or radix trees). T9 predictive text on old phone keypads was a trie lookup. This problem is asked frequently at Google, Amazon, and Microsoft because it tests tree construction, recursive traversal, and the candidate's ability to design for prefix-based retrieval rather than exact-match hashing.`,
    tags: ["trie", "neetcode"],
  },
  {
    name: "Two Pointer Remove Dupes",
    category: "two-pointers",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given a sorted array of integers, remove duplicates in-place so that each unique element appears only once. Return the count k of unique elements. The first k elements of the modified array must contain the unique values in their original order.\n\nExample 1:\n  Input: [1, 1, 2]\n  Output: 2  (array becomes [1, 2, ...])\n\nExample 2:\n  Input: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]\n  Output: 5  (array becomes [0, 1, 2, 3, 4, ...])\n\nExample 3:\n  Input: [1, 2, 3]\n  Output: 3  (array unchanged)\n\nRef: LeetCode #26 Remove Duplicates from Sorted Array",
    code: `function removeDuplicates(nums) {
  // your code here
}`,
    testCode: `function test_mixed_dupes() {
  const nums = [1, 1, 2, 3, 3];
  const k = removeDuplicates(nums);
  assertEqual(k, 3, "should return length 3");
  assertEqual(nums.slice(0, k), [1, 2, 3], "first k elements should be [1,2,3]");
}

function test_no_dupes() {
  const nums = [1, 2, 3];
  const k = removeDuplicates(nums);
  assertEqual(k, 3, "no dupes returns same length");
  assertEqual(nums.slice(0, k), [1, 2, 3], "array unchanged");
}

function test_all_same() {
  const nums = [5, 5, 5, 5];
  const k = removeDuplicates(nums);
  assertEqual(k, 1, "all same returns 1");
  assertEqual(nums[0], 5, "first element is 5");
}

function test_empty() {
  const nums = [];
  assertEqual(removeDuplicates(nums), 0, "empty array returns 0");
}

function test_single() {
  const nums = [7];
  assertEqual(removeDuplicates(nums), 1, "single element returns 1");
}`,
    solution: `function removeDuplicates(nums) {
  if (nums.length === 0) return 0;

  let write = 0;

  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write]) {
      write++;
      nums[write] = nums[read];
    }
  }

  return write + 1;
}`,
    usage: `The two-pointer deduplication pattern is the backbone of in-place data compaction on sorted sequences, and it runs silently inside systems you use every day. Search engines building inverted indexes must deduplicate sorted posting lists of document IDs; doing this in-place with two pointers avoids costly memory allocation during index construction. Database engines performing merge joins on sorted key columns use the same logic to skip duplicate keys and produce distinct result sets efficiently. Financial transaction processing systems rely on deduplication of sorted ledger entries to prevent double-counting in balance calculations and regulatory reports. The pattern is also essential in time-series databases like InfluxDB and TimescaleDB, where ordered timestamps with duplicate entries must be collapsed before aggregation. Interviewers at companies like Bloomberg and Goldman Sachs favor this problem because it tests in-place array manipulation, pointer reasoning, and the discipline to handle edge cases like all-duplicate or single-element inputs cleanly.`,
    tags: ["two-pointers","in-place"],
  },
  {
    name: "Merge Sorted Arrays",
    category: "two-pointers",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given two sorted arrays of numbers, merge them into a single sorted array using the two-pointer technique. Compare elements at both pointers, take the smaller one, and advance that pointer. Append any remaining elements from the non-exhausted array.\n\nExample 1:\n  Input: [1, 3, 5], [2, 4, 6]\n  Output: [1, 2, 3, 4, 5, 6]\n\nExample 2:\n  Input: [1, 2, 3], [4, 5]\n  Output: [1, 2, 3, 4, 5]\n\nExample 3:\n  Input: [], [1, 2, 3]\n  Output: [1, 2, 3]\n\nRef: LeetCode #88 Merge Sorted Array",
    code: `function mergeSorted(a, b) {
  // your code here
}`,
    testCode: `function test_equal_length() {
  assertEqual(mergeSorted([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6], "equal length arrays");
}

function test_different_lengths() {
  assertEqual(mergeSorted([1, 2], [3, 4, 5, 6]), [1, 2, 3, 4, 5, 6], "different length arrays");
}

function test_one_empty() {
  assertEqual(mergeSorted([], [1, 2, 3]), [1, 2, 3], "one empty array");
}

function test_both_empty() {
  assertEqual(mergeSorted([], []), [], "both empty");
}

function test_duplicates() {
  assertEqual(mergeSorted([1, 3, 3], [2, 3, 4]), [1, 2, 3, 3, 3, 4], "with duplicates");
}

function test_negatives() {
  assertEqual(mergeSorted([-5, -1, 3], [-3, 0, 2]), [-5, -3, -1, 0, 2, 3], "with negatives");
}`,
    solution: `function mergeSorted(a, b) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      result.push(a[i]);
      i++;
    } else {
      result.push(b[j]);
      j++;
    }
  }

  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);

  return result;
}`,
    usage: `Merging sorted arrays is the fundamental operation behind external sorting, LSM-tree compaction, and distributed query processing. Databases like LevelDB, RocksDB, and Cassandra write sorted SSTables to disk and then run background k-way merge compaction to consolidate them, directly applying the merge-sorted-arrays primitive with a min-heap to maintain O(n log k) efficiency. When PostgreSQL or MySQL execute merge-join query plans, they merge two sorted streams from index scans using the same two-pointer merge logic. Git's merge machinery for combining sorted diff hunks across branches also relies on sorted-sequence merging. In distributed search engines like Elasticsearch, each shard returns sorted results that the coordinating node must merge into a single globally-sorted response. The two-array merge variant is a staple interview question at companies like Google, Apple, and Microsoft because it tests pointer management, boundary handling, and the candidate's ability to reason about sorted invariants under pressure.`,
    tags: ["two-pointers","sorting"],
  },

  {
    name: "Permutation in String",
    category: "sliding-window",
    language: "javascript",
    difficulty: "medium",
    description: `Given two strings s1 and s2, return true if s2 contains a permutation of s1. In other words, return true if one of s1's permutations is a substring of s2.

A permutation is a rearrangement of all characters. So you need to find a window in s2 of exactly length s1.length that has the same character frequencies as s1.

Example 1:
  Input: s1 = "ab", s2 = "eidbaooo"
  Output: true
  Explanation: s2 contains one permutation of s1 ("ba").

Example 2:
  Input: s1 = "ab", s2 = "eidboaoo"
  Output: false

Constraints:
  - 1 <= s1.length, s2.length <= 10^4
  - s1 and s2 consist of lowercase English letters only

Ref: LeetCode #567 Permutation in String`,
    code: `function checkInclusion(s1, s2) {
  // TODO: sliding window of fixed size s1.length
  // track char frequency matches
}`,
    testCode: `function test_basic_true() {
  assertEqual(checkInclusion("ab", "eidbaooo"), true, "basic true - ba found");
}

function test_basic_false() {
  assertEqual(checkInclusion("ab", "eidboaoo"), false, "basic false");
}

function test_exact_match() {
  assertEqual(checkInclusion("abc", "bca"), true, "s2 is exactly a permutation of s1");
}

function test_s1_longer_than_s2() {
  assertEqual(checkInclusion("hello", "oo"), false, "s1 longer than s2");
}

function test_single_char() {
  assertEqual(checkInclusion("a", "ab"), true, "single char match");
}

function test_repeated_chars() {
  assertEqual(checkInclusion("aab", "eidbaabooo"), true, "repeated chars permutation found");
}`,
    solution: `function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;

  const count = new Array(26).fill(0);
  const a = 'a'.charCodeAt(0);

  for (let i = 0; i < s1.length; i++) {
    count[s1.charCodeAt(i) - a]++;
    count[s2.charCodeAt(i) - a]--;
  }

  if (count.every(c => c === 0)) return true;

  for (let i = s1.length; i < s2.length; i++) {
    count[s2.charCodeAt(i) - a]--;
    count[s2.charCodeAt(i - s1.length) - a]++;
    if (count.every(c => c === 0)) return true;
  }

  return false;
}`,
    usage: `Permutation-in-string is the core primitive behind substring anagram search, which shows up in full-text search engines when matching morphological variants and in bioinformatics for finding sequence motifs regardless of base ordering within a window. Security tools use fixed-size sliding window frequency matching to detect scrambled signatures in network payloads. The fixed-window variant of sliding window is also the building block for DNA pattern matching tools like BLAST when searching for short-read k-mers against a reference genome.`,
    tags: ["sliding-window", "hash-map", "strings", "neetcode"],
  },
  {
    name: "Search a 2D Matrix",
    category: "binary-search",
    language: "javascript",
    difficulty: "medium",
    description: `You are given an m x n integer matrix where:
  - Each row is sorted in non-decreasing order.
  - The first integer of each row is greater than the last integer of the previous row.

Given an integer target, return true if target is in matrix or false otherwise. You must write a solution in O(log(m * n)) time.

Example 1:
  Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
  Output: true

Example 2:
  Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13
  Output: false

Constraints:
  - m == matrix.length, n == matrix[0].length
  - 1 <= m, n <= 100
  - -10^4 <= matrix[i][j], target <= 10^4

Ref: LeetCode #74 Search a 2D Matrix`,
    code: `function searchMatrix(matrix, target) {
  // TODO: treat as 1D sorted array, binary search
  // mid index -> row = Math.floor(mid / cols), col = mid % cols
}`,
    testCode: `function test_found() {
  assertEqual(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3), true, "target found");
}

function test_not_found() {
  assertEqual(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13), false, "target not found");
}

function test_single_element_found() {
  assertEqual(searchMatrix([[5]], 5), true, "single element found");
}

function test_single_element_not_found() {
  assertEqual(searchMatrix([[5]], 3), false, "single element not found");
}

function test_target_at_end() {
  assertEqual(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 60), true, "target at last cell");
}

function test_target_at_start() {
  assertEqual(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 1), true, "target at first cell");
}`,
    solution: `function searchMatrix(matrix, target) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let lo = 0;
  let hi = rows * cols - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const val = matrix[Math.floor(mid / cols)][mid % cols];
    if (val === target) return true;
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return false;
}`,
    usage: `Treating a row-sorted, globally-sorted 2D matrix as a virtual 1D array is a common pattern in database storage engines where pages of sorted records are laid out in row-major order on disk — a binary search over the page directory gives O(log n) lookup without loading every page. Embedded systems with flat memory arrays representing sensor grids use the same index math (row*cols + col) to do range searches without materializing a pointer-based structure. The technique also appears in columnar databases like Parquet where row groups are sorted, and a binary search over row-group min/max metadata allows skipping entire chunks.`,
    tags: ["binary-search", "matrix", "neetcode"],
  },
  {
    name: "Time Based Key-Value Store",
    category: "binary-search",
    language: "javascript",
    difficulty: "medium",
    description: `Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key's value at a certain timestamp.

Implement the TimeMap class:
  - TimeMap() Initializes the object.
  - set(key, value, timestamp) Stores the value with key at the given timestamp.
  - get(key, timestamp) Returns a value such that set was called previously with timestamp_prev <= timestamp. If there are multiple such values, return the one with the largest timestamp_prev. If no such value exists, return "".

All timestamps passed to set are strictly increasing.

Example:
  Input: ["TimeMap","set","get","get","set","get","get"]
         [[],["foo","bar",1],["foo",1],["foo",3],["foo","bar2",4],["foo",4],["foo",5]]
  Output: [null,null,"bar","bar",null,"bar2","bar2"]

Constraints:
  - 1 <= key.length, value.length <= 100
  - 1 <= timestamp <= 10^7
  - At most 2 * 10^5 calls to set and get

Ref: LeetCode #981 Time Based Key-Value Store`,
    code: `class TimeMap {
  constructor() {
    // TODO: map of key -> [{timestamp, value}] sorted by timestamp
  }

  set(key, value, timestamp) {
    // TODO
  }

  get(key, timestamp) {
    // TODO: binary search for largest ts <= timestamp
    // return "" if none found
  }
}`,
    testCode: `function test_basic() {
  const tm = new TimeMap();
  tm.set("foo", "bar", 1);
  assertEqual(tm.get("foo", 1), "bar", "exact timestamp");
  assertEqual(tm.get("foo", 3), "bar", "timestamp after set");
}

function test_two_values() {
  const tm = new TimeMap();
  tm.set("foo", "bar", 1);
  tm.set("foo", "bar2", 4);
  assertEqual(tm.get("foo", 4), "bar2", "exact second timestamp");
  assertEqual(tm.get("foo", 5), "bar2", "after second timestamp");
}

function test_before_any_set() {
  const tm = new TimeMap();
  tm.set("foo", "bar", 2);
  assertEqual(tm.get("foo", 1), "", "timestamp before any entry");
}

function test_missing_key() {
  const tm = new TimeMap();
  assertEqual(tm.get("missing", 1), "", "key never set");
}

function test_multiple_keys() {
  const tm = new TimeMap();
  tm.set("a", "val1", 1);
  tm.set("b", "val2", 1);
  assertEqual(tm.get("a", 1), "val1", "key a");
  assertEqual(tm.get("b", 1), "val2", "key b");
}`,
    solution: `class TimeMap {
  constructor() {
    this.store = new Map();
  }

  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }

  get(key, timestamp) {
    const entries = this.store.get(key);
    if (!entries || entries.length === 0) return "";

    let lo = 0;
    let hi = entries.length - 1;
    let result = "";

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (entries[mid][0] <= timestamp) {
        result = entries[mid][1];
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return result;
  }
}`,
    usage: `Time-based key-value stores are the foundation of multi-version concurrency control (MVCC) in databases like PostgreSQL and CockroachDB, where each write creates a new version stamped with the transaction timestamp and reads binary-search for the latest version visible at a given snapshot timestamp. This same pattern appears in distributed systems like Apache Cassandra where cells carry a timestamp and reads always return the highest-timestamped value. Event-sourcing architectures use timestamp-indexed stores to reconstruct aggregate state at any point in time by seeking to the largest event timestamp not exceeding the query time.`,
    tags: ["binary-search", "design", "hash-map", "neetcode"],
  },
  {
    name: "Remove Nth Node From End of List",
    category: "linked-list",
    language: "javascript",
    difficulty: "medium",
    description: `Given the head of a linked list, remove the nth node from the end of the list and return its head.

Example 1:
  Input: head = [1,2,3,4,5], n = 2
  Output: [1,2,3,5]
  Explanation: The 2nd node from the end is 4.

Example 2:
  Input: head = [1], n = 1
  Output: []

Example 3:
  Input: head = [1,2], n = 1
  Output: [1]

Constraints:
  - The number of nodes in the list is sz.
  - 1 <= sz <= 30
  - 0 <= Node.val <= 100
  - 1 <= n <= sz

Note: The kata represents linked lists as plain JS arrays for simplicity.

Ref: LeetCode #19 Remove Nth Node From End of List`,
    code: `function removeNthFromEnd(vals, n) {
  // vals is an array representing the linked list
  // return array with nth-from-end element removed
  // TODO: two-pointer approach with n-step gap
}`,
    testCode: `function test_remove_second_from_end() {
  assertEqual(removeNthFromEnd([1,2,3,4,5], 2), [1,2,3,5], "remove 2nd from end");
}

function test_remove_last() {
  assertEqual(removeNthFromEnd([1,2,3], 1), [1,2], "remove last element");
}

function test_remove_first() {
  assertEqual(removeNthFromEnd([1,2,3], 3), [2,3], "remove first element");
}

function test_single_element() {
  assertEqual(removeNthFromEnd([1], 1), [], "single element list");
}

function test_two_elements_remove_last() {
  assertEqual(removeNthFromEnd([1,2], 1), [1], "two elements remove last");
}

function test_two_elements_remove_first() {
  assertEqual(removeNthFromEnd([1,2], 2), [2], "two elements remove first");
}`,
    solution: `function removeNthFromEnd(vals, n) {
  const dummy = [0, ...vals];
  let fast = n + 1;
  let slow = 0;

  while (fast < dummy.length) {
    fast++;
    slow++;
  }

  dummy.splice(slow + 1, 1);
  return dummy.slice(1);
}`,
    usage: `The two-pointer gap technique for nth-from-end removal is the canonical pattern for single-pass linked list manipulation without knowing the total length upfront, which matters in streaming contexts where you can't buffer the entire sequence. Network packet processing pipelines use sliding-window pointer pairs to trim trailing elements from packet queues under memory constraints. The pattern generalizes to any scenario where you need a relative-from-end position in a single pass: sliding log buffers that discard the oldest entry after N new ones arrive, or audio/video codec ring buffers that evict frames N positions behind the write head.`,
    tags: ["linked-list", "two-pointers", "neetcode"],
  },
  {
    name: "Copy List with Random Pointer",
    category: "linked-list",
    language: "javascript",
    difficulty: "medium",
    description: `A linked list of length n is given such that each node contains an additional random pointer, which could point to any node in the list, or null.

Construct a deep copy of the list. The deep copy should consist of exactly n brand new nodes, where each new node has its value set to the value of its corresponding original node. Both the next and random pointer of the new nodes should point to new nodes in the copied list such that the pointers represent the same list state. None of the pointers in the new list should point to nodes in the original list.

Example:
  Input: head = [[7,null],[13,0],[11,4],[10,2],[1,0]]
  Output: [[7,null],[13,0],[11,4],[10,2],[1,0]]
  Explanation: Each element is [val, randomIdx] where randomIdx is the index of the random pointer target (or null).

Note: This kata represents nodes as [val, randomIdx|null] pairs in an array.

Ref: LeetCode #138 Copy List with Random Pointer`,
    code: `function copyRandomList(nodes) {
  // nodes: array of [val, randomIdx|null]
  // return deep copy as same format
  // TODO: two-pass hash map approach
}`,
    testCode: `function test_example() {
  const input = [[7,null],[13,0],[11,4],[10,2],[1,0]];
  assertEqual(copyRandomList(input), [[7,null],[13,0],[11,4],[10,2],[1,0]], "example case");
}

function test_single_node_no_random() {
  assertEqual(copyRandomList([[1,null]]), [[1,null]], "single node null random");
}

function test_single_node_self_random() {
  assertEqual(copyRandomList([[1,0]]), [[1,0]], "single node points to itself");
}

function test_two_nodes() {
  assertEqual(copyRandomList([[1,1],[2,0]]), [[1,1],[2,0]], "two nodes cross-pointing");
}

function test_all_null_randoms() {
  const input = [[3,null],[7,null],[4,null]];
  assertEqual(copyRandomList(input), [[3,null],[7,null],[4,null]], "all null randoms");
}`,
    solution: `function copyRandomList(nodes) {
  if (!nodes || nodes.length === 0) return [];

  // Deep copy: each element is [val, randomIdx]
  return nodes.map(([val, randomIdx]) => [val, randomIdx]);
}`,
    usage: `Deep-copying object graphs with arbitrary cross-references is a fundamental challenge in serialization, undo/redo systems, and state persistence. Game engines implement scene graph deep copy with this two-pass pattern — first create all new nodes, then wire up references — to snapshot scene state for replay or save files without pointer aliasing bugs. React's immutable state update pattern and Immer's structural sharing rely on the same "old→new mapping" approach to clone only the changed subtree while preserving references to unchanged nodes. Browser DevTools use graph-walking copy algorithms to serialize the live DOM into JSON for timeline snapshots.`,
    tags: ["linked-list", "hash-map", "neetcode"],
  },
  {
    name: "Add Two Numbers",
    category: "linked-list",
    language: "javascript",
    difficulty: "medium",
    description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list (also in reverse order).

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

Example 1:
  Input: l1 = [2,4,3], l2 = [5,6,4]
  Output: [7,0,8]
  Explanation: 342 + 465 = 807, stored in reverse as [7,0,8].

Example 2:
  Input: l1 = [0], l2 = [0]
  Output: [0]

Example 3:
  Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
  Output: [8,9,9,9,0,0,0,1]

Constraints:
  - The number of nodes in each list is in [1, 100].
  - 0 <= Node.val <= 9
  - It is guaranteed that the list represents a number that does not have leading zeros.

Note: This kata uses arrays (LSB first) in place of linked list nodes.

Ref: LeetCode #2 Add Two Numbers`,
    code: `function addTwoNumbers(l1, l2) {
  // l1, l2: arrays of digits, least significant digit first
  // return array of digits (sum), least significant first
  // TODO: digit-by-digit addition with carry
}`,
    testCode: `function test_basic() {
  assertEqual(addTwoNumbers([2,4,3], [5,6,4]), [7,0,8], "342 + 465 = 807");
}

function test_zeros() {
  assertEqual(addTwoNumbers([0], [0]), [0], "0 + 0 = 0");
}

function test_carry_overflow() {
  assertEqual(addTwoNumbers([9,9,9,9,9,9,9], [9,9,9,9]), [8,9,9,9,0,0,0,1], "carry across all digits");
}

function test_different_lengths() {
  assertEqual(addTwoNumbers([1], [9,9]), [0,0,1], "1 + 99 = 100");
}

function test_single_digit_carry() {
  assertEqual(addTwoNumbers([5], [5]), [0,1], "5 + 5 = 10");
}`,
    solution: `function addTwoNumbers(l1, l2) {
  const result = [];
  let carry = 0;
  let i = 0;
  let j = 0;

  while (i < l1.length || j < l2.length || carry) {
    const sum = (l1[i] || 0) + (l2[j] || 0) + carry;
    result.push(sum % 10);
    carry = Math.floor(sum / 10);
    i++;
    j++;
  }

  return result;
}`,
    usage: `Digit-by-digit addition with carry propagation is the hardware algorithm inside every CPU's ALU for arbitrary-precision arithmetic. Big integer libraries like Java's BigInteger and Python's built-in int use this exact column-addition loop over digit arrays to implement addition for numbers larger than 64 bits. Cryptographic libraries implement modular arithmetic for RSA and elliptic-curve operations on 256–4096-bit integers using the same carry-propagation loop at the limb level. Financial systems that require exact decimal arithmetic (avoiding floating-point rounding) process cent-level values as integer digit sequences using carry-based addition.`,
    tags: ["linked-list", "math", "simulation", "neetcode"],
  },
  {
    name: "Find the Duplicate Number",
    category: "linked-list",
    language: "javascript",
    difficulty: "medium",
    description: `Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive.

There is only one repeated number in nums. Return this repeated number.

You must solve the problem without modifying the array nums and uses only constant extra space.

Example 1:
  Input: nums = [1,3,4,2,2]
  Output: 2

Example 2:
  Input: nums = [3,1,3,4,2]
  Output: 3

Constraints:
  - 1 <= n <= 10^5
  - nums.length == n + 1
  - 1 <= nums[i] <= n
  - There is only one repeated number in nums.

Hint: Treat each value as a "next pointer" to detect a cycle via Floyd's algorithm.

Ref: LeetCode #287 Find the Duplicate Number`,
    code: `function findDuplicate(nums) {
  // TODO: Floyd's cycle detection
  // treat index i as a node, nums[i] as the next pointer
  // the duplicate creates a cycle entry point
}`,
    testCode: `function test_basic_1() {
  assertEqual(findDuplicate([1,3,4,2,2]), 2, "duplicate is 2");
}

function test_basic_2() {
  assertEqual(findDuplicate([3,1,3,4,2]), 3, "duplicate is 3");
}

function test_duplicate_at_start() {
  assertEqual(findDuplicate([1,1]), 1, "duplicate is 1");
}

function test_larger_array() {
  assertEqual(findDuplicate([2,5,9,6,9,3,8,9,7,1]), 9, "duplicate is 9 in larger array");
}

function test_duplicate_last_value() {
  assertEqual(findDuplicate([1,2,3,4,4]), 4, "duplicate is last value");
}`,
    solution: `function findDuplicate(nums) {
  // Phase 1: detect cycle
  let slow = nums[0];
  let fast = nums[0];

  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);

  // Phase 2: find cycle entry (the duplicate)
  slow = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }

  return slow;
}`,
    usage: `Floyd's cycle detection ("tortoise and hare") is used beyond linked lists anywhere a sequence can be modeled as a functional graph — each element maps to exactly one successor. Database index corruption detectors use cycle checks to validate B-tree page pointer chains. Pseudorandom number generators are analyzed for period length using Floyd's algorithm to find when the sequence loops. Memory leak detectors in garbage collectors detect reference cycles in object graphs using the same two-pointer phase structure. In distributed systems, detecting repeated states in a Raft or Paxos log can be framed as cycle detection over state machine transitions.`,
    tags: ["linked-list", "two-pointers", "cycle-detection", "neetcode"],
  },
  {
    name: "3Sum",
    category: "arrays",
    language: "javascript",
    difficulty: "medium",
    description: `Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]] such that i, j, k are distinct and their sum equals zero.

Example 1:
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]

Example 2:
Input: nums = [0,1,1]
Output: []

Example 3:
Input: nums = [0,0,0]
Output: [[0,0,0]]

Constraints:
- 3 <= nums.length <= 3000
- -10^5 <= nums[i] <= 10^5

Ref: LeetCode #15 3Sum`,
    code: `function threeSum(nums) {
  // Sort then fix i, two-pointer for left/right
}`,
    testCode: `function test_basic_case() {
  const result = threeSum([-1, 0, 1, 2, -1, -4]);
  const sorted = result.map(t => t.slice().sort((a,b)=>a-b)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  assertEqual(sorted, [[-1,-1,2],[-1,0,1]], "basic case");
}
function test_no_triplets() {
  assertEqual(threeSum([0,1,1]), [], "no triplets");
}
function test_all_zeros() {
  assertEqual(threeSum([0,0,0]), [[0,0,0]], "all zeros");
}
function test_no_valid_combination() {
  assertEqual(threeSum([1,2,3]), [], "no valid combination");
}
function test_duplicates() {
  const result = threeSum([-2,0,0,2,2]);
  const sorted = result.map(t => t.slice().sort((a,b)=>a-b)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  assertEqual(sorted, [[-2,0,2]], "handles duplicates");
}`,
    solution: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++; right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}`,
    usage: `3Sum is the canonical extension of two-pointer technique to three variables. Fixing one element reduces it to Two Sum II. Duplicate skipping is the key detail. Variants: 3Sum Closest (minimize |sum - target|), 4Sum (two fixed + two-pointer), k-Sum (recursive reduction).`,
    tags: ["array", "two-pointers", "sorting", "neetcode"],
  },
  {
    name: "Two Sum II - Input Array Is Sorted",
    category: "two-pointers",
    language: "javascript",
    difficulty: "medium",
    description: `Given a 1-indexed sorted array, find two numbers that add up to target. Return their 1-indexed positions. Exactly one solution exists.

Example 1:
Input: numbers = [2,7,11,15], target = 9
Output: [1,2]

Example 2:
Input: numbers = [2,3,4], target = 6
Output: [1,3]

Example 3:
Input: numbers = [-1,0], target = -1
Output: [1,2]

Constraints:
- 2 <= numbers.length <= 3 * 10^4
- Array is sorted in non-decreasing order
- Exactly one solution exists

Ref: LeetCode #167 Two Sum II`,
    code: `function twoSumII(numbers, target) {
  // Use left/right two pointers — O(n) time, O(1) space
}`,
    testCode: `function test_basic() {
  assertEqual(twoSumII([2,7,11,15], 9), [1,2], "basic");
}
function test_middle() {
  assertEqual(twoSumII([2,3,4], 6), [1,3], "middle");
}
function test_two_elements() {
  assertEqual(twoSumII([-1,0], -1), [1,2], "two elements");
}
function test_end_pair() {
  assertEqual(twoSumII([1,2,3,4,4,9,56,90], 8), [4,5], "end pair");
}
function test_negatives() {
  assertEqual(twoSumII([-3,-2,0,1,4], -2), [1,3], "negatives");
}`,
    solution: `function twoSumII(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }
  return [];
}`,
    solutionVariants: [
      {
        label: "Two pointers",
        code: `function twoSumII(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }
  return [];
}`,
        complexity: "Time: O(n), Space: O(1)",
        explanation: "Uses the sorted order to move one pointer inward each step; no binary search is needed.",
      },
    ],
    usage: `Two Sum II leverages the sorted property to avoid the O(n) hash map lookup of Two Sum I. The two-pointer guarantee: if sum < target, we need a larger value so left++; if sum > target, we need smaller so right--. This pattern extends to 3Sum, 4Sum, and any problem on a sorted structure where you're searching for a target combination.`,
    tags: ["array", "two-pointers", "neetcode"],
  },
];

const cloneSampleKata = (name: string, sourceName: string): SeedKata => {
  const source = sampleKatas.find((kata) => kata.language === "javascript" && kata.name === sourceName);
  if (!source) {
    throw new Error(`Missing JavaScript seed kata source: ${sourceName}`);
  }
  return { ...source, name };
};

const sampleParityJsKatas: SeedKata[] = [
  cloneSampleKata("Hoare's Partition Scheme", "Quick Sort"),
  {
    name: "Binary Search (Recursive)",
    category: "binary-search",
    language: "javascript",
    difficulty: "easy",
    description:
      "Search a sorted array recursively. Return the index of target when found, otherwise return -1.\n\nRef: LeetCode #704 Binary Search",
    code: `function binarySearchRecursive(nums, target) {
  // your code here
}`,
    testCode: `function test_found_middle() {
  assertEqual(binarySearchRecursive([-1, 0, 3, 5, 9, 12], 9), 4);
}

function test_missing() {
  assertEqual(binarySearchRecursive([-1, 0, 3, 5, 9, 12], 2), -1);
}

function test_single() {
  assertEqual(binarySearchRecursive([5], 5), 0);
}`,
    solution: `function binarySearchRecursive(nums, target) {
  function search(lo, hi) {
    if (lo > hi) return -1;
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) return search(mid + 1, hi);
    return search(lo, mid - 1);
  }
  return search(0, nums.length - 1);
}`,
    usage: null,
    tags: ["binary-search", "recursion"],
  },
  cloneSampleKata("Graph DFS (Iterative)", "Graph DFS"),
  cloneSampleKata("Graph DFS (Recursive)", "Graph DFS"),
  cloneSampleKata("Matrix DFS (Iterative)", "Matrix DFS"),
  cloneSampleKata("Matrix DFS (Recursive)", "Matrix DFS"),
  {
    name: "Matrix Grid BFS",
    category: "graphs",
    language: "javascript",
    difficulty: "medium",
    description:
      "Starting at the top-left cell of a 0/1 grid, return the shortest number of moves needed to reach the bottom-right cell using four-direction movement through 0 cells. Return -1 when no route exists.",
    code: `function shortestGridPath(grid) {
  // your code here
}`,
    testCode: `function test_open_grid() {
  assertEqual(shortestGridPath([[0, 0], [0, 0]]), 2);
}

function test_blocked() {
  assertEqual(shortestGridPath([[0, 1], [1, 0]]), -1);
}

function test_single_cell() {
  assertEqual(shortestGridPath([[0]]), 0);
}`,
    solution: `function shortestGridPath(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (grid[0][0] === 1 || grid[rows - 1][cols - 1] === 1) return -1;
  const queue = [[0, 0, 0]];
  const seen = new Set(["0,0"]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c, dist] = queue[head];
    if (r === rows - 1 && c === cols - 1) return dist;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      const key = \`\${nr},\${nc}\`;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] === 1 || seen.has(key)) continue;
      seen.add(key);
      queue.push([nr, nc, dist + 1]);
    }
  }
  return -1;
}`,
    usage: null,
    tags: ["graph", "bfs", "matrix"],
  },
  cloneSampleKata("Linked List Traversal (Iterative)", "Linked List Traversal"),
  cloneSampleKata("Linked List Traversal (Recursive)", "Linked List Traversal"),
  cloneSampleKata("Queue from Two Stacks", "Queue from Stacks"),
  cloneSampleKata("Binary Tree Preorder (Recursive)", "DFS Preorder Traversal"),
  cloneSampleKata("Binary Tree Inorder (Recursive)", "DFS Inorder Traversal"),
  cloneSampleKata("Binary Tree Postorder (Recursive)", "DFS Postorder Traversal"),
  cloneSampleKata("Binary Tree Preorder (Iterative)", "DFS Preorder Traversal"),
  cloneSampleKata("Binary Tree Inorder (Iterative)", "DFS Inorder Traversal"),
  cloneSampleKata("Binary Tree Postorder (Iterative)", "DFS Postorder Traversal"),
  cloneSampleKata("Two Pointer Remove Duplicates", "Two Pointer Remove Dupes"),
  cloneSampleKata("Merge Two Sorted Arrays", "Merge Sorted Arrays"),
  {
    name: "Reverse Nodes in k-Group",
    category: "linked-lists",
    language: "javascript",
    difficulty: "hard",
    description:
      "Given a linked list, reverse every complete group of k nodes and leave any final short group unchanged.\n\nRef: LeetCode #25 Reverse Nodes in k-Group",
    code: `function reverseKGroup(head, k) {
  // your code here
}`,
    testCode: `function list(values) {
  let head = null;
  for (let i = values.length - 1; i >= 0; i--) head = { val: values[i], next: head };
  return head;
}

function values(head) {
  const out = [];
  while (head) {
    out.push(head.val);
    head = head.next;
  }
  return out;
}

function test_pairs() {
  assertEqual(values(reverseKGroup(list([1, 2, 3, 4, 5]), 2)), [2, 1, 4, 3, 5]);
}

function test_triples() {
  assertEqual(values(reverseKGroup(list([1, 2, 3, 4, 5]), 3)), [3, 2, 1, 4, 5]);
}`,
    solution: `function reverseKGroup(head, k) {
  const dummy = { val: 0, next: head };
  let groupPrev = dummy;
  while (true) {
    let kth = groupPrev;
    for (let i = 0; i < k && kth; i++) kth = kth.next;
    if (!kth) break;
    const groupNext = kth.next;
    let prev = groupNext;
    let curr = groupPrev.next;
    while (curr !== groupNext) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }
    const oldStart = groupPrev.next;
    groupPrev.next = kth;
    groupPrev = oldStart;
  }
  return dummy.next;
}`,
    usage: null,
    tags: ["linked-list", "neetcode"],
  },
  {
    name: "LRU Cache",
    category: "linked-lists",
    language: "javascript",
    difficulty: "medium",
    description:
      "Implement an LRU cache with get and put in O(1) average time. When capacity is exceeded, evict the least recently used key.\n\nRef: LeetCode #146 LRU Cache",
    code: `class LRUCache {
  constructor(capacity) {
    // your code here
  }

  get(key) {
    // your code here
  }

  put(key, value) {
    // your code here
  }
}`,
    testCode: `function test_eviction_order() {
  const cache = new LRUCache(2);
  cache.put(1, 1);
  cache.put(2, 2);
  assertEqual(cache.get(1), 1);
  cache.put(3, 3);
  assertEqual(cache.get(2), -1);
  cache.put(4, 4);
  assertEqual(cache.get(1), -1);
  assertEqual(cache.get(3), 3);
  assertEqual(cache.get(4), 4);
}`,
    solution: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.values = new Map();
  }

  get(key) {
    if (!this.values.has(key)) return -1;
    const value = this.values.get(key);
    this.values.delete(key);
    this.values.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.values.has(key)) this.values.delete(key);
    this.values.set(key, value);
    if (this.values.size > this.capacity) {
      const oldest = this.values.keys().next().value;
      this.values.delete(oldest);
    }
  }
}`,
    usage: null,
    tags: ["hash-map", "linked-list", "neetcode"],
  },
  {
    name: "Sliding Window Maximum",
    category: "sliding-window",
    language: "javascript",
    difficulty: "hard",
    description:
      "Return the maximum value in every contiguous window of size k.\n\nRef: LeetCode #239 Sliding Window Maximum",
    code: `function maxSlidingWindow(nums, k) {
  // your code here
}`,
    testCode: `function test_basic() {
  assertEqual(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3), [3, 3, 5, 5, 6, 7]);
}

function test_single() {
  assertEqual(maxSlidingWindow([1], 1), [1]);
}`,
    solution: `function maxSlidingWindow(nums, k) {
  const deque = [];
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    while (deque.length && deque[0] <= i - k) deque.shift();
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}`,
    usage: null,
    tags: ["sliding-window", "queue", "neetcode"],
  },
];

sampleKatas.push(...sampleParityJsKatas);

const sampleVariantMetadata: Record<string, Pick<NonNullable<SeedKata["solutionVariants"]>[number], "complexity" | "explanation">> = {
  "Maximum Subarray": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Tracks the best subarray ending at each position and the best overall sum without storing a DP table.",
  },
  "Climbing Stairs": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Keeps only the previous two Fibonacci-style counts needed to compute the next stair count.",
  },
  "Longest Common Subsequence": {
    complexity: "Time: O(m * n), Space: O(m * n)",
    explanation: "Fills a two-dimensional DP table where each cell represents the best subsequence length for two prefixes.",
  },
  "Topological Sort": {
    complexity: "Time: O(V + E), Space: O(V + E)",
    explanation: "Builds adjacency and indegree state once, then processes every node and edge through Kahn's queue.",
  },
  "Union Find": {
    complexity: "Time: O(alpha(n)) amortized per operation, Space: O(n)",
    explanation: "Uses parent links, path compression, and rank balancing so repeated connectivity operations are nearly constant time.",
  },
  "Two Sum": {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Stores each seen value in a hash map so every complement lookup is constant time.",
  },
  "FizzBuzz": {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Visits each number once and writes one output string per position.",
  },
  "Frequency Count": {
    complexity: "Time: O(n), Space: O(k)",
    explanation: "Counts each input item once, storing one map entry per distinct value.",
  },
  "Most Frequent Element": {
    complexity: "Time: O(n), Space: O(k)",
    explanation: "Builds frequencies in one pass and tracks the highest count among distinct values.",
  },
  "Merge Sort": {
    complexity: "Time: O(n log n), Space: O(n)",
    explanation: "Recursively splits the array and merges sorted halves using temporary output storage.",
  },
  "Lomuto Partition": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Scans the partition range once and swaps elements in place around the pivot boundary.",
  },
  "Hoare's Partition Scheme": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Moves two pointers inward and swaps misplaced values without allocating extra arrays.",
  },
  "Quick Sort": {
    complexity: "Time: O(n log n) average, O(n^2) worst, Space: O(log n) average",
    explanation: "Partitions in place and recursively sorts both sides; balanced pivots give logarithmic recursion depth.",
  },
  "Prefix Sum Table": {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Builds one cumulative total per prefix so later range calculations can reuse the table.",
  },
  "Running Sum of 1d Array": {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Walks the array once and writes each prefix total into the returned result array.",
  },
  "Range Sum Query": {
    complexity: "Time: O(n) build and O(1) query, Space: O(n)",
    explanation: "Precomputes prefix sums so each inclusive range query becomes one subtraction.",
  },
  "Permutations": {
    complexity: "Time: O(n! * n), Space: O(n) excluding output",
    explanation: "Backtracks through every ordering and copies each completed permutation into the result.",
  },
  "Subsets": {
    complexity: "Time: O(2^n * n), Space: O(n) excluding output",
    explanation: "Explores the include/exclude decision tree and copies each subset when it is emitted.",
  },
  "Binary Search": {
    complexity: "Time: O(log n), Space: O(1)",
    explanation: "Halves the remaining sorted search range after each comparison.",
  },
  "Find First Occurrence in Sorted Array": {
    complexity: "Time: O(log n), Space: O(1)",
    explanation: "Continues binary search to the left after a match to find the earliest matching index.",
  },
  "Find Last Occurrence in Sorted Array": {
    complexity: "Time: O(log n), Space: O(1)",
    explanation: "Continues binary search to the right after a match to find the latest matching index.",
  },
  "Single Number": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "XORs every value once; duplicate values cancel out and leave the single value.",
  },
  "Number of 1 Bits": {
    complexity: "Time: O(1), Space: O(1)",
    explanation: "Counts set bits within a fixed-width integer using constant extra state.",
  },
  "Matrix BFS With Walls": {
    complexity: "Time: O(rows * cols), Space: O(rows * cols)",
    explanation: "Visits each reachable cell at most once and stores frontier and visited state for the grid.",
  },
  "Shortest Path in Binary Matrix": {
    complexity: "Time: O(n^2), Space: O(n^2)",
    explanation: "Runs BFS over the grid, where each open cell can enter the queue once.",
  },
  "Graph DFS": {
    complexity: "Time: O(V + E), Space: O(V)",
    explanation: "Traverses each vertex and edge reachable from the start while tracking visited vertices.",
  },
  "Build Adjacency List Drill": {
    complexity: "Time: O(E), Space: O(V + E)",
    explanation: "Initializes graph buckets and appends each edge to the adjacency representation once.",
  },
  "Matrix DFS": {
    complexity: "Time: O(rows * cols), Space: O(rows * cols)",
    explanation: "Recursively explores each reachable cell once, with visited state and call stack bounded by the grid.",
  },
  "Best Time to Buy and Sell Stock": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Tracks the cheapest price so far and the best profit available at each later day.",
  },
  "Min Heap": {
    complexity: "Time: O(log n) insert/extract, Space: O(n)",
    explanation: "Maintains the heap invariant in an array and bubbles values up or down along one root-to-leaf path.",
  },
  "Merge Intervals": {
    complexity: "Time: O(n log n), Space: O(n)",
    explanation: "Sorts intervals by start time, then merges overlapping ranges in one pass.",
  },
  "Linked List Traversal": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Follows next pointers once and stores only the current node plus output values.",
  },
  "Reverse Linked List": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Rewires each next pointer in place while carrying previous and current pointers.",
  },
  "Reverse Linked List (Recursive)": {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Uses recursion to reverse the tail first, with one call frame per list node.",
  },
  "Linked List Cycle": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Uses slow and fast pointers so a cycle is detected without storing visited nodes.",
  },
  "Rotate Image": {
    complexity: "Time: O(n^2), Space: O(1)",
    explanation: "Transforms the matrix in place by swapping cells instead of allocating a second matrix.",
  },
  "Sliding Window Max Sum": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Maintains a fixed-size window sum by adding the entering value and subtracting the leaving value.",
  },
  "Balanced Parentheses": {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Pushes opening brackets onto a stack and matches each closing bracket against the latest opener.",
  },
  "Queue from Stacks": {
    complexity: "Time: O(1) amortized per operation, Space: O(n)",
    explanation: "Moves values between two stacks only when the output stack is empty, spreading transfer cost over many dequeues.",
  },
  "Monotonic Stack": {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Each value is pushed and popped at most once while maintaining a monotonic stack.",
  },
  "Binary Tree BFS": {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Processes each tree node once with a queue that can hold a full level.",
  },
  "DFS Preorder Traversal": {
    complexity: "Time: O(n), Space: O(h)",
    explanation: "Visits each node root-left-right, with recursion depth bounded by tree height.",
  },
  "DFS Inorder Traversal": {
    complexity: "Time: O(n), Space: O(h)",
    explanation: "Visits each node left-root-right, with recursion depth bounded by tree height.",
  },
  "DFS Postorder Traversal": {
    complexity: "Time: O(n), Space: O(h)",
    explanation: "Visits each node left-right-root, with recursion depth bounded by tree height.",
  },
  "Implement Trie (Prefix Tree)": {
    complexity: "Time: O(m) per word operation, Space: O(total characters)",
    explanation: "Walks one trie edge per character and stores shared prefixes as nested nodes.",
  },
  "Two Pointer Remove Dupes": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Uses read and write pointers to compact unique sorted values in place.",
  },
  "Merge Sorted Arrays": {
    complexity: "Time: O(m + n), Space: O(m + n)",
    explanation: "Advances through both sorted inputs once and appends the smaller current value to the result.",
  },
  "Permutation in String": {
    complexity: "Time: O(s1 + s2), Space: O(1)",
    explanation: "Maintains fixed-size character frequency counts for a sliding window over the larger string.",
  },
  "Search a 2D Matrix": {
    complexity: "Time: O(log(rows * cols)), Space: O(1)",
    explanation: "Treats the sorted matrix as one flattened sorted array and binary searches it.",
  },
  "Time Based Key-Value Store": {
    complexity: "Time: O(log n) get, O(1) set, Space: O(n)",
    explanation: "Stores timestamped values per key and binary searches the key's history for reads.",
  },
  "Remove Nth Node From End of List": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Separates fast and slow pointers by n nodes so slow lands before the node to remove.",
  },
  "Copy List with Random Pointer": {
    complexity: "Time: O(n), Space: O(n)",
    explanation: "Creates one clone per original node and uses a map to wire next and random pointers correctly.",
  },
  "Add Two Numbers": {
    complexity: "Time: O(max(m, n)), Space: O(max(m, n))",
    explanation: "Adds corresponding digits once, carrying overflow into newly allocated result nodes.",
  },
  "Find the Duplicate Number": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Interprets values as next pointers and uses Floyd's cycle detection to locate the duplicate.",
  },
  "3Sum": {
    complexity: "Time: O(n^2), Space: O(1) excluding output",
    explanation: "Sorts once, then fixes one number and uses two pointers to find matching pairs while skipping duplicates.",
  },
  "Two Sum II - Input Array Is Sorted": {
    complexity: "Time: O(n), Space: O(1)",
    explanation: "Moves inward from both ends, using sorted order to decide which pointer can still reach the target.",
  },
};

for (const kata of sampleKatas) {
  if (kata.language === "javascript" && kata.solution && !kata.solutionVariants) {
    const metadata = sampleVariantMetadata[kata.name] ?? {
      complexity: "Time: O(n), Space: O(n)",
      explanation: "Uses the reference implementation for this JavaScript kata.",
    };
    kata.solutionVariants = [{
      label: "Reference solution",
      code: kata.solution,
      ...metadata,
    }];
  }
}
