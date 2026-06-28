import type { SeedKata } from "../types/editor";

const neetcode2dDp: SeedKata[] = [
  {
    name: "Best Time to Buy and Sell Stock With Cooldown",
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
    tags: ["dynamic-programming", "2d-dp", "neetcode"],
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
    tags: ["dynamic-programming", "2d-dp", "neetcode"],
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
    tags: ["dynamic-programming", "2d-dp", "backtracking", "neetcode"],
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
    tags: ["dynamic-programming", "2d-dp", "string", "neetcode"],
  },
  {
    name: "Longest Increasing Path In a Matrix",
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
    tags: ["dynamic-programming", "2d-dp", "dfs", "neetcode"],
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
    tags: ["dynamic-programming", "2d-dp", "string", "neetcode"],
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
    tags: ["dynamic-programming", "2d-dp", "string", "neetcode"],
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
    assert max_coins([1,1,1]) == 4`,
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
    tags: ["dynamic-programming", "2d-dp", "neetcode"],
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
    tags: ["dynamic-programming", "2d-dp", "string", "recursion", "neetcode"],
  },
];

export { neetcode2dDp };
