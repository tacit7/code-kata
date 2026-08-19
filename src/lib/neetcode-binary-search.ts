import type { SeedKata } from "../types/editor";
import { enrichMissingPythonSolutionVariants } from "./python-solution-variants";

const neetcodeBinarySearch: SeedKata[] = [
  {
    name: "Search a 2D Matrix",
    category: "binary-search",
    language: "python",
    difficulty: "medium",
    description: `You are given an m x n integer matrix where:\n- Each row is sorted in ascending order.\n- The first integer of each row is greater than the last integer of the previous row.\n\nReturn true if target exists in the matrix, false otherwise. Must run in O(log(m * n)).\n\nExample 1:\nInput: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3\nOutput: True\n\nExample 2:\nInput: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13\nOutput: False\n\nConstraints:\n- m == matrix.length, n == matrix[i].length\n- 1 <= m, n <= 100\n- -10^4 <= matrix[i][j], target <= 10^4\n\nRef: LeetCode #74 Search a 2D Matrix`,
    code: `def search_matrix(matrix: list[list[int]], target: int) -> bool:
    raise NotImplementedError`,
    testCode: `def test_search_matrix_found():
    matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]]
    assert search_matrix(matrix, 3) == True

def test_search_matrix_not_found():
    matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]]
    assert search_matrix(matrix, 13) == False

def test_search_matrix_first():
    assert search_matrix([[1]], 1) == True

def test_search_matrix_last():
    matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]]
    assert search_matrix(matrix, 60) == True`,
    solution: `def search_matrix(matrix: list[list[int]], target: int) -> bool:
    m, n = len(matrix), len(matrix[0])
    left, right = 0, m * n - 1
    while left <= right:
        mid = (left + right) // 2
        val = matrix[mid // n][mid % n]
        if val == target:
            return True
        elif val < target:
            left = mid + 1
        else:
            right = mid - 1
    return False`,
    usage: null,
    tags: ["array", "binary-search", "matrix", "neetcode"],
  },
  {
    name: "Koko Eating Bananas",
    category: "binary-search",
    language: "python",
    difficulty: "medium",
    description: `Koko has piles of bananas. The guards will return in h hours. She can eat at most k bananas per hour; if a pile has fewer than k she finishes it and waits.\n\nReturn the minimum integer k such that she can eat all bananas within h hours.\n\nExample 1:\nInput: piles = [3,6,7,11], h = 8\nOutput: 4\n\nExample 2:\nInput: piles = [30,11,23,4,20], h = 5\nOutput: 30\n\nExample 3:\nInput: piles = [30,11,23,4,20], h = 6\nOutput: 23\n\nConstraints:\n- 1 <= piles.length <= 10^4\n- piles.length <= h <= 10^9\n- 1 <= piles[i] <= 10^9\n\nRef: LeetCode #875 Koko Eating Bananas`,
    code: `def min_eating_speed(piles: list[int], h: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_koko_basic():
    assert min_eating_speed([3, 6, 7, 11], 8) == 4

def test_koko_tight():
    assert min_eating_speed([30, 11, 23, 4, 20], 5) == 30

def test_koko_extra_time():
    assert min_eating_speed([30, 11, 23, 4, 20], 6) == 23

def test_koko_single():
    assert min_eating_speed([10], 10) == 1`,
    solution: `def min_eating_speed(piles: list[int], h: int) -> int:
    import math
    left, right = 1, max(piles)
    result = right
    while left <= right:
        mid = (left + right) // 2
        hours = sum(math.ceil(p / mid) for p in piles)
        if hours <= h:
            result = mid
            right = mid - 1
        else:
            left = mid + 1
    return result`,
    usage: null,
    tags: ["binary-search", "array", "neetcode"],
  },
  {
    name: "Time Based Key-Value Store",
    category: "binary-search",
    language: "python",
    difficulty: "medium",
    description: `Design a time-based key-value store that supports:\n- set(key, value, timestamp) — stores the key with value at the given timestamp.\n- get(key, timestamp) — returns the value with the largest timestamp <= the given timestamp. Returns "" if no such value.\n\nTimestamps in set are strictly increasing.\n\nExample:\nstore = TimeMap()\nstore.set("foo", "bar", 1)\nstore.get("foo", 1)   # → "bar"\nstore.get("foo", 3)   # → "bar"\nstore.set("foo", "bar2", 4)\nstore.get("foo", 4)   # → "bar2"\nstore.get("foo", 5)   # → "bar2"\n\nConstraints:\n- 1 <= key.length, value.length <= 100\n- 1 <= timestamp <= 10^7\n- All timestamps in set are strictly increasing.\n\nRef: LeetCode #981 Time Based Key-Value Store`,
    code: `class TimeMap:
    def __init__(self):
        raise NotImplementedError

    def set(self, key: str, value: str, timestamp: int) -> None:
        raise NotImplementedError

    def get(self, key: str, timestamp: int) -> str:
        raise NotImplementedError`,
    testCode: `def test_time_map_basic():
    store = TimeMap()
    store.set("foo", "bar", 1)
    assert store.get("foo", 1) == "bar"
    assert store.get("foo", 3) == "bar"
    store.set("foo", "bar2", 4)
    assert store.get("foo", 4) == "bar2"
    assert store.get("foo", 5) == "bar2"

def test_time_map_before_any():
    store = TimeMap()
    store.set("foo", "bar", 2)
    assert store.get("foo", 1) == ""

def test_time_map_missing_key():
    store = TimeMap()
    assert store.get("missing", 1) == ""`,
    solution: `class TimeMap:
    def __init__(self):
        self.store = {}

    def set(self, key: str, value: str, timestamp: int) -> None:
        if key not in self.store:
            self.store[key] = []
        self.store[key].append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        entries = self.store.get(key, [])
        left, right = 0, len(entries) - 1
        result = ""
        while left <= right:
            mid = (left + right) // 2
            if entries[mid][0] <= timestamp:
                result = entries[mid][1]
                left = mid + 1
            else:
                right = mid - 1
        return result`,
    usage: null,
    tags: ["binary-search", "design", "hash-map", "neetcode"],
  },
  {
    name: "Median of Two Sorted Arrays",
    category: "binary-search",
    language: "python",
    difficulty: "hard",
    description: `Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays. The overall run time must be O(log(m+n)).\n\nExample 1:\nInput: nums1 = [1,3], nums2 = [2]\nOutput: 2.0\n\nExample 2:\nInput: nums1 = [1,2], nums2 = [3,4]\nOutput: 2.5\n\nConstraints:\n- 0 <= m, n <= 1000\n- -10^6 <= nums1[i], nums2[i] <= 10^6\n- At least one array is non-empty.\n\nRef: LeetCode #4 Median of Two Sorted Arrays`,
    code: `def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:
    raise NotImplementedError`,
    testCode: `def test_median_odd():
    assert find_median_sorted_arrays([1, 3], [2]) == 2.0

def test_median_even():
    assert find_median_sorted_arrays([1, 2], [3, 4]) == 2.5

def test_median_one_empty():
    assert find_median_sorted_arrays([], [1]) == 1.0

def test_median_same():
    assert find_median_sorted_arrays([1, 2], [1, 2]) == 1.5

def test_median_disjoint():
    assert find_median_sorted_arrays([1, 3], [2, 4]) == 2.5`,
    solution: `def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:
    A, B = nums1, nums2
    if len(A) > len(B):
        A, B = B, A
    total = len(A) + len(B)
    half = total // 2
    left, right = 0, len(A) - 1
    while True:
        i = (left + right) // 2
        j = half - i - 2
        a_left  = A[i] if i >= 0 else float("-inf")
        a_right = A[i + 1] if i + 1 < len(A) else float("inf")
        b_left  = B[j] if j >= 0 else float("-inf")
        b_right = B[j + 1] if j + 1 < len(B) else float("inf")
        if a_left <= b_right and b_left <= a_right:
            if total % 2 == 1:
                return float(min(a_right, b_right))
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        elif a_left > b_right:
            right = i - 1
        else:
            left = i + 1`,
    usage: null,
    tags: ["binary-search", "array", "divide-and-conquer", "neetcode"],
  },
];

enrichMissingPythonSolutionVariants(neetcodeBinarySearch);

export { neetcodeBinarySearch };
