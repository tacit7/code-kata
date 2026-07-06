import type { SeedKata } from "../types/editor";

const neetcodeMathBit: SeedKata[] = [
  {
    name: "Reverse Integer",
    category: "binary",
    language: "ruby",
    difficulty: "medium",
    description: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], return 0.\n\nExample 1:\nInput: x = 123\nOutput: 321\n\nExample 2:\nInput: x = -123\nOutput: -321\n\nExample 3:\nInput: x = 120\nOutput: 21\n\nConstraints:\n- -2^31 <= x <= 2^31 - 1\n\nRef: LeetCode #7 Reverse Integer`,
    code: `def reverse(x)
  raise NotImplementedError
end`,
    testCode: `def test_reverse_positive
  assert_equal(321, reverse(123))
end

def test_reverse_negative
  assert_equal(-321, reverse(-123))
end

def test_reverse_trailing_zero
  assert_equal(21, reverse(120))
end

def test_reverse_zero
  assert_equal(0, reverse(0))
end

def test_reverse_overflow
  assert_equal(0, reverse(1534236469))
end`,
    solution: `def reverse(x)
  int_min = -(2**31)
  int_max = 2**31 - 1
  sign = x < 0 ? -1 : 1
  x = x.abs
  rev = x.to_s.reverse.to_i
  result = sign * rev
  return 0 if result < int_min || result > int_max
  result
end`,
    usage: null,
    tags: ["bit-manipulation", "math", "neetcode"],
  },
  {
    name: "Happy Number",
    category: "math",
    language: "ruby",
    difficulty: "easy",
    description: `Write an algorithm to determine if a number n is happy.\n\nA happy number is defined by the following process:\n- Starting with any positive integer, replace the number by the sum of the squares of its digits.\n- Repeat the process until the number equals 1 (it will stay there), or it loops endlessly in a cycle which does not include 1.\n- Numbers for which this process ends in 1 are happy.\n\nReturn True if n is a happy number, False otherwise.\n\nExample 1:\nInput: n = 19\nOutput: True  (1^2+9^2=82, 8^2+2^2=68, 6^2+8^2=100, 1^2+0^2+0^2=1)\n\nExample 2:\nInput: n = 2\nOutput: False\n\nConstraints:\n- 1 <= n <= 2^31 - 1\n\nRef: LeetCode #202 Happy Number`,
    code: `def is_happy(n)
  raise NotImplementedError
end`,
    testCode: `def test_happy_19
  assert_equal(true, is_happy(19))
end

def test_happy_2
  assert_equal(false, is_happy(2))
end

def test_happy_1
  assert_equal(true, is_happy(1))
end`,
    solution: `def is_happy(n)
  seen = {}
  while n != 1
    return false if seen[n]
    seen[n] = true
    n = n.to_s.chars.map { |d| d.to_i ** 2 }.sum
  end
  true
end`,
    usage: null,
    tags: ["math-geometry", "hash-map", "neetcode"],
  },
  {
    name: "Plus One",
    category: "math",
    language: "ruby",
    difficulty: "easy",
    description: `You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0s.\n\nIncrement the large integer by one and return the resulting array of digits.\n\nExample 1:\nInput: digits = [1,2,3]\nOutput: [1,2,4]\n\nExample 2:\nInput: digits = [4,3,2,1]\nOutput: [4,3,2,2]\n\nExample 3:\nInput: digits = [9]\nOutput: [1,0]\n\nConstraints:\n- 1 <= digits.length <= 100\n- 0 <= digits[i] <= 9\n- digits does not contain any leading 0 except for the zero itself.\n\nRef: LeetCode #66 Plus One`,
    code: `def plus_one(digits)
  raise NotImplementedError
end`,
    testCode: `def test_plus_one_basic
  assert_equal([1,2,4], plus_one([1,2,3]))
end

def test_plus_one_four_digits
  assert_equal([4,3,2,2], plus_one([4,3,2,1]))
end

def test_plus_one_carry
  assert_equal([1,0], plus_one([9]))
end

def test_plus_one_all_nines
  assert_equal([1,0,0], plus_one([9,9]))
end`,
    solution: `def plus_one(digits)
  (digits.length - 1).downto(0) do |i|
    if digits[i] < 9
      digits[i] += 1
      return digits
    end
    digits[i] = 0
  end
  [1] + digits
end`,
    usage: null,
    tags: ["math-geometry", "array", "neetcode"],
  },
  {
    name: "Pow(x, n)",
    category: "math",
    language: "ruby",
    difficulty: "medium",
    description: `Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).\n\nUse fast exponentiation (O(log n)) — do not simply loop n times.\n\nExample 1:\nInput: x = 2.00000, n = 10\nOutput: 1024.00000\n\nExample 2:\nInput: x = 2.10000, n = 3\nOutput: 9.26100\n\nExample 3:\nInput: x = 2.00000, n = -2\nOutput: 0.25000  (1/2^2 = 1/4 = 0.25)\n\nConstraints:\n- -100.0 < x < 100.0\n- -2^31 <= n <= 2^31 - 1\n- n is an integer\n- Either x is not zero, or n > 0\n- -10^4 <= x^n <= 10^4\n\nRef: LeetCode #50 Pow(x, n)`,
    code: `def my_pow(x, n)
  raise NotImplementedError
end`,
    testCode: `def test_pow_positive
  assert_true((my_pow(2.0, 10) - 1024.0).abs < 1e-5)
end

def test_pow_float
  assert_true((my_pow(2.1, 3) - 9.261).abs < 1e-3)
end

def test_pow_negative
  assert_true((my_pow(2.0, -2) - 0.25).abs < 1e-5)
end

def test_pow_zero_exp
  assert_true((my_pow(5.0, 0) - 1.0).abs < 1e-5)
end`,
    solution: `def my_pow(x, n)
  helper = lambda do |base, exp|
    return 1.0 if exp == 0
    if exp % 2 == 0
      half = helper.call(base, exp / 2)
      return half * half
    end
    base * helper.call(base, exp - 1)
  end

  if n < 0
    1.0 / helper.call(x, -n)
  else
    helper.call(x, n)
  end
end`,
    usage: null,
    tags: ["math-geometry", "binary-search", "neetcode"],
  },
  {
    name: "Multiply Strings",
    category: "math",
    language: "ruby",
    difficulty: "medium",
    description: `Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2, also represented as a string.\n\nNote: You must not convert the inputs to integers directly.\n\nExample 1:\nInput: num1 = "2", num2 = "3"\nOutput: "6"\n\nExample 2:\nInput: num1 = "123", num2 = "456"\nOutput: "56088"\n\nConstraints:\n- 1 <= num1.length, num2.length <= 200\n- num1 and num2 consist of digits only.\n- Both num1 and num2 do not have leading zeros, except for the zero itself.\n\nRef: LeetCode #43 Multiply Strings`,
    code: `def multiply(num1, num2)
  raise NotImplementedError
end`,
    testCode: `def test_multiply_single
  assert_equal("6", multiply("2", "3"))
end

def test_multiply_large
  assert_equal("56088", multiply("123", "456"))
end

def test_multiply_zero
  assert_equal("0", multiply("0", "0"))
end

def test_multiply_by_zero
  assert_equal("0", multiply("999", "0"))
end`,
    solution: `def multiply(num1, num2)
  m = num1.length
  n = num2.length
  pos = Array.new(m + n, 0)
  (m - 1).downto(0) do |i|
    (n - 1).downto(0) do |j|
      mul = (num1[i].ord - '0'.ord) * (num2[j].ord - '0'.ord)
      p1 = i + j
      p2 = i + j + 1
      total = mul + pos[p2]
      pos[p2] = total % 10
      pos[p1] += total / 10
    end
  end
  result = pos.map(&:to_s).join.sub(/\\A0+/, '')
  result.empty? ? '0' : result
end`,
    usage: null,
    tags: ["math-geometry", "string", "neetcode"],
  },
  {
    name: "Detect Squares",
    category: "math",
    language: "ruby",
    difficulty: "medium",
    description: `You are given a stream of points on the X-Y plane. Design an algorithm that:\n- Adds new points from the stream into a data structure.\n- Given a query point, counts the number of ways to choose three points from the data structure such that the three points and the query point form an axis-aligned square with positive area.\n\nAn axis-aligned square is a square whose edges are all the same length and are either parallel or perpendicular to the x-axis and y-axis.\n\nDuplicate points are allowed and are treated as separate points.\n\nImplement the DetectSquares class:\n- DetectSquares() — initializes the object.\n- add(point) — adds a new point point = [x, y].\n- count(point) — counts the number of axis-aligned squares with point = [x, y] as one corner.\n\nExample:\nds = DetectSquares()\nds.add([3, 10])\nds.add([11, 2])\nds.add([3, 2])\nds.count([11, 10])  # → 1\nds.count([14, 8])   # → 0\nds.add([11, 2])\nds.count([11, 10])  # → 2 (duplicate [11,2])\n\nRef: LeetCode #2013 Detect Squares`,
    code: `class DetectSquares
  def initialize
    raise NotImplementedError
  end

  def add(point)
    raise NotImplementedError
  end

  def count(point)
    raise NotImplementedError
  end
end`,
    testCode: `def test_detect_squares_basic
  ds = DetectSquares.new
  ds.add([3, 10])
  ds.add([11, 2])
  ds.add([3, 2])
  assert_equal(1, ds.count([11, 10]))
  assert_equal(0, ds.count([14, 8]))
end

def test_detect_squares_duplicate
  ds = DetectSquares.new
  ds.add([3, 10])
  ds.add([11, 2])
  ds.add([3, 2])
  ds.add([11, 2])
  assert_equal(2, ds.count([11, 10]))
end

def test_detect_squares_no_square
  ds = DetectSquares.new
  ds.add([1, 1])
  ds.add([2, 2])
  assert_equal(0, ds.count([1, 2]))
end`,
    solution: `class DetectSquares
  def initialize
    @pt_counts = Hash.new(0)
    @x_map = Hash.new { |h, k| h[k] = {} }
  end

  def add(point)
    px, py = point
    @pt_counts[[px, py]] += 1
    @x_map[px][py] = true
  end

  def count(point)
    qx, qy = point
    result = 0
    @x_map[qx].each_key do |py|
      next if py == qy
      side = (py - qy).abs
      [qx + side, qx - side].each do |dx|
        result += @pt_counts[[qx, py]] * @pt_counts[[dx, qy]] * @pt_counts[[dx, py]]
      end
    end
    result
  end
end`,
    usage: null,
    tags: ["math-geometry", "hash-map", "design", "neetcode"],
  },
];

export { neetcodeMathBit };
