import type { SeedKata } from "../types/editor";

export const dpFoundations: SeedKata[] = [
  {
    name: "Fibonacci Number",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `The Fibonacci sequence starts 0, 1 and each later term is the sum of the two before it. Given n, return the n-th Fibonacci number.\n\nExample:\nInput: n = 4\nOutput: 3\n\nConstraints:\n- 0 <= n <= 30\n\nRef: LeetCode #509`,
    code: `def fib(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_fib_zero():
    assert fib(0) == 0

def test_fib_one():
    assert fib(1) == 1

def test_fib_two():
    assert fib(2) == 1

def test_fib_ten():
    assert fib(10) == 55

def test_fib_twenty():
    assert fib(20) == 6765`,
    solution: `def fib(n: int) -> int:
    if n < 2:
        return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-basic", "recursion"],
  },
  {
    name: "N-th Tribonacci Number",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `The Tribonacci sequence starts 0, 1, 1 and each later term is the sum of the three before it. Given n, return the n-th Tribonacci number.\n\nExample:\nInput: n = 4\nOutput: 4\n\nConstraints:\n- 0 <= n <= 37\n\nRef: LeetCode #1137`,
    code: `def tribonacci(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_tribonacci_zero():
    assert tribonacci(0) == 0

def test_tribonacci_three():
    assert tribonacci(3) == 2

def test_tribonacci_four():
    assert tribonacci(4) == 4

def test_tribonacci_twenty_five():
    assert tribonacci(25) == 1389537`,
    solution: `def tribonacci(n: int) -> int:
    if n == 0:
        return 0
    if n <= 2:
        return 1
    a, b, c = 0, 1, 1
    for _ in range(3, n + 1):
        a, b, c = b, c, a + b + c
    return c`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-basic", "recursion"],
  },
  {
    name: "Delete and Earn",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums, you can pick any nums[i], earning nums[i] points, but that operation deletes every element equal to nums[i] - 1 and nums[i] + 1 from the array. Return the maximum points you can earn.\n\nExample:\nInput: nums = [3,4,2]\nOutput: 6\n\nConstraints:\n- 1 <= nums.length <= 2 * 10^4\n- 1 <= nums[i] <= 10^4\n\nRef: LeetCode #740`,
    code: `def delete_and_earn(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_delete_and_earn_basic():
    assert delete_and_earn([3, 4, 2]) == 6

def test_delete_and_earn_repeats():
    assert delete_and_earn([2, 2, 3, 3, 3, 4]) == 9

def test_delete_and_earn_single():
    assert delete_and_earn([1]) == 1`,
    solution: `def delete_and_earn(nums: list[int]) -> int:
    if not nums:
        return 0
    max_val = max(nums)
    points = [0] * (max_val + 1)
    for num in nums:
        points[num] += num
    prev2, prev1 = 0, 0
    for i in range(max_val + 1):
        curr = max(prev1, prev2 + points[i])
        prev2, prev1 = prev1, curr
    return prev1`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-decision"],
  },
  {
    name: "Minimum Path Sum",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given an m x n grid filled with non-negative numbers, find a path from top-left to bottom-right which minimizes the sum of numbers along the path. You can only move down or right.\n\nExample:\nInput: grid = [[1,3,1],[1,5,1],[4,2,1]]\nOutput: 7\n\nConstraints:\n- m == grid.length\n- n == grid[i].length\n- 1 <= m, n <= 200\n- 0 <= grid[i][j] <= 200\n\nRef: LeetCode #64`,
    code: `def min_path_sum(grid: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_min_path_sum_basic():
    assert min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) == 7

def test_min_path_sum_two_rows():
    assert min_path_sum([[1, 2, 3], [4, 5, 6]]) == 12

def test_min_path_sum_single_cell():
    assert min_path_sum([[5]]) == 5`,
    solution: `def min_path_sum(grid: list[list[int]]) -> int:
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                dp[r][c] = grid[r][c]
            elif r == 0:
                dp[r][c] = dp[r][c - 1] + grid[r][c]
            elif c == 0:
                dp[r][c] = dp[r - 1][c] + grid[r][c]
            else:
                dp[r][c] = min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c]
    return dp[m - 1][n - 1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-min-cost", "grid"],
  },
  {
    name: "Perfect Squares",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given an integer n, return the fewest number of perfect square numbers (1, 4, 9, 16, ...) that sum to n.\n\nExample:\nInput: n = 12\nOutput: 3  (4 + 4 + 4)\n\nConstraints:\n- 1 <= n <= 10^4\n\nRef: LeetCode #279`,
    code: `def num_squares(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_num_squares_basic():
    assert num_squares(12) == 3

def test_num_squares_perfect_square():
    assert num_squares(13) == 2

def test_num_squares_one():
    assert num_squares(1) == 1

def test_num_squares_larger():
    assert num_squares(43) == 3`,
    solution: `def num_squares(n: int) -> int:
    dp = [float("inf")] * (n + 1)
    dp[0] = 0
    for i in range(1, n + 1):
        j = 1
        while j * j <= i:
            dp[i] = min(dp[i], dp[i - j * j] + 1)
            j += 1
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-min-cost"],
  },
  {
    name: "Maximum Length of Repeated Subarray",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given two integer arrays nums1 and nums2, return the length of the longest common contiguous subarray (a run of equal elements at matching relative positions in both arrays).\n\nExample:\nInput: nums1 = [1,2,3,2,1], nums2 = [3,2,1,4,7]\nOutput: 3  ([3,2,1])\n\nConstraints:\n- 1 <= nums1.length, nums2.length <= 1000\n- 0 <= nums1[i], nums2[i] <= 100\n\nRef: LeetCode #718`,
    code: `def find_length(nums1: list[int], nums2: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_find_length_basic():
    assert find_length([1, 2, 3, 2, 1], [3, 2, 1, 4, 7]) == 3

def test_find_length_full_match():
    assert find_length([0, 0, 0, 0, 0], [0, 0, 0, 0, 0]) == 5

def test_find_length_no_overlap():
    assert find_length([1, 2, 3], [4, 5, 6]) == 0`,
    solution: `def find_length(nums1: list[int], nums2: list[int]) -> int:
    m, n = len(nums1), len(nums2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    best = 0
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if nums1[i - 1] == nums2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                best = max(best, dp[i][j])
    return best`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-subsequence", "array"],
  },
  {
    name: "Longest Palindromic Subsequence",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given a string s, return the length of the longest palindromic subsequence (characters can be skipped but not reordered).\n\nExample:\nInput: s = "bbbab"\nOutput: 4  ("bbbb")\n\nConstraints:\n- 1 <= s.length <= 1000\n- s consists only of lowercase English letters\n\nRef: LeetCode #516`,
    code: `def longest_palindrome_subseq(s: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_longest_palindrome_subseq_basic():
    assert longest_palindrome_subseq("bbbab") == 4

def test_longest_palindrome_subseq_two():
    assert longest_palindrome_subseq("cbbd") == 2

def test_longest_palindrome_subseq_single():
    assert longest_palindrome_subseq("a") == 1`,
    solution: `def longest_palindrome_subseq(s: str) -> int:
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-string", "string"],
  },
];
