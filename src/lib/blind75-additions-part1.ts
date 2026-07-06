import type { SeedKata } from "../types/editor";

const blind75Part1: SeedKata[] = [
  {
    name: "Best Time to Buy and Sell Stock",
    category: "arrays",
    language: "ruby",
    difficulty: "easy",
    description: `Given an array prices where prices[i] is the price of a stock on day i, find the maximum profit from one buy and one sell. Return 0 if no profit possible.

Example:
Input: prices = [7,1,5,3,6,4]
Output: 5

Constraints:
- 1 <= prices.length <= 10^5
- 0 <= prices[i] <= 10^4

Ref: LeetCode #121 Best Time to Buy and Sell Stock`,
    code: `def max_profit(prices)
  raise NotImplementedError
end`,
    testCode: `def test_basic_case
  assert_equal(5, max_profit([7, 1, 5, 3, 6, 4]))
end

def test_descending_prices
  assert_equal(0, max_profit([7, 6, 4, 3, 1]))
end

def test_single_price
  assert_equal(0, max_profit([1]))
end

def test_two_prices
  assert_equal(1, max_profit([1, 2]))
end`,
    solution: `def max_profit(prices)
  min_price = Float::INFINITY
  best_profit = 0
  prices.each do |price|
    if price < min_price
      min_price = price
    elsif price - min_price > best_profit
      best_profit = price - min_price
    end
  end
  best_profit
end`,
    usage: null,
    tags: ["array", "sliding-window", "blind75"],
  },
  {
    name: "Contains Duplicate",
    category: "arrays",
    language: "ruby",
    difficulty: "easy",
    description: `Given an integer array nums, return true if any value appears at least twice.

Example:
Input: nums = [1,2,3,1]
Output: True

Constraints:
- 1 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9`,
    code: `def contains_duplicate(nums)
  raise NotImplementedError
end`,
    testCode: `def test_has_duplicate
  assert_equal(true, contains_duplicate([1, 2, 3, 1]))
end

def test_no_duplicate
  assert_equal(false, contains_duplicate([1, 2, 3, 4]))
end

def test_all_same
  assert_equal(true, contains_duplicate([1, 1, 1, 1]))
end

def test_single_element
  assert_equal(false, contains_duplicate([1]))
end`,
    solution: `def contains_duplicate(nums)
  seen = {}
  nums.each do |num|
    return true if seen[num]
    seen[num] = true
  end
  false
end`,
    usage: null,
    tags: ["array", "hash-map", "blind75", "neetcode", "arrays-hashing"],
  },
  {
    name: "Product of Array Except Self",
    category: "arrays",
    language: "ruby",
    difficulty: "medium",
    description: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all elements except nums[i]. No division allowed. O(n) time.

Example:
Input: nums = [1,2,3,4]
Output: [24,12,8,6]

Constraints:
- 2 <= nums.length <= 10^5
- -30 <= nums[i] <= 30`,
    code: `def product_except_self(nums)
  raise NotImplementedError
end`,
    testCode: `def test_basic_case
  assert_equal([24, 12, 8, 6], product_except_self([1, 2, 3, 4]))
end

def test_with_negatives_and_zero
  assert_equal([0, 0, 9, 0, 0], product_except_self([-1, 1, 0, -3, 3]))
end

def test_two_elements
  assert_equal([3, 2], product_except_self([2, 3]))
end

def test_with_zeros
  assert_equal([0, 0], product_except_self([0, 0]))
end`,
    solution: `def product_except_self(nums)
  n = nums.length
  result = Array.new(n, 1)

  prefix = 1
  (0...n).each do |i|
    result[i] = prefix
    prefix *= nums[i]
  end

  suffix = 1
  (n - 1).downto(0) do |i|
    result[i] *= suffix
    suffix *= nums[i]
  end

  result
end`,
    usage: null,
    tags: ["array", "prefix-sum", "blind75", "neetcode", "arrays-hashing"],
  },
  {
    name: "Maximum Product Subarray",
    category: "arrays",
    language: "ruby",
    difficulty: "medium",
    description: `Given an integer array nums, find the subarray with the largest product and return the product.

Example:
Input: nums = [2,3,-2,4]
Output: 6

Constraints:
- 1 <= nums.length <= 2 * 10^4
- -10 <= nums[i] <= 10`,
    code: `def max_product(nums)
  raise NotImplementedError
end`,
    testCode: `def test_basic_case
  assert_equal(6, max_product([2, 3, -2, 4]))
end

def test_with_zero
  assert_equal(0, max_product([-2, 0, -1]))
end

def test_all_negative
  assert_equal(12, max_product([-2, -3, -4]))
end

def test_single_element
  assert_equal(-1, max_product([-1]))
end`,
    solution: `def max_product(nums)
  result = nums.max
  cur_min, cur_max = 1, 1

  nums.each do |n|
    if n == 0
      cur_min, cur_max = 1, 1
      next
    end
    tmp = cur_max * n
    cur_max = [n * cur_max, n * cur_min, n].max
    cur_min = [tmp, n * cur_min, n].min
    result = [result, cur_max].max
  end

  result
end`,
    usage: null,
    tags: ["array", "dynamic-programming", "blind75", "neetcode", "1d-dp"],
  },
  {
    name: "Find Minimum in Rotated Sorted Array",
    category: "arrays",
    language: "ruby",
    difficulty: "medium",
    description: `Given a sorted array rotated between 1 and n times, find the minimum element. O(log n) time.

Example:
Input: nums = [3,4,5,1,2]
Output: 1

Constraints:
- n == nums.length
- 1 <= n <= 5000
- -5000 <= nums[i] <= 5000
- All integers are unique`,
    code: `def find_min(nums)
  raise NotImplementedError
end`,
    testCode: `def test_basic_rotation
  assert_equal(1, find_min([3, 4, 5, 1, 2]))
end

def test_larger_rotation
  assert_equal(0, find_min([4, 5, 6, 7, 0, 1, 2]))
end

def test_single_element
  assert_equal(1, find_min([1]))
end

def test_two_elements
  assert_equal(1, find_min([2, 1]))
end`,
    solution: `def find_min(nums)
  left, right = 0, nums.length - 1

  while left < right
    mid = (left + right) / 2
    if nums[mid] > nums[right]
      left = mid + 1
    else
      right = mid
    end
  end

  nums[left]
end`,
    usage: null,
    tags: ["array", "binary-search", "blind75", "neetcode"],
  },
  {
    name: "Search in Rotated Sorted Array",
    category: "arrays",
    language: "ruby",
    difficulty: "medium",
    description: `Search target in a rotated sorted array. Return index or -1. O(log n).

Example:
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4

Constraints:
- 1 <= nums.length <= 5000
- All values unique
- -10^4 <= nums[i], target <= 10^4`,
    code: `def search(nums, target)
  raise NotImplementedError
end`,
    testCode: `def test_target_in_right_half
  assert_equal(4, search([4, 5, 6, 7, 0, 1, 2], 0))
end

def test_target_not_found
  assert_equal(-1, search([4, 5, 6, 7, 0, 1, 2], 3))
end

def test_target_in_left_half
  assert_equal(2, search([4, 5, 6, 7, 0, 1, 2], 6))
end

def test_single_element_match
  assert_equal(0, search([1], 1))
end`,
    solution: `def search(nums, target)
  left, right = 0, nums.length - 1

  while left <= right
    mid = (left + right) / 2
    return mid if nums[mid] == target

    if nums[left] <= nums[mid]
      if nums[left] <= target && target < nums[mid]
        right = mid - 1
      else
        left = mid + 1
      end
    else
      if nums[mid] < target && target <= nums[right]
        left = mid + 1
      else
        right = mid - 1
      end
    end
  end

  -1
end`,
    usage: null,
    tags: ["array", "binary-search", "blind75", "neetcode"],
  },
  {
    name: "Two Sum II - Input Array Is Sorted",
    category: "arrays",
    language: "ruby",
    difficulty: "medium",
    description: `Given a 1-indexed sorted array of integers, find two numbers that add up to a target. Return their indices (1-indexed). You may not use the same element twice. There is exactly one solution.\n\nExample 1:\nInput: numbers = [2,7,11,15], target = 9\nOutput: [1,2]\n\nExample 2:\nInput: numbers = [2,3,4], target = 6\nOutput: [1,3]\n\nConstraints:\n- 2 <= numbers.length <= 3 * 10^4\n- -1000 <= numbers[i] <= 1000\n- numbers is sorted in non-decreasing order\n- Only one valid solution exists\n\nRef: LeetCode #167 Two Sum II`,
    code: `def two_sum_ii(numbers, target)
  raise NotImplementedError
end`,
    testCode: `def test_two_sum_ii_basic
  assert_equal([1, 2], two_sum_ii([2, 7, 11, 15], 9))
end

def test_two_sum_ii_middle
  assert_equal([1, 3], two_sum_ii([2, 3, 4], 6))
end

def test_two_sum_ii_end
  assert_equal([1, 2], two_sum_ii([-1, 0], -1))
end

def test_two_sum_ii_negatives
  assert_equal([4, 5], two_sum_ii([1, 2, 3, 4, 4, 9, 56, 90], 8))
end`,
    solution: `def two_sum_ii(numbers, target)
  left, right = 0, numbers.length - 1
  while left < right
    total = numbers[left] + numbers[right]
    if total == target
      return [left + 1, right + 1]
    elsif total < target
      left += 1
    else
      right -= 1
    end
  end
  []
end`,
    usage: null,
    tags: ["array", "two-pointers", "binary-search", "neetcode"],
  },
  {
    name: "3Sum",
    category: "arrays",
    language: "ruby",
    difficulty: "medium",
    description: `Given an integer array nums, return all unique triplets that sum to zero.

Example:
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]

Constraints:
- 3 <= nums.length <= 3000
- -10^5 <= nums[i] <= 10^5`,
    code: `def three_sum(nums)
  raise NotImplementedError
end`,
    testCode: `def test_basic_case
  result = three_sum([-1, 0, 1, 2, -1, -4])
  assert_equal([[-1, -1, 2], [-1, 0, 1]].sort, result.sort)
end

def test_no_triplets
  assert_equal([], three_sum([0, 1, 1]))
end

def test_all_zeros
  assert_equal([[0, 0, 0]], three_sum([0, 0, 0]))
end

def test_no_valid_combination
  assert_equal([], three_sum([1, 2, 3]))
end`,
    solution: `def three_sum(nums)
  nums = nums.sort
  result = []

  (0..nums.length - 3).each do |i|
    next if i > 0 && nums[i] == nums[i - 1]
    left, right = i + 1, nums.length - 1
    while left < right
      total = nums[i] + nums[left] + nums[right]
      if total == 0
        result << [nums[i], nums[left], nums[right]]
        left += 1 while left < right && nums[left] == nums[left + 1]
        right -= 1 while left < right && nums[right] == nums[right - 1]
        left += 1
        right -= 1
      elsif total < 0
        left += 1
      else
        right -= 1
      end
    end
  end

  result
end`,
    usage: null,
    tags: ["array", "two-pointers", "blind75", "neetcode"],
  },
  {
    name: "Container With Most Water",
    category: "arrays",
    language: "ruby",
    difficulty: "medium",
    description: `Given n vertical lines at positions 0..n-1 with heights height[i], find the two lines that form a container holding the most water.

Example:
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49

Constraints:
- n == height.length
- 2 <= n <= 10^5
- 0 <= height[i] <= 10^4`,
    code: `def max_area(height)
  raise NotImplementedError
end`,
    testCode: `def test_basic_case
  assert_equal(49, max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))
end

def test_two_elements
  assert_equal(1, max_area([1, 1]))
end

def test_ascending
  assert_equal(6, max_area([1, 2, 3, 4, 5]))
end

def test_descending
  assert_equal(6, max_area([5, 4, 3, 2, 1]))
end`,
    solution: `def max_area(height)
  left, right = 0, height.length - 1
  max_water = 0

  while left < right
    water = [height[left], height[right]].min * (right - left)
    max_water = [max_water, water].max
    if height[left] < height[right]
      left += 1
    else
      right -= 1
    end
  end

  max_water
end`,
    usage: null,
    tags: ["array", "two-pointers", "blind75", "neetcode"],
  },
  {
    name: "Trapping Rain Water",
    category: "arrays",
    language: "ruby",
    difficulty: "hard",
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n\nExample 1:\nInput: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\n\nExample 2:\nInput: height = [4,2,0,3,2,5]\nOutput: 9\n\nConstraints:\n- n == height.length\n- 1 <= n <= 2 * 10^4\n- 0 <= height[i] <= 10^5\n\nRef: LeetCode #42 Trapping Rain Water`,
    code: `def trap(height)
  raise NotImplementedError
end`,
    testCode: `def test_trap_basic
  assert_equal(6, trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))
end

def test_trap_simple
  assert_equal(9, trap([4, 2, 0, 3, 2, 5]))
end

def test_trap_flat
  assert_equal(0, trap([3, 3, 3]))
end

def test_trap_single
  assert_equal(0, trap([1]))
end`,
    solution: `def trap(height)
  return 0 if height.empty?
  left, right = 0, height.length - 1
  left_max, right_max = height[left], height[right]
  water = 0
  while left < right
    if left_max <= right_max
      left += 1
      left_max = [left_max, height[left]].max
      water += left_max - height[left]
    else
      right -= 1
      right_max = [right_max, height[right]].max
      water += right_max - height[right]
    end
  end
  water
end`,
    usage: null,
    tags: ["array", "two-pointers", "stack", "neetcode"],
  },
  {
    name: "Sum of Two Integers",
    category: "binary",
    language: "ruby",
    difficulty: "medium",
    description: `Calculate the sum of two integers without using + or - operators.

Example:
Input: a = 1, b = 2
Output: 3

Constraints:
- -1000 <= a, b <= 1000`,
    code: `def get_sum(a, b)
  raise NotImplementedError
end`,
    testCode: `def test_basic_addition
  assert_equal(3, get_sum(1, 2))
end

def test_another_addition
  assert_equal(5, get_sum(2, 3))
end

def test_cancel_out
  assert_equal(0, get_sum(-1, 1))
end

def test_both_negative
  assert_equal(-8, get_sum(-5, -3))
end`,
    solution: `def get_sum(a, b)
  mask = 0xFFFFFFFF
  while (b & mask) != 0
    carry = (a & b) << 1
    a = a ^ b
    b = carry
  end
  if b != 0
    a & mask
  else
    a
  end
end`,
    usage: null,
    tags: ["bit-manipulation", "blind75"],
  },
  {
    name: "Counting Bits",
    category: "binary",
    language: "ruby",
    difficulty: "easy",
    description: `Given an integer n, return an array ans of length n+1 such that ans[i] is the number of 1 bits in the binary representation of i.

Example:
Input: n = 5
Output: [0,1,1,2,1,2]

Constraints:
- 0 <= n <= 10^5`,
    code: `def count_bits(n)
  raise NotImplementedError
end`,
    testCode: `def test_small_n
  assert_equal([0, 1, 1], count_bits(2))
end

def test_larger_n
  assert_equal([0, 1, 1, 2, 1, 2], count_bits(5))
end

def test_zero
  assert_equal([0], count_bits(0))
end

def test_one
  assert_equal([0, 1], count_bits(1))
end`,
    solution: `def count_bits(n)
  dp = Array.new(n + 1, 0)
  (1..n).each do |i|
    dp[i] = dp[i >> 1] + (i & 1)
  end
  dp
end`,
    usage: null,
    tags: ["bit-manipulation", "dynamic-programming", "blind75"],
  },
  {
    name: "Missing Number",
    category: "binary",
    language: "ruby",
    difficulty: "easy",
    description: `Given an array nums containing n distinct numbers in range [0, n], return the only missing number.

Example:
Input: nums = [3,0,1]
Output: 2

Constraints:
- n == nums.length
- 1 <= n <= 10^4
- 0 <= nums[i] <= n
- All nums are unique`,
    code: `def missing_number(nums)
  raise NotImplementedError
end`,
    testCode: `def test_basic_case
  assert_equal(2, missing_number([3, 0, 1]))
end

def test_missing_last
  assert_equal(2, missing_number([0, 1]))
end

def test_missing_first
  assert_equal(0, missing_number([1]))
end

def test_longer_array
  assert_equal(8, missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]))
end`,
    solution: `def missing_number(nums)
  n = nums.length
  expected = n * (n + 1) / 2
  expected - nums.sum
end`,
    usage: null,
    tags: ["bit-manipulation", "math", "blind75"],
  },
  {
    name: "Reverse Bits",
    category: "binary",
    language: "ruby",
    difficulty: "easy",
    description: `Reverse bits of a given 32-bit unsigned integer.

Example:
Input: n = 43261596 (00000010100101000001111010011100)
Output: 964176192 (00111001011110000010100101000000)

Constraints:
- Input is a 32-bit unsigned integer`,
    code: `def reverse_bits(n)
  raise NotImplementedError
end`,
    testCode: `def test_basic_case
  assert_equal(964176192, reverse_bits(43261596))
end

def test_zero
  assert_equal(0, reverse_bits(0))
end

def test_one
  assert_equal(2147483648, reverse_bits(1))
end

def test_max_uint32
  assert_equal(4294967295, reverse_bits(4294967295))
end`,
    solution: `def reverse_bits(n)
  result = 0
  32.times do
    result = (result << 1) | (n & 1)
    n >>= 1
  end
  result
end`,
    usage: null,
    tags: ["bit-manipulation", "blind75"],
  },
  {
    name: "Valid Sudoku",
    category: "arrays",
    language: "ruby",
    difficulty: "medium",
    description: `Determine if a 9x9 Sudoku board is valid. Only filled cells need to be validated:\n- Each row must contain digits 1-9 with no repeats.\n- Each column must contain digits 1-9 with no repeats.\n- Each of the 9 3x3 sub-boxes must contain digits 1-9 with no repeats.\n\nEmpty cells are represented as '.'.\n\nExample:\nInput: board = [\n  ["5","3",".",".","7",".",".",".","."],\n  ["6",".",".","1","9","5",".",".","."],\n  [".","9","8",".",".",".",".","6","."],\n  ["8",".",".",".","6",".",".",".","3"],\n  ["4",".",".","8",".","3",".",".","1"],\n  ["7",".",".",".","2",".",".",".","6"],\n  [".","6",".",".",".",".","2","8","."],\n  [".",".",".","4","1","9",".",".","5"],\n  [".",".",".",".","8",".",".","7","9"]\n]\nOutput: True\n\nConstraints:\n- board.length == 9, board[i].length == 9\n- Each cell is a digit or '.'\n\nRef: LeetCode #36 Valid Sudoku`,
    code: `def is_valid_sudoku(board)
  raise NotImplementedError
end`,
    testCode: `def test_valid_sudoku
  board = [
    ["5","3",".",".","7",".",".",".","."],
    ["6",".",".","1","9","5",".",".","."],
    [".","9","8",".",".",".",".","6","."],
    ["8",".",".",".","6",".",".",".","3"],
    ["4",".",".","8",".","3",".",".","1"],
    ["7",".",".",".","2",".",".",".","6"],
    [".","6",".",".",".",".","2","8","."],
    [".",".",".","4","1","9",".",".","5"],
    [".",".",".",".","8",".",".","7","9"],
  ]
  assert_equal(true, is_valid_sudoku(board))
end

def test_invalid_row
  board = [
    ["8","3",".",".","7",".",".",".","."],
    ["6",".",".","1","9","5",".",".","."],
    [".","9","8",".",".",".",".","6","."],
    ["8",".",".",".","6",".",".",".","3"],
    ["4",".",".","8",".","3",".",".","1"],
    ["7",".",".",".","2",".",".",".","6"],
    [".","6",".",".",".",".","2","8","."],
    [".",".",".","4","1","9",".",".","5"],
    [".",".",".",".","8",".",".","7","9"],
  ]
  assert_equal(false, is_valid_sudoku(board))
end`,
    solution: `def is_valid_sudoku(board)
  rows = Hash.new { |h, k| h[k] = {} }
  cols = Hash.new { |h, k| h[k] = {} }
  boxes = Hash.new { |h, k| h[k] = {} }

  (0...9).each do |r|
    (0...9).each do |c|
      val = board[r][c]
      next if val == "."
      box = [r / 3, c / 3]
      if rows[r][val] || cols[c][val] || boxes[box][val]
        return false
      end
      rows[r][val] = true
      cols[c][val] = true
      boxes[box][val] = true
    end
  end
  true
end`,
    usage: null,
    tags: ["array", "hash-map", "neetcode", "arrays-hashing"],
  },
];

export { blind75Part1 };
