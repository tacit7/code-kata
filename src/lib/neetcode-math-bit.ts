import type { SeedKata } from "../types/editor";
import { enrichMissingPythonSolutionVariants } from "./python-solution-variants";

const neetcodeMathBit: SeedKata[] = [
  {
    name: "Reverse Integer",
    category: "binary",
    language: "python",
    difficulty: "medium",
    description: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], return 0.\n\nExample 1:\nInput: x = 123\nOutput: 321\n\nExample 2:\nInput: x = -123\nOutput: -321\n\nExample 3:\nInput: x = 120\nOutput: 21\n\nConstraints:\n- -2^31 <= x <= 2^31 - 1\n\nRef: LeetCode #7 Reverse Integer`,
    code: `def reverse(x: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_reverse_positive():
    assert reverse(123) == 321

def test_reverse_negative():
    assert reverse(-123) == -321

def test_reverse_trailing_zero():
    assert reverse(120) == 21

def test_reverse_zero():
    assert reverse(0) == 0

def test_reverse_overflow():
    assert reverse(1534236469) == 0`,
    solution: `def reverse(x: int) -> int:
    INT_MIN, INT_MAX = -(2**31), 2**31 - 1
    sign = -1 if x < 0 else 1
    x = abs(x)
    rev = int(str(x)[::-1])
    result = sign * rev
    if result < INT_MIN or result > INT_MAX:
        return 0
    return result`,
    usage: null,
    tags: ["bit-manipulation", "math", "neetcode"],
  },
  {
    name: "Happy Number",
    category: "math",
    language: "python",
    difficulty: "easy",
    description: `Write an algorithm to determine if a number n is happy.\n\nA happy number is defined by the following process:\n- Starting with any positive integer, replace the number by the sum of the squares of its digits.\n- Repeat the process until the number equals 1 (it will stay there), or it loops endlessly in a cycle which does not include 1.\n- Numbers for which this process ends in 1 are happy.\n\nReturn True if n is a happy number, False otherwise.\n\nExample 1:\nInput: n = 19\nOutput: True  (1^2+9^2=82, 8^2+2^2=68, 6^2+8^2=100, 1^2+0^2+0^2=1)\n\nExample 2:\nInput: n = 2\nOutput: False\n\nConstraints:\n- 1 <= n <= 2^31 - 1\n\nRef: LeetCode #202 Happy Number`,
    code: `def is_happy(n: int) -> bool:
    raise NotImplementedError`,
    testCode: `def test_happy_19():
    assert is_happy(19) == True

def test_happy_2():
    assert is_happy(2) == False

def test_happy_1():
    assert is_happy(1) == True`,
    solution: `def is_happy(n: int) -> bool:
    seen = set()
    while n != 1:
        if n in seen:
            return False
        seen.add(n)
        n = sum(int(d) ** 2 for d in str(n))
    return True`,
    usage: null,
    tags: ["math-geometry", "hash-map", "neetcode"],
  },
  {
    name: "Plus One",
    category: "math",
    language: "python",
    difficulty: "easy",
    description: `You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0s.\n\nIncrement the large integer by one and return the resulting array of digits.\n\nExample 1:\nInput: digits = [1,2,3]\nOutput: [1,2,4]\n\nExample 2:\nInput: digits = [4,3,2,1]\nOutput: [4,3,2,2]\n\nExample 3:\nInput: digits = [9]\nOutput: [1,0]\n\nConstraints:\n- 1 <= digits.length <= 100\n- 0 <= digits[i] <= 9\n- digits does not contain any leading 0 except for the zero itself.\n\nRef: LeetCode #66 Plus One`,
    code: `def plus_one(digits: list[int]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_plus_one_basic():
    assert plus_one([1,2,3]) == [1,2,4]

def test_plus_one_four_digits():
    assert plus_one([4,3,2,1]) == [4,3,2,2]

def test_plus_one_carry():
    assert plus_one([9]) == [1,0]

def test_plus_one_all_nines():
    assert plus_one([9,9]) == [1,0,0]`,
    solution: `def plus_one(digits: list[int]) -> list[int]:
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    return [1] + digits`,
    usage: null,
    tags: ["math-geometry", "array", "neetcode"],
  },
  {
    name: "Pow(x, n)",
    category: "math",
    language: "python",
    difficulty: "medium",
    description: `Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).\n\nUse fast exponentiation (O(log n)) — do not simply loop n times.\n\nExample 1:\nInput: x = 2.00000, n = 10\nOutput: 1024.00000\n\nExample 2:\nInput: x = 2.10000, n = 3\nOutput: 9.26100\n\nExample 3:\nInput: x = 2.00000, n = -2\nOutput: 0.25000  (1/2^2 = 1/4 = 0.25)\n\nConstraints:\n- -100.0 < x < 100.0\n- -2^31 <= n <= 2^31 - 1\n- n is an integer\n- Either x is not zero, or n > 0\n- -10^4 <= x^n <= 10^4\n\nRef: LeetCode #50 Pow(x, n)`,
    code: `def my_pow(x: float, n: int) -> float:
    raise NotImplementedError`,
    testCode: `def test_pow_positive():
    assert abs(my_pow(2.0, 10) - 1024.0) < 1e-5

def test_pow_float():
    assert abs(my_pow(2.1, 3) - 9.261) < 1e-3

def test_pow_negative():
    assert abs(my_pow(2.0, -2) - 0.25) < 1e-5

def test_pow_zero_exp():
    assert abs(my_pow(5.0, 0) - 1.0) < 1e-5`,
    solution: `def my_pow(x: float, n: int) -> float:
    def helper(base: float, exp: int) -> float:
        if exp == 0:
            return 1.0
        if exp % 2 == 0:
            half = helper(base, exp // 2)
            return half * half
        return base * helper(base, exp - 1)

    if n < 0:
        return 1.0 / helper(x, -n)
    return helper(x, n)`,
    usage: null,
    tags: ["math-geometry", "binary-search", "neetcode"],
  },
  {
    name: "Multiply Strings",
    category: "math",
    language: "python",
    difficulty: "medium",
    description: `Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2, also represented as a string.\n\nNote: You must not convert the inputs to integers directly.\n\nExample 1:\nInput: num1 = "2", num2 = "3"\nOutput: "6"\n\nExample 2:\nInput: num1 = "123", num2 = "456"\nOutput: "56088"\n\nConstraints:\n- 1 <= num1.length, num2.length <= 200\n- num1 and num2 consist of digits only.\n- Both num1 and num2 do not have leading zeros, except for the zero itself.\n\nRef: LeetCode #43 Multiply Strings`,
    code: `def multiply(num1: str, num2: str) -> str:
    raise NotImplementedError`,
    testCode: `def test_multiply_single():
    assert multiply("2", "3") == "6"

def test_multiply_large():
    assert multiply("123", "456") == "56088"

def test_multiply_zero():
    assert multiply("0", "0") == "0"

def test_multiply_by_zero():
    assert multiply("999", "0") == "0"`,
    solution: `def multiply(num1: str, num2: str) -> str:
    m, n = len(num1), len(num2)
    pos = [0] * (m + n)
    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            mul = (ord(num1[i]) - ord('0')) * (ord(num2[j]) - ord('0'))
            p1, p2 = i + j, i + j + 1
            total = mul + pos[p2]
            pos[p2] = total % 10
            pos[p1] += total // 10
    result = ''.join(str(d) for d in pos).lstrip('0')
    return result or '0'`,
    usage: null,
    tags: ["math-geometry", "string", "neetcode"],
  },
  {
    name: "Detect Squares",
    category: "math",
    language: "python",
    difficulty: "medium",
    description: `You are given a stream of points on the X-Y plane. Design an algorithm that:\n- Adds new points from the stream into a data structure.\n- Given a query point, counts the number of ways to choose three points from the data structure such that the three points and the query point form an axis-aligned square with positive area.\n\nAn axis-aligned square is a square whose edges are all the same length and are either parallel or perpendicular to the x-axis and y-axis.\n\nDuplicate points are allowed and are treated as separate points.\n\nImplement the DetectSquares class:\n- DetectSquares() — initializes the object.\n- add(point) — adds a new point point = [x, y].\n- count(point) — counts the number of axis-aligned squares with point = [x, y] as one corner.\n\nExample:\nds = DetectSquares()\nds.add([3, 10])\nds.add([11, 2])\nds.add([3, 2])\nds.count([11, 10])  # → 1\nds.count([14, 8])   # → 0\nds.add([11, 2])\nds.count([11, 10])  # → 2 (duplicate [11,2])\n\nRef: LeetCode #2013 Detect Squares`,
    code: `class DetectSquares:
    def __init__(self):
        raise NotImplementedError

    def add(self, point: list[int]) -> None:
        raise NotImplementedError

    def count(self, point: list[int]) -> int:
        raise NotImplementedError`,
    testCode: `def test_detect_squares_basic():
    ds = DetectSquares()
    ds.add([3, 10])
    ds.add([11, 2])
    ds.add([3, 2])
    assert ds.count([11, 10]) == 1
    assert ds.count([14, 8]) == 0

def test_detect_squares_duplicate():
    ds = DetectSquares()
    ds.add([3, 10])
    ds.add([11, 2])
    ds.add([3, 2])
    ds.add([11, 2])
    assert ds.count([11, 10]) == 2

def test_detect_squares_no_square():
    ds = DetectSquares()
    ds.add([1, 1])
    ds.add([2, 2])
    assert ds.count([1, 2]) == 0`,
    solution: `class DetectSquares:
    def __init__(self):
        from collections import defaultdict
        self.pt_counts = defaultdict(int)
        self.x_map = defaultdict(set)

    def add(self, point: list[int]) -> None:
        px, py = point
        self.pt_counts[(px, py)] += 1
        self.x_map[px].add(py)

    def count(self, point: list[int]) -> int:
        from collections import defaultdict
        qx, qy = point
        result = 0
        for py in self.x_map[qx]:
            if py == qy:
                continue
            side = abs(py - qy)
            for dx in [qx + side, qx - side]:
                result += (
                    self.pt_counts[(qx, py)]
                    * self.pt_counts[(dx, qy)]
                    * self.pt_counts[(dx, py)]
                )
        return result`,
    usage: null,
    tags: ["math-geometry", "hash-map", "design", "neetcode"],
  },
];

enrichMissingPythonSolutionVariants(neetcodeMathBit);

export { neetcodeMathBit };
