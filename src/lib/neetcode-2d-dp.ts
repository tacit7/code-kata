import type { SeedKata } from "../types/editor";

const neetcode2dDp: SeedKata[] = [
  {
    name: "Best Time to Buy and Sell Stock With Cooldown",
    category: "2-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `You are given an array prices where prices[i] is the price of a stock on day i.\n\nFind the maximum profit you can achieve. You may complete as many transactions as you like with the following restriction: after you sell your stock, you cannot buy stock on the next day (i.e., cooldown one day).\n\nNote: You may not engage in multiple transactions simultaneously (you must sell the stock before you buy again).\n\nExample 1:\nInput: prices = [1,2,3,0,2]\nOutput: 3\nExplanation: transactions = [buy, sell, cooldown, buy, sell]\n\nExample 2:\nInput: prices = [1]\nOutput: 0\n\nConstraints:\n- 1 <= prices.length <= 5000\n- 0 <= prices[i] <= 1000\n\nRef: LeetCode #309 Best Time to Buy and Sell Stock with Cooldown`,
    code: `def max_profit_cooldown(prices)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_cooldown_basic
  assert_equal(3, max_profit_cooldown([1,2,3,0,2]))
end

def test_cooldown_single
  assert_equal(0, max_profit_cooldown([1]))
end

def test_cooldown_two_days
  assert_equal(1, max_profit_cooldown([1,2]))
end

def test_cooldown_decreasing
  assert_equal(0, max_profit_cooldown([5,4,3,2,1]))
end`,
    solution: `def max_profit_cooldown(prices)
  # States: holding, sold (just sold, next is cooldown), cooldown (can buy)
  holding, sold, cooldown = -prices[0], 0, 0
  prices[1..-1].each do |price|
    prev_holding, prev_sold, prev_cooldown = holding, sold, cooldown
    holding = [prev_holding, prev_cooldown - price].max
    sold = prev_holding + price
    cooldown = [prev_cooldown, prev_sold].max
  end
  [sold, cooldown].max
end`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "neetcode"],
  },
  {
    name: "Coin Change II",
    category: "2-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the number of combinations that make up that amount. If that amount of money cannot be made up by any combination of the coins, return 0.\n\nYou may assume that you have an infinite number of each kind of coin. The answer is guaranteed to fit into a signed 32-bit integer.\n\nExample 1:\nInput: amount = 5, coins = [1,2,5]\nOutput: 4\nExplanation: there are four ways to make up the amount:\n5=5\n5=2+2+1\n5=2+1+1+1\n5=1+1+1+1+1\n\nExample 2:\nInput: amount = 3, coins = [2]\nOutput: 0\nExplanation: the amount cannot be made up just with coins of 2.\n\nExample 3:\nInput: amount = 10, coins = [10]\nOutput: 1\n\nConstraints:\n- 1 <= coins.length <= 300\n- 1 <= coins[i] <= 5000\n- 0 <= amount <= 5000\n\nRef: LeetCode #518 Coin Change II`,
    code: `def change(amount, coins)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_coin_change2_basic
  assert_equal(4, change(5, [1,2,5]))
end

def test_coin_change2_impossible
  assert_equal(0, change(3, [2]))
end

def test_coin_change2_exact
  assert_equal(1, change(10, [10]))
end

def test_coin_change2_zero
  assert_equal(1, change(0, [1,2,5]))
end`,
    solution: `def change(amount, coins)
  dp = Array.new(amount + 1, 0)
  dp[0] = 1
  coins.each do |coin|
    (coin..amount).each do |a|
      dp[a] += dp[a - coin]
    end
  end
  dp[amount]
end`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "neetcode"],
  },
  {
    name: "Target Sum",
    category: "2-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `You are given an integer array nums and an integer target.\n\nYou want to build an expression out of nums by adding one of the symbols '+' and '-' before each integer in nums and then concatenate all the integers.\n\nReturn the number of different expressions that you can build which evaluates to target.\n\nExample 1:\nInput: nums = [1,1,1,1,1], target = 3\nOutput: 5\nExplanation: There are 5 ways to assign + and - to make the sum equal to target 3.\n-1+1+1+1+1 = 3\n+1-1+1+1+1 = 3\n+1+1-1+1+1 = 3\n+1+1+1-1+1 = 3\n+1+1+1+1-1 = 3\n\nExample 2:\nInput: nums = [1], target = 1\nOutput: 1\n\nConstraints:\n- 1 <= nums.length <= 20\n- 0 <= nums[i] <= 1000\n- 0 <= sum(nums[i]) <= 1000\n- -1000 <= target <= 1000\n\nRef: LeetCode #494 Target Sum`,
    code: `def find_target_sum_ways(nums, target)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_target_sum_basic
  assert_equal(5, find_target_sum_ways([1,1,1,1,1], 3))
end

def test_target_sum_single
  assert_equal(1, find_target_sum_ways([1], 1))
end

def test_target_sum_single_neg
  assert_equal(1, find_target_sum_ways([1], -1))
end

def test_target_sum_zero
  assert_equal(2, find_target_sum_ways([0], 0))
end`,
    solution: `def find_target_sum_ways(nums, target)
  dp = { 0 => 1 }
  nums.each do |num|
    next_dp = {}
    dp.each do |curr_sum, count|
      next_dp[curr_sum + num] = (next_dp[curr_sum + num] || 0) + count
      next_dp[curr_sum - num] = (next_dp[curr_sum - num] || 0) + count
    end
    dp = next_dp
  end
  dp[target] || 0
end`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "backtracking", "neetcode"],
  },
  {
    name: "Interleaving String",
    category: "2-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `Given strings s1, s2, and s3, find whether s3 is formed by an interleaving of s1 and s2.\n\nAn interleaving of two strings s and t is a configuration where s and t are divided into n and m substrings respectively, and the substrings are interleaved to form the result.\n\nExample 1:\nInput: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"\nOutput: true\n\nExample 2:\nInput: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"\nOutput: false\n\nExample 3:\nInput: s1 = "", s2 = "", s3 = ""\nOutput: true\n\nConstraints:\n- 0 <= s1.length, s2.length <= 100\n- 0 <= s3.length <= 200\n- s1, s2, and s3 consist of lowercase English letters.\n\nRef: LeetCode #97 Interleaving String`,
    code: `def is_interleave(s1, s2, s3)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_interleave_true
  assert_equal(true, is_interleave("aabcc", "dbbca", "aadbbcbcac"))
end

def test_interleave_false
  assert_equal(false, is_interleave("aabcc", "dbbca", "aadbbbaccc"))
end

def test_interleave_empty
  assert_equal(true, is_interleave("", "", ""))
end

def test_interleave_one_empty
  assert_equal(true, is_interleave("abc", "", "abc"))
end`,
    solution: `def is_interleave(s1, s2, s3)
  m, n = s1.length, s2.length
  return false if m + n != s3.length
  dp = Array.new(m + 1) { Array.new(n + 1, false) }
  dp[0][0] = true
  (1..m).each { |i| dp[i][0] = dp[i-1][0] && s1[i-1] == s3[i-1] }
  (1..n).each { |j| dp[0][j] = dp[0][j-1] && s2[j-1] == s3[j-1] }
  (1..m).each do |i|
    (1..n).each do |j|
      dp[i][j] = (dp[i-1][j] && s1[i-1] == s3[i+j-1]) ||
                 (dp[i][j-1] && s2[j-1] == s3[i+j-1])
    end
  end
  dp[m][n]
end`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "string", "neetcode"],
  },
  {
    name: "Longest Increasing Path In a Matrix",
    category: "2-d-dp",
    language: "ruby",
    difficulty: "hard",
    description: `Given an m x n integers matrix, return the length of the longest increasing path in matrix.\n\nFrom each cell, you can either move in four directions: left, right, up, or down. You may not move diagonally or move outside the boundary (i.e., wrap-around is not allowed).\n\nExample 1:\nInput: matrix = [[9,9,4],[6,6,8],[2,1,1]]\nOutput: 4\nExplanation: The longest increasing path is [1,2,6,9].\n\nExample 2:\nInput: matrix = [[3,4,5],[3,2,6],[2,2,1]]\nOutput: 4\nExplanation: The longest increasing path is [3,4,5,6].\n\nExample 3:\nInput: matrix = [[1]]\nOutput: 1\n\nConstraints:\n- m == matrix.length\n- n == matrix[i].length\n- 1 <= m, n <= 200\n- 0 <= matrix[i][j] <= 2^31 - 1\n\nRef: LeetCode #329 Longest Increasing Path in a Matrix`,
    code: `def longest_increasing_path(matrix)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_lip_basic
  assert_equal(4, longest_increasing_path([[9,9,4],[6,6,8],[2,1,1]]))
end

def test_lip_second
  assert_equal(4, longest_increasing_path([[3,4,5],[3,2,6],[2,2,1]]))
end

def test_lip_single
  assert_equal(1, longest_increasing_path([[1]]))
end

def test_lip_two_by_two
  assert_equal(3, longest_increasing_path([[1,2],[2,3]]))
end`,
    solution: `def longest_increasing_path(matrix)
  return 0 if matrix.empty?
  m, n = matrix.length, matrix[0].length
  memo = {}

  dfs = nil
  dfs = ->(r, c) {
    next memo[[r, c]] if memo.key?([r, c])
    best = 1
    [[0,1],[0,-1],[1,0],[-1,0]].each do |dr, dc|
      nr, nc = r + dr, c + dc
      if nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]
        best = [best, 1 + dfs.call(nr, nc)].max
      end
    end
    memo[[r, c]] = best
    best
  }

  best_overall = 0
  (0...m).each do |r|
    (0...n).each do |c|
      best_overall = [best_overall, dfs.call(r, c)].max
    end
  end
  best_overall
end`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "dfs", "neetcode"],
  },
  {
    name: "Distinct Subsequences",
    category: "2-d-dp",
    language: "ruby",
    difficulty: "hard",
    description: `Given two strings s and t, return the number of distinct subsequences of s which equals t.\n\nThe test cases are generated so that the answer fits in a 32-bit signed integer.\n\nExample 1:\nInput: s = "rabbbit", t = "rabbit"\nOutput: 3\nExplanation: There are 3 ways to generate "rabbit" from "rabbbit".\n\nExample 2:\nInput: s = "babgbag", t = "bag"\nOutput: 5\n\nConstraints:\n- 1 <= s.length, t.length <= 1000\n- s and t consist of English letters.\n\nRef: LeetCode #115 Distinct Subsequences`,
    code: `def num_distinct(s, t)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_distinct_subseq_basic
  assert_equal(3, num_distinct("rabbbit", "rabbit"))
end

def test_distinct_subseq_second
  assert_equal(5, num_distinct("babgbag", "bag"))
end

def test_distinct_subseq_empty_t
  assert_equal(1, num_distinct("abc", ""))
end

def test_distinct_subseq_same
  assert_equal(1, num_distinct("a", "a"))
end`,
    solution: `def num_distinct(s, t)
  m, n = s.length, t.length
  dp = Array.new(m + 1) { Array.new(n + 1, 0) }
  (0..m).each { |i| dp[i][0] = 1 }
  (1..m).each do |i|
    (1..n).each do |j|
      dp[i][j] = dp[i-1][j]
      dp[i][j] += dp[i-1][j-1] if s[i-1] == t[j-1]
    end
  end
  dp[m][n]
end`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "string", "neetcode"],
  },
  {
    name: "Edit Distance",
    category: "2-d-dp",
    language: "ruby",
    difficulty: "medium",
    description: `Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character\n\nExample 1:\nInput: word1 = "horse", word2 = "ros"\nOutput: 3\nExplanation:\nhorse -> rorse (replace 'h' with 'r')\nrorse -> rose (delete 'r')\nrose -> ros (delete 'e')\n\nExample 2:\nInput: word1 = "intention", word2 = "execution"\nOutput: 5\n\nConstraints:\n- 0 <= word1.length, word2.length <= 500\n- word1 and word2 consist of lowercase English letters.\n\nRef: LeetCode #72 Edit Distance`,
    code: `def min_distance(word1, word2)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_edit_distance_basic
  assert_equal(3, min_distance("horse", "ros"))
end

def test_edit_distance_second
  assert_equal(5, min_distance("intention", "execution"))
end

def test_edit_distance_empty
  assert_equal(0, min_distance("", ""))
end

def test_edit_distance_one_empty
  assert_equal(1, min_distance("a", ""))
end`,
    solution: `def min_distance(word1, word2)
  m, n = word1.length, word2.length
  dp = (0..n).to_a
  (1..m).each do |i|
    prev = dp[0]
    dp[0] = i
    (1..n).each do |j|
      temp = dp[j]
      if word1[i-1] == word2[j-1]
        dp[j] = prev
      else
        dp[j] = 1 + [prev, dp[j], dp[j-1]].min
      end
      prev = temp
    end
  end
  dp[n]
end`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "string", "neetcode"],
  },
  {
    name: "Burst Balloons",
    category: "2-d-dp",
    language: "ruby",
    difficulty: "hard",
    description: `You are given n balloons, indexed from 0 to n-1. Each balloon is painted with a number on it represented by an array nums. You are asked to burst all the balloons.\n\nIf you burst the ith balloon, you will get nums[i-1] * nums[i] * nums[i+1] coins. If i-1 or i+1 goes out of bounds of the array, treat it as if there is a balloon with a 1 painted on it.\n\nReturn the maximum coins you can collect by bursting the balloons wisely.\n\nExample 1:\nInput: nums = [3,1,5,8]\nOutput: 167\nExplanation: nums = [3,1,5,8] → [3,5,8] → [3,8] → [8] → []\ncoins = 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 167\n\nExample 2:\nInput: nums = [1,5]\nOutput: 10\n\nConstraints:\n- n == nums.length\n- 1 <= n <= 300\n- 0 <= nums[i] <= 100\n\nRef: LeetCode #312 Burst Balloons`,
    code: `def max_coins(nums)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_burst_balloons_basic
  assert_equal(167, max_coins([3,1,5,8]))
end

def test_burst_balloons_two
  assert_equal(10, max_coins([1,5]))
end

def test_burst_balloons_single
  assert_equal(5, max_coins([5]))
end

def test_burst_balloons_uniform
  assert_equal(3, max_coins([1,1,1]))
end`,
    solution: `def max_coins(nums)
  nums = [1] + nums + [1]
  n = nums.length
  dp = Array.new(n) { Array.new(n, 0) }
  (2...n).each do |length|
    (0...(n - length)).each do |left|
      right = left + length
      (left + 1...right).each do |k|
        dp[left][right] = [
          dp[left][right],
          dp[left][k] + nums[left] * nums[k] * nums[right] + dp[k][right]
        ].max
      end
    end
  end
  dp[0][n-1]
end`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "neetcode"],
  },
  {
    name: "Regular Expression Matching",
    category: "2-d-dp",
    language: "ruby",
    difficulty: "hard",
    description: `Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:\n- '.' matches any single character.\n- '*' matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).\n\nExample 1:\nInput: s = "aa", p = "a"\nOutput: false\nExplanation: "a" does not match the entire string "aa".\n\nExample 2:\nInput: s = "aa", p = "a*"\nOutput: true\nExplanation: '*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes "aa".\n\nExample 3:\nInput: s = "ab", p = ".*"\nOutput: true\nExplanation: ".*" means "zero or more (*) of any character (.)".\n\nExample 4:\nInput: s = "aab", p = "c*a*b"\nOutput: true\n\nConstraints:\n- 1 <= s.length <= 20\n- 1 <= p.length <= 30\n- s contains only lowercase English letters.\n- p contains only lowercase English letters, '.', and '*'.\n- It is guaranteed for each appearance of '*', there will be a previous valid character to match.\n\nRef: LeetCode #10 Regular Expression Matching`,
    code: `def is_match(s, p)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_regex_no_match
  assert_equal(false, is_match("aa", "a"))
end

def test_regex_star_repeat
  assert_equal(true, is_match("aa", "a*"))
end

def test_regex_dot_star
  assert_equal(true, is_match("ab", ".*"))
end

def test_regex_complex
  assert_equal(true, is_match("aab", "c*a*b"))
end`,
    solution: `def is_match(s, p)
  m, n = s.length, p.length
  dp = Array.new(m + 1) { Array.new(n + 1, false) }
  dp[0][0] = true
  (2..n).each do |j|
    dp[0][j] = dp[0][j-2] if p[j-1] == '*'
  end
  (1..m).each do |i|
    (1..n).each do |j|
      if p[j-1] == '*'
        dp[i][j] = dp[i][j-2]
        if p[j-2] == '.' || p[j-2] == s[i-1]
          dp[i][j] = dp[i][j] || dp[i-1][j]
        end
      elsif p[j-1] == '.' || p[j-1] == s[i-1]
        dp[i][j] = dp[i-1][j-1]
      end
    end
  end
  dp[m][n]
end`,
    usage: null,
    tags: ["dynamic-programming", "2d-dp", "string", "recursion", "neetcode"],
  },
];

export { neetcode2dDp };
