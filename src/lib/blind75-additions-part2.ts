import type { SeedKata } from "../types/editor";

const blind75Part2: SeedKata[] = [
  {
    name: "Coin Change",
    category: "1-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `Given coins of different denominations and an amount, find the fewest coins needed to make up that amount. Return -1 if impossible.\n\nExample:\nInput: coins = [1,5,11], amount = 11\nOutput: 1 (use one 11-coin)\n\nExample 2:\nInput: coins = [2], amount = 3\nOutput: -1\n\nConstraints:\n- 1 <= coins.length <= 12\n- 1 <= coins[i] <= 2^31 - 1\n- 0 <= amount <= 10^4`,
    code: `def coin_change(coins, amount)
  raise NotImplementedError
end`,
    testCode: `def test_coin_change_basic
  assert_equal(1, coin_change([1, 5, 11], 11))
end

def test_impossible
  assert_equal(-1, coin_change([2], 3))
end

def test_zero_amount
  assert_equal(0, coin_change([1], 0))
end

def test_multiple_coins
  assert_equal(3, coin_change([1, 2, 5], 11))
end`,
    solution: `def coin_change(coins, amount)
  dp = [Float::INFINITY] * (amount + 1)
  dp[0] = 0
  (1..amount).each do |i|
    coins.each do |c|
      dp[i] = [dp[i], dp[i - c] + 1].min if c <= i
    end
  end
  dp[amount] != Float::INFINITY ? dp[amount] : -1
end`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "neetcode", "1d-dp"],
  },
  {
    name: "Longest Increasing Subsequence",
    category: "1-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `Given an integer array nums, return the length of the longest strictly increasing subsequence.\n\nExample:\nInput: nums = [10,9,2,5,3,7,101,18]\nOutput: 4 ([2,3,7,101])\n\nConstraints:\n- 1 <= nums.length <= 2500\n- -10^4 <= nums[i] <= 10^4`,
    code: `def length_of_lis(nums)
  raise NotImplementedError
end`,
    testCode: `def test_lis_basic
  assert_equal(4, length_of_lis([10, 9, 2, 5, 3, 7, 101, 18]))
end

def test_lis_mixed
  assert_equal(4, length_of_lis([0, 1, 0, 3, 2, 3]))
end

def test_lis_all_same
  assert_equal(1, length_of_lis([7, 7, 7, 7, 7]))
end

def test_lis_single
  assert_equal(1, length_of_lis([5]))
end`,
    solution: `def length_of_lis(nums)
  sub = []
  nums.each do |num|
    pos = sub.bsearch_index { |x| x >= num }
    if pos.nil?
      sub.append(num)
    else
      sub[pos] = num
    end
  end
  sub.length
end`,
    usage: null,
    tags: ["dynamic-programming", "binary-search", "blind75", "neetcode", "1d-dp"],
  },
  {
    name: "Word Break",
    category: "1-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `Given a string s and a dictionary of strings wordDict, return true if s can be segmented into space-separated words from the dictionary.\n\nExample:\nInput: s = "leetcode", wordDict = ["leet","code"]\nOutput: True\n\nConstraints:\n- 1 <= s.length <= 300\n- 1 <= wordDict.length <= 1000\n- 1 <= wordDict[i].length <= 20`,
    code: `def word_break(s, word_dict)
  raise NotImplementedError
end`,
    testCode: `def test_word_break_basic
  assert_equal(true, word_break("leetcode", ["leet", "code"]))
end

def test_word_break_false
  assert_equal(false, word_break("catsandog", ["cats", "dog", "sand", "and", "cat"]))
end

def test_word_break_reuse
  assert_equal(true, word_break("applepenapple", ["apple", "pen"]))
end

def test_word_break_single
  assert_equal(true, word_break("a", ["a"]))
end`,
    solution: `def word_break(s, word_dict)
  word_set = word_dict.to_h { |w| [w, true] }
  n = s.length
  dp = Array.new(n + 1, false)
  dp[0] = true
  (1..n).each do |i|
    (0...i).each do |j|
      if dp[j] && word_set[s[j...i]]
        dp[i] = true
        break
      end
    end
  end
  dp[n]
end`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "neetcode", "1d-dp"],
  },
  {
    name: "Combination Sum IV",
    category: "1-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `Given an array of distinct integers nums and a target integer, return the number of possible combinations that add up to target. Order matters.\n\nExample:\nInput: nums = [1,2,3], target = 4\nOutput: 7\n\nConstraints:\n- 1 <= nums.length <= 200\n- 1 <= nums[i] <= 1000\n- All nums[i] are unique\n- 1 <= target <= 1000`,
    code: `def combination_sum4(nums, target)
  raise NotImplementedError
end`,
    testCode: `def test_combination_sum4_basic
  assert_equal(7, combination_sum4([1, 2, 3], 4))
end

def test_combination_sum4_impossible
  assert_equal(0, combination_sum4([9], 3))
end

def test_combination_sum4_single
  assert_equal(1, combination_sum4([1], 1))
end

def test_combination_sum4_two
  assert_equal(3, combination_sum4([1, 2], 3))
end`,
    solution: `def combination_sum4(nums, target)
  dp = Array.new(target + 1, 0)
  dp[0] = 1
  (1..target).each do |i|
    nums.each do |num|
      dp[i] += dp[i - num] if num <= i
    end
  end
  dp[target]
end`,
    usage: null,
    tags: ["dynamic-programming", "blind75"],
  },
  {
    name: "House Robber",
    category: "1-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `You are a robber planning to rob houses along a street. Adjacent houses have alarms. Given nums[i] = amount of money in house i, return the max amount you can rob without alerting police.\n\nExample:\nInput: nums = [1,2,3,1]\nOutput: 4\n\nConstraints:\n- 1 <= nums.length <= 100\n- 0 <= nums[i] <= 400`,
    code: `def rob(nums)
  raise NotImplementedError
end`,
    testCode: `def test_rob_basic
  assert_equal(4, rob([1, 2, 3, 1]))
end

def test_rob_five_houses
  assert_equal(12, rob([2, 7, 9, 3, 1]))
end

def test_rob_single
  assert_equal(1, rob([1]))
end

def test_rob_two
  assert_equal(2, rob([2, 1]))
end`,
    solution: `def rob(nums)
  prev2 = 0
  prev1 = 0
  nums.each do |num|
    curr = [prev1, prev2 + num].max
    prev2 = prev1
    prev1 = curr
  end
  prev1
end`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "neetcode", "1d-dp"],
  },
  {
    name: "House Robber II",
    category: "1-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `Houses are arranged in a circle. Adjacent houses have alarms. Return the max amount you can rob.\n\nExample:\nInput: nums = [2,3,2]\nOutput: 3\n\nConstraints:\n- 1 <= nums.length <= 100\n- 0 <= nums[i] <= 1000`,
    code: `def rob2(nums)
  raise NotImplementedError
end`,
    testCode: `def test_rob2_basic
  assert_equal(3, rob2([2, 3, 2]))
end

def test_rob2_four_houses
  assert_equal(4, rob2([1, 2, 3, 1]))
end

def test_rob2_three_houses
  assert_equal(3, rob2([1, 2, 3]))
end

def test_rob2_single
  assert_equal(0, rob2([0]))
end`,
    solution: `def rob2(nums)
  return nums[0] if nums.length == 1

  rob_linear = lambda do |houses|
    prev2 = 0
    prev1 = 0
    houses.each do |num|
      curr = [prev1, prev2 + num].max
      prev2 = prev1
      prev1 = curr
    end
    prev1
  end

  [rob_linear.call(nums[0...-1]), rob_linear.call(nums[1..])].max
end`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "neetcode", "1d-dp"],
  },
  {
    name: "Decode Ways",
    category: "1-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `A string of digits can be decoded where A=1, B=2, ..., Z=26. Given a string s, return the number of ways to decode it.\n\nExample:\nInput: s = "226"\nOutput: 3 ("BZ","VF","BBF")\n\nConstraints:\n- 1 <= s.length <= 100\n- s contains only digits\n- s may contain leading zeros`,
    code: `def num_decodings(s)
  raise NotImplementedError
end`,
    testCode: `def test_decode_two_ways
  assert_equal(2, num_decodings("12"))
end

def test_decode_three_ways
  assert_equal(3, num_decodings("226"))
end

def test_decode_zero
  assert_equal(0, num_decodings("0"))
end

def test_decode_leading_zero
  assert_equal(0, num_decodings("06"))
end`,
    solution: `def num_decodings(s)
  n = s.length
  dp = Array.new(n + 1, 0)
  dp[0] = 1
  dp[1] = s[0] == "0" ? 0 : 1
  (2..n).each do |i|
    one = s[i - 1].to_i
    two = s[i - 2...i].to_i
    dp[i] += dp[i - 1] if one != 0
    dp[i] += dp[i - 2] if two >= 10 && two <= 26
  end
  dp[n]
end`,
    usage: null,
    tags: ["dynamic-programming", "blind75", "neetcode", "1d-dp"],
  },
  {
    name: "Unique Paths",
    category: "2-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `A robot starts at top-left of an m x n grid and can only move right or down. How many unique paths reach bottom-right?\n\nExample:\nInput: m = 3, n = 7\nOutput: 28\n\nConstraints:\n- 1 <= m, n <= 100`,
    code: `def unique_paths(m, n)
  raise NotImplementedError
end`,
    testCode: `def test_unique_paths_basic
  assert_equal(28, unique_paths(3, 7))
end

def test_unique_paths_small
  assert_equal(3, unique_paths(3, 2))
end

def test_unique_paths_transposed
  assert_equal(28, unique_paths(7, 3))
end

def test_unique_paths_single
  assert_equal(1, unique_paths(1, 1))
end`,
    solution: `def unique_paths(m, n)
  dp = Array.new(m) { Array.new(n, 1) }
  (1...m).each do |r|
    (1...n).each do |c|
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    end
  end
  dp[m - 1][n - 1]
end`,
    usage: null,
    tags: ["dynamic-programming", "math", "blind75"],
  },
  {
    name: "Jump Game",
    category: "1-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `Given an integer array nums where nums[i] is the max jump length from position i, return true if you can reach the last index.\n\nExample:\nInput: nums = [2,3,1,1,4]\nOutput: True\n\nInput: nums = [3,2,1,0,4]\nOutput: False\n\nConstraints:\n- 1 <= nums.length <= 10^4\n- 0 <= nums[i] <= 10^5`,
    code: `def can_jump(nums)
  raise NotImplementedError
end`,
    testCode: `def test_can_jump_true
  assert_equal(true, can_jump([2, 3, 1, 1, 4]))
end

def test_can_jump_false
  assert_equal(false, can_jump([3, 2, 1, 0, 4]))
end

def test_can_jump_single
  assert_equal(true, can_jump([0]))
end

def test_can_jump_two
  assert_equal(true, can_jump([1, 0]))
end`,
    solution: `def can_jump(nums)
  max_reach = 0
  nums.each_with_index do |jump, i|
    return false if i > max_reach

    max_reach = [max_reach, i + jump].max
  end
  true
end`,
    usage: null,
    tags: ["dynamic-programming", "greedy", "blind75"],
  },
  {
    name: "Min Cost Climbing Stairs",
    category: "1-d-dp",
    language: "ruby",
    difficulty: "easy",
    description: `You are given an integer array cost where cost[i] is the cost of the i-th step. You can either start from step 0 or step 1. On each step, you can climb 1 or 2 steps. Return the minimum cost to reach the top (beyond the last step).\n\nExample 1:\nInput: cost = [10,15,20]\nOutput: 15\nExplanation: Start at step 1, pay 15, climb 2 steps to the top.\n\nExample 2:\nInput: cost = [1,100,1,1,1,100,1,1,100,1]\nOutput: 6\n\nConstraints:\n- 2 <= cost.length <= 1000\n- 0 <= cost[i] <= 999\n\nRef: LeetCode #746 Min Cost Climbing Stairs`,
    code: `def min_cost_climbing_stairs(cost)
  raise NotImplementedError
end`,
    testCode: `def test_min_cost_basic
  assert_equal(15, min_cost_climbing_stairs([10, 15, 20]))
end

def test_min_cost_longer
  assert_equal(6, min_cost_climbing_stairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]))
end

def test_min_cost_two
  assert_equal(0, min_cost_climbing_stairs([0, 0]))
end

def test_min_cost_equal
  assert_equal(2, min_cost_climbing_stairs([1, 1, 1, 1]))
end`,
    solution: `def min_cost_climbing_stairs(cost)
  n = cost.length
  (2...n).each do |i|
    cost[i] += [cost[i - 1], cost[i - 2]].min
  end
  [cost[-1], cost[-2]].min
end`,
    usage: null,
    tags: ["dynamic-programming", "neetcode", "1d-dp"],
  },
  {
    name: "Partition Equal Subset Sum",
    category: "1-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `Given an integer array nums, return true if you can partition it into two subsets with equal sum, false otherwise.\n\nExample 1:\nInput: nums = [1,5,11,5]\nOutput: True  (subsets [1,5,5] and [11])\n\nExample 2:\nInput: nums = [1,2,3,5]\nOutput: False\n\nConstraints:\n- 1 <= nums.length <= 200\n- 1 <= nums[i] <= 100\n\nRef: LeetCode #416 Partition Equal Subset Sum`,
    code: `def can_partition(nums)
  raise NotImplementedError
end`,
    testCode: `def test_can_partition_true
  assert_equal(true, can_partition([1, 5, 11, 5]))
end

def test_can_partition_false
  assert_equal(false, can_partition([1, 2, 3, 5]))
end

def test_can_partition_odd_sum
  assert_equal(false, can_partition([1, 1, 1]))
end

def test_can_partition_two
  assert_equal(true, can_partition([3, 3]))
end`,
    solution: `def can_partition(nums)
  total = nums.sum
  return false if total.odd?

  target = total / 2
  dp = { 0 => true }
  nums.each do |n|
    dp.keys.each do |s|
      dp[s + n] = true
    end
    return true if dp[target]
  end
  false
end`,
    usage: null,
    tags: ["dynamic-programming", "neetcode", "1d-dp"],
  },
];

export { blind75Part2 };
