import type { SeedKata } from "../types/editor";

const neetcodeGreedy: SeedKata[] = [
  {
    name: "Jump Game II",
    category: "greedy",
    language: "ruby",
    difficulty: "medium",
    description: `Given an array of non-negative integers nums where nums[i] represents the maximum jump length from index i, return the minimum number of jumps to reach the last index. You can assume you can always reach the last index.\n\nExample 1:\nInput: nums = [2,3,1,1,4]\nOutput: 2\nExplanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.\n\nExample 2:\nInput: nums = [2,3,0,1,4]\nOutput: 2\n\nConstraints:\n- 1 <= nums.length <= 10^4\n- 0 <= nums[i] <= 1000\n- The answer is guaranteed to exist.\n\nRef: LeetCode #45 Jump Game II`,
    code: `def jump(nums)
  raise NotImplementedError
end`,
    testCode: `def test_jump_basic
  assert_equal(2, jump([2,3,1,1,4]))
end

def test_jump_skip_zero
  assert_equal(2, jump([2,3,0,1,4]))
end

def test_jump_single
  assert_equal(0, jump([0]))
end

def test_jump_two
  assert_equal(1, jump([1,2]))
end`,
    solution: `def jump(nums)
  jumps = 0
  left = right = 0
  while right < nums.length - 1
    farthest = 0
    (left..right).each do |i|
      farthest = [farthest, i + nums[i]].max
    end
    left = right + 1
    right = farthest
    jumps += 1
  end
  jumps
end`,
    usage: null,
    tags: ["greedy", "dynamic-programming", "neetcode"],
  },
  {
    name: "Gas Station",
    category: "greedy",
    language: "ruby",
    difficulty: "medium",
    description: `There are n gas stations along a circular route. You are given two integer arrays gas and cost where gas[i] is the amount of gas at station i and cost[i] is the cost to travel from station i to the next.\n\nReturn the starting station index if you can travel around the circuit once in the clockwise direction. Otherwise, return -1. If a solution exists, it is guaranteed to be unique.\n\nExample 1:\nInput: gas = [1,2,3,4,5], cost = [3,4,5,1,2]\nOutput: 3\n\nExample 2:\nInput: gas = [2,3,4], cost = [3,4,3]\nOutput: -1\n\nConstraints:\n- n == gas.length == cost.length\n- 1 <= n <= 10^5\n- 0 <= gas[i], cost[i] <= 10^4\n\nRef: LeetCode #134 Gas Station`,
    code: `def can_complete_circuit(gas, cost)
  raise NotImplementedError
end`,
    testCode: `def test_gas_station_basic
  assert_equal(3, can_complete_circuit([1,2,3,4,5], [3,4,5,1,2]))
end

def test_gas_station_impossible
  assert_equal(-1, can_complete_circuit([2,3,4], [3,4,3]))
end

def test_gas_station_single_valid
  assert_equal(0, can_complete_circuit([5], [4]))
end

def test_gas_station_single_invalid
  assert_equal(-1, can_complete_circuit([1], [2]))
end`,
    solution: `def can_complete_circuit(gas, cost)
  return -1 if gas.sum < cost.sum
  tank = 0
  start = 0
  (0...gas.length).each do |i|
    tank += gas[i] - cost[i]
    if tank < 0
      tank = 0
      start = i + 1
    end
  end
  start
end`,
    usage: null,
    tags: ["greedy", "neetcode"],
  },
  {
    name: "Hand of Straights",
    category: "greedy",
    language: "ruby",
    difficulty: "medium",
    description: `Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards.\n\nGiven an integer array hand where hand[i] is the value written on the ith card and an integer groupSize, return True if she can rearrange the cards, or False otherwise.\n\nExample 1:\nInput: hand = [1,2,3,6,2,3,4,7,8], groupSize = 3\nOutput: True\nExplanation: Groups: [1,2,3], [2,3,4], [6,7,8]\n\nExample 2:\nInput: hand = [1,2,3,4,5], groupSize = 4\nOutput: False\n\nConstraints:\n- 1 <= hand.length <= 10^4\n- 0 <= hand[i] <= 10^9\n- 1 <= groupSize <= hand.length\n\nRef: LeetCode #846 Hand of Straights`,
    code: `def is_n_straight_hand(hand, group_size)
  raise NotImplementedError
end`,
    testCode: `def test_hand_straights_valid
  assert_equal(true, is_n_straight_hand([1,2,3,6,2,3,4,7,8], 3))
end

def test_hand_straights_invalid
  assert_equal(false, is_n_straight_hand([1,2,3,4,5], 4))
end

def test_hand_straights_single_groups
  assert_equal(true, is_n_straight_hand([1,2,3], 3))
end

def test_hand_straights_not_divisible
  assert_equal(false, is_n_straight_hand([1,2,3,4], 3))
end`,
    solution: `def is_n_straight_hand(hand, group_size)
  return false if hand.length % group_size != 0
  count = Hash.new(0)
  hand.each { |c| count[c] += 1 }
  count.keys.sort.each do |card|
    if count[card] > 0
      n = count[card]
      (0...group_size).each do |i|
        return false if count[card + i] < n
        count[card + i] -= n
      end
    end
  end
  true
end`,
    usage: null,
    tags: ["greedy", "hash-map", "sorting", "neetcode"],
  },
  {
    name: "Merge Triplets to Form Target Triplet",
    category: "greedy",
    language: "ruby",
    difficulty: "medium",
    description: `A triplet is an array of three integers. You are given a 2D integer array triplets and an integer array target of three integers.\n\nYou may apply the following operation any number of times: choose two triplets and replace one with the element-wise maximum.\n\nReturn True if it is possible to obtain target as an element of triplets, or False otherwise. Only consider triplets where no element exceeds target[i].\n\nExample 1:\nInput: triplets = [[2,7,1],[8,1,3],[3,2,1]], target = [8,7,1]\nOutput: True\n\nExample 2:\nInput: triplets = [[1,3,4],[2,5,8]], target = [2,7,9]\nOutput: False\n\nConstraints:\n- 1 <= triplets.length <= 10^5\n- triplets[i].length == target.length == 3\n- 1 <= triplets[i][j], target[j] <= 1000\n\nRef: LeetCode #1899 Merge Triplets to Form Target Triplet`,
    code: `def merge_triplets(triplets, target)
  raise NotImplementedError
end`,
    testCode: `def test_merge_triplets_valid
  assert_equal(true, merge_triplets([[2,7,1],[8,1,1],[3,2,1]], [8,7,1]))
end

def test_merge_triplets_invalid
  assert_equal(false, merge_triplets([[1,3,4],[2,5,8]], [2,7,9]))
end

def test_merge_triplets_single_match
  assert_equal(true, merge_triplets([[8,7,1]], [8,7,1]))
end

def test_merge_triplets_no_valid
  assert_equal(true, merge_triplets([[3,4,5],[4,5,6]], [3,4,5]))
end`,
    solution: `def merge_triplets(triplets, target)
  result = [0, 0, 0]
  triplets.each do |t|
    if t[0] <= target[0] && t[1] <= target[1] && t[2] <= target[2]
      result = (0...3).map { |i| [result[i], t[i]].max }
    end
  end
  result == target
end`,
    usage: null,
    tags: ["greedy", "neetcode"],
  },
  {
    name: "Partition Labels",
    category: "greedy",
    language: "ruby",
    difficulty: "medium",
    description: `You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part.\n\nReturn a list of integers representing the size of these parts.\n\nExample 1:\nInput: s = "ababcbacadefegdehijhklij"\nOutput: [9,7,8]\nExplanation: Partitions are "ababcbaca", "defegde", "hijhklij".\n\nExample 2:\nInput: s = "eccbbbbdec"\nOutput: [10]\n\nConstraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters.\n\nRef: LeetCode #763 Partition Labels`,
    code: `def partition_labels(s)
  raise NotImplementedError
end`,
    testCode: `def test_partition_labels_basic
  assert_equal([9,7,8], partition_labels("ababcbacadefegdehijhklij"))
end

def test_partition_labels_single
  assert_equal([10], partition_labels("eccbbbbdec"))
end

def test_partition_labels_all_unique
  assert_equal([1,1,1], partition_labels("abc"))
end

def test_partition_labels_one_char
  assert_equal([1], partition_labels("a"))
end`,
    solution: `def partition_labels(s)
  last = {}
  s.chars.each_with_index { |c, i| last[c] = i }
  result = []
  start = 0
  end_ = 0
  s.chars.each_with_index do |c, i|
    end_ = [end_, last[c]].max
    if i == end_
      result << (end_ - start + 1)
      start = i + 1
    end
  end
  result
end`,
    usage: null,
    tags: ["greedy", "hash-map", "two-pointers", "neetcode"],
  },
  {
    name: "Valid Parenthesis String",
    category: "greedy",
    language: "ruby",
    difficulty: "medium",
    description: `Given a string s containing only '(', ')' and '*', return True if s is valid.\n\nThe following rules define a valid string:\n- Any left parenthesis '(' must have a corresponding right parenthesis ')'.\n- Any right parenthesis ')' must have a corresponding left parenthesis '('.\n- Left parenthesis '(' must go before the corresponding right parenthesis ')'.\n- '*' could be treated as a single right parenthesis ')' or a single left parenthesis '(' or an empty string "".\n\nExample 1:\nInput: s = "(*))"\nOutput: True\n\nExample 2:\nInput: s = "(*)"\nOutput: True\n\nConstraints:\n- 1 <= s.length <= 100\n- s[i] is '(', ')' or '*'.\n\nRef: LeetCode #678 Valid Parenthesis String`,
    code: `def check_valid_string(s)
  raise NotImplementedError
end`,
    testCode: `def test_valid_paren_star_basic
  assert_equal(true, check_valid_string("(*))"))
end

def test_valid_paren_star_simple
  assert_equal(true, check_valid_string("(*)"))
end

def test_valid_paren_star_open
  assert_equal(true, check_valid_string("(*()"))
end

def test_valid_paren_star_only
  assert_equal(true, check_valid_string("(*"))
end

def test_valid_paren_star_invalid
  assert_equal(false, check_valid_string(")"))
end`,
    solution: `def check_valid_string(s)
  low = 0
  high = 0
  s.chars.each do |c|
    if c == '('
      low += 1
      high += 1
    elsif c == ')'
      low -= 1
      high -= 1
    else
      low -= 1
      high += 1
    end
    return false if high < 0
    low = [low, 0].max
  end
  low == 0
end`,
    usage: null,
    tags: ["greedy", "stack", "dynamic-programming", "neetcode"],
  },
  {
    name: "Minimum Interval to Include Each Query",
    category: "intervals",
    language: "ruby",
    difficulty: "hard",
    description: `You are given a 2D integer array intervals where intervals[i] = [left, right] and an integer array queries.\n\nFor each query, find the minimum size of any interval that contains query. The size of an interval is right - left + 1. If no interval contains query, return -1 for that query.\n\nReturn an integer array containing the answers to the queries in the same order.\n\nExample 1:\nInput: intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]\nOutput: [3,3,1,4]\n\nExample 2:\nInput: intervals = [[2,3],[2,5],[1,8],[20,25]], queries = [2,19,22]\nOutput: [2,-1,6]\n\nConstraints:\n- 1 <= intervals.length <= 10^5\n- 1 <= left <= right <= 10^7\n- 1 <= queries.length <= 10^5\n- 1 <= queries[i] <= 10^7\n\nRef: LeetCode #1851 Minimum Interval to Include Each Query`,
    code: `def min_interval(intervals, queries)
  raise NotImplementedError
end`,
    testCode: `def test_min_interval_basic
  assert_equal([3,3,1,4], min_interval([[1,4],[2,4],[3,6],[4,4]], [2,3,4,5]))
end

def test_min_interval_no_match
  assert_equal([2,-1,6], min_interval([[2,3],[2,5],[1,8],[20,25]], [2,19,22]))
end

def test_min_interval_single
  assert_equal([10], min_interval([[1,10]], [5]))
end

def test_min_interval_exact
  assert_equal([1], min_interval([[3,3]], [3]))
end`,
    solution: `def min_interval(intervals, queries)
  sorted_intervals = intervals.sort
  res = {}
  active = []
  i = 0
  queries.sort.each do |q|
    while i < sorted_intervals.length && sorted_intervals[i][0] <= q
      l, r = sorted_intervals[i]
      active << [r - l + 1, r]
      i += 1
    end
    active.reject! { |size, r| r < q }
    if active.empty?
      res[q] = -1
    else
      res[q] = active.min_by { |size, r| size }[0]
    end
  end
  queries.map { |q| res[q] }
end`,
    usage: null,
    tags: ["intervals", "heap", "sorting", "neetcode"],
  },
];

export { neetcodeGreedy };
