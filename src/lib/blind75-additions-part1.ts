import type { SeedKata } from "../types/editor";

const blind75Part1: SeedKata[] = [
  {
    name: "Best Time to Buy and Sell Stock",
    category: "arrays",
    language: "python",
    difficulty: "easy",
    description: `Given an array prices where prices[i] is the price of a stock on day i, find the maximum profit from one buy and one sell. Return 0 if no profit possible.

Example:
Input: prices = [7,1,5,3,6,4]
Output: 5

Constraints:
- 1 <= prices.length <= 10^5
- 0 <= prices[i] <= 10^4`,
    code: `def max_profit(prices: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_basic_case():
    assert max_profit([7, 1, 5, 3, 6, 4]) == 5

def test_descending_prices():
    assert max_profit([7, 6, 4, 3, 1]) == 0

def test_single_price():
    assert max_profit([1]) == 0

def test_two_prices():
    assert max_profit([1, 2]) == 1`,
    solution: `def max_profit(prices: list[int]) -> int:
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit`,
    usage: null,
    tags: ["array", "sliding-window", "blind75"],
  },
  {
    name: "Contains Duplicate",
    category: "arrays",
    language: "python",
    difficulty: "easy",
    description: `Given an integer array nums, return true if any value appears at least twice.

Example:
Input: nums = [1,2,3,1]
Output: True

Constraints:
- 1 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9`,
    code: `def contains_duplicate(nums: list[int]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_has_duplicate():
    assert contains_duplicate([1, 2, 3, 1]) == True

def test_no_duplicate():
    assert contains_duplicate([1, 2, 3, 4]) == False

def test_all_same():
    assert contains_duplicate([1, 1, 1, 1]) == True

def test_single_element():
    assert contains_duplicate([1]) == False`,
    solution: `def contains_duplicate(nums: list[int]) -> bool:
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False`,
    usage: null,
    tags: ["array", "hash-map", "blind75"],
  },
  {
    name: "Product of Array Except Self",
    category: "arrays",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all elements except nums[i]. No division allowed. O(n) time.

Example:
Input: nums = [1,2,3,4]
Output: [24,12,8,6]

Constraints:
- 2 <= nums.length <= 10^5
- -30 <= nums[i] <= 30`,
    code: `def product_except_self(nums: list[int]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_basic_case():
    assert product_except_self([1, 2, 3, 4]) == [24, 12, 8, 6]

def test_with_negatives_and_zero():
    assert product_except_self([-1, 1, 0, -3, 3]) == [0, 0, 9, 0, 0]

def test_two_elements():
    assert product_except_self([2, 3]) == [3, 2]

def test_with_zeros():
    assert product_except_self([0, 0]) == [0, 0]`,
    solution: `def product_except_self(nums: list[int]) -> list[int]:
    n = len(nums)
    result = [1] * n

    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]

    suffix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= suffix
        suffix *= nums[i]

    return result`,
    usage: null,
    tags: ["array", "prefix-sum", "blind75"],
  },
  {
    name: "Maximum Product Subarray",
    category: "arrays",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums, find the subarray with the largest product and return the product.

Example:
Input: nums = [2,3,-2,4]
Output: 6

Constraints:
- 1 <= nums.length <= 2 * 10^4
- -10 <= nums[i] <= 10`,
    code: `def max_product(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_basic_case():
    assert max_product([2, 3, -2, 4]) == 6

def test_with_zero():
    assert max_product([-2, 0, -1]) == 0

def test_all_negative():
    assert max_product([-2, -3, -4]) == 12

def test_single_element():
    assert max_product([-1]) == -1`,
    solution: `def max_product(nums: list[int]) -> int:
    result = max(nums)
    cur_min, cur_max = 1, 1

    for n in nums:
        if n == 0:
            cur_min, cur_max = 1, 1
            continue
        tmp = cur_max * n
        cur_max = max(n * cur_max, n * cur_min, n)
        cur_min = min(tmp, n * cur_min, n)
        result = max(result, cur_max)

    return result`,
    usage: null,
    tags: ["array", "dynamic-programming", "blind75", "neetcode", "1d-dp"],
  },
  {
    name: "Find Minimum in Rotated Sorted Array",
    category: "arrays",
    language: "python",
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
    code: `def find_min(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_basic_rotation():
    assert find_min([3, 4, 5, 1, 2]) == 1

def test_larger_rotation():
    assert find_min([4, 5, 6, 7, 0, 1, 2]) == 0

def test_single_element():
    assert find_min([1]) == 1

def test_two_elements():
    assert find_min([2, 1]) == 1`,
    solution: `def find_min(nums: list[int]) -> int:
    left, right = 0, len(nums) - 1

    while left < right:
        mid = (left + right) // 2
        if nums[mid] > nums[right]:
            left = mid + 1
        else:
            right = mid

    return nums[left]`,
    usage: null,
    tags: ["array", "binary-search", "blind75"],
  },
  {
    name: "Search in Rotated Sorted Array",
    category: "arrays",
    language: "python",
    difficulty: "medium",
    description: `Search target in a rotated sorted array. Return index or -1. O(log n).

Example:
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4

Constraints:
- 1 <= nums.length <= 5000
- All values unique
- -10^4 <= nums[i], target <= 10^4`,
    code: `def search(nums: list[int], target: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_target_in_right_half():
    assert search([4, 5, 6, 7, 0, 1, 2], 0) == 4

def test_target_not_found():
    assert search([4, 5, 6, 7, 0, 1, 2], 3) == -1

def test_target_in_left_half():
    assert search([4, 5, 6, 7, 0, 1, 2], 6) == 2

def test_single_element_match():
    assert search([1], 1) == 0`,
    solution: `def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid

        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1

    return -1`,
    usage: null,
    tags: ["array", "binary-search", "blind75"],
  },
  {
    name: "3Sum",
    category: "arrays",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums, return all unique triplets that sum to zero.

Example:
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]

Constraints:
- 3 <= nums.length <= 3000
- -10^5 <= nums[i] <= 10^5`,
    code: `def three_sum(nums: list[int]) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_basic_case():
    result = three_sum([-1, 0, 1, 2, -1, -4])
    assert sorted(result) == sorted([[-1, -1, 2], [-1, 0, 1]])

def test_no_triplets():
    assert three_sum([0, 1, 1]) == []

def test_all_zeros():
    assert three_sum([0, 0, 0]) == [[0, 0, 0]]

def test_no_valid_combination():
    assert three_sum([1, 2, 3]) == []`,
    solution: `def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    result = []

    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1

    return result`,
    usage: null,
    tags: ["array", "two-pointers", "blind75"],
  },
  {
    name: "Container With Most Water",
    category: "arrays",
    language: "python",
    difficulty: "medium",
    description: `Given n vertical lines at positions 0..n-1 with heights height[i], find the two lines that form a container holding the most water.

Example:
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49

Constraints:
- n == height.length
- 2 <= n <= 10^5
- 0 <= height[i] <= 10^4`,
    code: `def max_area(height: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_basic_case():
    assert max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49

def test_two_elements():
    assert max_area([1, 1]) == 1

def test_ascending():
    assert max_area([1, 2, 3, 4, 5]) == 6

def test_descending():
    assert max_area([5, 4, 3, 2, 1]) == 6`,
    solution: `def max_area(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    max_water = 0

    while left < right:
        water = min(height[left], height[right]) * (right - left)
        max_water = max(max_water, water)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1

    return max_water`,
    usage: null,
    tags: ["array", "two-pointers", "blind75"],
  },
  {
    name: "Sum of Two Integers",
    category: "binary",
    language: "python",
    difficulty: "medium",
    description: `Calculate the sum of two integers without using + or - operators.

Example:
Input: a = 1, b = 2
Output: 3

Constraints:
- -1000 <= a, b <= 1000`,
    code: `def get_sum(a: int, b: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_basic_addition():
    assert get_sum(1, 2) == 3

def test_another_addition():
    assert get_sum(2, 3) == 5

def test_cancel_out():
    assert get_sum(-1, 1) == 0

def test_both_negative():
    assert get_sum(-5, -3) == -8`,
    solution: `def get_sum(a: int, b: int) -> int:
    mask = 0xFFFFFFFF
    while b & mask:
        carry = (a & b) << 1
        a = a ^ b
        b = carry
    if b:
        return a & mask
    return a`,
    usage: null,
    tags: ["bit-manipulation", "blind75"],
  },
  {
    name: "Counting Bits",
    category: "binary",
    language: "python",
    difficulty: "easy",
    description: `Given an integer n, return an array ans of length n+1 such that ans[i] is the number of 1 bits in the binary representation of i.

Example:
Input: n = 5
Output: [0,1,1,2,1,2]

Constraints:
- 0 <= n <= 10^5`,
    code: `def count_bits(n: int) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_small_n():
    assert count_bits(2) == [0, 1, 1]

def test_larger_n():
    assert count_bits(5) == [0, 1, 1, 2, 1, 2]

def test_zero():
    assert count_bits(0) == [0]

def test_one():
    assert count_bits(1) == [0, 1]`,
    solution: `def count_bits(n: int) -> list[int]:
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)
    return dp`,
    usage: null,
    tags: ["bit-manipulation", "dynamic-programming", "blind75"],
  },
  {
    name: "Missing Number",
    category: "binary",
    language: "python",
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
    code: `def missing_number(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_basic_case():
    assert missing_number([3, 0, 1]) == 2

def test_missing_last():
    assert missing_number([0, 1]) == 2

def test_missing_first():
    assert missing_number([1]) == 0

def test_longer_array():
    assert missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]) == 8`,
    solution: `def missing_number(nums: list[int]) -> int:
    n = len(nums)
    expected = n * (n + 1) // 2
    return expected - sum(nums)`,
    usage: null,
    tags: ["bit-manipulation", "math", "blind75"],
  },
  {
    name: "Reverse Bits",
    category: "binary",
    language: "python",
    difficulty: "easy",
    description: `Reverse bits of a given 32-bit unsigned integer.

Example:
Input: n = 43261596 (00000010100101000001111010011100)
Output: 964176192 (00111001011110000010100101000000)

Constraints:
- Input is a 32-bit unsigned integer`,
    code: `def reverse_bits(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_basic_case():
    assert reverse_bits(43261596) == 964176192

def test_zero():
    assert reverse_bits(0) == 0

def test_one():
    assert reverse_bits(1) == 2147483648

def test_max_uint32():
    assert reverse_bits(4294967295) == 4294967295`,
    solution: `def reverse_bits(n: int) -> int:
    result = 0
    for _ in range(32):
        result = (result << 1) | (n & 1)
        n >>= 1
    return result`,
    usage: null,
    tags: ["bit-manipulation", "blind75"],
  },
];

export { blind75Part1 };
