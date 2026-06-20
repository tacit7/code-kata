import type { SeedKata } from "../types/editor";

const blind75Part8: SeedKata[] = [
  {
    name: "Top K Frequent Elements",
    category: "heap",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.\n\nExample:\nInput: nums=[1,1,1,2,2,3], k=2\nOutput: [1,2]\n\nConstraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n- k is in range [1, number of unique elements]\n- Guaranteed answer is unique`,
    code: `import heapq

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_top_k_frequent_basic():
    result = top_k_frequent([1, 1, 1, 2, 2, 3], 2)
    assert sorted(result) == [1, 2]

def test_top_k_frequent_single():
    result = top_k_frequent([1], 1)
    assert sorted(result) == [1]

def test_top_k_frequent_all():
    result = top_k_frequent([1, 2], 2)
    assert sorted(result) == [1, 2]

def test_top_k_frequent_negatives():
    result = top_k_frequent([4, 1, -1, 2, -1, 2, 3], 2)
    assert sorted(result) == [-1, 2]`,
    solution: `import heapq
from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=lambda x: count[x])`,
    usage: null,
    tags: ["heap", "hash-map", "blind75"],
  },
  {
    name: "Find Median from Data Stream",
    category: "heap",
    language: "python",
    difficulty: "hard",
    description: `Design a data structure that supports adding integers and finding the median.\n\nThe median is the middle value in an ordered list. For even length, it is the mean of the two middle values.\n\nExample:\nMedianFinder mf = MedianFinder()\nmf.add_num(1)\nmf.add_num(2)\nmf.find_median() -> 1.5\nmf.add_num(3)\nmf.find_median() -> 2.0\n\nConstraints:\n- -10^5 <= num <= 10^5\n- At most 5 * 10^4 calls to add_num and find_median\n- find_median called at least once`,
    code: `import heapq

class MedianFinder:
    def __init__(self):
        raise NotImplementedError

    def add_num(self, num: int) -> None:
        raise NotImplementedError

    def find_median(self) -> float:
        raise NotImplementedError`,
    testCode: `def test_median_three_elements():
    mf = MedianFinder()
    mf.add_num(1)
    mf.add_num(2)
    mf.add_num(3)
    assert mf.find_median() == 2.0

def test_median_two_elements():
    mf = MedianFinder()
    mf.add_num(1)
    mf.add_num(2)
    assert mf.find_median() == 1.5

def test_median_single_element():
    mf = MedianFinder()
    mf.add_num(5)
    assert mf.find_median() == 5.0

def test_median_four_elements():
    mf = MedianFinder()
    mf.add_num(6)
    mf.add_num(3)
    mf.add_num(1)
    mf.add_num(2)
    assert mf.find_median() == 2.5`,
    solution: `import heapq

class MedianFinder:
    def __init__(self):
        self.small = []  # max-heap (negated), stores lower half
        self.large = []  # min-heap, stores upper half

    def add_num(self, num: int) -> None:
        heapq.heappush(self.small, -num)
        # Ensure max of small <= min of large
        if self.small and self.large and (-self.small[0]) > self.large[0]:
            heapq.heappush(self.large, -heapq.heappop(self.small))
        # Balance sizes: small can have at most 1 more than large
        if len(self.small) > len(self.large) + 1:
            heapq.heappush(self.large, -heapq.heappop(self.small))
        elif len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def find_median(self) -> float:
        if len(self.small) > len(self.large):
            return float(-self.small[0])
        return (-self.small[0] + self.large[0]) / 2.0`,
    usage: null,
    tags: ["heap", "two-heaps", "blind75"],
  },
];

export { blind75Part8 };
