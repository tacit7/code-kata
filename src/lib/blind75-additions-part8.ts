import type { SeedKata } from "../types/editor";

const blind75Part8: SeedKata[] = [
  {
    name: "Top K Frequent Elements",
    category: "heap",
    language: "ruby",
    difficulty: "medium",
    description: `Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.\n\nExample:\nInput: nums=[1,1,1,2,2,3], k=2\nOutput: [1,2]\n\nConstraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n- k is in range [1, number of unique elements]\n- Guaranteed answer is unique`,
    code: `def top_k_frequent(nums, k)
  raise NotImplementedError
end`,
    testCode: `def test_top_k_frequent_basic
  result = top_k_frequent([1, 1, 1, 2, 2, 3], 2)
  assert_equal([1, 2], result.sort)
end

def test_top_k_frequent_single
  result = top_k_frequent([1], 1)
  assert_equal([1], result.sort)
end

def test_top_k_frequent_all
  result = top_k_frequent([1, 2], 2)
  assert_equal([1, 2], result.sort)
end

def test_top_k_frequent_negatives
  result = top_k_frequent([4, 1, -1, 2, -1, 2, 3], 2)
  assert_equal([-1, 2], result.sort)
end`,
    solution: `# Classic: counting sort by frequency (O(n), the expected interview answer)
def top_k_frequent(nums, k)
  counts = Hash.new(0)
  nums.each { |n| counts[n] += 1 }

  buckets = Array.new(nums.length + 1) { [] }
  counts.each { |num, freq| buckets[freq] << num }

  result = []
  (buckets.length - 1).downto(0) do |freq|
    buckets[freq].each do |num|
      result << num
      return result if result.length == k
    end
  end
  result
end

# Idiomatic Ruby (O(n log n), shorter but hides the algorithm):
# def top_k_frequent(nums, k)
#   count = nums.tally
#   count.keys.sort_by { |x| -count[x] }.first(k)
# end`,
    usage: null,
    tags: ["heap", "hash-map", "blind75", "neetcode", "arrays-hashing"],
  },
  {
    name: "Find Median from Data Stream",
    category: "heap",
    language: "ruby",
    difficulty: "hard",
    description: `Design a data structure that supports adding integers and finding the median.\n\nThe median is the middle value in an ordered list. For even length, it is the mean of the two middle values.\n\nExample:\nMedianFinder mf = MedianFinder()\nmf.add_num(1)\nmf.add_num(2)\nmf.find_median() -> 1.5\nmf.add_num(3)\nmf.find_median() -> 2.0\n\nConstraints:\n- -10^5 <= num <= 10^5\n- At most 5 * 10^4 calls to add_num and find_median\n- find_median called at least once`,
    code: `class MedianFinder
  def initialize
    raise NotImplementedError
  end

  def add_num(num)
    raise NotImplementedError
  end

  def find_median
    raise NotImplementedError
  end
end`,
    testCode: `def test_median_three_elements
  mf = MedianFinder.new
  mf.add_num(1)
  mf.add_num(2)
  mf.add_num(3)
  assert_equal(2.0, mf.find_median)
end

def test_median_two_elements
  mf = MedianFinder.new
  mf.add_num(1)
  mf.add_num(2)
  assert_equal(1.5, mf.find_median)
end

def test_median_single_element
  mf = MedianFinder.new
  mf.add_num(5)
  assert_equal(5.0, mf.find_median)
end

def test_median_four_elements
  mf = MedianFinder.new
  mf.add_num(6)
  mf.add_num(3)
  mf.add_num(1)
  mf.add_num(2)
  assert_equal(2.5, mf.find_median)
end`,
    solution: `class MedianFinder
  def initialize
    @small = []  # max-heap (kept sorted descending), stores lower half
    @large = []  # min-heap (kept sorted ascending), stores upper half
  end

  def add_num(num)
    @small.push(num)
    @small.sort! { |a, b| b <=> a }
    # Ensure max of small <= min of large
    if !@small.empty? && !@large.empty? && @small[0] > @large[0]
      @large.push(@small.shift)
      @large.sort!
    end
    # Balance sizes: small can have at most 1 more than large
    if @small.length > @large.length + 1
      @large.push(@small.shift)
      @large.sort!
    elsif @large.length > @small.length
      @small.push(@large.shift)
      @small.sort! { |a, b| b <=> a }
    end
  end

  def find_median
    if @small.length > @large.length
      return @small[0].to_f
    end
    (@small[0] + @large[0]) / 2.0
  end
end`,
    usage: null,
    tags: ["heap", "two-heaps", "blind75"],
  },
];

export { blind75Part8 };
