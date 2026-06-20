import type { SeedKata } from "../types/editor";

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
    tags: ["dynamic-programming", "blind75"],
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
    tags: ["dynamic-programming", "binary-search", "blind75"],
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
    tags: ["dynamic-programming", "blind75"],
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
    tags: ["dynamic-programming", "blind75"],
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
    tags: ["dynamic-programming", "blind75"],
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
    tags: ["dynamic-programming", "blind75"],
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
    tags: ["dynamic-programming", "blind75"],
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
    tags: ["dynamic-programming", "math", "blind75"],
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
    tags: ["dynamic-programming", "greedy", "blind75"],
  },
];

export { blind75Part2 };
