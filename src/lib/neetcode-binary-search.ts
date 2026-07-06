import type { SeedKata } from "../types/editor";

const neetcodeBinarySearch: SeedKata[] = [
  {
    name: "Search a 2D Matrix",
    category: "binary-search",
    language: "ruby",
    difficulty: "medium",
    description: `You are given an m x n integer matrix where:\n- Each row is sorted in ascending order.\n- The first integer of each row is greater than the last integer of the previous row.\n\nReturn true if target exists in the matrix, false otherwise. Must run in O(log(m * n)).\n\nExample 1:\nInput: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3\nOutput: True\n\nExample 2:\nInput: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13\nOutput: False\n\nConstraints:\n- m == matrix.length, n == matrix[i].length\n- 1 <= m, n <= 100\n- -10^4 <= matrix[i][j], target <= 10^4\n\nRef: LeetCode #74 Search a 2D Matrix`,
    code: `def search_matrix(matrix, target)
  raise NotImplementedError
end`,
    testCode: `def test_search_matrix_found
  matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]]
  assert_equal(true, search_matrix(matrix, 3))
end

def test_search_matrix_not_found
  matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]]
  assert_equal(false, search_matrix(matrix, 13))
end

def test_search_matrix_first
  assert_equal(true, search_matrix([[1]], 1))
end

def test_search_matrix_last
  matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]]
  assert_equal(true, search_matrix(matrix, 60))
end`,
    solution: `def search_matrix(matrix, target)
  m = matrix.length
  n = matrix[0].length
  left = 0
  right = m * n - 1
  while left <= right
    mid = (left + right) / 2
    val = matrix[mid / n][mid % n]
    if val == target
      return true
    elsif val < target
      left = mid + 1
    else
      right = mid - 1
    end
  end
  false
end`,
    usage: null,
    tags: ["array", "binary-search", "matrix", "neetcode"],
  },
  {
    name: "Koko Eating Bananas",
    category: "binary-search",
    language: "ruby",
    difficulty: "medium",
    description: `Koko has piles of bananas. The guards will return in h hours. She can eat at most k bananas per hour; if a pile has fewer than k she finishes it and waits.\n\nReturn the minimum integer k such that she can eat all bananas within h hours.\n\nExample 1:\nInput: piles = [3,6,7,11], h = 8\nOutput: 4\n\nExample 2:\nInput: piles = [30,11,23,4,20], h = 5\nOutput: 30\n\nExample 3:\nInput: piles = [30,11,23,4,20], h = 6\nOutput: 23\n\nConstraints:\n- 1 <= piles.length <= 10^4\n- piles.length <= h <= 10^9\n- 1 <= piles[i] <= 10^9\n\nRef: LeetCode #875 Koko Eating Bananas`,
    code: `def min_eating_speed(piles, h)
  raise NotImplementedError
end`,
    testCode: `def test_koko_basic
  assert_equal(4, min_eating_speed([3, 6, 7, 11], 8))
end

def test_koko_tight
  assert_equal(30, min_eating_speed([30, 11, 23, 4, 20], 5))
end

def test_koko_extra_time
  assert_equal(23, min_eating_speed([30, 11, 23, 4, 20], 6))
end

def test_koko_single
  assert_equal(1, min_eating_speed([10], 10))
end`,
    solution: `def min_eating_speed(piles, h)
  left = 1
  right = piles.max
  result = right
  while left <= right
    mid = (left + right) / 2
    hours = piles.sum { |p| (p.to_f / mid).ceil }
    if hours <= h
      result = mid
      right = mid - 1
    else
      left = mid + 1
    end
  end
  result
end`,
    usage: null,
    tags: ["binary-search", "array", "neetcode"],
  },
  {
    name: "Time Based Key-Value Store",
    category: "binary-search",
    language: "ruby",
    difficulty: "medium",
    description: `Design a time-based key-value store that supports:\n- set(key, value, timestamp) — stores the key with value at the given timestamp.\n- get(key, timestamp) — returns the value with the largest timestamp <= the given timestamp. Returns "" if no such value.\n\nTimestamps in set are strictly increasing.\n\nExample:\nstore = TimeMap()\nstore.set("foo", "bar", 1)\nstore.get("foo", 1)   # → "bar"\nstore.get("foo", 3)   # → "bar"\nstore.set("foo", "bar2", 4)\nstore.get("foo", 4)   # → "bar2"\nstore.get("foo", 5)   # → "bar2"\n\nConstraints:\n- 1 <= key.length, value.length <= 100\n- 1 <= timestamp <= 10^7\n- All timestamps in set are strictly increasing.\n\nRef: LeetCode #981 Time Based Key-Value Store`,
    code: `class TimeMap
  def initialize
    raise NotImplementedError
  end

  def set(key, value, timestamp)
    raise NotImplementedError
  end

  def get(key, timestamp)
    raise NotImplementedError
  end
end`,
    testCode: `def test_time_map_basic
  store = TimeMap.new
  store.set("foo", "bar", 1)
  assert_equal("bar", store.get("foo", 1))
  assert_equal("bar", store.get("foo", 3))
  store.set("foo", "bar2", 4)
  assert_equal("bar2", store.get("foo", 4))
  assert_equal("bar2", store.get("foo", 5))
end

def test_time_map_before_any
  store = TimeMap.new
  store.set("foo", "bar", 2)
  assert_equal("", store.get("foo", 1))
end

def test_time_map_missing_key
  store = TimeMap.new
  assert_equal("", store.get("missing", 1))
end`,
    solution: `class TimeMap
  def initialize
    @store = {}
  end

  def set(key, value, timestamp)
    @store[key] ||= []
    @store[key].push([timestamp, value])
  end

  def get(key, timestamp)
    entries = @store[key] || []
    left = 0
    right = entries.length - 1
    result = ""
    while left <= right
      mid = (left + right) / 2
      if entries[mid][0] <= timestamp
        result = entries[mid][1]
        left = mid + 1
      else
        right = mid - 1
      end
    end
    result
  end
end`,
    usage: null,
    tags: ["binary-search", "design", "hash-map", "neetcode"],
  },
  {
    name: "Median of Two Sorted Arrays",
    category: "binary-search",
    language: "ruby",
    difficulty: "hard",
    description: `Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays. The overall run time must be O(log(m+n)).\n\nExample 1:\nInput: nums1 = [1,3], nums2 = [2]\nOutput: 2.0\n\nExample 2:\nInput: nums1 = [1,2], nums2 = [3,4]\nOutput: 2.5\n\nConstraints:\n- 0 <= m, n <= 1000\n- -10^6 <= nums1[i], nums2[i] <= 10^6\n- At least one array is non-empty.\n\nRef: LeetCode #4 Median of Two Sorted Arrays`,
    code: `def find_median_sorted_arrays(nums1, nums2)
  raise NotImplementedError
end`,
    testCode: `def test_median_odd
  assert_equal(2.0, find_median_sorted_arrays([1, 3], [2]))
end

def test_median_even
  assert_equal(2.5, find_median_sorted_arrays([1, 2], [3, 4]))
end

def test_median_one_empty
  assert_equal(1.0, find_median_sorted_arrays([], [1]))
end

def test_median_same
  assert_equal(1.5, find_median_sorted_arrays([1, 2], [1, 2]))
end

def test_median_disjoint
  assert_equal(2.5, find_median_sorted_arrays([1, 3], [2, 4]))
end`,
    solution: `def find_median_sorted_arrays(nums1, nums2)
  a = nums1
  b = nums2
  a, b = b, a if a.length > b.length
  total = a.length + b.length
  half = total / 2
  left = 0
  right = a.length - 1
  loop do
    i = (left + right) / 2
    j = half - i - 2
    a_left  = i >= 0 ? a[i] : -Float::INFINITY
    a_right = i + 1 < a.length ? a[i + 1] : Float::INFINITY
    b_left  = j >= 0 ? b[j] : -Float::INFINITY
    b_right = j + 1 < b.length ? b[j + 1] : Float::INFINITY
    if a_left <= b_right && b_left <= a_right
      if total % 2 == 1
        return [a_right, b_right].min.to_f
      end
      return ([a_left, b_left].max + [a_right, b_right].min) / 2.0
    elsif a_left > b_right
      right = i - 1
    else
      left = i + 1
    end
  end
end`,
    usage: null,
    tags: ["binary-search", "array", "divide-and-conquer", "blind75", "neetcode"],
  },
];

export { neetcodeBinarySearch };
