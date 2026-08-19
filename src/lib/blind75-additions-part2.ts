import type { SeedKata } from "../types/editor";
import { enrichMissingPythonSolutionVariants } from "./python-solution-variants";

const blind75Part2: SeedKata[] = [
  {
    name: "Coin Change",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given coins of different denominations and an amount, find the fewest coins needed to make up that amount. Return -1 if impossible.\n\nExample:\nInput: coins = [1,5,11], amount = 11\nOutput: 1 (use one 11-coin)\n\nExample 2:\nInput: coins = [2], amount = 3\nOutput: -1\n\nConstraints:\n- 1 <= coins.length <= 12\n- 1 <= coins[i] <= 2^31 - 1\n- 0 <= amount <= 10^4`,
    code: `def coin_change(coins: list[int], amount: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_coin_change_basic():
    assert coin_change([1, 5, 11], 11) == 1

def test_impossible():
    assert coin_change([2], 3) == -1

def test_zero_amount():
    assert coin_change([1], 0) == 0

def test_multiple_coins():
    assert coin_change([1, 2, 5], 11) == 3`,
    solution: `def coin_change(coins: list[int], amount: int) -> int:
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if c <= i:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[amount] if dp[amount] != float("inf") else -1`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "neetcode", "1d-dp", "dp-min-cost"],
  },
  {
    name: "Longest Increasing Subsequence",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums, return the length of the longest strictly increasing subsequence.\n\nExample:\nInput: nums = [10,9,2,5,3,7,101,18]\nOutput: 4 ([2,3,7,101])\n\nConstraints:\n- 1 <= nums.length <= 2500\n- -10^4 <= nums[i] <= 10^4`,
    code: `def length_of_lis(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_lis_basic():
    assert length_of_lis([10, 9, 2, 5, 3, 7, 101, 18]) == 4

def test_lis_mixed():
    assert length_of_lis([0, 1, 0, 3, 2, 3]) == 4

def test_lis_all_same():
    assert length_of_lis([7, 7, 7, 7, 7]) == 1

def test_lis_single():
    assert length_of_lis([5]) == 1`,
    solution: `import bisect

def length_of_lis(nums: list[int]) -> int:
    sub = []
    for num in nums:
        pos = bisect.bisect_left(sub, num)
        if pos == len(sub):
            sub.append(num)
        else:
            sub[pos] = num
    return len(sub)`,
    usage: null,
    tags: ["dynamic-programming", "binary-search", "blind75", "neetcode", "1d-dp", "dp-subsequence"],
  },
  {
    name: "Word Break",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given a string s and a dictionary of strings wordDict, return true if s can be segmented into space-separated words from the dictionary.\n\nExample:\nInput: s = "leetcode", wordDict = ["leet","code"]\nOutput: True\n\nConstraints:\n- 1 <= s.length <= 300\n- 1 <= wordDict.length <= 1000\n- 1 <= wordDict[i].length <= 20`,
    code: `def word_break(s: str, word_dict: list[str]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_word_break_basic():
    assert word_break("leetcode", ["leet", "code"]) == True

def test_word_break_false():
    assert word_break("catsandog", ["cats", "dog", "sand", "and", "cat"]) == False

def test_word_break_reuse():
    assert word_break("applepenapple", ["apple", "pen"]) == True

def test_word_break_single():
    assert word_break("a", ["a"]) == True`,
    solution: `def word_break(s: str, word_dict: list[str]) -> bool:
    word_set = set(word_dict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "neetcode", "1d-dp", "dp-string"],
  },
  {
    name: "Combination Sum IV",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given an array of distinct integers nums and a target integer, return the number of possible combinations that add up to target. Order matters.\n\nExample:\nInput: nums = [1,2,3], target = 4\nOutput: 7\n\nConstraints:\n- 1 <= nums.length <= 200\n- 1 <= nums[i] <= 1000\n- All nums[i] are unique\n- 1 <= target <= 1000`,
    code: `def combination_sum4(nums: list[int], target: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_combination_sum4_basic():
    assert combination_sum4([1, 2, 3], 4) == 7

def test_combination_sum4_impossible():
    assert combination_sum4([9], 3) == 0

def test_combination_sum4_single():
    assert combination_sum4([1], 1) == 1

def test_combination_sum4_two():
    assert combination_sum4([1, 2], 3) == 3`,
    solution: `def combination_sum4(nums: list[int], target: int) -> int:
    dp = [0] * (target + 1)
    dp[0] = 1
    for i in range(1, target + 1):
        for num in nums:
            if num <= i:
                dp[i] += dp[i - num]
    return dp[target]`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "dp-counting"],
  },
  {
    name: "House Robber",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `You are a robber planning to rob houses along a street. Adjacent houses have alarms. Given nums[i] = amount of money in house i, return the max amount you can rob without alerting police.\n\nExample:\nInput: nums = [1,2,3,1]\nOutput: 4\n\nConstraints:\n- 1 <= nums.length <= 100\n- 0 <= nums[i] <= 400`,
    code: `def rob(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_rob_basic():
    assert rob([1, 2, 3, 1]) == 4

def test_rob_five_houses():
    assert rob([2, 7, 9, 3, 1]) == 12

def test_rob_single():
    assert rob([1]) == 1

def test_rob_two():
    assert rob([2, 1]) == 2`,
    solution: `def rob(nums: list[int]) -> int:
    prev2, prev1 = 0, 0
    for num in nums:
        curr = max(prev1, prev2 + num)
        prev2, prev1 = prev1, curr
    return prev1`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "neetcode", "1d-dp", "dp-decision"],
  },
  {
    name: "House Robber II",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Houses are arranged in a circle. Adjacent houses have alarms. Return the max amount you can rob.\n\nExample:\nInput: nums = [2,3,2]\nOutput: 3\n\nConstraints:\n- 1 <= nums.length <= 100\n- 0 <= nums[i] <= 1000`,
    code: `def rob2(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_rob2_basic():
    assert rob2([2, 3, 2]) == 3

def test_rob2_four_houses():
    assert rob2([1, 2, 3, 1]) == 4

def test_rob2_three_houses():
    assert rob2([1, 2, 3]) == 3

def test_rob2_single():
    assert rob2([0]) == 0`,
    solution: `def rob2(nums: list[int]) -> int:
    if len(nums) == 1:
        return nums[0]

    def rob_linear(houses: list[int]) -> int:
        prev2, prev1 = 0, 0
        for num in houses:
            curr = max(prev1, prev2 + num)
            prev2, prev1 = prev1, curr
        return prev1

    return max(rob_linear(nums[:-1]), rob_linear(nums[1:]))`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "neetcode", "1d-dp", "dp-decision"],
  },
  {
    name: "Decode Ways",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `A string of digits can be decoded where A=1, B=2, ..., Z=26. Given a string s, return the number of ways to decode it.\n\nExample:\nInput: s = "226"\nOutput: 3 ("BZ","VF","BBF")\n\nConstraints:\n- 1 <= s.length <= 100\n- s contains only digits\n- s may contain leading zeros`,
    code: `def num_decodings(s: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_decode_two_ways():
    assert num_decodings("12") == 2

def test_decode_three_ways():
    assert num_decodings("226") == 3

def test_decode_zero():
    assert num_decodings("0") == 0

def test_decode_leading_zero():
    assert num_decodings("06") == 0`,
    solution: `def num_decodings(s: str) -> int:
    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 0 if s[0] == "0" else 1
    for i in range(2, n + 1):
        one = int(s[i - 1])
        two = int(s[i - 2 : i])
        if one != 0:
            dp[i] += dp[i - 1]
        if 10 <= two <= 26:
            dp[i] += dp[i - 2]
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "neetcode", "1d-dp", "dp-counting"],
  },
  {
    name: "Unique Paths",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `A robot starts at top-left of an m x n grid and can only move right or down. How many unique paths reach bottom-right?\n\nExample:\nInput: m = 3, n = 7\nOutput: 28\n\nConstraints:\n- 1 <= m, n <= 100`,
    code: `def unique_paths(m: int, n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_unique_paths_basic():
    assert unique_paths(3, 7) == 28

def test_unique_paths_small():
    assert unique_paths(3, 2) == 3

def test_unique_paths_transposed():
    assert unique_paths(7, 3) == 28

def test_unique_paths_single():
    assert unique_paths(1, 1) == 1`,
    solution: `def unique_paths(m: int, n: int) -> int:
    dp = [[1] * n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]`,
    usage: null,
    tags: ["dynamic-programming", "math", "blind75", "neetcode", "dp-counting"],
  },
  {
    name: "Jump Game",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums where nums[i] is the max jump length from position i, return true if you can reach the last index.\n\nExample:\nInput: nums = [2,3,1,1,4]\nOutput: True\n\nInput: nums = [3,2,1,0,4]\nOutput: False\n\nConstraints:\n- 1 <= nums.length <= 10^4\n- 0 <= nums[i] <= 10^5`,
    code: `def can_jump(nums: list[int]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_can_jump_true():
    assert can_jump([2, 3, 1, 1, 4]) == True

def test_can_jump_false():
    assert can_jump([3, 2, 1, 0, 4]) == False

def test_can_jump_single():
    assert can_jump([0]) == True

def test_can_jump_two():
    assert can_jump([1, 0]) == True`,
    solution: `def can_jump(nums: list[int]) -> bool:
    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + jump)
    return True`,
    usage: null,
    tags: ["dynamic-programming", "greedy", "blind75", "neetcode"],
  },
  {
    name: "Min Cost Climbing Stairs",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `You are given an integer array cost where cost[i] is the cost of the i-th step. You can either start from step 0 or step 1. On each step, you can climb 1 or 2 steps. Return the minimum cost to reach the top (beyond the last step).\n\nExample 1:\nInput: cost = [10,15,20]\nOutput: 15\nExplanation: Start at step 1, pay 15, climb 2 steps to the top.\n\nExample 2:\nInput: cost = [1,100,1,1,1,100,1,1,100,1]\nOutput: 6\n\nConstraints:\n- 2 <= cost.length <= 1000\n- 0 <= cost[i] <= 999\n\nRef: LeetCode #746 Min Cost Climbing Stairs`,
    code: `def min_cost_climbing_stairs(cost: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_min_cost_basic():
    assert min_cost_climbing_stairs([10, 15, 20]) == 15

def test_min_cost_longer():
    assert min_cost_climbing_stairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]) == 6

def test_min_cost_two():
    assert min_cost_climbing_stairs([0, 0]) == 0

def test_min_cost_equal():
    assert min_cost_climbing_stairs([1, 1, 1, 1]) == 2`,
    solution: `def min_cost_climbing_stairs(cost: list[int]) -> int:
    n = len(cost)
    for i in range(2, n):
        cost[i] += min(cost[i - 1], cost[i - 2])
    return min(cost[-1], cost[-2])`,
    usage: null,
    tags: ["dynamic-programming", "neetcode", "1d-dp", "dp-basic"],
  },
  {
    name: "Partition Equal Subset Sum",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums, return true if you can partition it into two subsets with equal sum, false otherwise.\n\nExample 1:\nInput: nums = [1,5,11,5]\nOutput: True  (subsets [1,5,5] and [11])\n\nExample 2:\nInput: nums = [1,2,3,5]\nOutput: False\n\nConstraints:\n- 1 <= nums.length <= 200\n- 1 <= nums[i] <= 100\n\nRef: LeetCode #416 Partition Equal Subset Sum`,
    code: `def can_partition(nums: list[int]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_can_partition_true():
    assert can_partition([1, 5, 11, 5]) == True

def test_can_partition_false():
    assert can_partition([1, 2, 3, 5]) == False

def test_can_partition_odd_sum():
    assert can_partition([1, 1, 1]) == False

def test_can_partition_two():
    assert can_partition([3, 3]) == True`,
    solution: `def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2
    dp = {0}
    for n in nums:
        dp = {s + n for s in dp} | dp
        if target in dp:
            return True
    return False`,
    usage: null,
    tags: ["dynamic-programming", "neetcode", "1d-dp", "dp-decision"],
  },
];

const blind75Part2SolutionVariants: Record<string, NonNullable<SeedKata["solutionVariants"]>> = {
  "Coin Change": [
    {
      label: "Recursive search",
      code: `def coin_change(coins: list[int], amount: int) -> int:
    if amount == 0:
        return 0
    if amount < 0:
        return -1

    best = float("inf")
    for coin in coins:
        sub = coin_change(coins, amount - coin)
        if sub != -1:
            best = min(best, sub + 1)
    return best if best != float("inf") else -1`,
    },
    {
      label: "Memoized recursion",
      code: `def coin_change(coins: list[int], amount: int) -> int:
    memo = {0: 0}

    def dfs(rem: int) -> int:
        if rem < 0:
            return -1
        if rem in memo:
            return memo[rem]
        best = float("inf")
        for coin in coins:
            sub = dfs(rem - coin)
            if sub != -1:
                best = min(best, sub + 1)
        memo[rem] = best if best != float("inf") else -1
        return memo[rem]

    return dfs(amount)`,
    },
    {
      label: "Bottom-up tabulation",
      code: `def coin_change(coins: list[int], amount: int) -> int:
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0
    for total in range(1, amount + 1):
        for coin in coins:
            if coin <= total:
                dp[total] = min(dp[total], dp[total - coin] + 1)
    return dp[amount] if dp[amount] != float("inf") else -1`,
    },
  ],
  "Longest Increasing Subsequence": [
    {
      label: "Memoized subsequence search",
      code: `def length_of_lis(nums: list[int]) -> int:
    from functools import lru_cache

    @lru_cache(None)
    def dfs(i: int, prev: int) -> int:
        if i == len(nums):
            return 0
        skip = dfs(i + 1, prev)
        take = 0
        if prev == -1 or nums[i] > nums[prev]:
            take = 1 + dfs(i + 1, i)
        return max(skip, take)

    return dfs(0, -1)`,
    },
    {
      label: "O(n²) tabulation",
      code: `def length_of_lis(nums: list[int]) -> int:
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
    },
    {
      label: "Patience sorting",
      code: `import bisect

def length_of_lis(nums: list[int]) -> int:
    tails = []
    for num in nums:
        i = bisect.bisect_left(tails, num)
        if i == len(tails):
            tails.append(num)
        else:
            tails[i] = num
    return len(tails)`,
    },
  ],
  "Word Break": [
    {
      label: "Memoized start index",
      code: `def word_break(s: str, word_dict: list[str]) -> bool:
    words = set(word_dict)
    memo = {}

    def dfs(start: int) -> bool:
        if start == len(s):
            return True
        if start in memo:
            return memo[start]
        for end in range(start + 1, len(s) + 1):
            if s[start:end] in words and dfs(end):
                memo[start] = True
                return True
        memo[start] = False
        return False

    return dfs(0)`,
    },
    {
      label: "Prefix tabulation",
      code: `def word_break(s: str, word_dict: list[str]) -> bool:
    words = set(word_dict)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[-1]`,
    },
  ],
  "Combination Sum IV": [
    {
      label: "Memoized remaining target",
      code: `def combination_sum4(nums: list[int], target: int) -> int:
    memo = {0: 1}

    def dfs(rem: int) -> int:
        if rem < 0:
            return 0
        if rem in memo:
            return memo[rem]
        memo[rem] = sum(dfs(rem - num) for num in nums)
        return memo[rem]

    return dfs(target)`,
    },
    {
      label: "Ordered tabulation",
      code: `def combination_sum4(nums: list[int], target: int) -> int:
    dp = [0] * (target + 1)
    dp[0] = 1
    for total in range(1, target + 1):
        for num in nums:
            if num <= total:
                dp[total] += dp[total - num]
    return dp[target]`,
    },
  ],
  "House Robber": [
    {
      label: "Memoized decision tree",
      code: `def rob(nums: list[int]) -> int:
    memo = {}

    def dfs(i: int) -> int:
        if i >= len(nums):
            return 0
        if i in memo:
            return memo[i]
        memo[i] = max(dfs(i + 1), nums[i] + dfs(i + 2))
        return memo[i]

    return dfs(0)`,
    },
    {
      label: "DP array",
      code: `def rob(nums: list[int]) -> int:
    if len(nums) == 1:
        return nums[0]
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    for i in range(2, len(nums)):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])
    return dp[-1]`,
    },
    {
      label: "Two variables",
      code: `def rob(nums: list[int]) -> int:
    prev2 = prev1 = 0
    for num in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + num)
    return prev1`,
    },
  ],
  "House Robber II": [
    {
      label: "Split circle into two lines",
      code: `def rob2(nums: list[int]) -> int:
    if len(nums) == 1:
        return nums[0]

    def rob_line(houses: list[int]) -> int:
        prev2 = prev1 = 0
        for money in houses:
            prev2, prev1 = prev1, max(prev1, prev2 + money)
        return prev1

    return max(rob_line(nums[:-1]), rob_line(nums[1:]))`,
    },
    {
      label: "DP arrays for both ranges",
      code: `def rob2(nums: list[int]) -> int:
    if len(nums) == 1:
        return nums[0]

    def rob_line(houses: list[int]) -> int:
        if not houses:
            return 0
        if len(houses) == 1:
            return houses[0]
        dp = [0] * len(houses)
        dp[0] = houses[0]
        dp[1] = max(houses[0], houses[1])
        for i in range(2, len(houses)):
            dp[i] = max(dp[i - 1], dp[i - 2] + houses[i])
        return dp[-1]

    return max(rob_line(nums[:-1]), rob_line(nums[1:]))`,
    },
  ],
  "Decode Ways": [
    {
      label: "Memoized index",
      code: `def num_decodings(s: str) -> int:
    memo = {}

    def dfs(i: int) -> int:
        if i == len(s):
            return 1
        if s[i] == "0":
            return 0
        if i in memo:
            return memo[i]
        ways = dfs(i + 1)
        if i + 1 < len(s) and 10 <= int(s[i:i + 2]) <= 26:
            ways += dfs(i + 2)
        memo[i] = ways
        return ways

    return dfs(0)`,
    },
    {
      label: "DP array",
      code: `def num_decodings(s: str) -> int:
    dp = [0] * (len(s) + 1)
    dp[0] = 1
    dp[1] = 0 if s[0] == "0" else 1
    for i in range(2, len(s) + 1):
        if s[i - 1] != "0":
            dp[i] += dp[i - 1]
        if 10 <= int(s[i - 2:i]) <= 26:
            dp[i] += dp[i - 2]
    return dp[-1]`,
    },
    {
      label: "Two running counts",
      code: `def num_decodings(s: str) -> int:
    prev2 = 1
    prev1 = 0 if s[0] == "0" else 1
    for i in range(2, len(s) + 1):
        curr = 0
        if s[i - 1] != "0":
            curr += prev1
        if 10 <= int(s[i - 2:i]) <= 26:
            curr += prev2
        prev2, prev1 = prev1, curr
    return prev1`,
    },
  ],
  "Unique Paths": [
    {
      label: "Memoized grid walk",
      code: `def unique_paths(m: int, n: int) -> int:
    memo = {}

    def dfs(r: int, c: int) -> int:
        if r == m - 1 and c == n - 1:
            return 1
        if r >= m or c >= n:
            return 0
        if (r, c) in memo:
            return memo[(r, c)]
        memo[(r, c)] = dfs(r + 1, c) + dfs(r, c + 1)
        return memo[(r, c)]

    return dfs(0, 0)`,
    },
    {
      label: "2D tabulation",
      code: `def unique_paths(m: int, n: int) -> int:
    dp = [[1] * n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[-1][-1]`,
    },
    {
      label: "1D rolling row",
      code: `def unique_paths(m: int, n: int) -> int:
    row = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1]
    return row[-1]`,
    },
  ],
  "Jump Game": [
    {
      label: "Memoized reachability",
      code: `def can_jump(nums: list[int]) -> bool:
    memo = {}

    def dfs(i: int) -> bool:
        if i >= len(nums) - 1:
            return True
        if i in memo:
            return memo[i]
        furthest = min(len(nums) - 1, i + nums[i])
        for nxt in range(i + 1, furthest + 1):
            if dfs(nxt):
                memo[i] = True
                return True
        memo[i] = False
        return False

    return dfs(0)`,
    },
    {
      label: "Reachable table",
      code: `def can_jump(nums: list[int]) -> bool:
    good = [False] * len(nums)
    good[-1] = True
    for i in range(len(nums) - 2, -1, -1):
        furthest = min(len(nums) - 1, i + nums[i])
        for nxt in range(i + 1, furthest + 1):
            if good[nxt]:
                good[i] = True
                break
    return good[0]`,
    },
    {
      label: "Greedy max reach",
      code: `def can_jump(nums: list[int]) -> bool:
    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + jump)
    return True`,
    },
  ],
  "Min Cost Climbing Stairs": [
    {
      label: "Memoized step cost",
      code: `def min_cost_climbing_stairs(cost: list[int]) -> int:
    memo = {}

    def dfs(i: int) -> int:
        if i >= len(cost):
            return 0
        if i in memo:
            return memo[i]
        memo[i] = cost[i] + min(dfs(i + 1), dfs(i + 2))
        return memo[i]

    return min(dfs(0), dfs(1))`,
    },
    {
      label: "Non-mutating tabulation",
      code: `def min_cost_climbing_stairs(cost: list[int]) -> int:
    dp = cost[:]
    for i in range(2, len(cost)):
        dp[i] += min(dp[i - 1], dp[i - 2])
    return min(dp[-1], dp[-2])`,
    },
    {
      label: "Two variables",
      code: `def min_cost_climbing_stairs(cost: list[int]) -> int:
    prev2, prev1 = cost[0], cost[1]
    for i in range(2, len(cost)):
        curr = cost[i] + min(prev1, prev2)
        prev2, prev1 = prev1, curr
    return min(prev1, prev2)`,
    },
  ],
  "Partition Equal Subset Sum": [
    {
      label: "Memoized subset search",
      code: `def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    memo = {}

    def dfs(i: int, rem: int) -> bool:
        if rem == 0:
            return True
        if rem < 0 or i == len(nums):
            return False
        key = (i, rem)
        if key not in memo:
            memo[key] = dfs(i + 1, rem) or dfs(i + 1, rem - nums[i])
        return memo[key]

    return dfs(0, target)`,
    },
    {
      label: "2D subset table",
      code: `def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [[False] * (target + 1) for _ in range(len(nums) + 1)]
    for i in range(len(nums) + 1):
        dp[i][0] = True
    for i, num in enumerate(nums, 1):
        for s in range(1, target + 1):
            dp[i][s] = dp[i - 1][s] or (s >= num and dp[i - 1][s - num])
    return dp[-1][target]`,
    },
    {
      label: "1D subset table",
      code: `def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for s in range(target, num - 1, -1):
            dp[s] = dp[s] or dp[s - num]
    return dp[target]`,
    },
  ],
};

for (const kata of blind75Part2) {
  kata.solutionVariants = blind75Part2SolutionVariants[kata.name] ?? kata.solutionVariants;
}

enrichMissingPythonSolutionVariants(blind75Part2);

export { blind75Part2 };
