import type { SeedKata } from "../types/editor";

export const sampleKatasPython: SeedKata[] = [
  {
    name: "Kadane's Algorithm",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Kadane's Algorithm

Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.

Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

Example 2:
Input: nums = [1,2,3]
Output: 6
Explanation: The subarray [1,2,3] has the largest sum 6.

Example 3:
Input: nums = [-5]
Output: -5
Explanation: The single element is the only subarray, so the answer is -5.

Constraints:
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4

Ref: LeetCode #53 Maximum Subarray`,
    code: `def max_subarray_sum(nums):
    raise NotImplementedError`,
    testCode: `def test_mixed():
    assert max_subarray_sum([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6


def test_all_negative():
    assert max_subarray_sum([-3, -1, -2]) == -1


def test_all_positive():
    assert max_subarray_sum([1, 2, 3]) == 6


def test_single():
    assert max_subarray_sum([5]) == 5


def test_single_negative():
    assert max_subarray_sum([-5]) == -5


def test_zero_crossing():
    assert max_subarray_sum([-1, 2, 3, -4, 5]) == 6`,
    solution: `def max_subarray_sum(nums):
    max_sum = nums[0]
    current = nums[0]
    for num in nums[1:]:
        current = max(num, current + num)
        max_sum = max(max_sum, current)
    return max_sum`,
    usage: null,
    tags: ["dynamic-programming", "greedy", "blind75"],
  },
  {
    name: "Climbing Stairs (Iterative)",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Climbing Stairs (Iterative)

You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. Return the number of distinct ways you can climb to the top.

Use an iterative (bottom-up) approach.

Example 1:
Input: n = 2
Output: 2
Explanation: There are two ways: 1+1 and 2.

Example 2:
Input: n = 3
Output: 3
Explanation: There are three ways: 1+1+1, 1+2, and 2+1.

Example 3:
Input: n = 5
Output: 8

Constraints:
- 1 <= n <= 45

Ref: LeetCode #70 Climbing Stairs`,
    code: `def climb_stairs(n):
    raise NotImplementedError`,
    testCode: `def test_one():
    assert climb_stairs(1) == 1


def test_two():
    assert climb_stairs(2) == 2


def test_three():
    assert climb_stairs(3) == 3


def test_four():
    assert climb_stairs(4) == 5


def test_five():
    assert climb_stairs(5) == 8


def test_ten():
    assert climb_stairs(10) == 89`,
    solution: `def climb_stairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
    usage: null,
    tags: ["dynamic-programming", "memoization", "blind75", "neetcode", "1d-dp", "dp-basic"],
  },
  {
    name: "Climbing Stairs (Recursive)",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Climbing Stairs (Recursive)

You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. Return the number of distinct ways you can climb to the top.

Use a recursive approach with memoization.

Example 1:
Input: n = 2
Output: 2
Explanation: There are two ways: 1+1 and 2.

Example 2:
Input: n = 3
Output: 3
Explanation: There are three ways: 1+1+1, 1+2, and 2+1.

Example 3:
Input: n = 10
Output: 89

Constraints:
- 1 <= n <= 45

Ref: LeetCode #70 Climbing Stairs`,
    code: `def climb_stairs(n):
    raise NotImplementedError`,
    testCode: `def test_one():
    assert climb_stairs(1) == 1


def test_two():
    assert climb_stairs(2) == 2


def test_three():
    assert climb_stairs(3) == 3


def test_four():
    assert climb_stairs(4) == 5


def test_five():
    assert climb_stairs(5) == 8


def test_ten():
    assert climb_stairs(10) == 89`,
    solution: `def climb_stairs(n):
    memo = {}
    def helper(k):
        if k <= 2:
            return k
        if k in memo:
            return memo[k]
        memo[k] = helper(k - 1) + helper(k - 2)
        return memo[k]
    return helper(n)`,
    usage: null,
    tags: ["dynamic-programming", "memoization", "recursion", "blind75", "neetcode", "1d-dp", "dp-basic"],
  },
  {
    name: "Longest Common Subsequence",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Longest Common Subsequence

Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.

A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

Example 1:
Input: text1 = "abcde", text2 = "ace"
Output: 3
Explanation: The longest common subsequence is "ace" and its length is 3.

Example 2:
Input: text1 = "abc", text2 = "abc"
Output: 3
Explanation: The longest common subsequence is "abc" and its length is 3.

Example 3:
Input: text1 = "abc", text2 = "def"
Output: 0
Explanation: There is no common subsequence, so the result is 0.

Constraints:
- 1 <= text1.length, text2.length <= 1000
- text1 and text2 consist of only lowercase English characters.

Ref: LeetCode #1143 Longest Common Subsequence`,
    code: `def lcs(text1, text2):
    raise NotImplementedError`,
    testCode: `def test_basic():
    assert lcs("abcde", "ace") == 3


def test_identical():
    assert lcs("abc", "abc") == 3


def test_no_common():
    assert lcs("abc", "def") == 0


def test_one_empty():
    assert lcs("", "abc") == 0


def test_both_empty():
    assert lcs("", "") == 0


def test_longer():
    assert lcs("abcba", "abcbcba") == 5`,
    solution: `def lcs(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    usage: null,
    tags: ["dynamic-programming", "string", "blind75", "dp-subsequence"],
  },
  {
    name: "Topological Sort",
    category: "advanced-graphs",
    language: "python",
    difficulty: "hard",
    description: `Topological Sort

Given a directed acyclic graph (DAG) represented as an adjacency list (a dictionary mapping each node to a list of nodes it has edges to), return a valid topological ordering as a list.

A topological ordering is a linear ordering of vertices such that for every directed edge (u, v), vertex u comes before v in the ordering.

Example 1:
Input: graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
Output: ["a", "b", "c", "d"] (or any valid topological order)
Explanation: "a" must come before "b" and "c"; both "b" and "c" must come before "d".

Example 2:
Input: graph = {"a": ["b"], "b": ["c"], "c": []}
Output: ["a", "b", "c"]
Explanation: A simple linear chain has only one valid ordering.

Example 3:
Input: graph = {"a": [], "b": [], "c": []}
Output: ["a", "b", "c"] (any permutation is valid)
Explanation: With no edges, any ordering is a valid topological sort.

Constraints:
- The graph is a valid DAG (no cycles).
- All nodes appear as keys in the adjacency list.
- 1 <= number of nodes <= 10^4

Ref: LeetCode #210 Course Schedule II`,
    code: `def topological_sort(graph):
    raise NotImplementedError`,
    testCode: `def test_simple_dag():
    graph = {
        "a": ["b", "c"],
        "b": ["d"],
        "c": ["d"],
        "d": [],
    }
    result = topological_sort(graph)
    assert len(result) == 4
    assert result.index("a") < result.index("b")
    assert result.index("a") < result.index("c")
    assert result.index("b") < result.index("d")
    assert result.index("c") < result.index("d")


def test_linear():
    graph = {"a": ["b"], "b": ["c"], "c": []}
    result = topological_sort(graph)
    assert result == ["a", "b", "c"]


def test_no_edges():
    graph = {"a": [], "b": [], "c": []}
    result = topological_sort(graph)
    assert set(result) == {"a", "b", "c"}`,
    solution: `def topological_sort(graph):
    visited = set()
    order = []

    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        for neighbor in graph.get(node, []):
            dfs(neighbor)
        order.append(node)

    for node in graph:
        dfs(node)

    order.reverse()
    return order`,
    usage: null,
    tags: ["graph", "topological-sort"],
  },
  {
    name: "Union Find",
    category: "advanced-graphs",
    language: "python",
    difficulty: "hard",
    description: `Union Find

Implement a Union-Find (Disjoint Set Union) data structure that supports the following operations efficiently using path compression and union by rank:

- UnionFind(n): Initialize with n elements labeled 0 to n-1, each in its own set.
- find(x): Return the representative (root) of the set containing x.
- union(x, y): Merge the sets containing x and y.
- connected(x, y): Return True if x and y belong to the same set, False otherwise.

Example 1:
Input: n = 5, union(0, 1), union(1, 2), connected(0, 2)
Output: True
Explanation: After merging {0,1} and then {1,2}, elements 0 and 2 are in the same set.

Example 2:
Input: n = 5, union(0, 1), union(3, 4), connected(0, 4)
Output: False
Explanation: Sets {0,1} and {3,4} are separate components.

Example 3:
Input: n = 3, connected(0, 0)
Output: True
Explanation: Every element is always connected to itself.

Constraints:
- 0 <= x, y < n
- 1 <= n <= 10^5

Ref: LeetCode #684 Redundant Connection (closest match)`,
    code: `class UnionFind:
    def __init__(self, n):
        raise NotImplementedError

    def find(self, x):
        raise NotImplementedError

    def union(self, x, y):
        raise NotImplementedError

    def connected(self, x, y):
        raise NotImplementedError`,
    testCode: `def test_initially_disconnected():
    uf = UnionFind(5)
    assert uf.connected(0, 1) is False


def test_union_connects():
    uf = UnionFind(5)
    uf.union(0, 1)
    assert uf.connected(0, 1) is True


def test_transitive():
    uf = UnionFind(5)
    uf.union(0, 1)
    uf.union(1, 2)
    assert uf.connected(0, 2) is True


def test_separate_components():
    uf = UnionFind(5)
    uf.union(0, 1)
    uf.union(3, 4)
    assert uf.connected(0, 4) is False


def test_merge_components():
    uf = UnionFind(5)
    uf.union(0, 1)
    uf.union(3, 4)
    uf.union(1, 3)
    assert uf.connected(0, 4) is True


def test_self_connected():
    uf = UnionFind(3)
    assert uf.connected(0, 0) is True`,
    solution: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1

    def connected(self, x, y):
        return self.find(x) == self.find(y)`,
    usage: null,
    tags: ["graph", "disjoint-set"],
  },
  {
    name: "Frequency Count",
    category: "arrays",
    language: "python",
    difficulty: "easy",
    description: `Frequency Count

Given a list of items, return a dictionary mapping each unique item to the number of times it appears in the list.

Example 1:
Input: items = ["a", "b", "a", "c", "a", "b"]
Output: {"a": 3, "b": 2, "c": 1}

Example 2:
Input: items = [1, 2, 2, 3, 3, 3]
Output: {1: 1, 2: 2, 3: 3}

Example 3:
Input: items = []
Output: {}

Constraints:
- 0 <= len(items) <= 10^5
- Items can be any hashable type.

Ref: LeetCode #1207 Unique Number of Occurrences (closest match)`,
    code: `def frequency_count(items):
    raise NotImplementedError`,
    testCode: `def test_frequency_count():
    assert frequency_count(["a", "b", "a", "c", "a", "b"]) == {"a": 3, "b": 2, "c": 1}


def test_frequency_count_single():
    assert frequency_count(["x"]) == {"x": 1}


def test_frequency_count_numbers():
    assert frequency_count([1, 2, 2, 3, 3, 3]) == {1: 1, 2: 2, 3: 3}


def test_frequency_count_empty():
    assert frequency_count([]) == {}`,
    solution: `def frequency_count(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    return counts`,
    usage: null,
    tags: ["hash-map", "counting"],
  },
  {
    name: "Most Frequent Element",
    category: "arrays",
    language: "python",
    difficulty: "easy",
    description: `Most Frequent Element

Given a non-empty list of items, return the item that appears most frequently. If there are ties, return any one of the most frequent items.

Example 1:
Input: items = ["a", "b", "a", "c", "a", "b"]
Output: "a"
Explanation: "a" appears 3 times, more than any other element.

Example 2:
Input: items = [1, 2, 2, 3, 3, 3]
Output: 3
Explanation: 3 appears 3 times, which is the most frequent.

Example 3:
Input: items = [42]
Output: 42

Constraints:
- 1 <= len(items) <= 10^5
- Items can be any hashable type.

Ref: LeetCode #169 Majority Element (closest match)`,
    code: `def most_frequent(items):
    raise NotImplementedError`,
    testCode: `def test_most_frequent_strings():
    assert most_frequent(["a", "b", "a", "c", "a", "b"]) == "a"


def test_most_frequent_numbers():
    assert most_frequent([1, 2, 2, 3, 3, 3]) == 3


def test_most_frequent_single():
    assert most_frequent([42]) == 42`,
    solution: `def most_frequent(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    return max(counts, key=counts.get)`,
    usage: null,
    tags: ["hash-map", "counting"],
  },
  {
    name: "Merge Sort",
    category: "arrays",
    language: "python",
    difficulty: "medium",
    description: `Merge Sort

Given an array of integers arr, sort the array in ascending order using the merge sort algorithm and return the sorted array as a new list.

Merge sort is a divide-and-conquer algorithm that splits the array in half, recursively sorts each half, and then merges the two sorted halves.

Example 1:
Input: arr = [3, 1, 2]
Output: [1, 2, 3]

Example 2:
Input: arr = [5, 4, 3, 2, 1]
Output: [1, 2, 3, 4, 5]

Example 3:
Input: arr = [-3, 0, 2, -1]
Output: [-3, -1, 0, 2]

Constraints:
- 0 <= arr.length <= 5 * 10^4
- -5 * 10^4 <= arr[i] <= 5 * 10^4

Ref: LeetCode #912 Sort an Array`,
    code: `def merge_sort(arr):
    raise NotImplementedError`,
    testCode: `def test_basic():
    assert merge_sort([3, 1, 2]) == [1, 2, 3]


def test_already_sorted():
    assert merge_sort([1, 2, 3, 4]) == [1, 2, 3, 4]


def test_reversed():
    assert merge_sort([5, 4, 3, 2, 1]) == [1, 2, 3, 4, 5]


def test_duplicates():
    assert merge_sort([3, 1, 3, 1, 2]) == [1, 1, 2, 3, 3]


def test_single():
    assert merge_sort([1]) == [1]


def test_empty():
    assert merge_sort([]) == []


def test_negatives():
    assert merge_sort([-3, 0, 2, -1]) == [-3, -1, 0, 2]`,
    solution: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return _merge(left, right)


def _merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
    usage: null,
    tags: ["divide-and-conquer", "sorting", "recursion"],
  },
  {
    name: "Lomuto Partition",
    category: "arrays",
    language: "python",
    difficulty: "medium",
    description: `Lomuto Partition

Implement the Lomuto partition scheme. Given an array arr and indices lo and hi, use arr[hi] as the pivot. Rearrange elements in arr[lo..hi] in-place so that all elements less than or equal to the pivot come before it, and all elements greater than the pivot come after it. Return the final index of the pivot.

This is a fundamental building block of quicksort.

Example 1:
Input: arr = [3, 6, 8, 10, 1, 2, 1], lo = 0, hi = 6
Output: 1 (pivot value is 1; after partitioning, pivot is at index 1)
Explanation: Elements <= 1 are moved to the left of index 1, elements > 1 to the right.

Example 2:
Input: arr = [1, 2, 3, 4, 5], lo = 0, hi = 4
Output: 4
Explanation: Pivot is 5, which is already the largest element, so it stays at index 4.

Example 3:
Input: arr = [2, 1], lo = 0, hi = 1
Output: 0
Explanation: Pivot is 1; after partitioning, arr becomes [1, 2] and pivot is at index 0.

Constraints:
- 0 <= lo <= hi < len(arr)
- 1 <= len(arr) <= 10^5
- The function modifies arr in-place and returns the pivot index.

Ref: LeetCode #912 Sort an Array`,
    code: `def partition(arr, lo, hi):
    raise NotImplementedError`,
    testCode: `def test_partition_basic():
    arr = [3, 6, 8, 10, 1, 2, 1]
    p = partition(arr, 0, len(arr) - 1)
    pivot_val = arr[p]
    assert all(arr[i] <= pivot_val for i in range(p))
    assert all(arr[i] >= pivot_val for i in range(p, len(arr)))


def test_partition_sorted():
    arr = [1, 2, 3, 4, 5]
    p = partition(arr, 0, 4)
    assert arr[p] == 5
    assert p == 4


def test_partition_two():
    arr = [2, 1]
    p = partition(arr, 0, 1)
    assert arr == [1, 2]
    assert p == 0`,
    solution: `def partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo
    for j in range(lo, hi):
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]
    return i`,
    usage: null,
    tags: ["sorting", "partitioning"],
  },
  {
    name: "Hoare's Partition Scheme",
    category: "arrays",
    language: "python",
    difficulty: "medium",
    description: `Hoare's Partition Scheme

Implement Hoare's partition scheme. Given an array arr and indices lo and hi, use arr[lo] as the pivot. Two indices scan inward from opposite ends: one from the left past elements smaller than the pivot, one from the right past elements larger than it. When they find an out-of-place pair, swap them; when they cross, stop. Return the split index j.

Unlike Lomuto, Hoare does NOT move the pivot to its final sorted position, and the returned index j is NOT the pivot's location. Its guarantee is a split point: every element in arr[lo..j] is <= every element in arr[j+1..hi]. It does about three times fewer swaps than Lomuto and stays balanced on arrays full of duplicates, where Lomuto degrades to O(n^2).

Example 1:
Input: arr = [3, 6, 8, 10, 1, 2, 1], lo = 0, hi = 6
Output: 2
Explanation: arr becomes [1, 2, 1, 10, 8, 6, 3]. Left arr[0..2] = [1,2,1], right arr[3..6] = [10,8,6,3]; every left element <= every right element. Note the pivot value 3 ends up at index 6, not at the returned index 2.

Example 2:
Input: arr = [2, 1], lo = 0, hi = 1
Output: 0
Explanation: arr becomes [1, 2]; the split falls after index 0.

Example 3:
Input: arr = [3, 3, 3], lo = 0, hi = 2
Output: 1
Explanation: With all elements equal, Hoare still splits evenly (unlike Lomuto).

Constraints:
- 0 <= lo <= hi < len(arr)
- 1 <= len(arr) <= 10^5
- The function modifies arr in-place and returns a split index j with lo <= j < hi.

Ref: LeetCode #912 Sort an Array`,
    code: `def partition(arr, lo, hi):
    raise NotImplementedError`,
    testCode: `def test_partition_invariant():
    arr = [3, 6, 8, 10, 1, 2, 1]
    orig = list(arr)
    j = partition(arr, 0, len(arr) - 1)
    assert 0 <= j < len(arr) - 1
    assert sorted(arr) == sorted(orig)
    assert max(arr[0:j + 1]) <= min(arr[j + 1:len(arr)])


def test_reverse_sorted():
    arr = [5, 4, 3, 2, 1]
    orig = list(arr)
    j = partition(arr, 0, 4)
    assert sorted(arr) == sorted(orig)
    assert max(arr[0:j + 1]) <= min(arr[j + 1:5])


def test_two_elements():
    arr = [2, 1]
    j = partition(arr, 0, 1)
    assert arr == [1, 2]
    assert j == 0


def test_all_equal():
    arr = [3, 3, 3]
    j = partition(arr, 0, 2)
    assert 0 <= j < 2`,
    solution: `def partition(arr, lo, hi):
    pivot = arr[lo]
    i = lo - 1
    j = hi + 1
    while True:
        i += 1
        while arr[i] < pivot:
            i += 1
        j -= 1
        while arr[j] > pivot:
            j -= 1
        if i >= j:
            return j
        arr[i], arr[j] = arr[j], arr[i]`,
    usage: null,
    tags: ["sorting", "partitioning"],
  },
  {
    name: "Quick Sort",
    category: "arrays",
    language: "python",
    difficulty: "medium",
    description: `Quick Sort

Given an array of integers, sort the array in ascending order using the Quick Sort algorithm with Lomuto partition scheme and return the sorted array.

The Lomuto partition scheme picks the last element as the pivot, then partitions the array such that all elements less than or equal to the pivot come before it, and all elements greater come after it. Recursively apply this to the sub-arrays.

Example 1:
Input: arr = [3, 1, 2]
Output: [1, 2, 3]

Example 2:
Input: arr = [5, 4, 3, 2, 1]
Output: [1, 2, 3, 4, 5]

Example 3:
Input: arr = [3, 1, 3, 1, 2]
Output: [1, 1, 2, 3, 3]
Explanation: Duplicate elements are preserved and sorted correctly.

Constraints:
- 0 <= arr.length <= 10^4
- -10^4 <= arr[i] <= 10^4
- The array may contain duplicate values.

Ref: LeetCode #912 Sort an Array`,
    code: `def quick_sort(arr):
    raise NotImplementedError`,
    testCode: `def test_quick_sort_basic():
    assert quick_sort([3, 1, 2]) == [1, 2, 3]


def test_quick_sort_reversed():
    assert quick_sort([5, 4, 3, 2, 1]) == [1, 2, 3, 4, 5]


def test_quick_sort_duplicates():
    assert quick_sort([3, 1, 3, 1, 2]) == [1, 1, 2, 3, 3]


def test_quick_sort_single():
    assert quick_sort([1]) == [1]


def test_quick_sort_empty():
    assert quick_sort([]) == []`,
    solution: `def quick_sort(arr):
    _qs(arr, 0, len(arr) - 1)
    return arr

def _partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo
    for j in range(lo, hi):
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]
    return i

def _qs(arr, lo, hi):
    if lo < hi:
        p = _partition(arr, lo, hi)
        _qs(arr, lo, p - 1)
        _qs(arr, p + 1, hi)`,
    usage: null,
    tags: ["divide-and-conquer", "sorting", "recursion"],
  },
  {
    name: "Two Sum",
    category: "arrays",
    language: "python",
    difficulty: "easy",
    description: `Two Sum

Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.

Example 1:
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3, 2, 4], target = 6
Output: [1, 2]

Example 3:
Input: nums = [3, 3], target = 6
Output: [0, 1]

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.

Ref: LeetCode #1 Two Sum`,
    code: `def two_sum(nums, target):
    raise NotImplementedError`,
    testCode: `def test_basic():
    assert two_sum([2, 7, 11, 15], 9) == [0, 1]


def test_middle():
    result = two_sum([3, 2, 4], 6)
    assert sorted(result) == [1, 2]


def test_duplicates():
    assert two_sum([3, 3], 6) == [0, 1]


def test_negative():
    result = two_sum([-1, -2, -3, -4, -5], -8)
    assert sorted(result) == [2, 4]`,
    solution: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`,
    usage: null,
    tags: ["hash-map", "blind75", "neetcode", "arrays-hashing"],
  },
  {
    name: "Build Prefix Sum",
    category: "arrays",
    language: "python",
    difficulty: "easy",
    description: `Build Prefix Sum

Given an array of integers nums, build a prefix sum array where prefix[i] equals the sum of nums[0] through nums[i-1]. The prefix array starts with 0, so its length is len(nums) + 1.

This is a fundamental building block for range sum queries and many array problems.

Example 1:
Input: nums = [1, 2, 3, 4]
Output: [0, 1, 3, 6, 10]
Explanation: prefix[0]=0, prefix[1]=1, prefix[2]=1+2=3, prefix[3]=1+2+3=6, prefix[4]=1+2+3+4=10.

Example 2:
Input: nums = []
Output: [0]

Example 3:
Input: nums = [1, -1, 2]
Output: [0, 1, 0, 2]
Explanation: prefix[2]=1+(-1)=0, prefix[3]=1+(-1)+2=2.

Constraints:
- 0 <= nums.length <= 10^4
- -10^4 <= nums[i] <= 10^4

Ref: LeetCode #1480 Running Sum of 1d Array`,
    code: `def build_prefix(nums):
    raise NotImplementedError`,
    testCode: `def test_build_prefix():
    assert build_prefix([1, 2, 3, 4]) == [0, 1, 3, 6, 10]


def test_build_prefix_empty():
    assert build_prefix([]) == [0]


def test_build_prefix_single():
    assert build_prefix([5]) == [0, 5]


def test_build_prefix_negatives():
    assert build_prefix([1, -1, 2]) == [0, 1, 0, 2]`,
    solution: `def build_prefix(nums):
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    return prefix`,
    usage: null,
    tags: ["prefix-sum"],
  },
  {
    name: "Range Sum Query",
    category: "arrays",
    language: "python",
    difficulty: "easy",
    description: `Range Sum Query

Given a prefix sum array and two indices left and right, return the sum of the original array from index left to right (inclusive).

The prefix array satisfies prefix[i] = sum of original[0..i-1], with prefix[0] = 0. Use the identity: sum(left, right) = prefix[right + 1] - prefix[left].

Example 1:
Input: prefix = [0, 1, 3, 6, 10], left = 0, right = 3
Output: 10
Explanation: Sum of original array [1, 2, 3, 4] from index 0 to 3 is 10.

Example 2:
Input: prefix = [0, 1, 3, 6, 10], left = 1, right = 2
Output: 5
Explanation: Sum of elements at indices 1 and 2 (2 + 3) is 5.

Example 3:
Input: prefix = [0, 1, 3, 6, 10], left = 2, right = 2
Output: 3
Explanation: Single element at index 2 is 3.

Constraints:
- 1 <= prefix.length <= 10^4 + 1
- 0 <= left <= right < prefix.length - 1

Ref: LeetCode #303 Range Sum Query - Immutable`,
    code: `def range_sum(prefix, left, right):
    raise NotImplementedError`,
    testCode: `def test_range_sum_full():
    prefix = [0, 1, 3, 6, 10]
    assert range_sum(prefix, 0, 3) == 10


def test_range_sum_middle():
    prefix = [0, 1, 3, 6, 10]
    assert range_sum(prefix, 1, 2) == 5


def test_range_sum_single():
    prefix = [0, 1, 3, 6, 10]
    assert range_sum(prefix, 2, 2) == 3


def test_range_sum_first():
    prefix = [0, 5, 8, 15]
    assert range_sum(prefix, 0, 0) == 5`,
    solution: `def range_sum(prefix, left, right):
    return prefix[right + 1] - prefix[left]`,
    usage: null,
    tags: ["prefix-sum"],
  },
  {
    name: "Permutations",
    category: "backtracking",
    language: "python",
    difficulty: "medium",
    description: `Permutations

Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.

A permutation is a rearrangement of all the elements of the array. For n distinct elements, there are n! total permutations.

Example 1:
Input: nums = [1, 2, 3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

Example 2:
Input: nums = [0, 1]
Output: [[0,1],[1,0]]

Example 3:
Input: nums = [1]
Output: [[1]]

Constraints:
- 0 <= nums.length <= 6
- -10 <= nums[i] <= 10
- All the integers of nums are unique.

Ref: LeetCode #46 Permutations`,
    code: `def permutations(nums):
    raise NotImplementedError`,
    testCode: `def test_three_elements():
    result = permutations([1, 2, 3])
    assert sorted(result) == sorted([
        [1, 2, 3], [1, 3, 2], [2, 1, 3],
        [2, 3, 1], [3, 1, 2], [3, 2, 1],
    ])


def test_two_elements():
    result = permutations([1, 2])
    assert sorted(result) == sorted([[1, 2], [2, 1]])


def test_single():
    assert permutations([1]) == [[1]]


def test_empty():
    assert permutations([]) == [[]]


def test_count():
    result = permutations([1, 2, 3, 4])
    assert len(result) == 24`,
    solution: `def permutations(nums):
    result = []

    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        for i in range(len(remaining)):
            path.append(remaining[i])
            backtrack(path, remaining[:i] + remaining[i + 1:])
            path.pop()

    backtrack([], nums)
    return result`,
    usage: null,
    tags: ["backtracking", "recursion"],
  },
  {
    name: "Subsets",
    category: "backtracking",
    language: "python",
    difficulty: "medium",
    description: `Subsets

Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the subsets in any order.

The power set of a set with n elements contains 2^n subsets, including the empty set and the set itself.

Example 1:
Input: nums = [1, 2, 3]
Output: [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]

Example 2:
Input: nums = [0]
Output: [[], [0]]

Example 3:
Input: nums = [1, 2]
Output: [[], [1], [2], [1,2]]

Constraints:
- 0 <= nums.length <= 10
- -10 <= nums[i] <= 10
- All the numbers of nums are unique.

Ref: LeetCode #78 Subsets`,
    code: `def subsets(nums):
    raise NotImplementedError`,
    testCode: `def test_three_elements():
    result = subsets([1, 2, 3])
    assert sorted(result) == sorted([
        [], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3],
    ])


def test_two_elements():
    result = subsets([1, 2])
    assert sorted(result) == sorted([[], [1], [2], [1, 2]])


def test_single():
    result = subsets([1])
    assert sorted(result) == sorted([[], [1]])


def test_empty():
    assert subsets([]) == [[]]


def test_count():
    result = subsets([1, 2, 3, 4])
    assert len(result) == 16`,
    solution: `def subsets(nums):
    result = []

    def backtrack(start, path):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()

    backtrack(0, [])
    return result`,
    usage: null,
    tags: ["backtracking", "recursion"],
  },
  {
    name: "Binary Search (Iterative)",
    category: "binary-search",
    language: "python",
    difficulty: "easy",
    description: `Binary Search (Iterative)

Given a sorted array of integers nums in ascending order and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity using an iterative approach.

Example 1:
Input: nums = [1, 3, 5, 7, 9], target = 5
Output: 2
Explanation: 5 exists in nums and its index is 2.

Example 2:
Input: nums = [1, 3, 5, 7, 9], target = 4
Output: -1
Explanation: 4 does not exist in nums, so we return -1.

Example 3:
Input: nums = [], target = 1
Output: -1

Constraints:
- 0 <= nums.length <= 10^4
- -10^4 < nums[i], target < 10^4
- All the integers in nums are unique.
- nums is sorted in ascending order.

Ref: LeetCode #704 Binary Search`,
    code: `def binary_search(nums, target):
    raise NotImplementedError`,
    testCode: `def test_found_middle():
    assert binary_search([1, 3, 5, 7, 9], 5) == 2


def test_found_first():
    assert binary_search([1, 3, 5, 7, 9], 1) == 0


def test_found_last():
    assert binary_search([1, 3, 5, 7, 9], 9) == 4


def test_not_found():
    assert binary_search([1, 3, 5, 7, 9], 4) == -1


def test_empty_list():
    assert binary_search([], 1) == -1


def test_single_element_found():
    assert binary_search([5], 5) == 0


def test_single_element_not_found():
    assert binary_search([5], 3) == -1`,
    solution: `def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1

    while lo <= hi:
        mid = (lo + hi) // 2

        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1

    return -1`,
    usage: null,
    tags: ["binary-search", "divide-and-conquer", "neetcode"],
  },
  {
    name: "Binary Search Find First",
    category: "binary-search",
    language: "python",
    difficulty: "medium",
    description: `Binary Search Find First

Given a sorted array of integers nums and a target value, find the first (leftmost) index where target appears. Return -1 if target is not found.

The array may contain duplicates. Your solution should run in O(log n) time by using a modified binary search that continues searching left after finding a match.

Example 1:
Input: nums = [1, 2, 2, 2, 3], target = 2
Output: 1
Explanation: The first occurrence of 2 is at index 1.

Example 2:
Input: nums = [2, 2, 2], target = 2
Output: 0
Explanation: All elements are 2; the first occurrence is at index 0.

Example 3:
Input: nums = [1, 3, 5], target = 2
Output: -1
Explanation: 2 is not in the array.

Constraints:
- 0 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9
- nums is sorted in non-decreasing order.

Ref: LeetCode #34 Find First and Last Position of Element in Sorted Array`,
    code: `def find_first(nums, target):
    raise NotImplementedError`,
    testCode: `def test_find_first_dupes():
    assert find_first([1, 2, 2, 2, 3], 2) == 1


def test_find_first_not_found():
    assert find_first([1, 3, 5], 2) == -1


def test_find_first_single_match():
    assert find_first([1, 2, 3], 2) == 1


def test_find_first_all_same():
    assert find_first([2, 2, 2], 2) == 0


def test_find_first_empty():
    assert find_first([], 1) == -1


def test_find_first_at_start():
    assert find_first([1, 2, 3], 1) == 0`,
    solution: `def find_first(nums, target):
    lo, hi = 0, len(nums) - 1
    result = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            result = mid
            hi = mid - 1
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result`,
    usage: null,
    tags: ["binary-search"],
  },
  {
    name: "Binary Search Find Last",
    category: "binary-search",
    language: "python",
    difficulty: "medium",
    description: `Binary Search Find Last

Given a sorted array of integers nums and a target value, find the last (rightmost) index where target appears. Return -1 if target is not found.

The array may contain duplicates. Your solution should run in O(log n) time by using a modified binary search that continues searching right after finding a match.

Example 1:
Input: nums = [1, 2, 2, 2, 3], target = 2
Output: 3
Explanation: The last occurrence of 2 is at index 3.

Example 2:
Input: nums = [2, 2, 2], target = 2
Output: 2
Explanation: All elements are 2; the last occurrence is at index 2.

Example 3:
Input: nums = [1, 3, 5], target = 2
Output: -1
Explanation: 2 is not in the array.

Constraints:
- 0 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9
- nums is sorted in non-decreasing order.

Ref: LeetCode #34 Find First and Last Position of Element in Sorted Array`,
    code: `def find_last(nums, target):
    raise NotImplementedError`,
    testCode: `def test_find_last_dupes():
    assert find_last([1, 2, 2, 2, 3], 2) == 3


def test_find_last_not_found():
    assert find_last([1, 3, 5], 2) == -1


def test_find_last_single_match():
    assert find_last([1, 2, 3], 2) == 1


def test_find_last_all_same():
    assert find_last([2, 2, 2], 2) == 2


def test_find_last_empty():
    assert find_last([], 1) == -1


def test_find_last_at_end():
    assert find_last([1, 2, 3], 3) == 2`,
    solution: `def find_last(nums, target):
    lo, hi = 0, len(nums) - 1
    result = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            result = mid
            lo = mid + 1
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result`,
    usage: null,
    tags: ["binary-search"],
  },
  {
    name: "Binary Search (Recursive)",
    category: "binary-search",
    language: "python",
    difficulty: "easy",
    description: `Binary Search (Recursive)

Given a sorted array of integers nums in ascending order and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity using a recursive approach with a helper function.

Example 1:
Input: nums = [1, 3, 5, 7, 9], target = 5
Output: 2
Explanation: 5 exists in nums and its index is 2.

Example 2:
Input: nums = [1, 3, 5, 7, 9], target = 4
Output: -1
Explanation: 4 does not exist in nums, so we return -1.

Example 3:
Input: nums = [5], target = 5
Output: 0

Constraints:
- 0 <= nums.length <= 10^4
- -10^4 < nums[i], target < 10^4
- All the integers in nums are unique.
- nums is sorted in ascending order.

Ref: LeetCode #704 Binary Search`,
    code: `def binary_search(nums, target):
    raise NotImplementedError`,
    testCode: `def test_found_middle():
    assert binary_search([1, 3, 5, 7, 9], 5) == 2


def test_found_first():
    assert binary_search([1, 3, 5, 7, 9], 1) == 0


def test_found_last():
    assert binary_search([1, 3, 5, 7, 9], 9) == 4


def test_not_found():
    assert binary_search([1, 3, 5, 7, 9], 4) == -1


def test_empty_list():
    assert binary_search([], 1) == -1


def test_single_element_found():
    assert binary_search([5], 5) == 0


def test_single_element_not_found():
    assert binary_search([5], 3) == -1`,
    solution: `def binary_search(nums, target):
    def helper(lo, hi):
        if lo > hi:
            return -1
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            return helper(mid + 1, hi)
        else:
            return helper(lo, mid - 1)
    return helper(0, len(nums) - 1)`,
    usage: null,
    tags: ["binary-search", "divide-and-conquer", "recursion", "neetcode"],
  },
  {
    name: "Single Number XOR",
    category: "bit-manipulation",
    language: "python",
    difficulty: "easy",
    description: `Single Number

Given a non-empty array of integers nums, every element appears exactly twice except for one. Find that single one.

You must implement a solution with O(n) time complexity and O(1) space complexity.

Example 1:
Input: nums = [2, 2, 1]
Output: 1

Example 2:
Input: nums = [4, 1, 2, 1, 2]
Output: 4
Explanation: 1 and 2 each appear twice, so 4 is the single number.

Example 3:
Input: nums = [1]
Output: 1

Constraints:
- 1 <= nums.length <= 3 * 10^4
- -3 * 10^4 <= nums[i] <= 3 * 10^4
- Each element appears exactly twice except for one element which appears only once.

Ref: LeetCode #136 Single Number`,
    code: `def single_number(nums):
    raise NotImplementedError`,
    testCode: `def test_basic():
    assert single_number([2, 2, 1]) == 1


def test_middle():
    assert single_number([4, 1, 2, 1, 2]) == 4


def test_single():
    assert single_number([1]) == 1


def test_larger():
    assert single_number([10, 20, 10, 30, 20]) == 30`,
    solution: `def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result`,
    usage: null,
    tags: ["bit-manipulation", "xor"],
  },
  {
    name: "Count Set Bits",
    category: "bit-manipulation",
    language: "python",
    difficulty: "easy",
    description: `Number of 1 Bits

Given a non-negative integer n, return the number of 1 bits in its binary representation (also known as the Hamming weight).

Example 1:
Input: n = 11 (binary: 1011)
Output: 3
Explanation: The binary representation of 11 is 1011, which has three 1 bits.

Example 2:
Input: n = 128 (binary: 10000000)
Output: 1

Example 3:
Input: n = 255 (binary: 11111111)
Output: 8

Constraints:
- 0 <= n <= 2^31 - 1

Ref: LeetCode #191 Number of 1 Bits`,
    code: `def count_bits(n):
    raise NotImplementedError`,
    testCode: `def test_zero():
    assert count_bits(0) == 0


def test_one():
    assert count_bits(1) == 1


def test_three():
    assert count_bits(3) == 2  # 11


def test_seven():
    assert count_bits(7) == 3  # 111


def test_eight():
    assert count_bits(8) == 1  # 1000


def test_255():
    assert count_bits(255) == 8  # 11111111


def test_large():
    assert count_bits(1023) == 10  # 1111111111`,
    solution: `def count_bits(n):
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count`,
    usage: null,
    tags: ["bit-manipulation", "blind75"],
  },
  {
    name: "Matrix BFS",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Matrix BFS

Given a 2D grid of integers and a starting position (row, col), perform a breadth-first search and return the list of all positions visited in BFS order. Only traverse cells with value 0 (passable). Cells with value 1 are walls. Move in 4 directions: up, down, left, right.

Example 1:
Input: grid = [[0,0,0],[0,1,0],[0,0,0]], start = (0, 0)
Output: [(0,0), (0,1), (1,0), (0,2), (2,0), (1,2), (2,1), (2,2)]
Explanation: BFS explores all passable cells level by level. The center cell (1,1) is a wall and is skipped.

Example 2:
Input: grid = [[0,1],[1,0]], start = (0, 0)
Output: [(0, 0)]
Explanation: Start is surrounded by walls, so only the start cell is visited.

Example 3:
Input: grid = [[0]], start = (0, 0)
Output: [(0, 0)]

Constraints:
- 1 <= grid.length, grid[0].length <= 100
- grid[i][j] is 0 or 1
- start is always a passable cell (value 0)

Ref: LeetCode #1091 Shortest Path in Binary Matrix`,
    code: `from collections import deque

def matrix_bfs(grid, start):
    raise NotImplementedError`,
    testCode: `def test_matrix_bfs_simple():
    grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ]
    result = matrix_bfs(grid, (0, 0))
    assert result[0] == (0, 0)
    assert len(result) == 8  # all passable cells


def test_matrix_bfs_blocked():
    grid = [
        [0, 1],
        [1, 0],
    ]
    result = matrix_bfs(grid, (0, 0))
    assert result == [(0, 0)]


def test_matrix_bfs_single_cell():
    grid = [[0]]
    result = matrix_bfs(grid, (0, 0))
    assert result == [(0, 0)]`,
    solution: `from collections import deque


def matrix_bfs(grid, start):
    rows, cols = len(grid), len(grid[0])
    queue = deque([start])
    visited = {start}
    result = []

    while queue:
        r, c = queue.popleft()
        result.append((r, c))

        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in visited and grid[nr][nc] == 0:
                visited.add((nr, nc))
                queue.append((nr, nc))

    return result`,
    usage: null,
    tags: ["bfs", "matrix"],
  },
  {
    name: "Graph DFS (Iterative)",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Graph DFS (Iterative)

Given a graph represented as an adjacency list (dictionary mapping each node to a list of its neighbors) and a start node, return a list of all reachable nodes visited in depth-first order. Use an iterative approach with an explicit stack.

Example 1:
Input: graph = {"a": ["b", "c"], "b": ["d"], "c": [], "d": []}, start = "a"
Output: ["a", "c", "b", "d"]
Explanation: DFS visits "a", then pushes "b" and "c" onto the stack. Popping "c" first (stack is LIFO), then "b", then "d".

Example 2:
Input: graph = {"a": []}, start = "a"
Output: ["a"]

Example 3:
Input: graph = {"a": ["b"], "b": [], "c": ["d"], "d": []}, start = "a"
Output: ["a", "b"]
Explanation: Nodes "c" and "d" are not reachable from "a".

Constraints:
- The graph is represented as a dict of node -> list of neighbors.
- All neighbor nodes referenced in adjacency lists exist as keys in the graph.
- The start node exists in the graph.

Ref: LeetCode #323 Number of Connected Components (closest match)`,
    code: `def graph_dfs(graph, start):
    raise NotImplementedError`,
    testCode: `def test_simple_graph():
    graph = {
        "a": ["b", "c"],
        "b": ["d"],
        "c": [],
        "d": [],
    }
    result = graph_dfs(graph, "a")
    assert result[0] == "a"
    assert set(result) == {"a", "b", "c", "d"}


def test_single_node():
    graph = {"a": []}
    assert graph_dfs(graph, "a") == ["a"]


def test_disconnected():
    graph = {
        "a": ["b"],
        "b": [],
        "c": ["d"],
        "d": [],
    }
    result = graph_dfs(graph, "a")
    assert set(result) == {"a", "b"}`,
    solution: `def graph_dfs(graph, start):
    visited = set()
    result = []
    stack = [start]

    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        result.append(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)

    return result`,
    usage: null,
    tags: ["dfs", "graph"],
  },
  {
    name: "Build Adjacency List",
    category: "graphs",
    language: "python",
    difficulty: "easy",
    description: `Build Adjacency List

Given a list of edges where each edge is a tuple of two nodes, build and return an adjacency list represented as a dictionary. If directed is False (the default), add edges in both directions. If directed is True, only add edges in the given direction.

Example 1:
Input: edges = [("a", "b"), ("b", "c")], directed = False
Output: {"a": ["b"], "b": ["a", "c"], "c": ["b"]}
Explanation: Undirected graph, so each edge creates connections in both directions.

Example 2:
Input: edges = [("a", "b"), ("b", "c")], directed = True
Output: {"a": ["b"], "b": ["c"]}
Explanation: Directed graph, so edges only go one way. Node "c" has no outgoing edges and does not appear as a key.

Example 3:
Input: edges = []
Output: {}

Constraints:
- Each edge is a tuple of exactly two nodes.
- Nodes can be any hashable type (typically strings or integers).
- The returned dict maps each node to a list of its neighbors.

Ref: LeetCode #133 Clone Graph (closest match)`,
    code: `def build_adjacency_list(edges, directed=False):
    raise NotImplementedError`,
    testCode: `def test_undirected():
    edges = [("a", "b"), ("b", "c")]
    result = build_adjacency_list(edges)
    assert "b" in result["a"]
    assert "a" in result["b"]
    assert "c" in result["b"]
    assert "b" in result["c"]


def test_directed():
    edges = [("a", "b"), ("b", "c")]
    result = build_adjacency_list(edges, directed=True)
    assert result["a"] == ["b"]
    assert result["b"] == ["c"]
    assert "a" not in result.get("b", []) or result["b"] == ["c"]
    assert "c" not in result


def test_empty():
    result = build_adjacency_list([])
    assert result == {}`,
    solution: `from collections import defaultdict


def build_adjacency_list(edges, directed=False):
    graph = defaultdict(list)

    for a, b in edges:
        graph[a].append(b)
        if not directed:
            graph[b].append(a)

    return dict(graph)`,
    usage: null,
    tags: ["graph"],
  },
  {
    name: "Matrix DFS (Recursive)",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Matrix DFS (Recursive)

Given a 2D grid of integers and a starting position (row, col), perform a depth-first search using recursion and return the list of all positions visited in DFS order. Only traverse cells with value 0 (passable). Cells with value 1 are walls. Move in 4 directions: up, down, left, right.

Example 1:
Input: grid = [[0,0,0],[0,1,0],[0,0,0]], start = (0, 0)
Output: [(0,0), (0,1), (0,2), (1,2), (2,2), (2,1), (2,0), (1,0)]
Explanation: DFS explores as deep as possible along each branch before backtracking. The center cell (1,1) is a wall.

Example 2:
Input: grid = [[0,1],[1,0]], start = (0, 0)
Output: [(0, 0)]
Explanation: The start cell is surrounded by walls, so only it is visited.

Example 3:
Input: grid = [[0,0],[0,0]], start = (0, 0)
Output: [(0,0), (0,1), (1,1), (1,0)]
Explanation: All cells are passable. DFS visits all 4 cells.

Constraints:
- 1 <= grid.length, grid[0].length <= 100
- grid[i][j] is 0 or 1
- start is always a passable cell (value 0)

Ref: LeetCode #200 Number of Islands`,
    code: `def matrix_dfs(grid, start):
    raise NotImplementedError`,
    testCode: `def test_simple():
    grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ]
    result = matrix_dfs(grid, (0, 0))
    assert result[0] == (0, 0)
    assert len(result) == 8


def test_blocked():
    grid = [
        [0, 1],
        [1, 0],
    ]
    result = matrix_dfs(grid, (0, 0))
    assert result == [(0, 0)]


def test_single_cell():
    grid = [[0]]
    result = matrix_dfs(grid, (0, 0))
    assert result == [(0, 0)]


def test_all_open():
    grid = [
        [0, 0],
        [0, 0],
    ]
    result = matrix_dfs(grid, (0, 0))
    assert len(result) == 4
    assert result[0] == (0, 0)`,
    solution: `def matrix_dfs(grid, start):
    rows, cols = len(grid), len(grid[0])
    visited = set()
    result = []

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        if (r, c) in visited or grid[r][c] == 1:
            return

        visited.add((r, c))
        result.append((r, c))

        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            dfs(r + dr, c + dc)

    dfs(*start)
    return result`,
    usage: null,
    tags: ["dfs", "matrix", "recursion"],
  },
  {
    name: "Graph DFS (Recursive)",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Graph DFS (Recursive)

Given a graph represented as an adjacency list (dictionary mapping each node to a list of its neighbors) and a start node, return a list of all reachable nodes visited in depth-first order. Use a recursive approach.

Example 1:
Input: graph = {"a": ["b", "c"], "b": ["d"], "c": [], "d": []}, start = "a"
Output: ["a", "b", "d", "c"]
Explanation: Recursive DFS visits "a", then recurses into "b", then "d" (depth-first), backtracks, then visits "c".

Example 2:
Input: graph = {"a": []}, start = "a"
Output: ["a"]

Example 3:
Input: graph = {"a": ["b"], "b": [], "c": ["d"], "d": []}, start = "a"
Output: ["a", "b"]
Explanation: Nodes "c" and "d" are not reachable from "a".

Constraints:
- The graph is represented as a dict of node -> list of neighbors.
- All neighbor nodes referenced in adjacency lists exist as keys in the graph.
- The start node exists in the graph.

Ref: LeetCode #323 Number of Connected Components (closest match)`,
    code: `def graph_dfs(graph, start):
    raise NotImplementedError`,
    testCode: `def test_simple_graph():
    graph = {
        "a": ["b", "c"],
        "b": ["d"],
        "c": [],
        "d": [],
    }
    result = graph_dfs(graph, "a")
    assert result[0] == "a"
    assert set(result) == {"a", "b", "c", "d"}


def test_single_node():
    graph = {"a": []}
    assert graph_dfs(graph, "a") == ["a"]


def test_disconnected():
    graph = {
        "a": ["b"],
        "b": [],
        "c": ["d"],
        "d": [],
    }
    result = graph_dfs(graph, "a")
    assert set(result) == {"a", "b"}`,
    solution: `def graph_dfs(graph, start):
    visited = set()
    result = []

    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        result.append(node)
        for neighbor in graph[node]:
            dfs(neighbor)

    dfs(start)
    return result`,
    usage: null,
    tags: ["dfs", "graph", "recursion"],
  },
  {
    name: "Matrix DFS (Iterative)",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Matrix DFS (Iterative)

Given a 2D grid of integers and a starting position (row, col), perform a depth-first search using an explicit stack (iterative approach) and return the list of all positions visited in DFS order. Only traverse cells with value 0 (passable). Cells with value 1 are walls. Move in 4 directions: up, down, left, right.

Example 1:
Input: grid = [[0,0,0],[0,1,0],[0,0,0]], start = (0, 0)
Output: [(0,0), (1,0), (2,0), (2,1), (2,2), (1,2), (0,2), (0,1)]
Explanation: Iterative DFS uses a stack, so traversal order may differ from recursive DFS. The center cell (1,1) is a wall and is skipped.

Example 2:
Input: grid = [[0,1],[1,0]], start = (0, 0)
Output: [(0, 0)]
Explanation: Start is surrounded by walls, so only the start cell is visited.

Example 3:
Input: grid = [[0,0],[0,0]], start = (0, 0)
Output: [(0,0), (1,0), (1,1), (0,1)]
Explanation: All cells are passable. Stack-based DFS visits all 4 cells.

Constraints:
- 1 <= grid.length, grid[0].length <= 100
- grid[i][j] is 0 or 1
- start is always a passable cell (value 0)

Ref: LeetCode #200 Number of Islands`,
    code: `def matrix_dfs(grid, start):
    raise NotImplementedError`,
    testCode: `def test_simple():
    grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ]
    result = matrix_dfs(grid, (0, 0))
    assert result[0] == (0, 0)
    assert len(result) == 8


def test_blocked():
    grid = [
        [0, 1],
        [1, 0],
    ]
    result = matrix_dfs(grid, (0, 0))
    assert result == [(0, 0)]


def test_single_cell():
    grid = [[0]]
    result = matrix_dfs(grid, (0, 0))
    assert result == [(0, 0)]


def test_all_open():
    grid = [
        [0, 0],
        [0, 0],
    ]
    result = matrix_dfs(grid, (0, 0))
    assert len(result) == 4
    assert result[0] == (0, 0)`,
    solution: `def matrix_dfs(grid, start):
    rows, cols = len(grid), len(grid[0])
    visited = set()
    result = []
    stack = [start]

    while stack:
        r, c = stack.pop()
        if (r, c) in visited or grid[r][c] == 1:
            continue
        visited.add((r, c))
        result.append((r, c))

        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in visited:
                stack.append((nr, nc))

    return result`,
    usage: null,
    tags: ["dfs", "matrix"],
  },
  {
    name: "Matrix Grid BFS",
    category: "graphs",
    language: "python",
    difficulty: "easy",
    description: `Grid BFS

Given an integer n, perform a breadth-first search starting from cell (0, 0) on an n x n grid. Return the list of all visited cells as (row, col) tuples in the order they were visited. All cells are passable. Move in 4 directions: up, down, left, right.

Example 1:
Input: n = 1
Output: [(0, 0)]

Example 2:
Input: n = 2
Output: [(0,0), (0,1), (1,0), (1,1)]
Explanation: BFS from (0,0) visits adjacent cells level by level.

Example 3:
Input: n = 3
Output: [(0,0), (0,1), (1,0), (0,2), (1,1), (2,0), (1,2), (2,1), (2,2)]
Explanation: All 9 cells are visited in BFS order from the top-left corner.

Constraints:
- 1 <= n <= 100
- The grid has no walls; all n * n cells are visited.
- Output length is always n * n.`,
    code: `from collections import deque

def grid_bfs(n):
    raise NotImplementedError`,
    testCode: `def test_1x1():
    assert grid_bfs(1) == [(0, 0)]


def test_2x2():
    result = grid_bfs(2)
    assert result[0] == (0, 0)
    assert set(result) == {(0, 0), (0, 1), (1, 0), (1, 1)}
    assert len(result) == 4


def test_3x3():
    result = grid_bfs(3)
    assert result[0] == (0, 0)
    assert len(result) == 9
    assert set(result) == {(r, c) for r in range(3) for c in range(3)}


def test_all_cells_visited():
    n = 4
    result = grid_bfs(n)
    assert len(result) == n * n
    assert len(set(result)) == n * n`,
    solution: `from collections import deque

def grid_bfs(n):
    visited = set()
    order = []
    queue = deque([(0, 0)])
    visited.add((0, 0))
    while queue:
        r, c = queue.popleft()
        order.append((r, c))
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in visited:
                visited.add((nr, nc))
                queue.append((nr, nc))
    return order`,
    usage: null,
    tags: ["bfs", "matrix"],
  },
  {
    name: "Min Heap",
    category: "heap",
    language: "python",
    difficulty: "hard",
    description: `Min Heap

Implement a min heap data structure from scratch. Do not use Python's heapq module.

Your MinHeap class should support the following operations:
- insert(val): Add a value to the heap and maintain the heap property by bubbling up.
- extract_min(): Remove and return the smallest value from the heap, then restore the heap property by bubbling down. Raise IndexError if the heap is empty.
- peek(): Return the smallest value without removing it. Raise IndexError if the heap is empty.
- __len__(): Return the number of elements in the heap.

Example 1:
h = MinHeap()
h.insert(5)
h.insert(3)
h.insert(7)
h.peek()        # returns 3
h.extract_min()  # returns 3
h.extract_min()  # returns 5

Example 2:
h = MinHeap()
h.insert(1)
len(h)           # returns 1
h.extract_min()  # returns 1
len(h)           # returns 0

Example 3:
h = MinHeap()
h.insert(3)
h.insert(3)
h.insert(3)
h.extract_min()  # returns 3 (duplicates are allowed)

Constraints:
- Values are comparable integers.
- extract_min() and peek() on an empty heap must raise IndexError.
- All operations should maintain the min-heap invariant: parent <= children.

Ref: LeetCode #703 Kth Largest Element in a Stream (closest match)`,
    code: `class MinHeap:
    def __init__(self):
        self.data = []

    def insert(self, val):
        raise NotImplementedError

    def extract_min(self):
        raise NotImplementedError

    def peek(self):
        raise NotImplementedError

    def __len__(self):
        return len(self.data)`,
    testCode: `def test_insert_and_peek():
    h = MinHeap()
    h.insert(5)
    h.insert(3)
    h.insert(7)
    assert h.peek() == 3


def test_extract_min():
    h = MinHeap()
    for val in [5, 3, 7, 1, 4]:
        h.insert(val)

    assert h.extract_min() == 1
    assert h.extract_min() == 3
    assert h.extract_min() == 4
    assert h.extract_min() == 5
    assert h.extract_min() == 7


def test_extract_from_empty():
    h = MinHeap()
    try:
        h.extract_min()
        assert False, "Expected IndexError"
    except IndexError:
        pass


def test_peek_empty():
    h = MinHeap()
    try:
        h.peek()
        assert False, "Expected IndexError"
    except IndexError:
        pass


def test_len():
    h = MinHeap()
    assert len(h) == 0
    h.insert(1)
    h.insert(2)
    assert len(h) == 2
    h.extract_min()
    assert len(h) == 1


def test_insert_duplicates():
    h = MinHeap()
    h.insert(3)
    h.insert(3)
    h.insert(3)
    assert h.extract_min() == 3
    assert h.extract_min() == 3
    assert h.extract_min() == 3`,
    solution: `class MinHeap:
    def __init__(self):
        self.data = []

    def insert(self, val):
        self.data.append(val)
        self._bubble_up(len(self.data) - 1)

    def extract_min(self):
        if not self.data:
            raise IndexError("extract from empty heap")

        self._swap(0, len(self.data) - 1)
        val = self.data.pop()
        if self.data:
            self._bubble_down(0)
        return val

    def peek(self):
        if not self.data:
            raise IndexError("peek at empty heap")
        return self.data[0]

    def __len__(self):
        return len(self.data)

    def _bubble_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.data[i] < self.data[parent]:
                self._swap(i, parent)
                i = parent
            else:
                break

    def _bubble_down(self, i):
        size = len(self.data)
        while True:
            smallest = i
            left = 2 * i + 1
            right = 2 * i + 2

            if left < size and self.data[left] < self.data[smallest]:
                smallest = left
            if right < size and self.data[right] < self.data[smallest]:
                smallest = right

            if smallest == i:
                break

            self._swap(i, smallest)
            i = smallest

    def _swap(self, i, j):
        self.data[i], self.data[j] = self.data[j], self.data[i]`,
    usage: null,
    tags: ["heap"],
  },
  {
    name: "Merge Intervals",
    category: "intervals",
    language: "python",
    difficulty: "medium",
    description: `Merge Intervals

Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

Example 1:
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].

Example 2:
Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]
Explanation: Intervals [1,4] and [4,5] are considered overlapping.

Example 3:
Input: intervals = [[1,4],[2,3],[3,6]]
Output: [[1,6]]
Explanation: All three intervals overlap and merge into a single interval.

Constraints:
- 1 <= intervals.length <= 10^4
- intervals[i].length == 2
- 0 <= start_i <= end_i <= 10^4

Ref: LeetCode #56 Merge Intervals`,
    code: `def merge(intervals):
    raise NotImplementedError`,
    testCode: `def test_overlapping():
    assert merge([[1, 3], [2, 6], [8, 10], [15, 18]]) == [[1, 6], [8, 10], [15, 18]]


def test_adjacent():
    assert merge([[1, 4], [4, 5]]) == [[1, 5]]


def test_no_overlap():
    assert merge([[1, 2], [4, 5]]) == [[1, 2], [4, 5]]


def test_single():
    assert merge([[1, 5]]) == [[1, 5]]


def test_empty():
    assert merge([]) == []


def test_all_overlapping():
    assert merge([[1, 4], [2, 3], [3, 6]]) == [[1, 6]]


def test_unsorted():
    assert merge([[3, 4], [1, 2], [2, 3]]) == [[1, 4]]`,
    solution: `def merge(intervals):
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
    usage: null,
    tags: ["sorting", "intervals", "blind75"],
  },
  {
    name: "Linked List Traversal (Iterative)",
    category: "linked-list",
    language: "python",
    difficulty: "easy",
    description: `Linked List Traversal (Iterative)

Given the head of a singly linked list, return a list of all node values in order using an iterative approach.

Each node has a val attribute and a next pointer. Traverse from head to the end of the list, collecting each node's value.

Example 1:
Input: head = [1,2,3]
Output: [1,2,3]
Explanation: Traverse 1 -> 2 -> 3, collecting values into a list.

Example 2:
Input: head = [42]
Output: [42]
Explanation: Single node, return its value in a list.

Example 3:
Input: head = []
Output: []
Explanation: Empty list, return an empty list.

Constraints:
- 0 <= number of nodes <= 5000
- -10^4 <= Node.val <= 10^4

Ref: LeetCode #234 Palindrome Linked List (closest match)`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def traverse(head):
    raise NotImplementedError`,
    testCode: `def test_traverse_multiple():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    a.next = b
    b.next = c
    assert traverse(a) == [1, 2, 3]


def test_traverse_single():
    a = Node(42)
    assert traverse(a) == [42]


def test_traverse_empty():
    assert traverse(None) == []`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None


def traverse(head):
    result = []
    current = head

    while current is not None:
        result.append(current.val)
        current = current.next

    return result`,
    usage: null,
    tags: ["linked-list", "iteration", "blind75"],
  },
  {
    name: "Reverse Linked List (Iterative)",
    category: "linked-list",
    language: "python",
    difficulty: "easy",
    description: `Reverse Linked List (Iterative)

Given the head of a singly linked list, reverse the list using an iterative approach, and return the reversed list.

Example 1:
Input: head = [1,2,3,4]
Output: [4,3,2,1]
Explanation: Reverse all pointers so the list runs backwards.

Example 2:
Input: head = [1]
Output: [1]
Explanation: A single-node list is already reversed.

Example 3:
Input: head = []
Output: []
Explanation: An empty list remains empty when reversed.

Constraints:
- 0 <= number of nodes <= 5000
- -5000 <= Node.val <= 5000

Ref: LeetCode #206 Reverse Linked List`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def reverse_iterative(head):
    raise NotImplementedError`,
    testCode: `def _build(values):
    head = None
    for v in reversed(values):
        n = Node(v)
        n.next = head
        head = n
    return head


def _to_list(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result


def test_reverse_iterative():
    head = _build([1, 2, 3, 4])
    result = reverse_iterative(head)
    assert _to_list(result) == [4, 3, 2, 1]


def test_reverse_iterative_single():
    head = _build([1])
    result = reverse_iterative(head)
    assert _to_list(result) == [1]


def test_reverse_iterative_empty():
    assert reverse_iterative(None) is None`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None


def reverse_iterative(head):
    prev = None
    current = head
    while current is not None:
        nxt = current.next
        current.next = prev
        prev = current
        current = nxt
    return prev`,
    usage: null,
    tags: ["linked-list", "iteration"],
  },
  {
    name: "Reverse Linked List (Recursive)",
    category: "linked-list",
    language: "python",
    difficulty: "medium",
    description: `Reverse Linked List (Recursive)

Given the head of a singly linked list, reverse the list using a recursive approach, and return the reversed list.

Example 1:
Input: head = [1,2,3,4]
Output: [4,3,2,1]
Explanation: Recursively reverse the rest of the list, then fix the pointers.

Example 2:
Input: head = [1]
Output: [1]
Explanation: Base case; a single-node list is already reversed.

Example 3:
Input: head = []
Output: []
Explanation: An empty list remains empty when reversed.

Constraints:
- 0 <= number of nodes <= 5000
- -5000 <= Node.val <= 5000

Ref: LeetCode #206 Reverse Linked List`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def reverse_recursive(head):
    raise NotImplementedError`,
    testCode: `def _build(values):
    head = None
    for v in reversed(values):
        n = Node(v)
        n.next = head
        head = n
    return head


def _to_list(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result


def test_reverse_recursive():
    head = _build([1, 2, 3, 4])
    result = reverse_recursive(head)
    assert _to_list(result) == [4, 3, 2, 1]


def test_reverse_recursive_single():
    head = _build([1])
    result = reverse_recursive(head)
    assert _to_list(result) == [1]


def test_reverse_recursive_empty():
    assert reverse_recursive(None) is None`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None


def reverse_recursive(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_recursive(head.next)
    head.next.next = head
    head.next = None
    return new_head`,
    usage: null,
    tags: ["linked-list", "recursion", "blind75"],
  },
  {
    name: "Linked List Cycle Detection",
    category: "linked-list",
    language: "python",
    difficulty: "easy",
    description: `Linked List Cycle Detection

Given head, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer. Return True if there is a cycle, False otherwise.

Use Floyd's cycle detection algorithm (tortoise and hare) with O(1) space.

Example 1:
Input: head = [3,2,0,-4], pos = 1
Output: True
Explanation: There is a cycle where the tail connects to the 1st node (0-indexed).

Example 2:
Input: head = [1], pos = -1
Output: False
Explanation: There is no cycle in the list.

Example 3:
Input: head = [1,2], pos = 0
Output: True
Explanation: The tail connects back to the 0th node.

Constraints:
- 0 <= number of nodes <= 10^4
- -10^5 <= Node.val <= 10^5

Ref: LeetCode #141 Linked List Cycle`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None


def has_cycle(head):
    raise NotImplementedError`,
    testCode: `def test_no_cycle():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    a.next = b
    b.next = c
    assert has_cycle(a) is False


def test_has_cycle():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    a.next = b
    b.next = c
    c.next = a
    assert has_cycle(a) is True


def test_self_cycle():
    a = Node(1)
    a.next = a
    assert has_cycle(a) is True


def test_empty():
    assert has_cycle(None) is False


def test_single_no_cycle():
    a = Node(1)
    assert has_cycle(a) is False`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None


def has_cycle(head):
    slow = head
    fast = head

    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True

    return False`,
    usage: null,
    tags: ["linked-list", "fast-slow-pointer", "blind75"],
  },
  {
    name: "Linked List Traversal (Recursive)",
    category: "linked-list",
    language: "python",
    difficulty: "easy",
    description: `Linked List Traversal (Recursive)

Given the head of a singly linked list, return a list of all node values in order using a recursive approach.

At each recursive call, add the current node's value and recurse on the next node. Base case: return an empty list when head is None.

Example 1:
Input: head = [1,2,3]
Output: [1,2,3]
Explanation: Recursively visit 1, then 2, then 3, building up the result list.

Example 2:
Input: head = [42]
Output: [42]
Explanation: Single node; return [42].

Example 3:
Input: head = []
Output: []
Explanation: Empty list; base case returns [].

Constraints:
- 0 <= number of nodes <= 5000
- -10^4 <= Node.val <= 10^4

Ref: LeetCode #234 Palindrome Linked List (closest match)`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def traverse(head):
    raise NotImplementedError`,
    testCode: `def test_traverse_multiple():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    a.next = b
    b.next = c
    assert traverse(a) == [1, 2, 3]


def test_traverse_single():
    a = Node(42)
    assert traverse(a) == [42]


def test_traverse_empty():
    assert traverse(None) == []`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None


def traverse(head):
    if head is None:
        return []
    return [head.val] + traverse(head.next)`,
    usage: null,
    tags: ["linked-list", "recursion"],
  },
  {
    name: "Sliding Window Max Sum",
    category: "sliding-window",
    language: "python",
    difficulty: "medium",
    description: `Sliding Window Max Sum

Given an integer array nums and an integer k, find the maximum sum of any contiguous subarray of size k.

Use the sliding window technique: compute the sum of the first window, then slide by adding the next element and removing the leftmost element.

Example 1:
Input: nums = [1,4,2,10,2,3,1,0,20], k = 4
Output: 24
Explanation: The subarray [3,1,0,20] has the maximum sum of 24.

Example 2:
Input: nums = [1,2,3], k = 3
Output: 6
Explanation: Only one window exists, which is the entire array summing to 6.

Example 3:
Input: nums = [5,1,8,3], k = 1
Output: 8
Explanation: With window size 1, return the maximum element.

Constraints:
- 1 <= k <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4

Ref: LeetCode #2461 Maximum Sum of Distinct Subarrays With Length K`,
    code: `def max_subarray_sum(nums, k):
    raise NotImplementedError`,
    testCode: `def test_basic():
    assert max_subarray_sum([1, 4, 2, 10, 2, 3, 1, 0, 20], 4) == 24


def test_window_is_full_array():
    assert max_subarray_sum([1, 2, 3], 3) == 6


def test_window_of_one():
    assert max_subarray_sum([5, 1, 8, 3], 1) == 8


def test_negative_values():
    assert max_subarray_sum([-1, -2, -3, -4], 2) == -3


def test_mixed():
    assert max_subarray_sum([2, -1, 5, -3, 4], 3) == 6`,
    solution: `def max_subarray_sum(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum

    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)

    return max_sum`,
    usage: null,
    tags: ["sliding-window"],
  },
  {
    name: "Balanced Parentheses",
    category: "stack",
    language: "python",
    difficulty: "easy",
    description: `Valid Parentheses

Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example 1:
Input: s = "()"
Output: True

Example 2:
Input: s = "({[]})"
Output: True
Explanation: Each bracket is closed in the correct nesting order.

Example 3:
Input: s = "(]"
Output: False
Explanation: The open parenthesis is closed by a square bracket, which is invalid.

Constraints:
- 0 <= s.length <= 10^4
- s consists of parentheses only: '(){}[]'

Ref: LeetCode #20 Valid Parentheses`,
    code: `def is_balanced(s):
    raise NotImplementedError`,
    testCode: `def test_balanced_simple():
    assert is_balanced("()") is True


def test_balanced_nested():
    assert is_balanced("({[]})") is True


def test_balanced_multiple():
    assert is_balanced("()[]{}") is True


def test_unbalanced_close():
    assert is_balanced("(]") is False


def test_unbalanced_open():
    assert is_balanced("(") is False


def test_unbalanced_extra_close():
    assert is_balanced("())") is False


def test_empty():
    assert is_balanced("") is True


def test_complex():
    assert is_balanced("{[()]}[{}]") is True`,
    solution: `def is_balanced(s):
    stack = []
    pairs = {")": "(", "}": "{", "]": "["}
    for ch in s:
        if ch in "({[":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    return len(stack) == 0`,
    usage: null,
    tags: ["stack", "string", "blind75"],
  },
  {
    name: "Queue from Two Stacks",
    category: "stack",
    language: "python",
    difficulty: "medium",
    description: `Queue from Two Stacks

Implement a first-in-first-out (FIFO) queue using only two stacks (Python lists). The implemented queue should support the following operations: enqueue, dequeue, peek, and is_empty.

Implement the Queue class:
- Queue() initializes the queue object.
- enqueue(val) pushes element val to the back of the queue.
- dequeue() removes the element from the front of the queue and returns it.
- peek() returns the element at the front of the queue without removing it.
- is_empty() returns True if the queue is empty, False otherwise.

Example 1:
Input: enqueue(1), enqueue(2), dequeue(), dequeue()
Output: 1, 2
Explanation: Elements are dequeued in FIFO order.

Example 2:
Input: enqueue(5), enqueue(10), peek(), dequeue(), peek()
Output: 5, 5, 10
Explanation: peek() returns front without removing; after dequeue(), front becomes 10.

Example 3:
Input: is_empty(), enqueue(1), is_empty(), dequeue(), is_empty()
Output: True, False, True
Explanation: Queue starts empty, becomes non-empty after enqueue, empty again after dequeue.

Constraints:
- 1 <= val <= 9
- At most 100 calls to enqueue, dequeue, peek, and is_empty
- All calls to dequeue and peek are valid (queue is non-empty)

Ref: LeetCode #232 Implement Queue using Stacks`,
    code: `class Queue:
    def __init__(self):
        raise NotImplementedError

    def enqueue(self, val):
        raise NotImplementedError

    def dequeue(self):
        raise NotImplementedError

    def peek(self):
        raise NotImplementedError

    def is_empty(self):
        raise NotImplementedError`,
    testCode: `def test_enqueue_dequeue():
    q = Queue()
    q.enqueue(1)
    q.enqueue(2)
    assert q.dequeue() == 1
    assert q.dequeue() == 2


def test_fifo_order():
    q = Queue()
    q.enqueue(10)
    q.enqueue(20)
    q.enqueue(30)
    assert q.dequeue() == 10
    assert q.dequeue() == 20
    assert q.dequeue() == 30


def test_peek():
    q = Queue()
    q.enqueue(5)
    q.enqueue(10)
    assert q.peek() == 5
    q.dequeue()
    assert q.peek() == 10


def test_is_empty():
    q = Queue()
    assert q.is_empty() is True
    q.enqueue(1)
    assert q.is_empty() is False
    q.dequeue()
    assert q.is_empty() is True


def test_interleaved():
    q = Queue()
    q.enqueue(1)
    q.enqueue(2)
    assert q.dequeue() == 1
    q.enqueue(3)
    assert q.dequeue() == 2
    assert q.dequeue() == 3`,
    solution: `class Queue:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def enqueue(self, val):
        self.in_stack.append(val)

    def _transfer(self):
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())

    def dequeue(self):
        self._transfer()
        return self.out_stack.pop()

    def peek(self):
        self._transfer()
        return self.out_stack[-1]

    def is_empty(self):
        return not self.in_stack and not self.out_stack`,
    usage: null,
    tags: ["stack", "queue"],
  },
  {
    name: "Monotonic Stack",
    category: "stack",
    language: "python",
    difficulty: "medium",
    description: `Next Greater Element

Given an array of integers nums, for each element find the next greater element to its right. The next greater element of a number x is the first number to the right that is greater than x. If no such element exists, use -1.

Return an array answer where answer[i] is the next greater element for nums[i].

Example 1:
Input: nums = [2,1,2,4,3]
Output: [4,2,4,-1,-1]
Explanation: For 2, next greater is 4. For 1, next greater is 2. For the second 2, next greater is 4. For 4 and 3, no greater element exists to the right.

Example 2:
Input: nums = [5,4,3,2,1]
Output: [-1,-1,-1,-1,-1]
Explanation: Array is strictly decreasing, so no element has a next greater element.

Example 3:
Input: nums = [1,2,3,4,5]
Output: [2,3,4,5,-1]
Explanation: Each element's next greater is the element immediately to its right, except for 5.

Constraints:
- 1 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9

Ref: LeetCode #496 Next Greater Element I`,
    code: `def next_greater_element(nums):
    raise NotImplementedError`,
    testCode: `def test_basic():
    assert next_greater_element([2, 1, 2, 4, 3]) == [4, 2, 4, -1, -1]


def test_descending():
    assert next_greater_element([5, 4, 3, 2, 1]) == [-1, -1, -1, -1, -1]


def test_ascending():
    assert next_greater_element([1, 2, 3, 4, 5]) == [2, 3, 4, 5, -1]


def test_single():
    assert next_greater_element([1]) == [-1]


def test_duplicates():
    assert next_greater_element([1, 1, 1, 2]) == [2, 2, 2, -1]`,
    solution: `def next_greater_element(nums):
    result = [-1] * len(nums)
    stack = []
    for i in range(len(nums)):
        while stack and nums[i] > nums[stack[-1]]:
            result[stack.pop()] = nums[i]
        stack.append(i)
    return result`,
    usage: null,
    tags: ["stack", "monotonic"],
  },
  {
    name: "Binary Tree BFS",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Binary Tree BFS

Given the root of a binary tree, return its node values in breadth-first (level-order) traversal order. Visit nodes level by level, from left to right.

If the tree is empty (root is None), return an empty list.

Example 1:
Input: root = [1, 2, 3, 4, 5]
        1
       / \\
      2   3
     / \\
    4   5
Output: [1, 2, 3, 4, 5]

Example 2:
Input: root = [1]
Output: [1]

Example 3:
Input: root = []
Output: []

Constraints:
- The number of nodes in the tree is in the range [0, 1000].
- -1000 <= Node.val <= 1000

Ref: LeetCode #102 Binary Tree Level Order Traversal`,
    code: `from collections import deque

class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def bfs(root):
    raise NotImplementedError`,
    testCode: `def test_bfs_single_node():
    a = Node(1)
    assert bfs(a) == [1]


def test_bfs_complete_tree():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    d = Node(4)
    e = Node(5)
    a.left = b
    a.right = c
    b.left = d
    b.right = e
    assert bfs(a) == [1, 2, 3, 4, 5]


def test_bfs_left_skewed():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    a.left = b
    b.left = c
    assert bfs(a) == [1, 2, 3]


def test_bfs_empty():
    assert bfs(None) == []`,
    solution: `from collections import deque


class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def bfs(root):
    if root is None:
        return []

    queue = deque([root])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node.val)

        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)

    return result`,
    usage: null,
    tags: ["bfs", "tree", "blind75"],
  },
  {
    name: "Binary Tree Preorder (Recursive)",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Binary Tree Preorder Traversal (Recursive)

Given the root of a binary tree, return a list of its node values in preorder traversal order: visit the root first, then recursively traverse the left subtree, then the right subtree.

If the tree is empty (root is None), return an empty list.

Example 1:
Input: root = [1, 2, 3, 4, 5]
        1
       / \\
      2   3
     / \\
    4   5
Output: [1, 2, 4, 5, 3]
Explanation: Root(1) -> Left(2) -> Left(4) -> Right(5) -> Right(3)

Example 2:
Input: root = [42]
Output: [42]

Example 3:
Input: root = []
Output: []

Constraints:
- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100

Ref: LeetCode #144 Binary Tree Preorder Traversal`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def preorder(root):
    raise NotImplementedError`,
    testCode: `def _build_tree():
    #       1
    #      / \\
    #     2   3
    #    / \\
    #   4   5
    a = Node(1)
    b = Node(2)
    c = Node(3)
    d = Node(4)
    e = Node(5)
    a.left = b
    a.right = c
    b.left = d
    b.right = e
    return a


def test_preorder():
    assert preorder(_build_tree()) == [1, 2, 4, 5, 3]


def test_preorder_empty():
    assert preorder(None) == []


def test_preorder_single():
    n = Node(42)
    assert preorder(n) == [42]`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def preorder(root):
    if root is None:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)`,
    usage: null,
    tags: ["dfs", "tree", "recursion"],
  },
  {
    name: "Binary Tree Inorder (Recursive)",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Binary Tree Inorder Traversal (Recursive)

Given the root of a binary tree, return a list of its node values in inorder traversal order: recursively traverse the left subtree, visit the root, then recursively traverse the right subtree.

If the tree is empty (root is None), return an empty list.

Example 1:
Input: root = [1, 2, 3, 4, 5]
        1
       / \\
      2   3
     / \\
    4   5
Output: [4, 2, 5, 1, 3]
Explanation: Left(4) -> Root(2) -> Right(5) -> Root(1) -> Right(3)

Example 2:
Input: root = [42]
Output: [42]

Example 3:
Input: root = []
Output: []

Constraints:
- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100

Ref: LeetCode #94 Binary Tree Inorder Traversal`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def inorder(root):
    raise NotImplementedError`,
    testCode: `def _build_tree():
    #       1
    #      / \\
    #     2   3
    #    / \\
    #   4   5
    a = Node(1)
    b = Node(2)
    c = Node(3)
    d = Node(4)
    e = Node(5)
    a.left = b
    a.right = c
    b.left = d
    b.right = e
    return a


def test_inorder():
    assert inorder(_build_tree()) == [4, 2, 5, 1, 3]


def test_inorder_empty():
    assert inorder(None) == []


def test_inorder_single():
    n = Node(42)
    assert inorder(n) == [42]`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def inorder(root):
    if root is None:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)`,
    usage: null,
    tags: ["dfs", "tree", "recursion"],
  },
  {
    name: "Binary Tree Postorder (Recursive)",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Binary Tree Postorder Traversal (Recursive)

Given the root of a binary tree, return a list of its node values in postorder traversal order: recursively traverse the left subtree, then the right subtree, then visit the root.

If the tree is empty (root is None), return an empty list.

Example 1:
Input: root = [1, 2, 3, 4, 5]
        1
       / \\
      2   3
     / \\
    4   5
Output: [4, 5, 2, 3, 1]
Explanation: Left(4) -> Right(5) -> Root(2) -> Right(3) -> Root(1)

Example 2:
Input: root = [42]
Output: [42]

Example 3:
Input: root = []
Output: []

Constraints:
- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100

Ref: LeetCode #145 Binary Tree Postorder Traversal`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def postorder(root):
    raise NotImplementedError`,
    testCode: `def _build_tree():
    #       1
    #      / \\
    #     2   3
    #    / \\
    #   4   5
    a = Node(1)
    b = Node(2)
    c = Node(3)
    d = Node(4)
    e = Node(5)
    a.left = b
    a.right = c
    b.left = d
    b.right = e
    return a


def test_postorder():
    assert postorder(_build_tree()) == [4, 5, 2, 3, 1]


def test_postorder_empty():
    assert postorder(None) == []


def test_postorder_single():
    n = Node(42)
    assert postorder(n) == [42]`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def postorder(root):
    if root is None:
        return []
    return postorder(root.left) + postorder(root.right) + [root.val]`,
    usage: null,
    tags: ["dfs", "tree", "recursion"],
  },
  {
    name: "Binary Tree Preorder (Iterative)",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Binary Tree Preorder Traversal (Iterative)

Given the root of a binary tree, return a list of its node values in preorder traversal order (root, left, right). You must use an iterative approach with an explicit stack instead of recursion.

If the tree is empty (root is None), return an empty list.

Example 1:
Input: root = [1, 2, 3, 4, 5]
        1
       / \\
      2   3
     / \\
    4   5
Output: [1, 2, 4, 5, 3]

Example 2:
Input: root = [42]
Output: [42]

Example 3:
Input: root = []
Output: []

Constraints:
- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100
- Must use iterative approach (no recursion).

Ref: LeetCode #144 Binary Tree Preorder Traversal`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def preorder(root):
    raise NotImplementedError`,
    testCode: `def _build_tree():
    #       1
    #      / \\
    #     2   3
    #    / \\
    #   4   5
    a = Node(1)
    b = Node(2)
    c = Node(3)
    d = Node(4)
    e = Node(5)
    a.left = b
    a.right = c
    b.left = d
    b.right = e
    return a


def test_preorder():
    assert preorder(_build_tree()) == [1, 2, 4, 5, 3]


def test_preorder_empty():
    assert preorder(None) == []


def test_preorder_single():
    n = Node(42)
    assert preorder(n) == [42]`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def preorder(root):
    if root is None:
        return []
    stack = [root]
    result = []
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    return result`,
    usage: null,
    tags: ["dfs", "tree"],
  },
  {
    name: "Binary Tree Inorder (Iterative)",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Binary Tree Inorder Traversal (Iterative)

Given the root of a binary tree, return a list of its node values in inorder traversal order (left, root, right). You must use an iterative approach with an explicit stack instead of recursion.

If the tree is empty (root is None), return an empty list.

Example 1:
Input: root = [1, 2, 3, 4, 5]
        1
       / \\
      2   3
     / \\
    4   5
Output: [4, 2, 5, 1, 3]

Example 2:
Input: root = [42]
Output: [42]

Example 3:
Input: root = []
Output: []

Constraints:
- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100
- Must use iterative approach (no recursion).

Ref: LeetCode #94 Binary Tree Inorder Traversal`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def inorder(root):
    raise NotImplementedError`,
    testCode: `def _build_tree():
    #       1
    #      / \\
    #     2   3
    #    / \\
    #   4   5
    a = Node(1)
    b = Node(2)
    c = Node(3)
    d = Node(4)
    e = Node(5)
    a.left = b
    a.right = c
    b.left = d
    b.right = e
    return a


def test_inorder():
    assert inorder(_build_tree()) == [4, 2, 5, 1, 3]


def test_inorder_empty():
    assert inorder(None) == []


def test_inorder_single():
    n = Node(42)
    assert inorder(n) == [42]`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def inorder(root):
    result = []
    stack = []
    current = root
    while current or stack:
        while current:
            stack.append(current)
            current = current.left
        current = stack.pop()
        result.append(current.val)
        current = current.right
    return result`,
    usage: null,
    tags: ["dfs", "tree"],
  },
  {
    name: "Binary Tree Postorder (Iterative)",
    category: "trees",
    language: "python",
    difficulty: "hard",
    description: `Binary Tree Postorder Traversal (Iterative)

Given the root of a binary tree, return a list of its node values in postorder traversal order (left, right, root). You must use an iterative approach with an explicit stack instead of recursion.

If the tree is empty (root is None), return an empty list.

Example 1:
Input: root = [1, 2, 3, 4, 5]
        1
       / \\
      2   3
     / \\
    4   5
Output: [4, 5, 2, 3, 1]

Example 2:
Input: root = [42]
Output: [42]

Example 3:
Input: root = []
Output: []

Constraints:
- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100
- Must use iterative approach (no recursion).

Ref: LeetCode #145 Binary Tree Postorder Traversal`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def postorder(root):
    raise NotImplementedError`,
    testCode: `def _build_tree():
    #       1
    #      / \\
    #     2   3
    #    / \\
    #   4   5
    a = Node(1)
    b = Node(2)
    c = Node(3)
    d = Node(4)
    e = Node(5)
    a.left = b
    a.right = c
    b.left = d
    b.right = e
    return a


def test_postorder():
    assert postorder(_build_tree()) == [4, 5, 2, 3, 1]


def test_postorder_empty():
    assert postorder(None) == []


def test_postorder_single():
    n = Node(42)
    assert postorder(n) == [42]`,
    solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def postorder(root):
    if root is None:
        return []
    stack = [root]
    result = []
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.left:
            stack.append(node.left)
        if node.right:
            stack.append(node.right)
    return result[::-1]`,
    usage: null,
    tags: ["dfs", "tree"],
  },
  {
    name: "Trie",
    category: "tries",
    language: "python",
    difficulty: "hard",
    description: `Implement Trie (Prefix Tree)

A trie (pronounced "try") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class with the following methods:

- Trie() initializes the trie object.
- insert(word) inserts the string word into the trie.
- search(word) returns True if the string word is in the trie (i.e., was inserted before), and False otherwise.
- starts_with(prefix) returns True if there is a previously inserted string word that has the prefix prefix, and False otherwise.

Example 1:
Input:
  t = Trie()
  t.insert("apple")
  t.search("apple")   -> True
  t.search("app")     -> False
  t.starts_with("app") -> True
  t.insert("app")
  t.search("app")     -> True

Example 2:
Input:
  t = Trie()
  t.search("anything") -> False
  t.starts_with("any") -> False

Constraints:
- 1 <= len(word), len(prefix) <= 2000
- word and prefix consist only of lowercase English letters.
- At most 3 * 10^4 calls in total will be made to insert, search, and starts_with.

Ref: LeetCode #208 Implement Trie (Prefix Tree)`,
    code: `class Trie:
    def __init__(self):
        raise NotImplementedError

    def insert(self, word):
        raise NotImplementedError

    def search(self, word):
        raise NotImplementedError

    def starts_with(self, prefix):
        raise NotImplementedError`,
    testCode: `def test_insert_search():
    t = Trie()
    t.insert("apple")
    assert t.search("apple") is True


def test_search_missing():
    t = Trie()
    t.insert("apple")
    assert t.search("app") is False


def test_starts_with():
    t = Trie()
    t.insert("apple")
    assert t.starts_with("app") is True


def test_starts_with_missing():
    t = Trie()
    t.insert("apple")
    assert t.starts_with("ban") is False


def test_multiple_words():
    t = Trie()
    t.insert("apple")
    t.insert("app")
    assert t.search("app") is True
    assert t.search("apple") is True


def test_empty_search():
    t = Trie()
    assert t.search("anything") is False`,
    solution: `class Trie:
    def __init__(self):
        self.children = {}
        self.is_end = False

    def insert(self, word):
        node = self
        for ch in word:
            if ch not in node.children:
                node.children[ch] = Trie()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        node = self._find(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        return self._find(prefix) is not None

    def _find(self, prefix):
        node = self
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node`,
    usage: null,
    tags: ["trie", "blind75"],
  },
  {
    name: "Two Pointer Remove Duplicates",
    category: "two-pointers",
    language: "python",
    difficulty: "easy",
    description: `Remove Duplicates from Sorted Array

Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Return k, the number of unique elements.

After calling your function, the first k elements of nums should hold the unique values in their original order. It does not matter what you leave beyond position k.

Example 1:
Input: nums = [1, 1, 2, 3, 3]
Output: 3, nums = [1, 2, 3, ...]
Explanation: Your function should return k = 3, with the first three elements being 1, 2, and 3.

Example 2:
Input: nums = [5, 5, 5, 5]
Output: 1, nums = [5, ...]

Example 3:
Input: nums = [1, 2, 3]
Output: 3, nums = [1, 2, 3]

Constraints:
- 0 <= nums.length <= 3 * 10^4
- -100 <= nums[i] <= 100
- nums is sorted in non-decreasing order.

Ref: LeetCode #26 Remove Duplicates from Sorted Array`,
    code: `def remove_duplicates(nums):
    raise NotImplementedError`,
    testCode: `def test_basic():
    nums = [1, 1, 2, 3, 3]
    k = remove_duplicates(nums)
    assert k == 3
    assert nums[:k] == [1, 2, 3]


def test_no_dupes():
    nums = [1, 2, 3]
    k = remove_duplicates(nums)
    assert k == 3
    assert nums[:k] == [1, 2, 3]


def test_all_same():
    nums = [5, 5, 5, 5]
    k = remove_duplicates(nums)
    assert k == 1
    assert nums[:k] == [5]


def test_empty():
    nums = []
    k = remove_duplicates(nums)
    assert k == 0


def test_single():
    nums = [7]
    k = remove_duplicates(nums)
    assert k == 1
    assert nums[:k] == [7]`,
    solution: `def remove_duplicates(nums):
    if not nums:
        return 0

    write = 0

    for read in range(1, len(nums)):
        if nums[read] != nums[write]:
            write += 1
            nums[write] = nums[read]

    return write + 1`,
    usage: null,
    tags: ["two-pointers", "in-place"],
  },
  {
    name: "Merge Two Sorted Arrays",
    category: "two-pointers",
    language: "python",
    difficulty: "easy",
    description: `Merge Two Sorted Arrays

You are given two integer arrays a and b, both sorted in non-decreasing order. Merge them into a single sorted array and return it. You may not use any built-in sort function.

Example 1:
Input: a = [1, 3, 5], b = [2, 4, 6]
Output: [1, 2, 3, 4, 5, 6]

Example 2:
Input: a = [1, 2], b = [3, 4, 5, 6]
Output: [1, 2, 3, 4, 5, 6]

Example 3:
Input: a = [], b = [1, 2, 3]
Output: [1, 2, 3]

Constraints:
- 0 <= a.length, b.length <= 1000
- -10^6 <= a[i], b[j] <= 10^6
- Both a and b are sorted in non-decreasing order.
- Do not use built-in sort.

Ref: LeetCode #88 Merge Sorted Array`,
    code: `def merge_sorted(a, b):
    raise NotImplementedError`,
    testCode: `def test_basic():
    assert merge_sorted([1, 3, 5], [2, 4, 6]) == [1, 2, 3, 4, 5, 6]


def test_different_lengths():
    assert merge_sorted([1, 2], [3, 4, 5, 6]) == [1, 2, 3, 4, 5, 6]


def test_one_empty():
    assert merge_sorted([], [1, 2, 3]) == [1, 2, 3]
    assert merge_sorted([1, 2, 3], []) == [1, 2, 3]


def test_both_empty():
    assert merge_sorted([], []) == []


def test_duplicates():
    assert merge_sorted([1, 3, 3], [2, 3, 4]) == [1, 2, 3, 3, 3, 4]


def test_negatives():
    assert merge_sorted([-5, -1, 3], [-3, 0, 2]) == [-5, -3, -1, 0, 2, 3]`,
    solution: `def merge_sorted(a, b):
    result = []
    i, j = 0, 0

    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1

    result.extend(a[i:])
    result.extend(b[j:])
    return result`,
    usage: null,
    tags: ["two-pointers", "sorting"],
  },
];
