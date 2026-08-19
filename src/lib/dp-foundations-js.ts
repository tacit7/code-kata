import type { SeedKata } from "../types/editor";

const jsDp = (
  name: string,
  category: string,
  description: string,
  code: string,
  testCode: string,
  solution: string,
  tags: string[] = [],
  difficulty: SeedKata["difficulty"] = "easy"
): SeedKata => ({
  name,
  category,
  language: "javascript",
  difficulty,
  description,
  code,
  testCode,
  solution,
  usage: null,
  tags: ["dynamic-programming", "dp", ...tags],
});

export const dpFoundationsJs: SeedKata[] = [
  jsDp(
    "Sum from 1 to n",
    "1-d-dp",
    "Given n, return the sum 1 + 2 + ... + n. DP framing: dp[i] = dp[i - 1] + i.",
    `function sumToN(n) {
  // your code here
}`,
    `function test_small() { assertEqual(sumToN(5), 15); }
function test_zero() { assertEqual(sumToN(0), 0); }
function test_one() { assertEqual(sumToN(1), 1); }`,
    `function sumToN(n) {
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) dp[i] = dp[i - 1] + i;
  return dp[n];
}`,
    ["dp-basic", "pre-leetcode"]
  ),
  jsDp(
    "Running Total",
    "1-d-dp",
    "Given an array, return an array where each position is the sum up to that position. DP framing: dp[i] = dp[i - 1] + nums[i].",
    `function runningTotal(nums) {
  // your code here
}`,
    `function test_basic() { assertEqual(runningTotal([1, 2, 3]), [1, 3, 6]); }
function test_negatives() { assertEqual(runningTotal([3, -5, 4, 2]), [3, -2, 2, 4]); }
function test_empty() { assertEqual(runningTotal([]), []); }`,
    `function runningTotal(nums) {
  if (nums.length === 0) return [];
  const dp = new Array(nums.length);
  dp[0] = nums[0];
  for (let i = 1; i < nums.length; i++) dp[i] = dp[i - 1] + nums[i];
  return dp;
}`,
    ["dp-basic", "pre-leetcode"]
  ),
  jsDp(
    "Double-or-Add Sequence",
    "1-d-dp",
    "Return the nth value of a sequence where dp[0] = 1 and dp[i] = 2 * dp[i - 1] + 1.",
    `function doubleOrAdd(n) {
  // your code here
}`,
    `function test_zero() { assertEqual(doubleOrAdd(0), 1); }
function test_three() { assertEqual(doubleOrAdd(3), 15); }
function test_five() { assertEqual(doubleOrAdd(5), 63); }`,
    `function doubleOrAdd(n) {
  let value = 1;
  for (let i = 1; i <= n; i++) value = 2 * value + 1;
  return value;
}`,
    ["dp-basic", "pre-leetcode"]
  ),
  jsDp(
    "Two-Step Number Sequence",
    "1-d-dp",
    "Return sequence[n] where sequence[0] = 2, sequence[1] = 3, and sequence[i] = sequence[i - 1] + sequence[i - 2].",
    `function twoStepSequence(n) {
  // your code here
}`,
    `function test_zero() { assertEqual(twoStepSequence(0), 2); }
function test_one() { assertEqual(twoStepSequence(1), 3); }
function test_five() { assertEqual(twoStepSequence(5), 21); }`,
    `function twoStepSequence(n) {
  if (n === 0) return 2;
  if (n === 1) return 3;
  let prev2 = 2, prev1 = 3;
  for (let i = 2; i <= n; i++) [prev2, prev1] = [prev1, prev1 + prev2];
  return prev1;
}`,
    ["dp-basic", "pre-leetcode"]
  ),
  jsDp(
    "Move Through a Hallway",
    "1-d-dp",
    "Count ways to reach position n when each move is 1 or 2 positions. DP framing: dp[i] = dp[i - 1] + dp[i - 2].",
    `function hallwayWays(n) {
  // your code here
}`,
    `function test_zero() { assertEqual(hallwayWays(0), 1); }
function test_two() { assertEqual(hallwayWays(2), 2); }
function test_five() { assertEqual(hallwayWays(5), 8); }`,
    `function hallwayWays(n) {
  if (n <= 1) return 1;
  let prev2 = 1, prev1 = 1;
  for (let i = 2; i <= n; i++) [prev2, prev1] = [prev1, prev1 + prev2];
  return prev1;
}`,
    ["dp-basic", "pre-leetcode"]
  ),
  jsDp(
    "Build a Strip With Tiles",
    "1-d-dp",
    "Count ways to tile a strip of length n using tiles of length 1 and 2.",
    `function tileStrip(n) {
  // your code here
}`,
    `function test_zero() { assertEqual(tileStrip(0), 1); }
function test_three() { assertEqual(tileStrip(3), 3); }
function test_five() { assertEqual(tileStrip(5), 8); }`,
    `function tileStrip(n) {
  if (n <= 1) return 1;
  let prev2 = 1, prev1 = 1;
  for (let i = 2; i <= n; i++) [prev2, prev1] = [prev1, prev1 + prev2];
  return prev1;
}`,
    ["dp-basic", "pre-leetcode"]
  ),
  jsDp(
    "Reach Target With 1, 2, or 3",
    "1-d-dp",
    "Count ordered ways to reach target n using jumps of 1, 2, or 3.",
    `function reachTarget(n) {
  // your code here
}`,
    `function test_zero() { assertEqual(reachTarget(0), 1); }
function test_three() { assertEqual(reachTarget(3), 4); }
function test_four() { assertEqual(reachTarget(4), 7); }`,
    `function reachTarget(n) {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    dp[i] += dp[i - 1] ?? 0;
    if (i >= 2) dp[i] += dp[i - 2];
    if (i >= 3) dp[i] += dp[i - 3];
  }
  return dp[n];
}`,
    ["dp-basic", "pre-leetcode"]
  ),
  jsDp(
    "Minimum Moves to Reach N",
    "1-d-dp",
    "Starting from 0, you may add 1, 3, or 5 on each move. Return the fewest moves needed to land exactly on n.",
    `function minMovesToReachN(n) {
  // your code here
}`,
    `function test_zero() { assertEqual(minMovesToReachN(0), 0); }
function test_two() { assertEqual(minMovesToReachN(2), 2); }
function test_seven() { assertEqual(minMovesToReachN(7), 3); }
function test_eleven() { assertEqual(minMovesToReachN(11), 3); }`,
    `function minMovesToReachN(n) {
  const moves = [1, 3, 5];
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;
  for (let total = 1; total <= n; total++) {
    for (const move of moves) {
      if (move <= total) dp[total] = Math.min(dp[total], dp[total - move] + 1);
    }
  }
  return dp[n];
}`,
    ["dp-basic", "dp-min-cost", "pre-leetcode"]
  ),
  jsDp(
    "Fibonacci Number",
    "1-d-dp",
    "Return the nth Fibonacci number, where fib(0)=0 and fib(1)=1.",
    `function fib(n) {
  // your code here
}`,
    `function test_zero() { assertEqual(fib(0), 0); }
function test_one() { assertEqual(fib(1), 1); }
function test_ten() { assertEqual(fib(10), 55); }`,
    `function fib(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
    ["dp-basic", "recursion"]
  ),
  jsDp(
    "Climbing Stairs (Recursive)",
    "1-d-dp",
    "Climbing Stairs with a memoized recursive framing.",
    `function climbStairs(n) {
  // your code here
}`,
    `function test_two() { assertEqual(climbStairs(2), 2); }
function test_three() { assertEqual(climbStairs(3), 3); }
function test_five() { assertEqual(climbStairs(5), 8); }`,
    `function climbStairs(n) {
  const memo = new Map([[1, 1], [2, 2]]);
  function ways(k) {
    if (!memo.has(k)) memo.set(k, ways(k - 1) + ways(k - 2));
    return memo.get(k);
  }
  return ways(n);
}`,
    ["dp-basic", "memoization", "recursion", "neetcode"]
  ),
  jsDp(
    "Climbing Stairs",
    "1-d-dp",
    "Climbing Stairs with an iterative O(1)-space DP framing.",
    `function climbStairs(n) {
  // your code here
}`,
    `function test_two() { assertEqual(climbStairs(2), 2); }
function test_four() { assertEqual(climbStairs(4), 5); }
function test_ten() { assertEqual(climbStairs(10), 89); }`,
    `function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) [prev2, prev1] = [prev1, prev1 + prev2];
  return prev1;
}`,
    ["dp-basic", "neetcode"]
  ),
  jsDp(
    "N-th Tribonacci Number",
    "1-d-dp",
    "Return tribonacci(n), where T0=0, T1=1, T2=1, and Tn=Tn-1+Tn-2+Tn-3.",
    `function tribonacci(n) {
  // your code here
}`,
    `function test_zero() { assertEqual(tribonacci(0), 0); }
function test_four() { assertEqual(tribonacci(4), 4); }
function test_twenty_five() { assertEqual(tribonacci(25), 1389537); }`,
    `function tribonacci(n) {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  let a = 0, b = 1, c = 1;
  for (let i = 3; i <= n; i++) [a, b, c] = [b, c, a + b + c];
  return c;
}`,
    ["dp-basic", "recursion"]
  ),
  jsDp(
    "Longest Repeated-Character Run",
    "1-d-dp",
    "Return the length of the longest contiguous run of equal characters.",
    `function longestRepeatedCharRun(s) {
  // your code here
}`,
    `function test_basic() { assertEqual(longestRepeatedCharRun("aaabbcdddd"), 4); }
function test_empty() { assertEqual(longestRepeatedCharRun(""), 0); }
function test_single() { assertEqual(longestRepeatedCharRun("x"), 1); }`,
    `function longestRepeatedCharRun(s) {
  if (s.length === 0) return 0;
  let current = 1, best = 1;
  for (let i = 1; i < s.length; i++) {
    current = s[i] === s[i - 1] ? current + 1 : 1;
    best = Math.max(best, current);
  }
  return best;
}`,
    ["1d-sequence-dp", "pre-leetcode"]
  ),
  jsDp(
    "Longest Increasing Run",
    "1-d-dp",
    "Return the length of the longest contiguous strictly increasing run.",
    `function longestIncreasingRun(nums) {
  // your code here
}`,
    `function test_basic() { assertEqual(longestIncreasingRun([1, 2, 2, 3, 4, 1]), 3); }
function test_empty() { assertEqual(longestIncreasingRun([]), 0); }
function test_decreasing() { assertEqual(longestIncreasingRun([5, 4, 3]), 1); }`,
    `function longestIncreasingRun(nums) {
  if (nums.length === 0) return 0;
  let current = 1, best = 1;
  for (let i = 1; i < nums.length; i++) {
    current = nums[i] > nums[i - 1] ? current + 1 : 1;
    best = Math.max(best, current);
  }
  return best;
}`,
    ["1d-sequence-dp", "pre-leetcode"]
  ),
  jsDp(
    "Can the End Be Reached?",
    "1-d-dp",
    "Given booleans for allowed positions, return whether the end is reachable by moving 1 or 2 positions.",
    `function canReachEnd(allowed) {
  // your code here
}`,
    `function test_reachable() { assertEqual(canReachEnd([true, false, true, true]), true); }
function test_blocked() { assertEqual(canReachEnd([true, false, false]), false); }
function test_empty() { assertEqual(canReachEnd([]), false); }`,
    `function canReachEnd(allowed) {
  if (allowed.length === 0) return false;
  const dp = new Array(allowed.length).fill(false);
  dp[0] = allowed[0];
  for (let i = 1; i < allowed.length; i++) {
    dp[i] = allowed[i] && (dp[i - 1] || (i >= 2 && dp[i - 2]));
  }
  return dp[allowed.length - 1];
}`,
    ["1d-sequence-dp", "pre-leetcode"]
  ),
  jsDp(
    "Cheapest Walk Across Stones",
    "1-d-dp",
    "Given costs for stones, return the cheapest cost to land on the final stone when moving 1 or 2 stones at a time.",
    `function cheapestWalk(costs) {
  // your code here
}`,
    `function test_basic() { assertEqual(cheapestWalk([10, 15, 20]), 30); }
function test_choice() { assertEqual(cheapestWalk([1, 100, 1, 1]), 3); }
function test_empty() { assertEqual(cheapestWalk([]), 0); }`,
    `function cheapestWalk(costs) {
  if (costs.length === 0) return 0;
  if (costs.length === 1) return costs[0];
  const dp = [...costs];
  for (let i = 2; i < costs.length; i++) dp[i] = costs[i] + Math.min(dp[i - 1], dp[i - 2]);
  return dp[dp.length - 1];
}`,
    ["1d-sequence-dp", "pre-leetcode"]
  ),
  jsDp(
    "Maximum Points Without Adjacent Cards",
    "1-d-dp",
    "Choose card values for maximum points, but you cannot choose adjacent cards.",
    `function maxNonAdjacent(cards) {
  // your code here
}`,
    `function test_basic() { assertEqual(maxNonAdjacent([2, 7, 9, 3, 1]), 12); }
function test_empty() { assertEqual(maxNonAdjacent([]), 0); }
function test_pair() { assertEqual(maxNonAdjacent([5, 9]), 9); }`,
    `function maxNonAdjacent(cards) {
  if (cards.length === 0) return 0;
  if (cards.length === 1) return cards[0];
  let prev2 = cards[0], prev1 = Math.max(cards[0], cards[1]);
  for (let i = 2; i < cards.length; i++) [prev2, prev1] = [prev1, Math.max(prev1, cards[i] + prev2)];
  return prev1;
}`,
    ["1d-sequence-dp", "pre-leetcode"]
  ),
  jsDp(
    "Maximum Points With a One-Position Cooldown",
    "1-d-dp",
    "Choose points with a one-position cooldown after each chosen position.",
    `function maxPointsCooldown(points) {
  // your code here
}`,
    `function test_basic() { assertEqual(maxPointsCooldown([2, 7, 9, 3, 1]), 12); }
function test_empty() { assertEqual(maxPointsCooldown([]), 0); }
function test_pair() { assertEqual(maxPointsCooldown([4, 10]), 10); }`,
    `function maxPointsCooldown(points) {
  if (points.length === 0) return 0;
  if (points.length === 1) return points[0];
  let prev2 = points[0], prev1 = Math.max(points[0], points[1]);
  for (let i = 2; i < points.length; i++) [prev2, prev1] = [prev1, Math.max(prev1, points[i] + prev2)];
  return prev1;
}`,
    ["1d-sequence-dp", "pre-leetcode"]
  ),
  jsDp(
    "Maximum Sum With No Three Consecutive Values",
    "1-d-dp",
    "Choose values from nums to maximize the sum, but you may not choose three adjacent positions in a row.",
    `function maxSumNoThreeConsecutive(nums) {
  // your code here
}`,
    `function test_basic() { assertEqual(maxSumNoThreeConsecutive([3, 2, 5, 10, 7]), 22); }
function test_three_values() { assertEqual(maxSumNoThreeConsecutive([1, 2, 3]), 5); }
function test_four_values() { assertEqual(maxSumNoThreeConsecutive([5, 1, 1, 5]), 11); }
function test_empty() { assertEqual(maxSumNoThreeConsecutive([]), 0); }`,
    `function maxSumNoThreeConsecutive(nums) {
  const n = nums.length;
  if (n === 0) return 0;
  const dp = new Array(n).fill(0);
  dp[0] = Math.max(0, nums[0]);
  if (n >= 2) dp[1] = Math.max(dp[0], nums[1], nums[0] + nums[1], 0);
  for (let i = 2; i < n; i++) {
    dp[i] = Math.max(
      dp[i - 1],
      dp[i - 2] + nums[i],
      (i >= 3 ? dp[i - 3] : 0) + nums[i - 1] + nums[i],
      0
    );
  }
  return dp[n - 1];
}`,
    ["1d-sequence-dp", "pre-leetcode"]
  ),
  jsDp(
    "Cheapest Route Through Checkpoints",
    "1-d-dp",
    "Return the cheapest cost to reach the last checkpoint when each move advances one or two checkpoints.",
    `function cheapestRoute(costs) {
  // your code here
}`,
    `function test_basic() { assertEqual(cheapestRoute([1, 100, 1, 1, 1]), 3); }
function test_single() { assertEqual(cheapestRoute([5]), 5); }
function test_empty() { assertEqual(cheapestRoute([]), 0); }`,
    `function cheapestRoute(costs) {
  if (costs.length === 0) return 0;
  if (costs.length === 1) return costs[0];
  let prev2 = costs[0], prev1 = costs[1];
  for (let i = 2; i < costs.length; i++) [prev2, prev1] = [prev1, costs[i] + Math.min(prev1, prev2)];
  return prev1;
}`,
    ["1d-sequence-dp", "pre-leetcode"]
  ),
  jsDp(
    "Maximum Contiguous Sum Ending at Each Position",
    "1-d-dp",
    "Return the DP array where dp[i] is the maximum contiguous sum ending exactly at i.",
    `function maxEndingSums(nums) {
  // your code here
}`,
    `function test_basic() { assertEqual(maxEndingSums([3, -5, 4, 2]), [3, -2, 4, 6]); }
function test_all_negative() { assertEqual(maxEndingSums([-2, -1, -3]), [-2, -1, -3]); }
function test_single() { assertEqual(maxEndingSums([5]), [5]); }`,
    `function maxEndingSums(nums) {
  if (nums.length === 0) return [];
  const dp = new Array(nums.length);
  dp[0] = nums[0];
  for (let i = 1; i < nums.length; i++) dp[i] = Math.max(nums[i], nums[i] + dp[i - 1]);
  return dp;
}`,
    ["1d-sequence-dp", "pre-leetcode"]
  ),
  jsDp(
    "Fill One Grid State",
    "2-d-dp",
    "You are filling one cell in a path-counting Grid DP table. Movement is only down or right, so every path into the current cell must come from the cell above it or the cell to its left. Given those two already-computed values, return their sum. Example: top = 1 and left = 2 means this cell has 3 total ways to be reached.",
    `function fillGridState(top, left) {
  // your code here
}`,
    `function test_basic() { assertEqual(fillGridState(1, 2), 3); }
function test_zero() { assertEqual(fillGridState(0, 5), 5); }`,
    `function fillGridState(top, left) {
  return top + left;
}`,
    ["grid-dp", "pre-leetcode"]
  ),
  jsDp(
    "Build a Path-Count Table",
    "2-d-dp",
    "Return the complete DP table for counting paths in a rows x cols grid moving only down or right.",
    `function buildPathCountTable(rows, cols) {
  // your code here
}`,
    `function test_basic() { assertEqual(buildPathCountTable(3, 4), [[1,1,1,1],[1,2,3,4],[1,3,6,10]]); }
function test_single() { assertEqual(buildPathCountTable(1, 3), [[1,1,1]]); }`,
    `function buildPathCountTable(rows, cols) {
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(1));
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
  }
  return dp;
}`,
    ["grid-dp", "pre-leetcode"]
  ),
  jsDp(
    "Build a Blocked-Cell Path Table",
    "2-d-dp",
    "Return a path-count DP table where true cells are blocked and contribute zero paths.",
    `function buildBlockedPathTable(blocked) {
  // your code here
}`,
    `function test_basic() { assertEqual(buildBlockedPathTable([[false,false,false],[false,true,false],[false,false,false]]), [[1,1,1],[1,0,1],[1,1,2]]); }
function test_start_blocked() { assertEqual(buildBlockedPathTable([[true]]), [[0]]); }`,
    `function buildBlockedPathTable(blocked) {
  const rows = blocked.length, cols = blocked[0].length;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (blocked[r][c]) dp[r][c] = 0;
      else if (r === 0 && c === 0) dp[r][c] = 1;
      else dp[r][c] = (r > 0 ? dp[r - 1][c] : 0) + (c > 0 ? dp[r][c - 1] : 0);
    }
  }
  return dp;
}`,
    ["grid-dp", "pre-leetcode"]
  ),
  jsDp(
    "Build a Minimum-Cost Table",
    "2-d-dp",
    "Return the complete DP table of minimum cost to reach each cell from the top-left.",
    `function buildMinCostTable(grid) {
  // your code here
}`,
    `function test_basic() { assertEqual(buildMinCostTable([[1,3,1],[1,5,1]]), [[1,4,5],[2,7,6]]); }
function test_single() { assertEqual(buildMinCostTable([[7]]), [[7]]); }`,
    `function buildMinCostTable(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 0) dp[r][c] = grid[r][c];
      else dp[r][c] = grid[r][c] + Math.min(r > 0 ? dp[r - 1][c] : Infinity, c > 0 ? dp[r][c - 1] : Infinity);
    }
  }
  return dp;
}`,
    ["grid-dp", "pre-leetcode"]
  ),
  jsDp(
    "Build a Maximum-Cost Table",
    "2-d-dp",
    "Return the complete DP table of maximum value collected from the top-left, moving only down or right.",
    `function buildMaxCostTable(grid) {
  // your code here
}`,
    `function test_basic() { assertEqual(buildMaxCostTable([[1,3,1],[1,5,1]]), [[1,4,5],[2,9,10]]); }
function test_single() { assertEqual(buildMaxCostTable([[7]]), [[7]]); }
function test_column() { assertEqual(buildMaxCostTable([[2],[3],[4]]), [[2],[5],[9]]); }`,
    `function buildMaxCostTable(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 0) dp[r][c] = grid[r][c];
      else dp[r][c] = grid[r][c] + Math.max(r > 0 ? dp[r - 1][c] : -Infinity, c > 0 ? dp[r][c - 1] : -Infinity);
    }
  }
  return dp;
}`,
    ["grid-dp", "pre-leetcode"]
  ),
  jsDp(
    "Count Paths With Diagonal Movement",
    "2-d-dp",
    "Count paths from the top-left to bottom-right when each move may go right, down, or diagonal down-right.",
    `function countPathsWithDiagonal(rows, cols) {
  // your code here
}`,
    `function test_three_by_three() { assertEqual(countPathsWithDiagonal(3, 3), 13); }
function test_two_by_two() { assertEqual(countPathsWithDiagonal(2, 2), 3); }
function test_single_row() { assertEqual(countPathsWithDiagonal(1, 4), 1); }`,
    `function countPathsWithDiagonal(rows, cols) {
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  dp[0][0] = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 0) continue;
      const top = r > 0 ? dp[r - 1][c] : 0;
      const left = c > 0 ? dp[r][c - 1] : 0;
      const diagonal = r > 0 && c > 0 ? dp[r - 1][c - 1] : 0;
      dp[r][c] = top + left + diagonal;
    }
  }
  return dp[rows - 1][cols - 1];
}`,
    ["grid-dp", "pre-leetcode"]
  ),
  jsDp(
    "Reconstruct One Minimum-Cost Grid Path",
    "2-d-dp",
    "Given a non-negative cost grid, return one minimum-cost path from the top-left to the bottom-right as [row, col] coordinates. You may only move down or right.",
    `function reconstructMinCostPath(grid) {
  // your code here
}`,
    `function test_basic() { assertEqual(reconstructMinCostPath([[1,3,1],[1,5,1],[4,2,1]]), [[0,0],[0,1],[0,2],[1,2],[2,2]]); }
function test_column() { assertEqual(reconstructMinCostPath([[2],[4],[1]]), [[0,0],[1,0],[2,0]]); }
function test_single() { assertEqual(reconstructMinCostPath([[7]]), [[0,0]]); }`,
    `function reconstructMinCostPath(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 0) dp[r][c] = grid[r][c];
      else dp[r][c] = grid[r][c] + Math.min(r > 0 ? dp[r - 1][c] : Infinity, c > 0 ? dp[r][c - 1] : Infinity);
    }
  }

  const path = [];
  let r = rows - 1, c = cols - 1;
  while (r > 0 || c > 0) {
    path.push([r, c]);
    if (r === 0) c--;
    else if (c === 0) r--;
    else if (dp[r - 1][c] <= dp[r][c - 1]) r--;
    else c--;
  }
  path.push([0, 0]);
  return path.reverse();
}`,
    ["grid-dp", "dp-min-cost", "pre-leetcode"]
  ),
  jsDp(
    "Minimum Falling Path in a Small Grid",
    "2-d-dp",
    "Return the minimum falling path sum in a grid. Each step moves to the next row in the same column or one adjacent column.",
    `function smallMinFallingPath(matrix) {
  // your code here
}`,
    `function test_basic() { assertEqual(smallMinFallingPath([[2,1,3],[6,5,4],[7,8,9]]), 13); }
function test_single() { assertEqual(smallMinFallingPath([[5]]), 5); }
function test_negative() { assertEqual(smallMinFallingPath([[-19,57],[-40,-5]]), -59); }`,
    `function smallMinFallingPath(matrix) {
  let dp = matrix[0].slice();
  for (let r = 1; r < matrix.length; r++) {
    const next = new Array(matrix[r].length).fill(0);
    for (let c = 0; c < matrix[r].length; c++) {
      let best = dp[c];
      if (c > 0) best = Math.min(best, dp[c - 1]);
      if (c + 1 < dp.length) best = Math.min(best, dp[c + 1]);
      next[c] = matrix[r][c] + best;
    }
    dp = next;
  }
  return Math.min(...dp);
}`,
    ["grid-dp", "pre-leetcode"]
  ),
  jsDp(
    "Minimum Falling Path Sum",
    "2-d-dp",
    "Given a square matrix, return the minimum falling path sum using same-column or adjacent-column moves between rows. Ref: LeetCode #931.",
    `function minFallingPathSum(matrix) {
  // your code here
}`,
    `function test_basic() { assertEqual(minFallingPathSum([[2,1,3],[6,5,4],[7,8,9]]), 13); }
function test_negative() { assertEqual(minFallingPathSum([[-19,57],[-40,-5]]), -59); }
function test_single() { assertEqual(minFallingPathSum([[7]]), 7); }`,
    `function minFallingPathSum(matrix) {
  let dp = matrix[0].slice();
  for (let r = 1; r < matrix.length; r++) {
    const next = new Array(matrix.length).fill(0);
    for (let c = 0; c < matrix.length; c++) {
      let best = dp[c];
      if (c > 0) best = Math.min(best, dp[c - 1]);
      if (c + 1 < matrix.length) best = Math.min(best, dp[c + 1]);
      next[c] = matrix[r][c] + best;
    }
    dp = next;
  }
  return Math.min(...dp);
}`,
    ["grid-dp"],
    "medium"
  ),
  jsDp(
    "Maximal Square",
    "2-d-dp",
    "Given a binary matrix of \"0\" and \"1\" strings, return the area of the largest square containing only 1s. Ref: LeetCode #221.",
    `function maximalSquare(matrix) {
  // your code here
}`,
    `function test_basic() { assertEqual(maximalSquare([["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]), 4); }
function test_zero() { assertEqual(maximalSquare([["0","0"],["0","0"]]), 0); }
function test_all_ones() { assertEqual(maximalSquare([["1","1","1"],["1","1","1"],["1","1","1"]]), 9); }`,
    `function maximalSquare(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const dp = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
  let bestSide = 0;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (matrix[r - 1][c - 1] === "1") {
        dp[r][c] = 1 + Math.min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]);
        bestSide = Math.max(bestSide, dp[r][c]);
      }
    }
  }
  return bestSide * bestSide;
}`,
    ["grid-dp", "shape-dp"],
    "medium"
  ),
  jsDp(
    "Count Square Submatrices With All Ones",
    "2-d-dp",
    "Given a binary matrix, count all square submatrices that contain only 1s. Ref: LeetCode #1277.",
    `function countSquares(matrix) {
  // your code here
}`,
    `function test_basic() { assertEqual(countSquares([[0,1,1,1],[1,1,1,1],[0,1,1,1]]), 15); }
function test_example_two() { assertEqual(countSquares([[1,0,1],[1,1,0],[1,1,0]]), 7); }
function test_all_ones() { assertEqual(countSquares([[1,1,1],[1,1,1],[1,1,1]]), 14); }`,
    `function countSquares(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const dp = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
  let total = 0;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (matrix[r - 1][c - 1] === 1) {
        dp[r][c] = 1 + Math.min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]);
        total += dp[r][c];
      }
    }
  }
  return total;
}`,
    ["grid-dp", "shape-dp"],
    "medium"
  ),
  jsDp(
    "Dungeon Game",
    "2-d-dp",
    "Return the minimum starting health needed to cross a dungeon grid while health never drops below 1. Moves are only right or down. Ref: LeetCode #174.",
    `function calculateMinimumHP(dungeon) {
  // your code here
}`,
    `function test_basic() { assertEqual(calculateMinimumHP([[-2,-3,3],[-5,-10,1],[10,30,-5]]), 7); }
function test_positive() { assertEqual(calculateMinimumHP([[10]]), 1); }
function test_negative() { assertEqual(calculateMinimumHP([[-5]]), 6); }`,
    `function calculateMinimumHP(dungeon) {
  const rows = dungeon.length, cols = dungeon[0].length;
  const dp = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(Infinity));
  dp[rows][cols - 1] = 1;
  dp[rows - 1][cols] = 1;
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      const needAfter = Math.min(dp[r + 1][c], dp[r][c + 1]);
      dp[r][c] = Math.max(1, needAfter - dungeon[r][c]);
    }
  }
  return dp[0][0];
}`,
    ["grid-dp", "reverse-dp", "advanced"],
    "hard"
  ),
];
