import type { SeedKata } from "../types/editor";
import { enrichMissingPythonSolutionVariants } from "./python-solution-variants";

const variant = (label: string, code: string) => ({ label, code });

const neetcode2dDp: SeedKata[] = [
  {
    name: "Best Time to Buy and Sell Stock with Cooldown",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `You are given an array prices where prices[i] is the price of a stock on day i.\n\nFind the maximum profit you can achieve. You may complete as many transactions as you like with the following restriction: after you sell your stock, you cannot buy stock on the next day (i.e., cooldown one day).\n\nNote: You may not engage in multiple transactions simultaneously (you must sell the stock before you buy again).\n\nExample 1:\nInput: prices = [1,2,3,0,2]\nOutput: 3\nExplanation: transactions = [buy, sell, cooldown, buy, sell]\n\nExample 2:\nInput: prices = [1]\nOutput: 0\n\nConstraints:\n- 1 <= prices.length <= 5000\n- 0 <= prices[i] <= 1000\n\nRef: LeetCode #309 Best Time to Buy and Sell Stock with Cooldown`,
    code: `def max_profit_cooldown(prices: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_cooldown_basic():
    assert max_profit_cooldown([1,2,3,0,2]) == 3

def test_cooldown_single():
    assert max_profit_cooldown([1]) == 0

def test_cooldown_two_days():
    assert max_profit_cooldown([1,2]) == 1

def test_cooldown_decreasing():
    assert max_profit_cooldown([5,4,3,2,1]) == 0`,
    solution: `def max_profit_cooldown(prices: list[int]) -> int:
    # States: holding, sold (just sold, next is cooldown), cooldown (can buy)
    holding, sold, cooldown = -prices[0], 0, 0
    for price in prices[1:]:
        prev_holding, prev_sold, prev_cooldown = holding, sold, cooldown
        holding = max(prev_holding, prev_cooldown - price)
        sold = prev_holding + price
        cooldown = max(prev_cooldown, prev_sold)
    return max(sold, cooldown)`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "neetcode", "dp-multistate"],
  },
  {
    name: "Coin Change II",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the number of combinations that make up that amount. If that amount of money cannot be made up by any combination of the coins, return 0.\n\nYou may assume that you have an infinite number of each kind of coin. The answer is guaranteed to fit into a signed 32-bit integer.\n\nExample 1:\nInput: amount = 5, coins = [1,2,5]\nOutput: 4\nExplanation: there are four ways to make up the amount:\n5=5\n5=2+2+1\n5=2+1+1+1\n5=1+1+1+1+1\n\nExample 2:\nInput: amount = 3, coins = [2]\nOutput: 0\nExplanation: the amount cannot be made up just with coins of 2.\n\nExample 3:\nInput: amount = 10, coins = [10]\nOutput: 1\n\nConstraints:\n- 1 <= coins.length <= 300\n- 1 <= coins[i] <= 5000\n- 0 <= amount <= 5000\n\nRef: LeetCode #518 Coin Change II`,
    code: `def change(amount: int, coins: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_coin_change2_basic():
    assert change(5, [1,2,5]) == 4

def test_coin_change2_impossible():
    assert change(3, [2]) == 0

def test_coin_change2_exact():
    assert change(10, [10]) == 1

def test_coin_change2_zero():
    assert change(0, [1,2,5]) == 1`,
    solution: `def change(amount: int, coins: list[int]) -> int:
    dp = [0] * (amount + 1)
    dp[0] = 1
    for coin in coins:
        for a in range(coin, amount + 1):
            dp[a] += dp[a - coin]
    return dp[amount]`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "neetcode", "dp-counting"],
  },
  {
    name: "Target Sum",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `You are given an integer array nums and an integer target.\n\nYou want to build an expression out of nums by adding one of the symbols '+' and '-' before each integer in nums and then concatenate all the integers.\n\nReturn the number of different expressions that you can build which evaluates to target.\n\nExample 1:\nInput: nums = [1,1,1,1,1], target = 3\nOutput: 5\nExplanation: There are 5 ways to assign + and - to make the sum equal to target 3.\n-1+1+1+1+1 = 3\n+1-1+1+1+1 = 3\n+1+1-1+1+1 = 3\n+1+1+1-1+1 = 3\n+1+1+1+1-1 = 3\n\nExample 2:\nInput: nums = [1], target = 1\nOutput: 1\n\nConstraints:\n- 1 <= nums.length <= 20\n- 0 <= nums[i] <= 1000\n- 0 <= sum(nums[i]) <= 1000\n- -1000 <= target <= 1000\n\nRef: LeetCode #494 Target Sum`,
    code: `def find_target_sum_ways(nums: list[int], target: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_target_sum_basic():
    assert find_target_sum_ways([1,1,1,1,1], 3) == 5

def test_target_sum_single():
    assert find_target_sum_ways([1], 1) == 1

def test_target_sum_single_neg():
    assert find_target_sum_ways([1], -1) == 1

def test_target_sum_zero():
    assert find_target_sum_ways([0], 0) == 2`,
    solution: `def find_target_sum_ways(nums: list[int], target: int) -> int:
    dp = {0: 1}
    for num in nums:
        next_dp: dict[int, int] = {}
        for curr_sum, count in dp.items():
            next_dp[curr_sum + num] = next_dp.get(curr_sum + num, 0) + count
            next_dp[curr_sum - num] = next_dp.get(curr_sum - num, 0) + count
        dp = next_dp
    return dp.get(target, 0)`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "backtracking", "neetcode", "dp-decision"],
  },
  {
    name: "Interleaving String",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given strings s1, s2, and s3, find whether s3 is formed by an interleaving of s1 and s2.\n\nAn interleaving of two strings s and t is a configuration where s and t are divided into n and m substrings respectively, and the substrings are interleaved to form the result.\n\nExample 1:\nInput: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"\nOutput: true\n\nExample 2:\nInput: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"\nOutput: false\n\nExample 3:\nInput: s1 = "", s2 = "", s3 = ""\nOutput: true\n\nConstraints:\n- 0 <= s1.length, s2.length <= 100\n- 0 <= s3.length <= 200\n- s1, s2, and s3 consist of lowercase English letters.\n\nRef: LeetCode #97 Interleaving String`,
    code: `def is_interleave(s1: str, s2: str, s3: str) -> bool:
    raise NotImplementedError`,
    testCode: `def test_interleave_true():
    assert is_interleave("aabcc", "dbbca", "aadbbcbcac") == True

def test_interleave_false():
    assert is_interleave("aabcc", "dbbca", "aadbbbaccc") == False

def test_interleave_empty():
    assert is_interleave("", "", "") == True

def test_interleave_one_empty():
    assert is_interleave("abc", "", "abc") == True`,
    solution: `def is_interleave(s1: str, s2: str, s3: str) -> bool:
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for i in range(1, m + 1):
        dp[i][0] = dp[i-1][0] and s1[i-1] == s3[i-1]
    for j in range(1, n + 1):
        dp[0][j] = dp[0][j-1] and s2[j-1] == s3[j-1]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = (dp[i-1][j] and s1[i-1] == s3[i+j-1]) or \
                        (dp[i][j-1] and s2[j-1] == s3[i+j-1])
    return dp[m][n]`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "string", "neetcode", "dp-string"],
  },
  {
    name: "Longest Increasing Path in a Matrix",
    category: "2-d-dp",
    language: "python",
    difficulty: "hard",
    description: `Given an m x n integers matrix, return the length of the longest increasing path in matrix.\n\nFrom each cell, you can either move in four directions: left, right, up, or down. You may not move diagonally or move outside the boundary (i.e., wrap-around is not allowed).\n\nExample 1:\nInput: matrix = [[9,9,4],[6,6,8],[2,1,1]]\nOutput: 4\nExplanation: The longest increasing path is [1,2,6,9].\n\nExample 2:\nInput: matrix = [[3,4,5],[3,2,6],[2,2,1]]\nOutput: 4\nExplanation: The longest increasing path is [3,4,5,6].\n\nExample 3:\nInput: matrix = [[1]]\nOutput: 1\n\nConstraints:\n- m == matrix.length\n- n == matrix[i].length\n- 1 <= m, n <= 200\n- 0 <= matrix[i][j] <= 2^31 - 1\n\nRef: LeetCode #329 Longest Increasing Path in a Matrix`,
    code: `def longest_increasing_path(matrix: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_lip_basic():
    assert longest_increasing_path([[9,9,4],[6,6,8],[2,1,1]]) == 4

def test_lip_second():
    assert longest_increasing_path([[3,4,5],[3,2,6],[2,2,1]]) == 4

def test_lip_single():
    assert longest_increasing_path([[1]]) == 1

def test_lip_two_by_two():
    assert longest_increasing_path([[1,2],[2,3]]) == 3`,
    solution: `def longest_increasing_path(matrix: list[list[int]]) -> int:
    if not matrix:
        return 0
    m, n = len(matrix), len(matrix[0])
    memo: dict[tuple[int, int], int] = {}

    def dfs(r: int, c: int) -> int:
        if (r, c) in memo:
            return memo[(r, c)]
        best = 1
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        memo[(r, c)] = best
        return best

    return max(dfs(r, c) for r in range(m) for c in range(n))`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "dfs", "neetcode", "dp-subsequence"],
  },
  {
    name: "Distinct Subsequences",
    category: "2-d-dp",
    language: "python",
    difficulty: "hard",
    description: `Given two strings s and t, return the number of distinct subsequences of s which equals t.\n\nThe test cases are generated so that the answer fits in a 32-bit signed integer.\n\nExample 1:\nInput: s = "rabbbit", t = "rabbit"\nOutput: 3\nExplanation: There are 3 ways to generate "rabbit" from "rabbbit".\n\nExample 2:\nInput: s = "babgbag", t = "bag"\nOutput: 5\n\nConstraints:\n- 1 <= s.length, t.length <= 1000\n- s and t consist of English letters.\n\nRef: LeetCode #115 Distinct Subsequences`,
    code: `def num_distinct(s: str, t: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_distinct_subseq_basic():
    assert num_distinct("rabbbit", "rabbit") == 3

def test_distinct_subseq_second():
    assert num_distinct("babgbag", "bag") == 5

def test_distinct_subseq_empty_t():
    assert num_distinct("abc", "") == 1

def test_distinct_subseq_same():
    assert num_distinct("a", "a") == 1`,
    solution: `def num_distinct(s: str, t: str) -> int:
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = 1
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i-1][j]
            if s[i-1] == t[j-1]:
                dp[i][j] += dp[i-1][j-1]
    return dp[m][n]`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "string", "neetcode", "dp-subsequence"],
  },
  {
    name: "Edit Distance",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character\n\nExample 1:\nInput: word1 = "horse", word2 = "ros"\nOutput: 3\nExplanation:\nhorse -> rorse (replace 'h' with 'r')\nrorse -> rose (delete 'r')\nrose -> ros (delete 'e')\n\nExample 2:\nInput: word1 = "intention", word2 = "execution"\nOutput: 5\n\nConstraints:\n- 0 <= word1.length, word2.length <= 500\n- word1 and word2 consist of lowercase English letters.\n\nRef: LeetCode #72 Edit Distance`,
    code: `def min_distance(word1: str, word2: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_edit_distance_basic():
    assert min_distance("horse", "ros") == 3

def test_edit_distance_second():
    assert min_distance("intention", "execution") == 5

def test_edit_distance_empty():
    assert min_distance("", "") == 0

def test_edit_distance_one_empty():
    assert min_distance("a", "") == 1`,
    solution: `def min_distance(word1: str, word2: str) -> int:
    m, n = len(word1), len(word2)
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev = dp[0]
        dp[0] = i
        for j in range(1, n + 1):
            temp = dp[j]
            if word1[i-1] == word2[j-1]:
                dp[j] = prev
            else:
                dp[j] = 1 + min(prev, dp[j], dp[j-1])
            prev = temp
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "string", "neetcode", "dp-subsequence"],
  },
  {
    name: "Burst Balloons",
    category: "2-d-dp",
    language: "python",
    difficulty: "hard",
    description: `You are given n balloons, indexed from 0 to n-1. Each balloon is painted with a number on it represented by an array nums. You are asked to burst all the balloons.\n\nIf you burst the ith balloon, you will get nums[i-1] * nums[i] * nums[i+1] coins. If i-1 or i+1 goes out of bounds of the array, treat it as if there is a balloon with a 1 painted on it.\n\nReturn the maximum coins you can collect by bursting the balloons wisely.\n\nExample 1:\nInput: nums = [3,1,5,8]\nOutput: 167\nExplanation: nums = [3,1,5,8] → [3,5,8] → [3,8] → [8] → []\ncoins = 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 167\n\nExample 2:\nInput: nums = [1,5]\nOutput: 10\n\nConstraints:\n- n == nums.length\n- 1 <= n <= 300\n- 0 <= nums[i] <= 100\n\nRef: LeetCode #312 Burst Balloons`,
    code: `def max_coins(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_burst_balloons_basic():
    assert max_coins([3,1,5,8]) == 167

def test_burst_balloons_two():
    assert max_coins([1,5]) == 10

def test_burst_balloons_single():
    assert max_coins([5]) == 5

def test_burst_balloons_uniform():
    assert max_coins([1,1,1]) == 3`,
    solution: `def max_coins(nums: list[int]) -> int:
    nums = [1] + nums + [1]
    n = len(nums)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n):
        for left in range(0, n - length):
            right = left + length
            for k in range(left + 1, right):
                dp[left][right] = max(
                    dp[left][right],
                    dp[left][k] + nums[left] * nums[k] * nums[right] + dp[k][right]
                )
    return dp[0][n-1]`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "neetcode", "dp-string"],
  },
  {
    name: "Regular Expression Matching",
    category: "2-d-dp",
    language: "python",
    difficulty: "hard",
    description: `Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:\n- '.' matches any single character.\n- '*' matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).\n\nExample 1:\nInput: s = "aa", p = "a"\nOutput: false\nExplanation: "a" does not match the entire string "aa".\n\nExample 2:\nInput: s = "aa", p = "a*"\nOutput: true\nExplanation: '*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes "aa".\n\nExample 3:\nInput: s = "ab", p = ".*"\nOutput: true\nExplanation: ".*" means "zero or more (*) of any character (.)".\n\nExample 4:\nInput: s = "aab", p = "c*a*b"\nOutput: true\n\nConstraints:\n- 1 <= s.length <= 20\n- 1 <= p.length <= 30\n- s contains only lowercase English letters.\n- p contains only lowercase English letters, '.', and '*'.\n- It is guaranteed for each appearance of '*', there will be a previous valid character to match.\n\nRef: LeetCode #10 Regular Expression Matching`,
    code: `def is_match(s: str, p: str) -> bool:
    raise NotImplementedError`,
    testCode: `def test_regex_no_match():
    assert is_match("aa", "a") == False

def test_regex_star_repeat():
    assert is_match("aa", "a*") == True

def test_regex_dot_star():
    assert is_match("ab", ".*") == True

def test_regex_complex():
    assert is_match("aab", "c*a*b") == True`,
    solution: `def is_match(s: str, p: str) -> bool:
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(2, n + 1):
        if p[j-1] == '*':
            dp[0][j] = dp[0][j-2]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j-1] == '*':
                dp[i][j] = dp[i][j-2]
                if p[j-2] == '.' or p[j-2] == s[i-1]:
                    dp[i][j] = dp[i][j] or dp[i-1][j]
            elif p[j-1] == '.' or p[j-1] == s[i-1]:
                dp[i][j] = dp[i-1][j-1]
    return dp[m][n]`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "string", "recursion", "neetcode", "dp-string"],
  },
];

const neetcode2dDpSolutionVariants: Record<string, NonNullable<SeedKata["solutionVariants"]>> = {
  "Best Time to Buy and Sell Stock with Cooldown": [
    variant("State machine", `def max_profit_cooldown(prices: list[int]) -> int:
    hold = -prices[0]
    sold = 0
    rest = 0
    for price in prices[1:]:
        prev_hold, prev_sold, prev_rest = hold, sold, rest
        hold = max(prev_hold, prev_rest - price)
        sold = prev_hold + price
        rest = max(prev_rest, prev_sold)
    return max(sold, rest)`),
    variant("DP arrays", `def max_profit_cooldown(prices: list[int]) -> int:
    n = len(prices)
    hold = [0] * n
    sold = [0] * n
    rest = [0] * n
    hold[0] = -prices[0]
    for i in range(1, n):
        hold[i] = max(hold[i - 1], rest[i - 1] - prices[i])
        sold[i] = hold[i - 1] + prices[i]
        rest[i] = max(rest[i - 1], sold[i - 1])
    return max(sold[-1], rest[-1])`),
  ],
  "Coin Change II": [
    variant("Memoized recursion", `def change(amount: int, coins: list[int]) -> int:
    memo = {}

    def ways(i: int, remaining: int) -> int:
        if remaining == 0:
            return 1
        if remaining < 0 or i == len(coins):
            return 0
        key = (i, remaining)
        if key not in memo:
            memo[key] = ways(i, remaining - coins[i]) + ways(i + 1, remaining)
        return memo[key]

    return ways(0, amount)`),
    variant("2D tabulation", `def change(amount: int, coins: list[int]) -> int:
    n = len(coins)
    dp = [[0] * (amount + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = 1
    for i in range(n - 1, -1, -1):
        for total in range(1, amount + 1):
            dp[i][total] = dp[i + 1][total]
            if total >= coins[i]:
                dp[i][total] += dp[i][total - coins[i]]
    return dp[0][amount]`),
    variant("1D unbounded knapsack", `def change(amount: int, coins: list[int]) -> int:
    dp = [0] * (amount + 1)
    dp[0] = 1
    for coin in coins:
        for total in range(coin, amount + 1):
            dp[total] += dp[total - coin]
    return dp[amount]`),
  ],
  "Target Sum": [
    variant("Sum-count DP", `def find_target_sum_ways(nums: list[int], target: int) -> int:
    counts = {0: 1}
    for num in nums:
        next_counts = {}
        for total, count in counts.items():
            next_counts[total + num] = next_counts.get(total + num, 0) + count
            next_counts[total - num] = next_counts.get(total - num, 0) + count
        counts = next_counts
    return counts.get(target, 0)`),
    variant("Subset-sum transform", `def find_target_sum_ways(nums: list[int], target: int) -> int:
    total = sum(nums)
    if abs(target) > total or (total + target) % 2:
        return 0
    subset = (total + target) // 2
    dp = [0] * (subset + 1)
    dp[0] = 1
    for num in nums:
        for s in range(subset, num - 1, -1):
            dp[s] += dp[s - num]
    return dp[subset]`),
  ],
  "Interleaving String": [
    variant("Memoized DFS", `def is_interleave(s1: str, s2: str, s3: str) -> bool:
    if len(s1) + len(s2) != len(s3):
        return False
    memo = {}

    def can(i: int, j: int) -> bool:
        if i == len(s1) and j == len(s2):
            return True
        key = (i, j)
        if key not in memo:
            k = i + j
            take1 = i < len(s1) and s1[i] == s3[k] and can(i + 1, j)
            take2 = j < len(s2) and s2[j] == s3[k] and can(i, j + 1)
            memo[key] = take1 or take2
        return memo[key]

    return can(0, 0)`),
    variant("2D tabulation", `def is_interleave(s1: str, s2: str, s3: str) -> bool:
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for i in range(m + 1):
        for j in range(n + 1):
            k = i + j
            if i < m and s1[i] == s3[k]:
                dp[i + 1][j] = dp[i + 1][j] or dp[i][j]
            if j < n and s2[j] == s3[k]:
                dp[i][j + 1] = dp[i][j + 1] or dp[i][j]
    return dp[m][n]`),
    variant("1D tabulation", `def is_interleave(s1: str, s2: str, s3: str) -> bool:
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False
    dp = [False] * (n + 1)
    dp[0] = True
    for i in range(m + 1):
        for j in range(n + 1):
            if i == 0 and j == 0:
                continue
            k = i + j - 1
            from_s1 = i > 0 and dp[j] and s1[i - 1] == s3[k]
            from_s2 = j > 0 and dp[j - 1] and s2[j - 1] == s3[k]
            dp[j] = from_s1 or from_s2
    return dp[n]`),
  ],
  "Longest Increasing Path in a Matrix": [
    variant("DFS memoization", `def longest_increasing_path(matrix: list[list[int]]) -> int:
    rows, cols = len(matrix), len(matrix[0])
    memo = {}

    def dfs(r: int, c: int) -> int:
        if (r, c) in memo:
            return memo[(r, c)]
        best = 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        memo[(r, c)] = best
        return best

    return max(dfs(r, c) for r in range(rows) for c in range(cols))`),
    variant("Topological BFS", `def longest_increasing_path(matrix: list[list[int]]) -> int:
    from collections import deque

    rows, cols = len(matrix), len(matrix[0])
    outdegree = [[0] * cols for _ in range(rows)]
    q = deque()
    for r in range(rows):
        for c in range(cols):
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                    outdegree[r][c] += 1
            if outdegree[r][c] == 0:
                q.append((r, c))
    length = 0
    while q:
        length += 1
        for _ in range(len(q)):
            r, c = q.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] < matrix[r][c]:
                    outdegree[nr][nc] -= 1
                    if outdegree[nr][nc] == 0:
                        q.append((nr, nc))
    return length`),
  ],
  "Distinct Subsequences": [
    variant("Memoized recursion", `def num_distinct(s: str, t: str) -> int:
    memo = {}

    def count(i: int, j: int) -> int:
        if j == len(t):
            return 1
        if i == len(s):
            return 0
        key = (i, j)
        if key not in memo:
            total = count(i + 1, j)
            if s[i] == t[j]:
                total += count(i + 1, j + 1)
            memo[key] = total
        return memo[key]

    return count(0, 0)`),
    variant("2D tabulation", `def num_distinct(s: str, t: str) -> int:
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = 1
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j]
            if s[i - 1] == t[j - 1]:
                dp[i][j] += dp[i - 1][j - 1]
    return dp[m][n]`),
    variant("1D tabulation", `def num_distinct(s: str, t: str) -> int:
    dp = [0] * (len(t) + 1)
    dp[0] = 1
    for ch in s:
        for j in range(len(t) - 1, -1, -1):
            if ch == t[j]:
                dp[j + 1] += dp[j]
    return dp[-1]`),
  ],
  "Edit Distance": [
    variant("Memoized recursion", `def min_distance(word1: str, word2: str) -> int:
    memo = {}

    def best(i: int, j: int) -> int:
        if i == len(word1):
            return len(word2) - j
        if j == len(word2):
            return len(word1) - i
        key = (i, j)
        if key not in memo:
            if word1[i] == word2[j]:
                memo[key] = best(i + 1, j + 1)
            else:
                memo[key] = 1 + min(best(i + 1, j), best(i, j + 1), best(i + 1, j + 1))
        return memo[key]

    return best(0, 0)`),
    variant("2D tabulation", `def min_distance(word1: str, word2: str) -> int:
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]`),
    variant("Rolling row", `def min_distance(word1: str, word2: str) -> int:
    dp = list(range(len(word2) + 1))
    for i, ch1 in enumerate(word1, 1):
        prev_diag = dp[0]
        dp[0] = i
        for j, ch2 in enumerate(word2, 1):
            old = dp[j]
            if ch1 == ch2:
                dp[j] = prev_diag
            else:
                dp[j] = 1 + min(dp[j], dp[j - 1], prev_diag)
            prev_diag = old
    return dp[-1]`),
  ],
  "Burst Balloons": [
    variant("Interval memoization", `def max_coins(nums: list[int]) -> int:
    vals = [1] + nums + [1]
    memo = {}

    def best(left: int, right: int) -> int:
        if left + 1 == right:
            return 0
        key = (left, right)
        if key not in memo:
            memo[key] = max(
                vals[left] * vals[k] * vals[right] + best(left, k) + best(k, right)
                for k in range(left + 1, right)
            )
        return memo[key]

    return best(0, len(vals) - 1)`),
    variant("Interval tabulation", `def max_coins(nums: list[int]) -> int:
    vals = [1] + nums + [1]
    n = len(vals)
    dp = [[0] * n for _ in range(n)]
    for width in range(2, n):
        for left in range(n - width):
            right = left + width
            for k in range(left + 1, right):
                dp[left][right] = max(
                    dp[left][right],
                    vals[left] * vals[k] * vals[right] + dp[left][k] + dp[k][right],
                )
    return dp[0][n - 1]`),
  ],
  "Regular Expression Matching": [
    variant("Memoized recursion", `def is_match(s: str, p: str) -> bool:
    memo = {}

    def match(i: int, j: int) -> bool:
        if j == len(p):
            return i == len(s)
        key = (i, j)
        if key not in memo:
            first = i < len(s) and p[j] in (s[i], ".")
            if j + 1 < len(p) and p[j + 1] == "*":
                memo[key] = match(i, j + 2) or (first and match(i + 1, j))
            else:
                memo[key] = first and match(i + 1, j + 1)
        return memo[key]

    return match(0, 0)`),
    variant("Bottom-up DP", `def is_match(s: str, p: str) -> bool:
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[m][n] = True
    for i in range(m, -1, -1):
        for j in range(n - 1, -1, -1):
            first = i < m and p[j] in (s[i], ".")
            if j + 1 < n and p[j + 1] == "*":
                dp[i][j] = dp[i][j + 2] or (first and dp[i + 1][j])
            else:
                dp[i][j] = first and dp[i + 1][j + 1]
    return dp[0][0]`),
  ],
};

const neetcode2dDpVariantMetadata: Record<string, Record<string, Pick<NonNullable<SeedKata["solutionVariants"]>[number], "complexity" | "explanation">>> = {
  "Best Time to Buy and Sell Stock with Cooldown": {
    "State machine": {
      complexity: "Time: O(n), Space: O(1)",
      explanation: "Tracks holding, just-sold, and resting states for each day using only the previous day's values.",
    },
    "DP arrays": {
      complexity: "Time: O(n), Space: O(n)",
      explanation: "Stores the three state values for every day, making the recurrence explicit.",
    },
  },
  "Coin Change II": {
    "Memoized recursion": {
      complexity: "Time: O(coins*amount), Space: O(coins*amount)",
      explanation: "Caches each coin-index and remaining-amount pair while branching between using or skipping the current coin.",
    },
    "2D tabulation": {
      complexity: "Time: O(coins*amount), Space: O(coins*amount)",
      explanation: "Fills a table where each row chooses combinations using the current coin and later coins.",
    },
    "1D unbounded knapsack": {
      complexity: "Time: O(coins*amount), Space: O(amount)",
      explanation: "Sweeps amounts forward for each coin, allowing unlimited reuse while counting combinations once.",
    },
  },
  "Target Sum": {
    "Sum-count DP": {
      complexity: "Time: O(n*sum), Space: O(sum)",
      explanation: "Carries a map from reachable signed sums to the number of ways to make each sum after each number.",
    },
    "Subset-sum transform": {
      complexity: "Time: O(n*target_sum), Space: O(target_sum)",
      explanation: "Transforms plus/minus assignment into counting subsets with sum (total + target) / 2.",
    },
  },
  "Interleaving String": {
    "Memoized DFS": {
      complexity: "Time: O(m*n), Space: O(m*n)",
      explanation: "Caches each pair of consumed indices from s1 and s2.",
    },
    "2D tabulation": {
      complexity: "Time: O(m*n), Space: O(m*n)",
      explanation: "Builds whether each prefix pair can form the matching prefix of s3.",
    },
    "1D tabulation": {
      complexity: "Time: O(m*n), Space: O(n)",
      explanation: "Compresses the 2D table to one row because each state needs only the previous row and left neighbor.",
    },
  },
  "Longest Increasing Path in a Matrix": {
    "DFS memoization": {
      complexity: "Time: O(m*n), Space: O(m*n)",
      explanation: "Each cell's best increasing path is computed once and cached; edges only go to larger values.",
    },
    "Topological BFS": {
      complexity: "Time: O(m*n), Space: O(m*n)",
      explanation: "Processes cells in layers from local maxima backward by reducing outdegree.",
    },
  },
  "Distinct Subsequences": {
    "Memoized recursion": {
      complexity: "Time: O(m*n), Space: O(m*n)",
      explanation: "Caches counts for each source index and target index pair.",
    },
    "2D tabulation": {
      complexity: "Time: O(m*n), Space: O(m*n)",
      explanation: "Fills the count of ways each source prefix can form each target prefix.",
    },
    "1D tabulation": {
      complexity: "Time: O(m*n), Space: O(n)",
      explanation: "Updates target positions backward so previous-row values are not overwritten too early.",
    },
  },
  "Edit Distance": {
    "Memoized recursion": {
      complexity: "Time: O(m*n), Space: O(m*n)",
      explanation: "Caches each pair of positions and branches over insert, delete, and replace when characters differ.",
    },
    "2D tabulation": {
      complexity: "Time: O(m*n), Space: O(m*n)",
      explanation: "Fills the minimum edits needed for every pair of prefixes.",
    },
    "Rolling row": {
      complexity: "Time: O(m*n), Space: O(n)",
      explanation: "Keeps one row plus the diagonal previous value because each state depends on top, left, and diagonal.",
    },
  },
  "Burst Balloons": {
    "Interval memoization": {
      complexity: "Time: O(n³), Space: O(n²)",
      explanation: "Chooses the last balloon burst inside each interval and caches every interval result.",
    },
    "Interval tabulation": {
      complexity: "Time: O(n³), Space: O(n²)",
      explanation: "Fills shorter intervals before larger intervals so both sides of each final-burst choice are ready.",
    },
  },
  "Regular Expression Matching": {
    "Memoized recursion": {
      complexity: "Time: O(m*n), Space: O(m*n)",
      explanation: "Caches each string and pattern index pair while handling '*' as skip or consume.",
    },
    "Bottom-up DP": {
      complexity: "Time: O(m*n), Space: O(m*n)",
      explanation: "Fills match states from the end of the string and pattern back to the start.",
    },
  },
};

for (const kata of neetcode2dDp) {
  kata.solutionVariants = neetcode2dDpSolutionVariants[kata.name] ?? kata.solutionVariants;
  if (kata.solutionVariants) {
    const metadata = neetcode2dDpVariantMetadata[kata.name] ?? {};
    kata.solutionVariants = kata.solutionVariants.map((solution) => ({
      ...solution,
      ...(metadata[solution.label] ?? {}),
    }));
  }
}

enrichMissingPythonSolutionVariants(neetcode2dDp);

export { neetcode2dDp };
