import type { Kata, SeedKata } from "../types/editor";

export type EvaluationOrder =
  | "left-to-right"
  | "right-to-left"
  | "top-left-to-bottom-right"
  | "bottom-up"
  | "increasing-interval-length"
  | "top-down-memoized"
  | "custom";

export type DpModule =
  | "dp-foundations"
  | "1d-sequence-dp"
  | "grid-dp"
  | "0-1-knapsack"
  | "unbounded-knapsack"
  | "string-dp"
  | "subsequence-dp"
  | "interval-dp"
  | "state-machine-dp"
  | "dfs-memo"
  | "bitmask-dp";

export type PatternModule = DpModule | "expand-around-center";

export interface DpPattern {
  primaryModule: PatternModule;
  relatedPatterns?: DpModule[];
  state: string;
  transition: string;
  baseCases: string[];
  evaluationOrder: {
    kind: EvaluationOrder;
    explanation: string;
  };
}

/**
 * Ordered curriculum modules. `dp-foundations` is the prerequisite tier;
 * all others are numbered problem-family modules.
 * Drive the Module View section order in the Problems list.
 */
export const DP_MODULES: { id: DpModule; label: string; tier: "prerequisite" | "problem-family" }[] = [
  { id: "dp-foundations", label: "DP Foundations", tier: "prerequisite" },
  { id: "1d-sequence-dp", label: "1D Sequence DP", tier: "problem-family" },
  { id: "grid-dp", label: "Grid DP", tier: "problem-family" },
  { id: "0-1-knapsack", label: "0/1 Knapsack", tier: "problem-family" },
  { id: "unbounded-knapsack", label: "Unbounded Knapsack", tier: "problem-family" },
  { id: "string-dp", label: "String DP", tier: "problem-family" },
  { id: "subsequence-dp", label: "Subsequence DP", tier: "problem-family" },
  { id: "interval-dp", label: "Interval DP", tier: "problem-family" },
  { id: "state-machine-dp", label: "State-Machine DP", tier: "problem-family" },
  { id: "dfs-memo", label: "DFS with Memoization", tier: "problem-family" },
  { id: "bitmask-dp", label: "Bitmask DP", tier: "problem-family" },
];

const DP_MODULE_IDS = new Set<string>(DP_MODULES.map((m) => m.id));

/**
 * Keyed by kata NAME. One entry per DP kata, derived from that kata's
 * reference solution. `primaryModule` is the mental model we teach; the
 * state/transition describe the checked-in reference solution.
 */
export const DP_PATTERNS: Record<string, DpPattern> = {
  "Fibonacci Number": {
    primaryModule: "dp-foundations",
    state: "dp[i] = the i-th Fibonacci number",
    transition: "dp[i] = dp[i-1] + dp[i-2]",
    baseCases: ["dp[0] = 0", "dp[1] = 1"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "dp[i] needs dp[i-1] and dp[i-2]; filling from i=2 upward keeps both prior values available",
    },
  },
  "Climbing Stairs (Iterative)": {
    primaryModule: "dp-foundations",
    relatedPatterns: ["1d-sequence-dp"],
    state: "dp[i] = number of ways to reach step i",
    transition: "dp[i] = dp[i-1] + dp[i-2] (arrive via a 1-step or a 2-step)",
    baseCases: ["dp[1] = 1 (one way to reach step 1: take a 1-step)", "dp[2] = 2 (two ways: 1+1 or a single 2-step)"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "dp[i] reads dp[i-1] and dp[i-2]; filling from i=3 upward ensures both earlier values are settled",
    },
  },
  "Climbing Stairs (Recursive)": {
    primaryModule: "dp-foundations",
    relatedPatterns: ["dfs-memo"],
    state: "dp[i] = number of ways to reach step i",
    transition: "dp[i] = dp[i-1] + dp[i-2], memoized top-down",
    baseCases: ["dp[1] = 1", "dp[2] = 2"],
    evaluationOrder: {
      kind: "top-down-memoized",
      explanation: "recursion computes dp[i] from dp[i-1] and dp[i-2] on demand; the memo cache ensures each sub-problem is solved once",
    },
  },
  "N-th Tribonacci Number": {
    primaryModule: "1d-sequence-dp",
    state: "dp[i] = the i-th Tribonacci number",
    transition: "dp[i] = dp[i-1] + dp[i-2] + dp[i-3]",
    baseCases: ["dp[0] = 0", "dp[1] = 1", "dp[2] = 1"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "dp[i] needs dp[i-1], dp[i-2], and dp[i-3]; filling from i=3 upward keeps all three prior values available",
    },
  },
  "Min Cost Climbing Stairs": {
    primaryModule: "1d-sequence-dp",
    state: "cost[i] = min cost to reach step i (mutated in place over the input)",
    transition: "cost[i] += min(cost[i-1], cost[i-2])",
    baseCases: ["cost[0] and cost[1] are unchanged — each is the price to leave from that step"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "cost[i] accumulates min(cost[i-1], cost[i-2]); both positions must be finalized before updating i",
    },
  },
  "House Robber": {
    primaryModule: "1d-sequence-dp",
    relatedPatterns: ["0-1-knapsack"],
    state: "dp[i] = max money obtainable from houses 0..i",
    transition: "dp[i] = max(skip current: dp[i-1], rob current: nums[i] + dp[i-2])",
    baseCases: ["dp[0] = nums[0]", "dp[1] = max(nums[0], nums[1])"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "dp[i] reads dp[i-1] and dp[i-2]; filling left to right keeps both prior values available",
    },
  },
  "House Robber II": {
    primaryModule: "1d-sequence-dp",
    state: "dp[i] = max money from a non-circular run of houses",
    transition: "House Robber's linear recurrence run twice (exclude last house, exclude first house), take the max",
    baseCases: ["each linear sub-run starts with the first element as dp[0] and max of first two as dp[1]"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "two passes of the linear House Robber recurrence over overlapping subranges; each pass fills left to right",
    },
  },
  "Delete and Earn": {
    primaryModule: "1d-sequence-dp",
    state: "dp[v] = max points earnable using values 0..v, after bucketing nums into points[v] = v * count(v)",
    transition: "dp[v] = max(skip value v: dp[v-1], take all of v: points[v] + dp[v-2])",
    baseCases: ["dp[0] = points[0]", "dp[1] = max(points[0], points[1])"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "dp[v] reads dp[v-1] and dp[v-2] after building the points array; filling from v=2 upward keeps both prior buckets settled",
    },
  },
  "Unique Paths": {
    primaryModule: "grid-dp",
    state: "dp[r][c] = number of paths from top-left to (r, c)",
    transition: "dp[r][c] = dp[r-1][c] + dp[r][c-1]",
    baseCases: [
      "dp[0][c] = 1 for all c (only one path along the top row: move right)",
      "dp[r][0] = 1 for all r (only one path down the left column: move down)",
    ],
    evaluationOrder: {
      kind: "top-left-to-bottom-right",
      explanation: "dp[r][c] reads dp[r-1][c] and dp[r][c-1]; row-major order fills both before (r,c)",
    },
  },
  "Unique Paths II": {
    primaryModule: "grid-dp",
    state: "dp[r][c] = number of obstacle-free paths from top-left to (r, c)",
    transition: "dp[r][c] = dp[r-1][c] + dp[r][c-1] if no obstacle, else 0",
    baseCases: [
      "dp[r][0] = 1 for each unobstructed leading cell in the left column (stop on first obstacle)",
      "dp[0][c] = 1 for each unobstructed leading cell in the top row (stop on first obstacle)",
      "dp[r][c] = 0 whenever obstacle_grid[r][c] == 1 (obstacle zeroes out a state before paths accumulate)",
    ],
    evaluationOrder: {
      kind: "top-left-to-bottom-right",
      explanation: "dp[r][c] reads dp[r-1][c] and dp[r][c-1]; row-major order ensures both predecessors are settled, and obstacle cells propagate zero forward correctly",
    },
  },
  "Minimum Path Sum": {
    primaryModule: "grid-dp",
    state: "dp[r][c] = min cost of a path from top-left to (r, c)",
    transition: "dp[r][c] = min(dp[r-1][c], dp[r][c-1]) + grid[r][c]",
    baseCases: [
      "dp[0][0] = grid[0][0]",
      "dp[0][c] = dp[0][c-1] + grid[0][c] for c > 0 (top row: only path is rightward)",
      "dp[r][0] = dp[r-1][0] + grid[r][0] for r > 0 (left column: only path is downward)",
    ],
    evaluationOrder: {
      kind: "top-left-to-bottom-right",
      explanation: "dp[r][c] reads dp[r-1][c] and dp[r][c-1]; row-major order guarantees both are available when (r,c) is computed",
    },
  },
  "Triangle": {
    primaryModule: "grid-dp",
    state: "dp[col] = minimum path sum from that cell to the bottom of the triangle (space-compressed to one row)",
    transition: "dp[col] = triangle[row][col] + min(dp[col], dp[col+1])",
    baseCases: ["dp = triangle[-1][:] (the bottom row is already the base; each cell costs only itself)"],
    evaluationOrder: {
      kind: "bottom-up",
      explanation: "starting from the penultimate row and working upward, dp[col] accumulates the cheaper of the two choices below it; all downstream values are available because we fill from the last row upward",
    },
  },
  "Partition Equal Subset Sum": {
    primaryModule: "0-1-knapsack",
    state: "dp = set of subset sums reachable using nums seen so far",
    transition: "dp = {s + n for s in dp} ∪ dp for each num n (include or skip n)",
    baseCases: ["dp = {0} (the empty subset always sums to 0)"],
    evaluationOrder: {
      kind: "right-to-left",
      explanation: "building a fresh set each round prevents the current item from being counted twice; this is equivalent to filling a boolean capacity array backward (high to low) so each item is used at most once",
    },
  },
  "0/1 Knapsack": {
    primaryModule: "0-1-knapsack",
    state: "dp[c] = maximum value achievable with capacity c using items considered so far",
    transition: "dp[c] = max(dp[c], dp[c - w] + v) for each item (weight w, value v)",
    baseCases: ["dp[0..capacity] = 0 (no items means no value)"],
    evaluationOrder: {
      kind: "right-to-left",
      explanation: "iterating capacity from high to low ensures each item is considered at most once; a forward pass would let a single item contribute multiple times (unbounded knapsack behavior)",
    },
  },
  "Target Sum": {
    primaryModule: "0-1-knapsack",
    relatedPatterns: ["dfs-memo"],
    state: "dp[sum] = number of ways to reach that running sum using nums seen so far",
    transition: "for each num, next_dp[sum ± num] += dp[sum] (choose + or − for each num)",
    baseCases: ["dp = {0: 1} (one way to reach sum 0 before processing any number)"],
    evaluationOrder: {
      kind: "custom",
      explanation: "each num branches every reachable sum into two (+num and -num); a fresh dict each round prevents a single num from being applied twice to the same running sum",
    },
  },
  "Combination Sum IV": {
    primaryModule: "unbounded-knapsack",
    relatedPatterns: ["dfs-memo"],
    state: "dp[t] = number of ordered combinations of nums summing to t",
    transition: "dp[t] = sum(dp[t - num] for num in nums if num <= t)",
    baseCases: ["dp[0] = 1 (one ordered combination sums to 0: the empty selection)"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "dp[t] reads dp[t-num] for each num; filling left to right makes smaller targets available; nums loop inside target, enabling reuse and counting ordered arrangements",
    },
  },
  "Coin Change II": {
    primaryModule: "unbounded-knapsack",
    state: "dp[a] = number of unordered combinations of coins summing to a",
    transition: "for each coin, dp[a] += dp[a - coin] for a from coin..amount (coin in outer loop keeps combinations unordered)",
    baseCases: ["dp[0] = 1 (one combination — using no coins — makes amount 0)"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "coin iterates in the outer loop and amount fills forward; dp[a-coin] is already updated for the current coin, allowing unlimited reuse while keeping combinations unordered",
    },
  },
  "Coin Change": {
    primaryModule: "unbounded-knapsack",
    state: "dp[i] = fewest coins summing to i (∞ if unreachable)",
    transition: "dp[i] = min(dp[i - c] + 1) over every coin c <= i",
    baseCases: ["dp[0] = 0 (zero coins needed to make amount 0)", "dp[i] = ∞ for i > 0 (initially unreachable)"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "dp[i] reads dp[i-c] for every coin c; filling left to right ensures all smaller amounts are finalized, allowing forward reuse of each coin",
    },
  },
  "Perfect Squares": {
    primaryModule: "unbounded-knapsack",
    state: "dp[i] = fewest perfect squares summing to i",
    transition: "dp[i] = min(dp[i - j*j] + 1) over every j with j*j <= i",
    baseCases: ["dp[0] = 0 (zero squares needed to sum to 0)", "dp[i] = ∞ for i > 0 (initially unreachable)"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "dp[i] reads dp[i-j²] for every perfect square j²≤i; filling left to right keeps all smaller sub-problems available when needed",
    },
  },
  "Unbounded Knapsack": {
    primaryModule: "unbounded-knapsack",
    state: "dp[c] = maximum value achievable with capacity c using items considered so far (items reusable)",
    transition: "dp[c] = max(dp[c], dp[c - w] + v) for each item (weight w, value v)",
    baseCases: ["dp[0..capacity] = 0 (no items means no value)"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "iterating capacity from low to high lets dp[c-w] already include the current item, enabling unlimited reuse; backward iteration would restrict each item to one use (0/1 behavior)",
    },
  },
  "Decode Ways": {
    primaryModule: "string-dp",
    state: "dp[i] = number of ways to decode the first i characters",
    transition: "dp[i] = dp[i-1] if s[i-1] is a valid single digit, plus dp[i-2] if s[i-2:i] is a valid 10-26 pair",
    baseCases: [
      "dp[0] = 1 (empty prefix has exactly one decoding)",
      "dp[1] = 1 if s[0] != '0', else 0 (single digit is valid only if non-zero)",
    ],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "dp[i] reads dp[i-1] and dp[i-2]; filling left to right keeps both prior positions settled",
    },
  },
  "Edit Distance": {
    primaryModule: "string-dp",
    state: "dp[j] = edit distance between word1[:i] and word2[:j] (rolling 1D row over i)",
    transition: "dp[j] = prev (diagonal) if word1[i-1] == word2[j-1], else 1 + min(prev, dp[j], dp[j-1])",
    baseCases: [
      "dp[0][j] = j (delete all j characters of word2 to reach empty word1)",
      "dp[i][0] = i (insert i characters from word1 when word2 is empty)",
    ],
    evaluationOrder: {
      kind: "top-left-to-bottom-right",
      explanation: "dp[i][j] reads dp[i-1][j-1], dp[i-1][j], and dp[i][j-1]; row-major order ensures all three are available; the reference solution space-optimizes to a rolling row",
    },
  },
  "Interleaving String": {
    primaryModule: "string-dp",
    state: "dp[i][j] = can s3[0..i+j) be formed by interleaving s1[0..i) and s2[0..j)",
    transition: "dp[i][j] = (dp[i-1][j] && s1[i-1]==s3[i+j-1]) || (dp[i][j-1] && s2[j-1]==s3[i+j-1])",
    baseCases: [
      "dp[0][0] = True (two empty strings interleave as the empty string)",
      "dp[i][0] = dp[i-1][0] and s1[i-1] == s3[i-1] (consuming only s1)",
      "dp[0][j] = dp[0][j-1] and s2[j-1] == s3[j-1] (consuming only s2)",
    ],
    evaluationOrder: {
      kind: "top-left-to-bottom-right",
      explanation: "dp[i][j] reads dp[i-1][j] and dp[i][j-1]; row-major order makes both available when (i,j) is computed",
    },
  },
  "Regular Expression Matching": {
    primaryModule: "string-dp",
    state: "dp[i][j] = does s[0..i) match pattern p[0..j)",
    transition: "on '*': skip x* → dp[i][j-2], or consume if p[j-2] matches s[i-1] → dp[i-1][j]; else single char/'.' match → dp[i-1][j-1]",
    baseCases: [
      "dp[0][0] = True (empty pattern matches empty string)",
      "dp[0][j] = dp[0][j-2] when p[j-1] == '*' (x* can match zero occurrences, clearing two pattern chars)",
    ],
    evaluationOrder: {
      kind: "top-left-to-bottom-right",
      explanation: "dp[i][j] reads dp[i-1][j], dp[i][j-2], and dp[i-1][j-1]; row-major order keeps all needed prior states settled",
    },
  },
  "Maximum Length of Repeated Subarray": {
    primaryModule: "subsequence-dp",
    state: "dp[i][j] = length of the common run ending exactly at nums1[i-1] and nums2[j-1]",
    transition: "dp[i][j] = dp[i-1][j-1] + 1 if nums1[i-1] == nums2[j-1], else 0",
    baseCases: ["dp[i][0] = 0 and dp[0][j] = 0 for all i, j (no common run extends from an empty array)"],
    evaluationOrder: {
      kind: "top-left-to-bottom-right",
      explanation: "dp[i][j] reads only dp[i-1][j-1]; row-major order ensures the diagonal predecessor is available when (i,j) is processed",
    },
  },
  "Longest Increasing Subsequence": {
    primaryModule: "subsequence-dp",
    state: "sub = smallest tail value achievable for an increasing subsequence of each length seen so far",
    transition: "binary-search num's insertion point in sub; extend sub if num is a new largest tail, else overwrite that slot",
    baseCases: ["sub = [] (empty array has LIS length 0; the first element initializes sub)"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "each num extends or replaces a tail in `sub` via binary search; processing left to right builds increasingly refined tail values for longer subsequences",
    },
  },
  "Longest Common Subsequence": {
    primaryModule: "subsequence-dp",
    state: "dp[i][j] = LCS length of text1[:i] and text2[:j]",
    transition: "dp[i][j] = dp[i-1][j-1] + 1 if text1[i-1] == text2[j-1], else max(dp[i-1][j], dp[i][j-1])",
    baseCases: [
      "dp[0][j] = 0 for all j (no common subsequence with an empty text1)",
      "dp[i][0] = 0 for all i (no common subsequence with an empty text2)",
    ],
    evaluationOrder: {
      kind: "top-left-to-bottom-right",
      explanation: "dp[i][j] reads dp[i-1][j-1], dp[i-1][j], and dp[i][j-1]; row-major order ensures all three are settled before (i,j)",
    },
  },
  "Distinct Subsequences": {
    primaryModule: "subsequence-dp",
    relatedPatterns: ["string-dp"],
    state: "dp[i][j] = number of subsequences of s[0..i) that equal t[0..j)",
    transition: "dp[i][j] = dp[i-1][j] + (s[i-1]==t[j-1] ? dp[i-1][j-1] : 0)",
    baseCases: [
      "dp[i][0] = 1 for all i (one way to embed an empty t: choose nothing from s)",
      "dp[0][j] = 0 for j > 0 (empty s cannot embed non-empty t)",
    ],
    evaluationOrder: {
      kind: "top-left-to-bottom-right",
      explanation: "dp[i][j] reads dp[i-1][j] and dp[i-1][j-1]; both come from the previous row, which is fully settled in row-major order",
    },
  },
  "Longest Palindromic Subsequence": {
    primaryModule: "interval-dp",
    relatedPatterns: ["subsequence-dp"],
    state: "dp[i][j] = longest palindromic subsequence length within s[i..j]",
    transition: "dp[i][j] = dp[i+1][j-1] + 2 if s[i] == s[j], else max(dp[i+1][j], dp[i][j-1])",
    baseCases: ["dp[i][i] = 1 for all i (every single character is a palindrome of length 1)"],
    evaluationOrder: {
      kind: "increasing-interval-length",
      explanation: "dp[i][j] reads dp[i+1][j-1], dp[i+1][j], and dp[i][j-1]; all three are strictly shorter intervals that must be filled before the enclosing span",
    },
  },
  "Burst Balloons": {
    primaryModule: "interval-dp",
    state: "dp[l][r] = max coins from bursting every balloon strictly inside the open interval (l, r)",
    transition: "dp[l][r] = max over k in (l,r) of dp[l][k] + nums[l]*nums[k]*nums[r] + dp[k][r]  (k burst last)",
    baseCases: ["dp[l][r] = 0 for all adjacent pairs (l, l+1) — no balloons fit in an empty open interval"],
    evaluationOrder: {
      kind: "increasing-interval-length",
      explanation: "dp[l][r] reads dp[l][k] and dp[k][r] for k in (l,r); both are strictly shorter intervals and must be computed before the outer span",
    },
  },
  "Maximum Product Subarray": {
    primaryModule: "state-machine-dp",
    state: "cur_max/cur_min = max/min product of a subarray ending at the current index",
    transition: "cur_max, cur_min = max(n, n*cur_max, n*cur_min), min(n, n*cur_max, n*cur_min) — track both because a negative n flips them",
    baseCases: ["cur_max = cur_min = nums[0] (the first element is both the max and min product ending at index 0)"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "cur_max and cur_min each depend only on the previous element's values; processing elements left to right propagates both states correctly",
    },
  },
  "Best Time to Buy and Sell Stock With Cooldown": {
    primaryModule: "state-machine-dp",
    state: "three running states per day: hold / sold / cooldown = max profit ending that day in that state",
    transition: "hold = max(hold, cooldown-price); sold = hold+price; cooldown = max(cooldown, sold)",
    baseCases: [
      "holding = -prices[0] (bought on day 0)",
      "sold = 0 (no transaction completed yet)",
      "cooldown = 0 (no restriction in effect yet)",
    ],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "each day's (holding, sold, cooldown) states depend only on the previous day; processing prices left to right propagates all three states",
    },
  },
  "Word Break": {
    primaryModule: "dfs-memo",
    relatedPatterns: ["string-dp"],
    state: "dp[i] = whether s[:i] can be segmented into dictionary words",
    transition: "dp[i] = true if dp[j] is true and s[j:i] is in the dictionary, for some j < i",
    baseCases: ["dp[0] = True (the empty prefix is always decodable)"],
    evaluationOrder: {
      kind: "left-to-right",
      explanation: "dp[i] checks dp[j] for every j < i; filling left to right ensures all smaller prefix results are settled before the longer prefix is evaluated",
    },
  },
  "Longest Increasing Path In a Matrix": {
    primaryModule: "dfs-memo",
    relatedPatterns: ["grid-dp"],
    state: "memo[r][c] = length of longest strictly increasing path starting at cell (r,c)",
    transition: "memo[r][c] = 1 + max(memo of orthogonal neighbors with a greater value)",
    baseCases: ["memo[(r,c)] = 1 for any cell with no strictly-greater neighbor (the path is the cell itself)"],
    evaluationOrder: {
      kind: "top-down-memoized",
      explanation: "DFS recurses into strictly greater neighbors; since values strictly increase along any valid path there are no cycles, and each cell is computed once and cached",
    },
  },
  "Longest Palindromic Substring": {
    primaryModule: "expand-around-center",
    state: "the widest palindrome found so far, expanding outward from each center (i,i) and (i,i+1) — DP's O(n²) table is a detour here",
    transition: "grow left/right from a center while s[left] == s[right]; keep the longest span seen",
    baseCases: ["each single character (i, i) and each adjacent pair (i, i+1) is a potential expansion center"],
    evaluationOrder: {
      kind: "custom",
      explanation: "each center expands independently outward; no shared DP table is needed, so evaluation order across centers does not matter",
    },
  },
  "Palindromic Substrings": {
    primaryModule: "expand-around-center",
    state: "count = total palindromic substrings found so far, expanding outward from each center — DP's O(n²) table is a detour here",
    transition: "for each center (i,i) and (i,i+1), count += 1 for every step s[left] == s[right] holds",
    baseCases: ["each single character (i, i) counts as one palindrome; each pair (i, i+1) is checked as an even-length center"],
    evaluationOrder: {
      kind: "custom",
      explanation: "each center expands independently; order across centers does not affect correctness",
    },
  },
};

/**
 * Resolve a kata's DP module from its pattern map entry (by name), or fall
 * back to a recognized new module tag. The pattern map is the source of truth;
 * DB tags are never preferred over it because seedMissingKatas never updates
 * tags on already-seeded rows.
 */
export function dpFamilyFor(kata: Pick<Kata | SeedKata, "name" | "tags">): PatternModule | null {
  const fromPattern = DP_PATTERNS[kata.name]?.primaryModule;
  if (fromPattern) return fromPattern;
  const tag = kata.tags.find((t) => DP_MODULE_IDS.has(t));
  return (tag as PatternModule | undefined) ?? null;
}

/** Resolve a kata's DP pattern (state/transition/baseCases/evaluationOrder), or null if it has none. */
export function dpPatternFor(kata: Pick<Kata | SeedKata, "name">): DpPattern | null {
  return DP_PATTERNS[kata.name] ?? null;
}
