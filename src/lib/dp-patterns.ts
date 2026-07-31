import type { Kata, SeedKata } from "../types/editor";

/**
 * DP family + recurrence metadata for seed katas, structured data like
 * `leetcode-numbers.ts` — NOT a DB column, resolved at render time.
 *
 * `DP_FAMILIES` orders the recurrence shapes from simplest to most involved;
 * it drives the Family View section order in the Problems list.
 */
export type DpFamily =
  | "dp-basic"
  | "dp-decision"
  | "dp-counting"
  | "dp-min-cost"
  | "dp-multistate"
  | "dp-subsequence"
  | "dp-string"
  | "expand-around-center";

export const DP_FAMILIES: { id: DpFamily; label: string }[] = [
  { id: "dp-basic", label: "1 · Basic recurrence" },
  { id: "dp-decision", label: "2 · Include / skip decision" },
  { id: "dp-counting", label: "3 · Counting ways" },
  { id: "dp-min-cost", label: "4 · Minimum cost" },
  { id: "dp-multistate", label: "5 · Multi-state 1D" },
  { id: "dp-subsequence", label: "6 · Subsequence" },
  { id: "dp-string", label: "7 · String / interval" },
  { id: "expand-around-center", label: "Not DP · expand-around-center" },
];

const DP_FAMILY_IDS = new Set<string>(DP_FAMILIES.map((f) => f.id));

export interface DpPattern {
  family: DpFamily;
  state: string;
  transition: string;
  deps: string;
}

/**
 * Keyed by kata NAME (the recurrence is language-agnostic, unlike
 * LEETCODE_NUMBERS which is keyed by language+name). One entry per kata
 * carrying a `dp-*`/`expand-around-center` family tag, derived from that
 * kata's actual `solution` in the repo.
 */
export const DP_PATTERNS: Record<string, DpPattern> = {
  "Fibonacci Number": {
    family: "dp-basic",
    state: "dp[i] = the i-th Fibonacci number",
    transition: "dp[i] = dp[i-1] + dp[i-2]",
    deps: "dp[i-1], dp[i-2]",
  },
  "N-th Tribonacci Number": {
    family: "dp-basic",
    state: "dp[i] = the i-th Tribonacci number",
    transition: "dp[i] = dp[i-1] + dp[i-2] + dp[i-3]",
    deps: "dp[i-1], dp[i-2], dp[i-3]",
  },
  "Climbing Stairs (Iterative)": {
    family: "dp-basic",
    state: "dp[i] = number of ways to reach step i",
    transition: "dp[i] = dp[i-1] + dp[i-2] (arrive via a 1-step or a 2-step)",
    deps: "dp[i-1], dp[i-2]",
  },
  "Climbing Stairs (Recursive)": {
    family: "dp-basic",
    state: "dp[i] = number of ways to reach step i",
    transition: "dp[i] = dp[i-1] + dp[i-2], memoized top-down",
    deps: "dp[i-1], dp[i-2]",
  },
  "Min Cost Climbing Stairs": {
    family: "dp-basic",
    state: "cost[i] = min cost to reach step i (mutated in place over the input)",
    transition: "cost[i] += min(cost[i-1], cost[i-2])",
    deps: "cost[i-1], cost[i-2]",
  },
  "House Robber": {
    family: "dp-decision",
    state: "dp[i] = max money obtainable from houses 0..i",
    transition: "dp[i] = max(skip current: dp[i-1], rob current: nums[i] + dp[i-2])",
    deps: "dp[i-1], dp[i-2]",
  },
  "House Robber II": {
    family: "dp-decision",
    state: "dp[i] = max money from a non-circular run of houses",
    transition: "House Robber's linear recurrence run twice (exclude last house, exclude first house), take the max",
    deps: "dp[i-1], dp[i-2] within each linear run",
  },
  "Delete and Earn": {
    family: "dp-decision",
    state: "dp[v] = max points earnable using values 0..v, after bucketing nums into points[v] = v * count(v)",
    transition: "dp[v] = max(skip value v: dp[v-1], take all of v: points[v] + dp[v-2])",
    deps: "dp[v-1], dp[v-2]",
  },
  "Partition Equal Subset Sum": {
    family: "dp-decision",
    state: "dp = set of subset sums reachable using nums seen so far",
    transition: "dp = {s + n for s in dp} ∪ dp for each num n (include or skip n)",
    deps: "dp from before considering n",
  },
  "Target Sum": {
    family: "dp-decision",
    state: "dp[sum] = number of ways to reach that running sum using nums seen so far",
    transition: "for each num, next_dp[sum ± num] += dp[sum] (choose + or − for each num)",
    deps: "dp from before considering the current num",
  },
  "Decode Ways": {
    family: "dp-counting",
    state: "dp[i] = number of ways to decode the first i characters",
    transition: "dp[i] = dp[i-1] if s[i-1] is a valid single digit, plus dp[i-2] if s[i-2:i] is a valid 10-26 pair",
    deps: "dp[i-1], dp[i-2]",
  },
  "Unique Paths": {
    family: "dp-counting",
    state: "dp[r][c] = number of paths from top-left to (r, c)",
    transition: "dp[r][c] = dp[r-1][c] + dp[r][c-1]",
    deps: "dp[r-1][c], dp[r][c-1]",
  },
  "Combination Sum IV": {
    family: "dp-counting",
    state: "dp[t] = number of ordered combinations of nums summing to t",
    transition: "dp[t] = sum(dp[t - num] for num in nums if num <= t)",
    deps: "dp[t - num] for every num",
  },
  "Coin Change II": {
    family: "dp-counting",
    state: "dp[a] = number of unordered combinations of coins summing to a",
    transition: "for each coin, dp[a] += dp[a - coin] for a from coin..amount (coin in outer loop keeps combinations unordered)",
    deps: "dp[a - coin] for the current coin",
  },
  "Minimum Path Sum": {
    family: "dp-min-cost",
    state: "dp[r][c] = min cost of a path from top-left to (r, c)",
    transition: "dp[r][c] = min(dp[r-1][c], dp[r][c-1]) + grid[r][c]",
    deps: "dp[r-1][c], dp[r][c-1]",
  },
  "Perfect Squares": {
    family: "dp-min-cost",
    state: "dp[i] = fewest perfect squares summing to i",
    transition: "dp[i] = min(dp[i - j*j] + 1) over every j with j*j <= i",
    deps: "dp[i - j*j] for every perfect square j*j <= i",
  },
  "Coin Change": {
    family: "dp-min-cost",
    state: "dp[i] = fewest coins summing to i (∞ if unreachable)",
    transition: "dp[i] = min(dp[i - c] + 1) over every coin c <= i",
    deps: "dp[i - c] for every coin c",
  },
  "Maximum Product Subarray": {
    family: "dp-multistate",
    state: "cur_max/cur_min = max/min product of a subarray ending at the current index",
    transition: "cur_max, cur_min = max(n, n*cur_max, n*cur_min), min(n, n*cur_max, n*cur_min) — track both because a negative n flips them",
    deps: "cur_max, cur_min from the previous index",
  },
  "Maximum Length of Repeated Subarray": {
    family: "dp-subsequence",
    state: "dp[i][j] = length of the common run ending exactly at nums1[i-1] and nums2[j-1]",
    transition: "dp[i][j] = dp[i-1][j-1] + 1 if nums1[i-1] == nums2[j-1], else 0",
    deps: "dp[i-1][j-1]",
  },
  "Longest Increasing Subsequence": {
    family: "dp-subsequence",
    state: "sub = smallest tail value achievable for an increasing subsequence of each length seen so far",
    transition: "binary-search num's insertion point in sub; extend sub if num is a new largest tail, else overwrite that slot",
    deps: "the whole `sub` array built so far (patience-sorting form of the dp[i] = 1 + max(dp[j]) recurrence)",
  },
  "Longest Common Subsequence": {
    family: "dp-subsequence",
    state: "dp[i][j] = LCS length of text1[:i] and text2[:j]",
    transition: "dp[i][j] = dp[i-1][j-1] + 1 if text1[i-1] == text2[j-1], else max(dp[i-1][j], dp[i][j-1])",
    deps: "dp[i-1][j-1], dp[i-1][j], dp[i][j-1]",
  },
  "Edit Distance": {
    family: "dp-subsequence",
    state: "dp[j] = edit distance between word1[:i] and word2[:j] (rolling 1D row over i)",
    transition: "dp[j] = prev (diagonal) if word1[i-1] == word2[j-1], else 1 + min(prev, dp[j], dp[j-1])",
    deps: "prev (diagonal dp[i-1][j-1]), dp[j] (up), dp[j-1] (left)",
  },
  "Word Break": {
    family: "dp-string",
    state: "dp[i] = whether s[:i] can be segmented into dictionary words",
    transition: "dp[i] = true if dp[j] is true and s[j:i] is in the dictionary, for some j < i",
    deps: "dp[j] for every j < i",
  },
  "Longest Palindromic Subsequence": {
    family: "dp-string",
    state: "dp[i][j] = longest palindromic subsequence length within s[i..j]",
    transition: "dp[i][j] = dp[i+1][j-1] + 2 if s[i] == s[j], else max(dp[i+1][j], dp[i][j-1])",
    deps: "dp[i+1][j-1], dp[i+1][j], dp[i][j-1]",
  },
  "Best Time to Buy and Sell Stock With Cooldown": {
    family: "dp-multistate",
    state: "three running states per day: hold / sold / cooldown = max profit ending that day in that state",
    transition: "hold = max(hold, cooldown-price); sold = hold+price; cooldown = max(cooldown, sold)",
    deps: "prior day's hold, sold, cooldown",
  },
  "Interleaving String": {
    family: "dp-string",
    state: "dp[i][j] = can s3[0..i+j) be formed by interleaving s1[0..i) and s2[0..j)",
    transition: "dp[i][j] = (dp[i-1][j] && s1[i-1]==s3[i+j-1]) || (dp[i][j-1] && s2[j-1]==s3[i+j-1])",
    deps: "dp[i-1][j], dp[i][j-1]",
  },
  "Longest Increasing Path In a Matrix": {
    family: "dp-subsequence",
    state: "memo[r][c] = length of longest strictly increasing path starting at cell (r,c)",
    transition: "memo[r][c] = 1 + max(memo of orthogonal neighbors with a greater value)",
    deps: "memoized DFS into the 4 greater-valued neighbors",
  },
  "Burst Balloons": {
    family: "dp-string",
    state: "dp[l][r] = max coins from bursting every balloon strictly inside the open interval (l, r)",
    transition: "dp[l][r] = max over k in (l,r) of dp[l][k] + nums[l]*nums[k]*nums[r] + dp[k][r]  (k burst last)",
    deps: "shorter intervals dp[l][k], dp[k][r]",
  },
  "Regular Expression Matching": {
    family: "dp-string",
    state: "dp[i][j] = does s[0..i) match pattern p[0..j)",
    transition: "on '*': skip x* → dp[i][j-2], or consume if p[j-2] matches s[i-1] → dp[i-1][j]; else single char/'.' match → dp[i-1][j-1]",
    deps: "dp[i-1][j], dp[i][j-1], dp[i][j-2]",
  },
  "Distinct Subsequences": {
    family: "dp-subsequence",
    state: "dp[i][j] = number of subsequences of s[0..i) that equal t[0..j)",
    transition: "dp[i][j] = dp[i-1][j] + (s[i-1]==t[j-1] ? dp[i-1][j-1] : 0)",
    deps: "dp[i-1][j], dp[i-1][j-1]",
  },
  "Longest Palindromic Substring": {
    family: "expand-around-center",
    state: "the widest palindrome found so far, expanding outward from each center (i,i) and (i,i+1) — DP's O(n²) table is a detour here",
    transition: "grow left/right from a center while s[left] == s[right]; keep the longest span seen",
    deps: "none (each center expands independently; no shared table)",
  },
  "Palindromic Substrings": {
    family: "expand-around-center",
    state: "count = total palindromic substrings found so far, expanding outward from each center — DP's O(n²) table is a detour here",
    transition: "for each center (i,i) and (i,i+1), count += 1 for every step s[left] == s[right] holds",
    deps: "none (each center expands independently; no shared table)",
  },
};

/** Resolve a kata's DP family from its tags, or null if untagged. */
export function dpFamilyFor(kata: Pick<Kata | SeedKata, "name" | "tags">): DpFamily | null {
  // Source of truth is the pattern map (keyed by name), NOT the DB tags column:
  // seedMissingKatas never updates tags on already-seeded rows, so an existing
  // DB's DP katas may lack the family tag. Fall back to the tag for anything not
  // in the map (e.g. custom katas).
  const fromPattern = DP_PATTERNS[kata.name]?.family;
  if (fromPattern) return fromPattern;
  const tag = kata.tags.find((t) => DP_FAMILY_IDS.has(t));
  return (tag as DpFamily | undefined) ?? null;
}

/** Resolve a kata's DP pattern (state/transition/deps), or null if it has none. */
export function dpPatternFor(kata: Pick<Kata | SeedKata, "name">): DpPattern | null {
  return DP_PATTERNS[kata.name] ?? null;
}
