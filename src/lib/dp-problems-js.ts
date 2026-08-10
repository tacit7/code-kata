import type { SeedKata } from "../types/editor";

const kata = (
  name: string,
  category: string,
  fn: string,
  params: string,
  description: string,
  testCode: string,
  solution: string,
  tags: string[]
): SeedKata => ({
  name,
  category,
  language: "javascript",
  difficulty: "medium",
  description,
  code: `function ${fn}(${params}) {
  // your code here
}`,
  testCode,
  solution,
  usage: null,
  tags: ["dynamic-programming", "dp", ...tags],
});

export const dpProblemsJs: SeedKata[] = [
  kata("Segment a Number String", "1-d-dp", "canSegmentNumberString", "s, chunks", "Return whether s can be segmented into allowed chunks.", `function test_true() { assertEqual(canSegmentNumberString("1234", ["12", "34"]), true); }
function test_false() { assertEqual(canSegmentNumberString("1234", ["1", "23"]), false); }`, `function canSegmentNumberString(s, chunks) {
  const allowed = new Set(chunks), dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) for (const chunk of allowed) {
    const start = i - chunk.length;
    if (start >= 0 && dp[start] && s.slice(start, i) === chunk) dp[i] = true;
  }
  return dp[s.length];
}`, ["string-dp", "pre-leetcode"]),
  kata("Min Cost Climbing Stairs", "1-d-dp", "minCostClimbingStairs", "cost", "Return the minimum cost to reach the top of the staircase.", `function test_basic() { assertEqual(minCostClimbingStairs([10,15,20]), 15); }
function test_longer() { assertEqual(minCostClimbingStairs([1,100,1,1,1,100,1,1,100,1]), 6); }`, `function minCostClimbingStairs(cost) {
  let downTwo = 0, downOne = 0;
  for (const c of cost) [downTwo, downOne] = [downOne, c + Math.min(downOne, downTwo)];
  return Math.min(downOne, downTwo);
}`, ["1d-sequence-dp", "neetcode"]),
  kata("House Robber", "1-d-dp", "rob", "nums", "Return the maximum money you can rob without robbing adjacent houses.", `function test_basic() { assertEqual(rob([1,2,3,1]), 4); }
function test_second() { assertEqual(rob([2,7,9,3,1]), 12); }`, `function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const n of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + n)];
  return prev1;
}`, ["1d-sequence-dp", "blind75", "neetcode"]),
  kata("House Robber II", "1-d-dp", "robCircle", "nums", "House Robber where houses are arranged in a circle.", `function test_three() { assertEqual(robCircle([2,3,2]), 3); }
function test_four() { assertEqual(robCircle([1,2,3,1]), 4); }`, `function robCircle(nums) {
  if (nums.length === 1) return nums[0];
  const robLine = (arr) => arr.reduce(([a, b], n) => [b, Math.max(b, a + n)], [0, 0])[1];
  return Math.max(robLine(nums.slice(1)), robLine(nums.slice(0, -1)));
}`, ["1d-sequence-dp", "blind75", "neetcode"]),
  kata("Delete and Earn", "1-d-dp", "deleteAndEarn", "nums", "Choose a number to earn its value and delete all adjacent values.", `function test_basic() { assertEqual(deleteAndEarn([3,4,2]), 6); }
function test_second() { assertEqual(deleteAndEarn([2,2,3,3,3,4]), 9); }`, `function deleteAndEarn(nums) {
  const points = new Map();
  for (const n of nums) points.set(n, (points.get(n) ?? 0) + n);
  const values = [...points.keys()].sort((a, b) => a - b);
  let avoid = 0, using = 0, prev = -Infinity;
  for (const v of values) {
    const best = Math.max(avoid, using);
    if (v === prev + 1) [avoid, using] = [best, avoid + points.get(v)];
    else [avoid, using] = [best, best + points.get(v)];
    prev = v;
  }
  return Math.max(avoid, using);
}`, ["1d-sequence-dp"]),
  kata("Unique Paths", "2-d-dp", "uniquePaths", "m, n", "Count paths through an m x n grid moving only down or right.", `function test_small() { assertEqual(uniquePaths(3, 7), 28); }
function test_square() { assertEqual(uniquePaths(3, 3), 6); }`, `function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
  return dp[m - 1][n - 1];
}`, ["grid-dp", "blind75"]),
  kata("Unique Paths II", "2-d-dp", "uniquePathsWithObstacles", "grid", "Count paths through a grid with blocked cells marked as 1.", `function test_basic() { assertEqual(uniquePathsWithObstacles([[0,0,0],[0,1,0],[0,0,0]]), 2); }
function test_blocked_start() { assertEqual(uniquePathsWithObstacles([[1]]), 0); }`, `function uniquePathsWithObstacles(grid) {
  const m = grid.length, n = grid[0].length, dp = new Array(n).fill(0);
  dp[0] = grid[0][0] === 0 ? 1 : 0;
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
    if (grid[r][c] === 1) dp[c] = 0;
    else if (c > 0) dp[c] += dp[c - 1];
  }
  return dp[n - 1];
}`, ["grid-dp"]),
  kata("Minimum Path Sum", "2-d-dp", "minPathSum", "grid", "Return the minimum path sum from top-left to bottom-right.", `function test_basic() { assertEqual(minPathSum([[1,3,1],[1,5,1],[4,2,1]]), 7); }
function test_row() { assertEqual(minPathSum([[1,2,3]]), 6); }`, `function minPathSum(grid) {
  const m = grid.length, n = grid[0].length, dp = new Array(n).fill(Infinity);
  dp[0] = 0;
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) dp[c] = grid[r][c] + Math.min(dp[c], c > 0 ? dp[c - 1] : Infinity);
  return dp[n - 1];
}`, ["grid-dp", "dp-min-cost"]),
  kata("Subset Sum", "1-d-dp", "subsetSum", "nums, target", "Return whether some subset of nums sums exactly to target. Each value may be used at most once.", `function test_true() { assertEqual(subsetSum([3, 4, 5, 2], 9), true); }
function test_false() { assertEqual(subsetSum([2, 4, 6], 5), false); }
function test_zero() { assertEqual(subsetSum([7, 8], 0), true); }`, `function subsetSum(nums, target) {
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const n of nums) {
    for (let sum = target; sum >= n; sum--) dp[sum] ||= dp[sum - n];
  }
  return dp[target];
}`, ["0-1-knapsack", "pre-leetcode"]),
  kata("Triangle", "2-d-dp", "minimumTotal", "triangle", "Return the minimum path sum from top to bottom of a triangle.", `function test_basic() { assertEqual(minimumTotal([[2],[3,4],[6,5,7],[4,1,8,3]]), 11); }
function test_single() { assertEqual(minimumTotal([[-10]]), -10); }`, `function minimumTotal(triangle) {
  const dp = triangle[triangle.length - 1].slice();
  for (let r = triangle.length - 2; r >= 0; r--) for (let c = 0; c < triangle[r].length; c++) dp[c] = triangle[r][c] + Math.min(dp[c], dp[c + 1]);
  return dp[0];
}`, ["grid-dp"]),
  kata("Partition Equal Subset Sum", "1-d-dp", "canPartition", "nums", "Return whether nums can be split into two subsets with equal sum.", `function test_true() { assertEqual(canPartition([1,5,11,5]), true); }
function test_false() { assertEqual(canPartition([1,2,3,5]), false); }`, `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2, dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const n of nums) for (let s = target; s >= n; s--) dp[s] ||= dp[s - n];
  return dp[target];
}`, ["0-1-knapsack", "neetcode"]),
  kata("0/1 Knapsack", "1-d-dp", "knapsack01", "weights, values, capacity", "Return max value with each item usable at most once.", `function test_basic() { assertEqual(knapsack01([2,3,4], [4,5,6], 5), 9); }
function test_zero() { assertEqual(knapsack01([1], [10], 0), 0); }`, `function knapsack01(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) for (let c = capacity; c >= weights[i]; c--) dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
  return dp[capacity];
}`, ["0-1-knapsack"]),
  kata("Count Subsets That Sum to Target", "1-d-dp", "countSubsetsThatSumToTarget", "nums, target", "Count how many subsets of nums sum exactly to target. Each index is a separate choice, even when values repeat.", `function test_basic() { assertEqual(countSubsetsThatSumToTarget([1, 2, 3, 3], 6), 3); }
function test_repeated_values() { assertEqual(countSubsetsThatSumToTarget([1, 1, 1], 2), 3); }
function test_zero() { assertEqual(countSubsetsThatSumToTarget([4, 5], 0), 1); }`, `function countSubsetsThatSumToTarget(nums, target) {
  const dp = new Array(target + 1).fill(0);
  dp[0] = 1;
  for (const n of nums) {
    for (let sum = target; sum >= n; sum--) dp[sum] += dp[sum - n];
  }
  return dp[target];
}`, ["0-1-knapsack", "dp-counting", "pre-leetcode"]),
  kata("Target Sum", "1-d-dp", "findTargetSumWays", "nums, target", "Count ways to assign + or - before each number to reach target.", `function test_basic() { assertEqual(findTargetSumWays([1,1,1,1,1], 3), 5); }
function test_single() { assertEqual(findTargetSumWays([1], 1), 1); }`, `function findTargetSumWays(nums, target) {
  let dp = new Map([[0, 1]]);
  for (const n of nums) {
    const next = new Map();
    for (const [sum, count] of dp) {
      next.set(sum + n, (next.get(sum + n) ?? 0) + count);
      next.set(sum - n, (next.get(sum - n) ?? 0) + count);
    }
    dp = next;
  }
  return dp.get(target) ?? 0;
}`, ["0-1-knapsack"]),
  kata("Combination Sum IV", "1-d-dp", "combinationSum4", "nums, target", "Count ordered combinations that sum to target.", `function test_basic() { assertEqual(combinationSum4([1,2,3], 4), 7); }
function test_none() { assertEqual(combinationSum4([9], 3), 0); }`, `function combinationSum4(nums, target) {
  const dp = new Array(target + 1).fill(0);
  dp[0] = 1;
  for (let total = 1; total <= target; total++) for (const n of nums) if (n <= total) dp[total] += dp[total - n];
  return dp[target];
}`, ["unbounded-knapsack"]),
  kata("Coin Change II", "1-d-dp", "change", "amount, coins", "Count unordered combinations of coins that make amount.", `function test_basic() { assertEqual(change(5, [1,2,5]), 4); }
function test_zero() { assertEqual(change(0, [1,2]), 1); }`, `function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) for (let a = coin; a <= amount; a++) dp[a] += dp[a - coin];
  return dp[amount];
}`, ["unbounded-knapsack"]),
  kata("Coin Change", "1-d-dp", "coinChange", "coins, amount", "Return the fewest coins needed to make amount, or -1.", `function test_basic() { assertEqual(coinChange([1,2,5], 11), 3); }
function test_impossible() { assertEqual(coinChange([2], 3), -1); }`, `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) for (const coin of coins) if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}`, ["unbounded-knapsack", "blind75", "neetcode"]),
  kata("Perfect Squares", "1-d-dp", "numSquares", "n", "Return the fewest perfect squares that sum to n.", `function test_twelve() { assertEqual(numSquares(12), 3); }
function test_thirteen() { assertEqual(numSquares(13), 2); }`, `function numSquares(n) {
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= n; i++) for (let s = 1; s * s <= i; s++) dp[i] = Math.min(dp[i], dp[i - s * s] + 1);
  return dp[n];
}`, ["unbounded-knapsack", "dp-min-cost"]),
  kata("Unbounded Knapsack", "1-d-dp", "unboundedKnapsack", "weights, values, capacity", "Return max value when each item can be reused.", `function test_basic() { assertEqual(unboundedKnapsack([2,3], [4,5], 7), 13); }
function test_zero() { assertEqual(unboundedKnapsack([1], [3], 0), 0); }`, `function unboundedKnapsack(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) for (let c = weights[i]; c <= capacity; c++) dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
  return dp[capacity];
}`, ["unbounded-knapsack"]),
  kata("Decode Ways", "1-d-dp", "numDecodings", "s", "Count ways to decode a digit string where 1=A through 26=Z.", `function test_basic() { assertEqual(numDecodings("12"), 2); }
function test_zero() { assertEqual(numDecodings("06"), 0); }`, `function numDecodings(s) {
  if (!s || s[0] === "0") return 0;
  let prev2 = 1, prev1 = 1;
  for (let i = 2; i <= s.length; i++) {
    let curr = s[i - 1] !== "0" ? prev1 : 0;
    const two = Number(s.slice(i - 2, i));
    if (two >= 10 && two <= 26) curr += prev2;
    [prev2, prev1] = [prev1, curr];
  }
  return prev1;
}`, ["string-dp", "blind75", "neetcode"]),
  kata("Edit Distance", "2-d-dp", "minDistance", "word1, word2", "Return the minimum insert/delete/replace edits from word1 to word2.", `function test_basic() { assertEqual(minDistance("horse", "ros"), 3); }
function test_second() { assertEqual(minDistance("intention", "execution"), 5); }`, `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = word1[i - 1] === word2[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}`, ["string-dp"]),
  kata("Interleaving String", "2-d-dp", "isInterleave", "s1, s2, s3", "Return whether s3 is formed by interleaving s1 and s2.", `function test_true() { assertEqual(isInterleave("aabcc", "dbbca", "aadbbcbcac"), true); }
function test_false() { assertEqual(isInterleave("aabcc", "dbbca", "aadbbbaccc"), false); }`, `function isInterleave(s1, s2, s3) {
  if (s1.length + s2.length !== s3.length) return false;
  const dp = Array.from({ length: s1.length + 1 }, () => new Array(s2.length + 1).fill(false));
  dp[0][0] = true;
  for (let i = 0; i <= s1.length; i++) for (let j = 0; j <= s2.length; j++) {
    if (i > 0) dp[i][j] ||= dp[i - 1][j] && s1[i - 1] === s3[i + j - 1];
    if (j > 0) dp[i][j] ||= dp[i][j - 1] && s2[j - 1] === s3[i + j - 1];
  }
  return dp[s1.length][s2.length];
}`, ["string-dp"]),
  kata("Word Break", "1-d-dp", "wordBreak", "s, wordDict", "Return whether s can be segmented into dictionary words.", `function test_true() { assertEqual(wordBreak("leetcode", ["leet","code"]), true); }
function test_false() { assertEqual(wordBreak("catsandog", ["cats","dog","sand","and","cat"]), false); }`, `function wordBreak(s, wordDict) {
  const words = new Set(wordDict), dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) for (let j = 0; j < i; j++) if (dp[j] && words.has(s.slice(j, i))) dp[i] = true;
  return dp[s.length];
}`, ["dfs-memo", "string-dp", "blind75", "neetcode"]),
  kata("Regular Expression Matching", "2-d-dp", "isMatch", "s, p", "Return whether s matches pattern p with '.' and '*'.", `function test_true() { assertEqual(isMatch("aab", "c*a*b"), true); }
function test_false() { assertEqual(isMatch("mississippi", "mis*is*p*."), false); }`, `function isMatch(s, p) {
  const dp = Array.from({ length: s.length + 1 }, () => new Array(p.length + 1).fill(false));
  dp[0][0] = true;
  for (let j = 2; j <= p.length; j++) if (p[j - 1] === "*") dp[0][j] = dp[0][j - 2];
  for (let i = 1; i <= s.length; i++) for (let j = 1; j <= p.length; j++) {
    if (p[j - 1] === "." || p[j - 1] === s[i - 1]) dp[i][j] = dp[i - 1][j - 1];
    else if (p[j - 1] === "*") dp[i][j] = dp[i][j - 2] || ((p[j - 2] === "." || p[j - 2] === s[i - 1]) && dp[i - 1][j]);
  }
  return dp[s.length][p.length];
}`, ["string-dp"]),
  kata("Maximum Length of Repeated Subarray", "2-d-dp", "findLength", "nums1, nums2", "Return the length of the longest common contiguous subarray.", `function test_basic() { assertEqual(findLength([1,2,3,2,1], [3,2,1,4,7]), 3); }
function test_none() { assertEqual(findLength([1,2], [3,4]), 0); }`, `function findLength(nums1, nums2) {
  const dp = new Array(nums2.length + 1).fill(0);
  let best = 0;
  for (let i = 1; i <= nums1.length; i++) {
    const next = new Array(nums2.length + 1).fill(0);
    for (let j = 1; j <= nums2.length; j++) if (nums1[i - 1] === nums2[j - 1]) best = Math.max(best, next[j] = dp[j - 1] + 1);
    for (let j = 0; j < next.length; j++) dp[j] = next[j];
  }
  return best;
}`, ["subsequence-dp", "array"]),
  kata("LIS Length Ending at Each Index", "1-d-dp", "lisLengthsEndingAtEachIndex", "nums", "Return an array where each position stores the length of the longest strictly increasing subsequence that must end at that index.", `function test_basic() { assertEqual(lisLengthsEndingAtEachIndex([1, 3, 2, 4]), [1, 2, 2, 3]); }
function test_decreasing() { assertEqual(lisLengthsEndingAtEachIndex([5, 4, 3]), [1, 1, 1]); }
function test_empty() { assertEqual(lisLengthsEndingAtEachIndex([]), []); }`, `function lisLengthsEndingAtEachIndex(nums) {
  const dp = new Array(nums.length).fill(1);
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return dp;
}`, ["lis-chain-dp", "subsequence-dp", "pre-leetcode"]),
  kata("Longest Increasing Subsequence", "1-d-dp", "lengthOfLIS", "nums", "Return the length of the longest strictly increasing subsequence.", `function test_basic() { assertEqual(lengthOfLIS([10,9,2,5,3,7,101,18]), 4); }
function test_same() { assertEqual(lengthOfLIS([7,7,7]), 1); }`, `function lengthOfLIS(nums) {
  const tails = [];
  for (const n of nums) {
    let l = 0, r = tails.length;
    while (l < r) {
      const m = Math.floor((l + r) / 2);
      if (tails[m] < n) l = m + 1; else r = m;
    }
    tails[l] = n;
  }
  return tails.length;
}`, ["subsequence-dp", "binary-search", "blind75", "neetcode"]),
  kata("Distinct Subsequences", "2-d-dp", "numDistinct", "s, t", "Count subsequences of s equal to t.", `function test_basic() { assertEqual(numDistinct("rabbbit", "rabbit"), 3); }
function test_second() { assertEqual(numDistinct("babgbag", "bag"), 5); }`, `function numDistinct(s, t) {
  const dp = new Array(t.length + 1).fill(0);
  dp[0] = 1;
  for (const ch of s) for (let j = t.length; j >= 1; j--) if (ch === t[j - 1]) dp[j] += dp[j - 1];
  return dp[t.length];
}`, ["subsequence-dp"]),
  kata("Longest Palindromic Subsequence", "2-d-dp", "longestPalindromeSubseq", "s", "Return the length of the longest palindromic subsequence.", `function test_basic() { assertEqual(longestPalindromeSubseq("bbbab"), 4); }
function test_second() { assertEqual(longestPalindromeSubseq("cbbd"), 2); }`, `function longestPalindromeSubseq(s) {
  const n = s.length, dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) dp[i][j] = s[i] === s[j] ? 2 + dp[i + 1][j - 1] : Math.max(dp[i + 1][j], dp[i][j - 1]);
  }
  return dp[0][n - 1];
}`, ["interval-dp", "string"]),
  kata("Burst Balloons", "2-d-dp", "maxCoins", "nums", "Return max coins from bursting balloons; model the last balloon inside each interval.", `function test_basic() { assertEqual(maxCoins([3,1,5,8]), 167); }
function test_ones() { assertEqual(maxCoins([1,1,1]), 3); }`, `function maxCoins(nums) {
  const arr = [1, ...nums, 1], n = arr.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len < n; len++) for (let left = 0; left + len < n; left++) {
    const right = left + len;
    for (let k = left + 1; k < right; k++) dp[left][right] = Math.max(dp[left][right], dp[left][k] + arr[left] * arr[k] * arr[right] + dp[k][right]);
  }
  return dp[0][n - 1];
}`, ["interval-dp"]),
  kata("Maximum Product Subarray", "1-d-dp", "maxProduct", "nums", "Return the maximum product of a contiguous subarray.", `function test_basic() { assertEqual(maxProduct([2,3,-2,4]), 6); }
function test_zero() { assertEqual(maxProduct([-2,0,-1]), 0); }`, `function maxProduct(nums) {
  let best = nums[0], maxEnding = nums[0], minEnding = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const n = nums[i], a = maxEnding * n, b = minEnding * n;
    maxEnding = Math.max(n, a, b);
    minEnding = Math.min(n, a, b);
    best = Math.max(best, maxEnding);
  }
  return best;
}`, ["state-machine-dp", "blind75", "neetcode"]),
  kata("Best Time to Buy and Sell Stock With Cooldown", "1-d-dp", "maxProfitCooldown", "prices", "Return max stock profit with one-day cooldown after selling.", `function test_basic() { assertEqual(maxProfitCooldown([1,2,3,0,2]), 3); }
function test_single() { assertEqual(maxProfitCooldown([1]), 0); }`, `function maxProfitCooldown(prices) {
  let hold = -Infinity, sold = 0, rest = 0;
  for (const price of prices) {
    const prevSold = sold;
    sold = hold + price;
    hold = Math.max(hold, rest - price);
    rest = Math.max(rest, prevSold);
  }
  return Math.max(sold, rest);
}`, ["state-machine-dp"]),
  kata("Count Paths in a DAG", "1-d-dp", "countPathsInDag", "graph, start, target", "Given a directed acyclic graph as an adjacency list, count paths from start to target using memoized DFS.", `function test_branching() { assertEqual(countPathsInDag([[1,2],[3],[3],[]], 0, 3), 2); }
function test_shared_tail() { assertEqual(countPathsInDag([[1,2],[2,3],[3],[]], 0, 3), 3); }
function test_same_node() { assertEqual(countPathsInDag([[]], 0, 0), 1); }`, `function countPathsInDag(graph, start, target) {
  const memo = new Map();
  function dfs(node) {
    if (node === target) return 1;
    if (memo.has(node)) return memo.get(node);
    let total = 0;
    for (const next of graph[node]) total += dfs(next);
    memo.set(node, total);
    return total;
  }
  return dfs(start);
}`, ["dfs-memo", "graph", "dp-counting", "pre-leetcode"]),
  kata("Longest Increasing Path In a Matrix", "2-d-dp", "longestIncreasingPath", "matrix", "Return the longest strictly increasing path length in a matrix.", `function test_basic() { assertEqual(longestIncreasingPath([[9,9,4],[6,6,8],[2,1,1]]), 4); }
function test_single() { assertEqual(longestIncreasingPath([[1]]), 1); }`, `function longestIncreasingPath(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const memo = Array.from({ length: rows }, () => new Array(cols).fill(0));
  function dfs(r, c) {
    if (memo[r][c]) return memo[r][c];
    let best = 1;
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) best = Math.max(best, 1 + dfs(nr, nc));
    }
    return memo[r][c] = best;
  }
  let answer = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) answer = Math.max(answer, dfs(r, c));
  return answer;
}`, ["dfs-memo", "grid-dp"]),
  kata("Minimum Worker-Job Assignment Cost", "1-d-dp", "minWorkerJobAssignmentCost", "costs", "Assign each worker to a different job and return the minimum total cost. costs[worker][job] gives the cost of one assignment.", `function test_basic() { assertEqual(minWorkerJobAssignmentCost([[9,2,7],[6,4,3],[5,8,1]]), 9); }
function test_two_workers() { assertEqual(minWorkerJobAssignmentCost([[5,1],[2,4]]), 3); }
function test_single() { assertEqual(minWorkerJobAssignmentCost([[6]]), 6); }`, `function minWorkerJobAssignmentCost(costs) {
  const n = costs.length;
  const fullMask = 1 << n;
  const dp = new Array(fullMask).fill(Infinity);
  dp[0] = 0;
  for (let mask = 0; mask < fullMask; mask++) {
    const worker = countBits(mask);
    if (worker >= n) continue;
    for (let job = 0; job < n; job++) {
      if ((mask & (1 << job)) === 0) {
        const nextMask = mask | (1 << job);
        dp[nextMask] = Math.min(dp[nextMask], dp[mask] + costs[worker][job]);
      }
    }
  }
  return dp[fullMask - 1];
}

function countBits(mask) {
  let count = 0;
  while (mask > 0) {
    count += mask & 1;
    mask >>= 1;
  }
  return count;
}`, ["bitmask-dp", "dp-min-cost", "pre-leetcode"]),
  kata("Longest Palindromic Substring", "1-d-dp", "longestPalindrome", "s", "Return the longest palindromic substring.", `function test_basic() { assertEqual(["bab","aba"].includes(longestPalindrome("babad")), true); }
function test_even() { assertEqual(longestPalindrome("cbbd"), "bb"); }`, `function longestPalindrome(s) {
  let start = 0, end = 0;
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    if (r - l - 2 > end - start) { start = l + 1; end = r - 1; }
  }
  for (let i = 0; i < s.length; i++) { expand(i, i); expand(i, i + 1); }
  return s.slice(start, end + 1);
}`, ["expand-around-center", "blind75", "neetcode"]),
  kata("Palindromic Substrings", "1-d-dp", "countSubstrings", "s", "Count palindromic substrings.", `function test_basic() { assertEqual(countSubstrings("abc"), 3); }
function test_repeated() { assertEqual(countSubstrings("aaa"), 6); }`, `function countSubstrings(s) {
  let count = 0;
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) { count++; l--; r++; }
  }
  for (let i = 0; i < s.length; i++) { expand(i, i); expand(i, i + 1); }
  return count;
}`, ["expand-around-center", "blind75", "neetcode"]),
];
