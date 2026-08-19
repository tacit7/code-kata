import type { SeedKata, SolutionVariant } from "../types/editor";

const CALL_FLOW_TAGS = ["recursion", "recursion-call-flow"];
const NUMERIC_TAGS = ["recursion", "recursion-numeric"];
const ARRAY_TAGS = ["recursion", "recursion-array"];
const STRING_TAGS = ["recursion", "recursion-string"];
const BRANCHING_TAGS = ["recursion", "recursion-branching"];
const BINARY_TREE_TAGS = ["recursion", "recursion-binary-tree"];
const BACKTRACKING_TAGS = ["recursion", "recursion-backtracking"];

function variant(
  label: string,
  code: string,
  explanation: string,
  complexity = "Time O(n), Space O(n) recursion stack",
): SolutionVariant {
  return {
    label,
    complexity,
    explanation,
    code,
  };
}

const PRINT_CAPTURE_HELPER = `def capture_lines(fn, *args):
    import contextlib
    import io
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        result = fn(*args)
    lines = [line.strip() for line in buffer.getvalue().splitlines() if line.strip()]
    return result, lines`;

const TREE_NODE_CLASS = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self):
        return f"TreeNode({self.val!r})"`;

const MAKE_TREE_HELPER = `def make_tree(vals):
    if not vals:
        return None
    from collections import deque
    root = TreeNode(vals[0])
    q = deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            q.append(node.right)
        i += 1
    return root`;

const TREE_TO_LIST_HELPER = `def tree_to_list(root):
    if root is None:
        return []
    from collections import deque
    result = []
    q = deque([root])
    while q:
        node = q.popleft()
        if node is None:
            result.append(None)
            continue
        result.append(node.val)
        q.append(node.left)
        q.append(node.right)
    while result and result[-1] is None:
        result.pop()
    return result`;

const TREE_TEST_HEADER = `${TREE_NODE_CLASS}

${MAKE_TREE_HELPER}

`;

const TREE_SERIALIZE_TEST_HEADER = `${TREE_TEST_HEADER}${TREE_TO_LIST_HELPER}

`;

export const recursionFoundations: SeedKata[] = [
  {
    name: "Countdown",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Print the numbers from n down to 1, one number per line.

This is the first call-flow drill: do the work before the recursive call, then move n closer to the base case.

Example:
Input: n = 4
Output:
4
3
2
1

Constraints:
- 0 <= n <= 1000
- If n is 0, print nothing.`,
    code: `def countdown(n: int) -> None:
    raise NotImplementedError`,
    testCode: `${PRINT_CAPTURE_HELPER}

def test_countdown_basic():
    result, lines = capture_lines(countdown, 4)
    assert result is None
    assert lines == ["4", "3", "2", "1"]

def test_countdown_one():
    _, lines = capture_lines(countdown, 1)
    assert lines == ["1"]

def test_countdown_zero():
    _, lines = capture_lines(countdown, 0)
    assert lines == []`,
    solution: `def countdown(n: int) -> None:
    if n <= 0:
        return
    print(n)
    countdown(n - 1)`,
    solutionVariants: [
      variant(
        "Work before recursive call",
        `def countdown(n: int) -> None:
    if n <= 0:
        return
    print(n)
    countdown(n - 1)`,
        "Print the current value first, then recurse on n - 1. The base case stops the chain once n reaches 0.",
      ),
    ],
    usage: "Pattern: work before the recursive call. Learning prompt: what happens before the next stack frame is created?",
    tags: [...CALL_FLOW_TAGS, "linear-recursion", "work-before-recursive-call"],
  },
  {
    name: "Print Evens Down",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Print the even numbers from n down to 2, one number per line.

This is another work-before-recursive-call drill. Each call decides whether the current value should be printed before moving to n - 1.

Example:
Input: n = 8
Output:
8
6
4
2

Example:
Input: n = 5
Output:
4
2

Constraints:
- 0 <= n <= 1000
- If there are no positive even numbers, print nothing.`,
    code: `def print_evens_down(n: int) -> None:
    raise NotImplementedError`,
    testCode: `${PRINT_CAPTURE_HELPER}

def test_print_evens_down_even_start():
    result, lines = capture_lines(print_evens_down, 8)
    assert result is None
    assert lines == ["8", "6", "4", "2"]

def test_print_evens_down_odd_start():
    _, lines = capture_lines(print_evens_down, 5)
    assert lines == ["4", "2"]

def test_print_evens_down_no_values():
    _, lines = capture_lines(print_evens_down, 1)
    assert lines == []`,
    solution: `def print_evens_down(n: int) -> None:
    if n <= 1:
        return
    if n % 2 == 0:
        print(n)
    print_evens_down(n - 1)`,
    solutionVariants: [
      variant(
        "Process current value first",
        `def print_evens_down(n: int) -> None:
    if n <= 1:
        return
    if n % 2 == 0:
        print(n)
    print_evens_down(n - 1)`,
        "Each call handles the current number before creating the next stack frame. Odd numbers are skipped, but the recursion still moves downward.",
      ),
    ],
    usage: "Pattern: process current value before the recursive call. Learning prompt: why does an odd n still need a recursive call?",
    tags: [...CALL_FLOW_TAGS, "linear-recursion", "work-before-recursive-call", "conditional-print"],
  },
  {
    name: "Print Stars Shrinking",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Print a shrinking block of stars from n down to 1.

This makes decreasing input visible. Each line represents the current value before the recursive call shrinks it.

Example:
Input: n = 4
Output:
****
***
**
*

Constraints:
- 0 <= n <= 1000
- If n is 0, print nothing.`,
    code: `def print_stars_shrinking(n: int) -> None:
    raise NotImplementedError`,
    testCode: `${PRINT_CAPTURE_HELPER}

def test_print_stars_shrinking_basic():
    result, lines = capture_lines(print_stars_shrinking, 4)
    assert result is None
    assert lines == ["****", "***", "**", "*"]

def test_print_stars_shrinking_one():
    _, lines = capture_lines(print_stars_shrinking, 1)
    assert lines == ["*"]

def test_print_stars_shrinking_zero():
    _, lines = capture_lines(print_stars_shrinking, 0)
    assert lines == []`,
    solution: `def print_stars_shrinking(n: int) -> None:
    if n <= 0:
        return
    print("*" * n)
    print_stars_shrinking(n - 1)`,
    solutionVariants: [
      variant(
        "Visual decreasing input",
        `def print_stars_shrinking(n: int) -> None:
    if n <= 0:
        return
    print("*" * n)
    print_stars_shrinking(n - 1)`,
        "The printed line shows the current input size. The recursive call then moves to the next smaller line.",
      ),
    ],
    usage: "Pattern: visualize decreasing input. Learning prompt: which printed line belongs to the current stack frame?",
    tags: [...CALL_FLOW_TAGS, "linear-recursion", "work-before-recursive-call", "visual-recursion"],
  },
  {
    name: "Print Array Forward Recursively",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Print each item in an array from left to right using recursion.

This applies work-before-recursive-call to an index. Process nums[index], then recurse to the next index.

Example:
Input: nums = [3, 1, 4]
Output:
3
1
4

Constraints:
- 0 <= len(nums) <= 1000
- Array values may be any integers.`,
    code: `def print_array_forward(nums: list[int]) -> None:
    raise NotImplementedError`,
    testCode: `${PRINT_CAPTURE_HELPER}

def test_print_array_forward_basic():
    result, lines = capture_lines(print_array_forward, [3, 1, 4])
    assert result is None
    assert lines == ["3", "1", "4"]

def test_print_array_forward_single():
    _, lines = capture_lines(print_array_forward, [9])
    assert lines == ["9"]

def test_print_array_forward_empty():
    _, lines = capture_lines(print_array_forward, [])
    assert lines == []`,
    solution: `def print_array_forward(nums: list[int]) -> None:
    def helper(index: int) -> None:
        if index == len(nums):
            return
        print(nums[index])
        helper(index + 1)

    helper(0)`,
    solutionVariants: [
      variant(
        "Process current index first",
        `def print_array_forward(nums: list[int]) -> None:
    def helper(index: int) -> None:
        if index == len(nums):
            return
        print(nums[index])
        helper(index + 1)

    helper(0)`,
        "The index identifies the current item. Printing happens before the helper advances to the next index.",
      ),
    ],
    usage: "Pattern: process current index before moving forward. Learning prompt: what base case means there are no items left?",
    tags: [...CALL_FLOW_TAGS, "linear-recursion", "work-before-recursive-call", "index-recursion"],
  },
  {
    name: "Count Up",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Print the numbers from 1 up to n, one number per line.

This is the paired call-flow drill for Countdown. Make the recursive call first, then do the work as stack frames return.

Example:
Input: n = 4
Output:
1
2
3
4

Constraints:
- 0 <= n <= 1000
- If n is 0, print nothing.`,
    code: `def count_up(n: int) -> None:
    raise NotImplementedError`,
    testCode: `${PRINT_CAPTURE_HELPER}

def test_count_up_basic():
    result, lines = capture_lines(count_up, 4)
    assert result is None
    assert lines == ["1", "2", "3", "4"]

def test_count_up_one():
    _, lines = capture_lines(count_up, 1)
    assert lines == ["1"]

def test_count_up_zero():
    _, lines = capture_lines(count_up, 0)
    assert lines == []`,
    solution: `def count_up(n: int) -> None:
    if n <= 0:
        return
    count_up(n - 1)
    print(n)`,
    solutionVariants: [
      variant(
        "Recursive call before work",
        `def count_up(n: int) -> None:
    if n <= 0:
        return
    count_up(n - 1)
    print(n)`,
        "Recurse first so smaller numbers print as the call stack unwinds. The print happens after the deeper call returns.",
      ),
    ],
    usage: "Pattern: recursive call before work. Learning prompt: why does output wait until the base case is reached?",
    tags: [...CALL_FLOW_TAGS, "linear-recursion", "recursive-call-before-work"],
  },
  {
    name: "Sum From 1 to N",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return the sum of all integers from 1 through n.

This introduces return recursion: each call asks for the sum of a smaller prefix, then adds the current n.

Example:
Input: n = 5
Output: 15
Explanation: 1 + 2 + 3 + 4 + 5 = 15

Constraints:
- 0 <= n <= 1000
- The sum for 0 is 0.`,
    code: `def sum_from_1_to_n(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_sum_from_1_to_n_basic():
    assert sum_from_1_to_n(5) == 15

def test_sum_from_1_to_n_zero():
    assert sum_from_1_to_n(0) == 0

def test_sum_from_1_to_n_one():
    assert sum_from_1_to_n(1) == 1

def test_sum_from_1_to_n_ten():
    assert sum_from_1_to_n(10) == 55`,
    solution: `def sum_from_1_to_n(n: int) -> int:
    if n <= 0:
        return 0
    return n + sum_from_1_to_n(n - 1)`,
    solutionVariants: [
      variant(
        "Additive return recursion",
        `def sum_from_1_to_n(n: int) -> int:
    if n <= 0:
        return 0
    return n + sum_from_1_to_n(n - 1)`,
        "The recursive call returns the sum of 1 through n - 1. Add n to that returned value.",
      ),
    ],
    usage: "Pattern: additive return recursion. Learning prompt: what does sum_from_1_to_n(n - 1) promise to return?",
    tags: [...CALL_FLOW_TAGS, "return-recursion", "additive-recursion"],
  },
  {
    name: "Factorial",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return n factorial.

n! means n * (n - 1) * ... * 1. This has the same return shape as Sum From 1 to N, but combines results with multiplication instead of addition.

Example:
Input: n = 5
Output: 120

Constraints:
- 0 <= n <= 12
- 0! is 1.`,
    code: `def factorial(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_factorial_basic():
    assert factorial(5) == 120

def test_factorial_zero():
    assert factorial(0) == 1

def test_factorial_one():
    assert factorial(1) == 1

def test_factorial_six():
    assert factorial(6) == 720`,
    solution: `def factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
    solutionVariants: [
      variant(
        "Multiplicative return recursion",
        `def factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
        "The base case returns the multiplicative identity, 1. Every other call multiplies n by the factorial of n - 1.",
      ),
    ],
    usage: "Pattern: multiplicative return recursion. Learning prompt: what is the smallest value that can be returned directly?",
    tags: [...CALL_FLOW_TAGS, "return-recursion", "multiplicative-recursion"],
  },
  {
    name: "Power of Number",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return base raised to a non-negative integer exponent using repeated recursive multiplication.

Do not use Python's ** operator or pow(). The goal is to practice moving one parameter toward the base case.

Example:
Input: base = 2, exponent = 5
Output: 32

Constraints:
- -20 <= base <= 20
- 0 <= exponent <= 20
- Any base to exponent 0 returns 1.`,
    code: `def power(base: int, exponent: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_power_basic():
    assert power(2, 5) == 32

def test_power_zero_exponent():
    assert power(7, 0) == 1

def test_power_one_exponent():
    assert power(9, 1) == 9

def test_power_negative_base():
    assert power(-2, 3) == -8`,
    solution: `def power(base: int, exponent: int) -> int:
    if exponent == 0:
        return 1
    return base * power(base, exponent - 1)`,
    solutionVariants: [
      variant(
        "Repeated recursive multiplication",
        `def power(base: int, exponent: int) -> int:
    if exponent == 0:
        return 1
    return base * power(base, exponent - 1)`,
        "Each call consumes one multiplication and decreases exponent. The exponent parameter is what moves toward the base case.",
      ),
    ],
    usage: "Pattern: repeated recursive multiplication. Learning prompt: which parameter moves toward the base case?",
    tags: [...CALL_FLOW_TAGS, "return-recursion", "multiplicative-recursion"],
  },
  {
    name: "Count Digits",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return how many decimal digits are in a non-negative integer.

This starts numeric recursion: instead of moving n toward 0 by subtracting 1, shrink the number by dividing by 10.

Example:
Input: n = 12345
Output: 5

Edge case:
Input: n = 0
Output: 1

Constraints:
- 0 <= n <= 10^18
- 0 counts as one digit.`,
    code: `def count_digits(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_digits_zero():
    assert count_digits(0) == 1

def test_count_digits_single():
    assert count_digits(7) == 1

def test_count_digits_two_digits():
    assert count_digits(42) == 2

def test_count_digits_many_digits():
    assert count_digits(12345) == 5`,
    solution: `def count_digits(n: int) -> int:
    if n < 10:
        return 1
    return 1 + count_digits(n // 10)`,
    solutionVariants: [
      variant(
        "Divide by 10",
        `def count_digits(n: int) -> int:
    if n < 10:
        return 1
    return 1 + count_digits(n // 10)`,
        "Each call removes the last decimal digit with integer division. The return value counts one digit plus the remaining prefix.",
        "Time O(d), Space O(d) recursion stack, where d is the number of digits",
      ),
    ],
    usage: "Pattern: divide by 10. Learning prompt: what does n // 10 remove from the number?",
    tags: [...NUMERIC_TAGS, "numeric-recursion", "divide-by-10"],
  },
  {
    name: "Sum Digits",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return the sum of the decimal digits in a non-negative integer.

Use modulo to read the last digit, then integer division to recurse on the remaining prefix.

Example:
Input: n = 12345
Output: 15

Constraints:
- 0 <= n <= 10^18
- The digit sum of 0 is 0.`,
    code: `def sum_digits(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_sum_digits_zero():
    assert sum_digits(0) == 0

def test_sum_digits_single():
    assert sum_digits(7) == 7

def test_sum_digits_many_digits():
    assert sum_digits(12345) == 15

def test_sum_digits_with_zero_inside():
    assert sum_digits(105) == 6`,
    solution: `def sum_digits(n: int) -> int:
    if n == 0:
        return 0
    return (n % 10) + sum_digits(n // 10)`,
    solutionVariants: [
      variant(
        "Modulo plus division",
        `def sum_digits(n: int) -> int:
    if n == 0:
        return 0
    return (n % 10) + sum_digits(n // 10)`,
        "n % 10 gives the last digit. n // 10 removes it, so the recursive call handles the rest.",
        "Time O(d), Space O(d) recursion stack, where d is the number of digits",
      ),
    ],
    usage: "Pattern: modulo plus division. Learning prompt: which expression reads the last digit, and which expression removes it?",
    tags: [...NUMERIC_TAGS, "numeric-recursion", "modulo-division"],
  },
  {
    name: "Product of Digits",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return the product of the decimal digits in a non-negative integer.

This uses the same modulo and division movement as Sum Digits, but the base cases need care: 0 has product 0, while a positive single digit returns itself.

Example:
Input: n = 123
Output: 6

Edge case:
Input: n = 0
Output: 0

Constraints:
- 0 <= n <= 10^18
- A zero digit makes the product 0.`,
    code: `def product_digits(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_product_digits_zero():
    assert product_digits(0) == 0

def test_product_digits_single():
    assert product_digits(7) == 7

def test_product_digits_many_digits():
    assert product_digits(123) == 6

def test_product_digits_with_zero_inside():
    assert product_digits(105) == 0`,
    solution: `def product_digits(n: int) -> int:
    if n < 10:
        return n
    return (n % 10) * product_digits(n // 10)`,
    solutionVariants: [
      variant(
        "Modulo plus division",
        `def product_digits(n: int) -> int:
    if n < 10:
        return n
    return (n % 10) * product_digits(n // 10)`,
        "A positive single digit is already its own product. Larger numbers multiply the last digit by the product of the remaining prefix.",
        "Time O(d), Space O(d) recursion stack, where d is the number of digits",
      ),
    ],
    usage: "Pattern: modulo plus division. Learning prompt: why is product_digits(0) different from factorial(0)?",
    tags: [...NUMERIC_TAGS, "numeric-recursion", "modulo-division"],
  },
  {
    name: "Reverse Number",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return the decimal digits of a non-negative integer in reverse order.

This introduces accumulator recursion. The accumulator carries the reversed prefix built so far while the remaining number shrinks by one digit per call.

Example:
Input: n = 1234
Output: 4321

Example:
Input: n = 1200
Output: 21

Constraints:
- 0 <= n <= 10^18
- Leading zeroes in the reversed number are dropped naturally by integer math.`,
    code: `def reverse_number(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_reverse_number_zero():
    assert reverse_number(0) == 0

def test_reverse_number_single():
    assert reverse_number(7) == 7

def test_reverse_number_basic():
    assert reverse_number(1234) == 4321

def test_reverse_number_trailing_zeroes():
    assert reverse_number(1200) == 21`,
    solution: `def reverse_number(n: int) -> int:
    def helper(remaining: int, acc: int) -> int:
        if remaining == 0:
            return acc
        return helper(remaining // 10, acc * 10 + remaining % 10)

    return helper(n, 0)`,
    solutionVariants: [
      variant(
        "Accumulator recursion",
        `def reverse_number(n: int) -> int:
    def helper(remaining: int, acc: int) -> int:
        if remaining == 0:
            return acc
        return helper(remaining // 10, acc * 10 + remaining % 10)

    return helper(n, 0)`,
        "The accumulator shifts left by one decimal place and appends the last digit from remaining. The recursive call removes that last digit.",
        "Time O(d), Space O(d) recursion stack, where d is the number of digits",
      ),
    ],
    usage: "Pattern: accumulator recursion. Learning prompt: what does the accumulator represent after each call?",
    tags: [...NUMERIC_TAGS, "numeric-recursion", "accumulator-recursion"],
  },
  {
    name: "Multiply Using Addition",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return the product of two non-negative integers without using the multiplication operator.

This turns multiplication into repeated addition. Each recursive call reduces one operand until there is nothing left to add.

Example:
Input: a = 4, b = 3
Output: 12

Example:
Input: a = 9, b = 0
Output: 0

Constraints:
- 0 <= a, b <= 1000
- Do not use * inside your solution.`,
    code: `def multiply(a: int, b: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_multiply_zero():
    assert multiply(9, 0) == 0
    assert multiply(0, 9) == 0

def test_multiply_one():
    assert multiply(7, 1) == 7

def test_multiply_basic():
    assert multiply(4, 3) == 12

def test_multiply_larger():
    assert multiply(12, 8) == 96`,
    solution: `def multiply(a: int, b: int) -> int:
    if b == 0:
        return 0
    return a + multiply(a, b - 1)`,
    solutionVariants: [
      variant(
        "Repeated addition",
        `def multiply(a: int, b: int) -> int:
    if b == 0:
        return 0
    return a + multiply(a, b - 1)`,
        "The recursive call computes one fewer copy of a. The current call adds the missing copy back.",
        "Time O(b), Space O(b) recursion stack",
      ),
    ],
    usage: "Pattern: repeated addition. Learning prompt: what does multiply(a, b - 1) promise to return?",
    tags: [...NUMERIC_TAGS, "numeric-recursion", "repeated-addition"],
  },
  {
    name: "Count Halvings to One",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return how many times a positive integer can be halved with integer division before it reaches 1.

This is a direct repeated-halving drill. Each call divides the input by 2 and counts one step.

Example:
Input: n = 8
Output: 3

Example:
Input: n = 10
Output: 3

Constraints:
- 1 <= n <= 10^18
- Use integer division.`,
    code: `def count_halvings_to_one(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_halvings_one():
    assert count_halvings_to_one(1) == 0

def test_count_halvings_power_of_two():
    assert count_halvings_to_one(8) == 3

def test_count_halvings_odd_path():
    assert count_halvings_to_one(9) == 3

def test_count_halvings_large():
    assert count_halvings_to_one(1024) == 10`,
    solution: `def count_halvings_to_one(n: int) -> int:
    if n <= 1:
        return 0
    return 1 + count_halvings_to_one(n // 2)`,
    solutionVariants: [
      variant(
        "Repeated halving",
        `def count_halvings_to_one(n: int) -> int:
    if n <= 1:
        return 0
    return 1 + count_halvings_to_one(n // 2)`,
        "Each call performs one halving step. Reaching 1 means there are no more steps to count.",
        "Time O(log n), Space O(log n) recursion stack",
      ),
    ],
    usage: "Pattern: repeated halving. Learning prompt: why does n // 2 move toward the base case so quickly?",
    tags: [...NUMERIC_TAGS, "numeric-recursion", "repeated-halving"],
  },
  {
    name: "Is Power of Two",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return True if n is a power of two, otherwise return False.

This is recursive reduction: a valid power of two can keep being divided by 2 until it reaches 1. Odd numbers greater than 1 fail immediately.

Example:
Input: n = 16
Output: True

Example:
Input: n = 18
Output: False

Constraints:
- -10^9 <= n <= 10^9
- Non-positive numbers are not powers of two.`,
    code: `def is_power_of_two(n: int) -> bool:
    raise NotImplementedError`,
    testCode: `def test_is_power_of_two_one():
    assert is_power_of_two(1) is True

def test_is_power_of_two_true():
    assert is_power_of_two(16) is True

def test_is_power_of_two_false_odd():
    assert is_power_of_two(12) is False

def test_is_power_of_two_false_non_positive():
    assert is_power_of_two(0) is False
    assert is_power_of_two(-8) is False`,
    solution: `def is_power_of_two(n: int) -> bool:
    if n <= 0:
        return False
    if n == 1:
        return True
    if n % 2 != 0:
        return False
    return is_power_of_two(n // 2)`,
    solutionVariants: [
      variant(
        "Recursive reduction",
        `def is_power_of_two(n: int) -> bool:
    if n <= 0:
        return False
    if n == 1:
        return True
    if n % 2 != 0:
        return False
    return is_power_of_two(n // 2)`,
        "Repeatedly divide by 2. Reaching 1 means every reduction was valid; hitting an odd number greater than 1 means it is not a power of two.",
        "Time O(log n), Space O(log n) recursion stack",
      ),
    ],
    usage: "Pattern: recursive reduction. Learning prompt: which values can stop immediately without another recursive call?",
    tags: [...NUMERIC_TAGS, "numeric-recursion", "recursive-reduction"],
  },
  {
    name: "Steps to Reduce to Zero",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return how many recursive steps it takes to reduce a non-negative integer to 0.

If the number is even, divide it by 2. If the number is odd, subtract 1. Count each operation.

Example:
Input: n = 14
Output: 6

Explanation:
14 -> 7 -> 6 -> 3 -> 2 -> 1 -> 0

Constraints:
- 0 <= n <= 10^9`,
    code: `def steps_to_zero(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_steps_to_zero_zero():
    assert steps_to_zero(0) == 0

def test_steps_to_zero_one():
    assert steps_to_zero(1) == 1

def test_steps_to_zero_even_path():
    assert steps_to_zero(8) == 4

def test_steps_to_zero_mixed_path():
    assert steps_to_zero(14) == 6`,
    solution: `def steps_to_zero(n: int) -> int:
    if n == 0:
        return 0
    if n % 2 == 0:
        return 1 + steps_to_zero(n // 2)
    return 1 + steps_to_zero(n - 1)`,
    solutionVariants: [
      variant(
        "Even divide, odd subtract",
        `def steps_to_zero(n: int) -> int:
    if n == 0:
        return 0
    if n % 2 == 0:
        return 1 + steps_to_zero(n // 2)
    return 1 + steps_to_zero(n - 1)`,
        "The recursive rule depends on parity. Every branch performs one operation and moves n closer to 0.",
        "Time O(log n), Space O(log n) recursion stack",
      ),
    ],
    usage: "Pattern: conditional numeric reduction. Learning prompt: which branch handles odd numbers, and why does it make the next call even?",
    tags: [...NUMERIC_TAGS, "numeric-recursion", "conditional-reduction"],
  },
  {
    name: "Greatest Common Divisor",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return the greatest common divisor of two non-negative integers.

This introduces Euclidean recursion. The pair (a, b) shrinks to (b, a % b) until the remainder side reaches 0.

Example:
Input: a = 48, b = 18
Output: 6

Example:
Input: a = 7, b = 3
Output: 1

Constraints:
- 0 <= a, b <= 10^9
- At least one input is greater than 0.`,
    code: `def gcd(a: int, b: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_gcd_basic():
    assert gcd(48, 18) == 6

def test_gcd_coprime():
    assert gcd(7, 3) == 1

def test_gcd_with_zero():
    assert gcd(0, 5) == 5
    assert gcd(12, 0) == 12

def test_gcd_same_number():
    assert gcd(21, 21) == 21`,
    solution: `def gcd(a: int, b: int) -> int:
    if b == 0:
        return a
    return gcd(b, a % b)`,
    solutionVariants: [
      variant(
        "Euclidean recursion",
        `def gcd(a: int, b: int) -> int:
    if b == 0:
        return a
    return gcd(b, a % b)`,
        "The modulo operation removes full copies of b from a. The gcd does not change, but the second argument gets smaller until it reaches 0.",
        "Time O(log min(a, b)), Space O(log min(a, b)) recursion stack",
      ),
    ],
    usage: "Pattern: Euclidean recursion. Learning prompt: why does gcd(a, b) equal gcd(b, a % b)?",
    tags: [...NUMERIC_TAGS, "numeric-recursion", "euclidean-recursion"],
  },
  {
    name: "Count Items",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return how many items are in an array using recursion.

This is the counting version of Sum Array: each valid index contributes 1, then the recursive call counts the rest.

Example:
Input: nums = [8, 4, 2]
Output: 3

Constraints:
- 0 <= len(nums) <= 1000
- Do not call len(nums) as the returned answer; use recursion to count.`,
    code: `def count_items(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_items_basic():
    assert count_items([8, 4, 2]) == 3

def test_count_items_empty():
    assert count_items([]) == 0

def test_count_items_single():
    assert count_items([7]) == 1

def test_count_items_many():
    assert count_items([1, 2, 3, 4, 5]) == 5`,
    solution: `def count_items(nums: list[int]) -> int:
    def helper(index: int) -> int:
        if index == len(nums):
            return 0
        return 1 + helper(index + 1)

    return helper(0)`,
    solutionVariants: [
      variant(
        "Index recursion",
        `def count_items(nums: list[int]) -> int:
    def helper(index: int) -> int:
        if index == len(nums):
            return 0
        return 1 + helper(index + 1)

    return helper(0)`,
        "Each in-bounds index contributes one item. The base case returns 0 once the index reaches the array length.",
      ),
      variant(
        "Slicing recursion (not optimal)",
        `def count_items(nums: list[int]) -> int:
    if not nums:
        return 0

    return 1 + count_items(nums[1:])`,
        "This works because each call removes the first item and counts it. It is not optimal because nums[1:] copies the remaining list on every recursive call.",
        "Time O(n^2), Space O(n^2) from copied slices plus recursion stack",
      ),
    ],
    usage: "Pattern: index recursion. Learning prompt: why does reaching len(nums) mean there are zero items left?",
    tags: [...ARRAY_TAGS, "array-recursion", "index-recursion"],
  },
  {
    name: "Sum Array",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return the sum of all numbers in an array using recursion.

This starts array recursion. The index tells the recursive call which part of the array still needs work.

Example:
Input: nums = [2, 4, 6]
Output: 12

Constraints:
- 0 <= len(nums) <= 1000
- Values may be negative.
- An empty array sums to 0.`,
    code: `def sum_array(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_sum_array_basic():
    assert sum_array([2, 4, 6]) == 12

def test_sum_array_empty():
    assert sum_array([]) == 0

def test_sum_array_single():
    assert sum_array([7]) == 7

def test_sum_array_negatives():
    assert sum_array([5, -2, 1]) == 4`,
    solution: `def sum_array(nums: list[int]) -> int:
    def helper(index: int) -> int:
        if index == len(nums):
            return 0
        return nums[index] + helper(index + 1)

    return helper(0)`,
    solutionVariants: [
      variant(
        "Index recursion",
        `def sum_array(nums: list[int]) -> int:
    def helper(index: int) -> int:
        if index == len(nums):
            return 0
        return nums[index] + helper(index + 1)

    return helper(0)`,
        "The index marks the current element. Add that element to the recursive result for the rest of the array.",
      ),
      variant(
        "Slicing recursion (not optimal)",
        `def sum_array(nums: list[int]) -> int:
    if not nums:
        return 0

    return nums[-1] + sum_array(nums[:-1])`,
        "This is a valid recursive solution: add the last value, then recurse on everything before it. It is not optimal because nums[:-1] creates a new list on every call, so the repeated copying makes it O(n^2) time and O(n^2) extra memory instead of the index solution's O(n) stack space.",
        "Time O(n^2), Space O(n^2) from copied slices plus recursion stack",
      ),
    ],
    usage: "Pattern: index recursion. Learning prompt: what does helper(index) promise to return?",
    tags: [...ARRAY_TAGS, "array-recursion", "index-recursion"],
  },
  {
    name: "Contains Target",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return True if an array contains target, otherwise return False.

This is boolean recursion: the current element can answer immediately, or the recursive call searches the rest.

Example:
Input: nums = [4, 2, 9], target = 2
Output: True

Constraints:
- 0 <= len(nums) <= 1000
- Values may be negative.`,
    code: `def contains_target(nums: list[int], target: int) -> bool:
    raise NotImplementedError`,
    testCode: `def test_contains_target_present():
    assert contains_target([4, 2, 9], 2) is True

def test_contains_target_absent():
    assert contains_target([4, 2, 9], 7) is False

def test_contains_target_empty():
    assert contains_target([], 1) is False

def test_contains_target_first():
    assert contains_target([5, 1, 2], 5) is True`,
    solution: `def contains_target(nums: list[int], target: int) -> bool:
    def helper(index: int) -> bool:
        if index == len(nums):
            return False
        if nums[index] == target:
            return True
        return helper(index + 1)

    return helper(0)`,
    solutionVariants: [
      variant(
        "Boolean recursion",
        `def contains_target(nums: list[int], target: int) -> bool:
    def helper(index: int) -> bool:
        if index == len(nums):
            return False
        if nums[index] == target:
            return True
        return helper(index + 1)

    return helper(0)`,
        "A match returns True immediately. Otherwise the recursive call decides whether the target appears later.",
      ),
      variant(
        "Slicing recursion (not optimal)",
        `def contains_target(nums: list[int], target: int) -> bool:
    if not nums:
        return False
    if nums[0] == target:
        return True
    return contains_target(nums[1:], target)`,
        "This is readable because the recursive call searches the rest of the list. It is not optimal because nums[1:] allocates a new list at each step.",
        "Time O(n^2), Space O(n^2) from copied slices plus recursion stack",
      ),
    ],
    usage: "Pattern: boolean recursion. Learning prompt: which branch lets the search stop early?",
    tags: [...ARRAY_TAGS, "array-recursion", "boolean-recursion"],
  },
  {
    name: "Count Target Occurrences",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return how many times target appears in an array.

Each call counts the current element as 1 or 0, then adds the count from the rest of the array.

Example:
Input: nums = [1, 2, 1, 1], target = 1
Output: 3

Constraints:
- 0 <= len(nums) <= 1000
- Values may be negative.`,
    code: `def count_target_occurrences(nums: list[int], target: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_target_occurrences_basic():
    assert count_target_occurrences([1, 2, 1, 1], 1) == 3

def test_count_target_occurrences_absent():
    assert count_target_occurrences([1, 2, 3], 9) == 0

def test_count_target_occurrences_empty():
    assert count_target_occurrences([], 1) == 0

def test_count_target_occurrences_all():
    assert count_target_occurrences([4, 4, 4], 4) == 3`,
    solution: `def count_target_occurrences(nums: list[int], target: int) -> int:
    def helper(index: int) -> int:
        if index == len(nums):
            return 0
        current = 1 if nums[index] == target else 0
        return current + helper(index + 1)

    return helper(0)`,
    solutionVariants: [
      variant(
        "Count current plus rest",
        `def count_target_occurrences(nums: list[int], target: int) -> int:
    def helper(index: int) -> int:
        if index == len(nums):
            return 0
        current = 1 if nums[index] == target else 0
        return current + helper(index + 1)

    return helper(0)`,
        "The current frame contributes one count when it matches target, then adds the count returned by the suffix.",
      ),
      variant(
        "Slicing recursion (not optimal)",
        `def count_target_occurrences(nums: list[int], target: int) -> int:
    if not nums:
        return 0

    current = 1 if nums[0] == target else 0
    return current + count_target_occurrences(nums[1:], target)`,
        "This follows the same current-plus-rest idea, but it passes a copied suffix on every call. The copying makes it much more expensive than carrying an index.",
        "Time O(n^2), Space O(n^2) from copied slices plus recursion stack",
      ),
    ],
    usage: "Pattern: count current plus rest. Learning prompt: what value should the current frame contribute on a miss?",
    tags: [...ARRAY_TAGS, "array-recursion", "count-current-plus-rest"],
  },
  {
    name: "Find Maximum",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return the largest value in a non-empty array using recursion.

Each call compares the current element with the maximum value returned by the recursive call for the rest of the array.

Example:
Input: nums = [3, 9, 2, 7]
Output: 9

Constraints:
- 1 <= len(nums) <= 1000
- Values may be negative.`,
    code: `def find_maximum(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_find_maximum_basic():
    assert find_maximum([3, 9, 2, 7]) == 9

def test_find_maximum_single():
    assert find_maximum([5]) == 5

def test_find_maximum_negatives():
    assert find_maximum([-8, -3, -10]) == -3

def test_find_maximum_at_end():
    assert find_maximum([1, 2, 3, 4]) == 4`,
    solution: `def find_maximum(nums: list[int]) -> int:
    def helper(index: int) -> int:
        if index == len(nums) - 1:
            return nums[index]
        return max(nums[index], helper(index + 1))

    return helper(0)`,
    solutionVariants: [
      variant(
        "Compare recursive result",
        `def find_maximum(nums: list[int]) -> int:
    def helper(index: int) -> int:
        if index == len(nums) - 1:
            return nums[index]
        return max(nums[index], helper(index + 1))

    return helper(0)`,
        "The recursive call returns the maximum from the suffix after index. Compare that result with nums[index].",
      ),
      variant(
        "Slicing recursion (not optimal)",
        `def find_maximum(nums: list[int]) -> int:
    if len(nums) == 1:
        return nums[0]

    return max(nums[0], find_maximum(nums[1:]))`,
        "This works by asking for the maximum of the copied suffix. It is not optimal because each nums[1:] slice copies almost the whole remaining list.",
        "Time O(n^2), Space O(n^2) from copied slices plus recursion stack",
      ),
    ],
    usage: "Pattern: compare recursive result. Learning prompt: why is the last element a useful base case?",
    tags: [...ARRAY_TAGS, "array-recursion", "compare-recursive-result"],
  },
  {
    name: "Check If Sorted",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return True if an array is sorted in non-decreasing order.

This teaches neighbor comparison. Each call checks the current pair, then asks recursion whether the rest is sorted.

Example:
Input: nums = [1, 2, 2, 4]
Output: True

Example:
Input: nums = [1, 3, 2]
Output: False

Constraints:
- 0 <= len(nums) <= 1000
- Empty and single-item arrays are sorted.`,
    code: `def is_sorted(nums: list[int]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_is_sorted_true():
    assert is_sorted([1, 2, 2, 4]) is True

def test_is_sorted_false():
    assert is_sorted([1, 3, 2]) is False

def test_is_sorted_empty():
    assert is_sorted([]) is True

def test_is_sorted_single():
    assert is_sorted([7]) is True`,
    solution: `def is_sorted(nums: list[int]) -> bool:
    def helper(index: int) -> bool:
        if index >= len(nums) - 1:
            return True
        if nums[index] > nums[index + 1]:
            return False
        return helper(index + 1)

    return helper(0)`,
    solutionVariants: [
      variant(
        "Compare neighbors",
        `def is_sorted(nums: list[int]) -> bool:
    def helper(index: int) -> bool:
        if index >= len(nums) - 1:
            return True
        if nums[index] > nums[index + 1]:
            return False
        return helper(index + 1)

    return helper(0)`,
        "Every adjacent pair must be ordered. A bad pair returns False immediately; otherwise recursion checks the next pair.",
      ),
      variant(
        "Slicing recursion (not optimal)",
        `def is_sorted(nums: list[int]) -> bool:
    if len(nums) <= 1:
        return True
    if nums[0] > nums[1]:
        return False
    return is_sorted(nums[1:])`,
        "This mirrors the neighbor comparison idea, but it copies the suffix after every successful pair check. The index version avoids those repeated copies.",
        "Time O(n^2), Space O(n^2) from copied slices plus recursion stack",
      ),
    ],
    usage: "Pattern: compare neighbors. Learning prompt: why does reaching the last index mean the array is sorted?",
    tags: [...ARRAY_TAGS, "array-recursion", "compare-neighbors"],
  },
  {
    name: "First Index of Target",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return the first index where target appears in an array, or -1 if it does not appear.

This combines boolean search with returning useful data. A match returns the current index; otherwise recursion searches the rest.

Example:
Input: nums = [5, 1, 5, 2], target = 5
Output: 0

Example:
Input: nums = [5, 1, 5, 2], target = 9
Output: -1

Constraints:
- 0 <= len(nums) <= 1000
- Values may be negative.`,
    code: `def first_index_of_target(nums: list[int], target: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_first_index_of_target_first():
    assert first_index_of_target([5, 1, 5, 2], 5) == 0

def test_first_index_of_target_later():
    assert first_index_of_target([5, 1, 5, 2], 2) == 3

def test_first_index_of_target_absent():
    assert first_index_of_target([5, 1, 5, 2], 9) == -1

def test_first_index_of_target_empty():
    assert first_index_of_target([], 1) == -1`,
    solution: `def first_index_of_target(nums: list[int], target: int) -> int:
    def helper(index: int) -> int:
        if index == len(nums):
            return -1
        if nums[index] == target:
            return index
        return helper(index + 1)

    return helper(0)`,
    solutionVariants: [
      variant(
        "Return index or -1",
        `def first_index_of_target(nums: list[int], target: int) -> int:
    def helper(index: int) -> int:
        if index == len(nums):
            return -1
        if nums[index] == target:
            return index
        return helper(index + 1)

    return helper(0)`,
        "The current frame can return its own index on a match. If not, it delegates the answer to the recursive call.",
      ),
      variant(
        "Slicing recursion (not optimal)",
        `def first_index_of_target(nums: list[int], target: int) -> int:
    if not nums:
        return -1
    if nums[0] == target:
        return 0

    result = first_index_of_target(nums[1:], target)
    if result == -1:
        return -1
    return result + 1`,
        "This works, but slicing loses the original index positions. The returned index from the suffix must be shifted by 1, and nums[1:] still copies the rest of the list every time.",
        "Time O(n^2), Space O(n^2) from copied slices plus recursion stack",
      ),
    ],
    usage: "Pattern: return index or -1. Learning prompt: why does this return the first matching index rather than any matching index?",
    tags: [...ARRAY_TAGS, "array-recursion", "return-index-or-minus-one"],
  },
  {
    name: "Last Index of Target",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return the last index where target appears in an array, or -1 if it does not appear.

This is the mirror of First Index of Target. Search from the right side so the first match you find is the last occurrence in the original array.

Example:
Input: nums = [5, 1, 5, 2], target = 5
Output: 2

Example:
Input: nums = [5, 1, 5, 2], target = 9
Output: -1

Constraints:
- 0 <= len(nums) <= 1000
- Values may be negative.`,
    code: `def last_index_of_target(nums: list[int], target: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_last_index_of_target_repeated():
    assert last_index_of_target([5, 1, 5, 2], 5) == 2

def test_last_index_of_target_last():
    assert last_index_of_target([5, 1, 5, 2], 2) == 3

def test_last_index_of_target_absent():
    assert last_index_of_target([5, 1, 5, 2], 9) == -1

def test_last_index_of_target_empty():
    assert last_index_of_target([], 1) == -1`,
    solution: `def last_index_of_target(nums: list[int], target: int) -> int:
    def helper(index: int) -> int:
        if index < 0:
            return -1
        if nums[index] == target:
            return index
        return helper(index - 1)

    return helper(len(nums) - 1)`,
    solutionVariants: [
      variant(
        "Search backward",
        `def last_index_of_target(nums: list[int], target: int) -> int:
    def helper(index: int) -> int:
        if index < 0:
            return -1
        if nums[index] == target:
            return index
        return helper(index - 1)

    return helper(len(nums) - 1)`,
        "Starting at the final index makes the first match from this direction the last occurrence in the original array.",
      ),
      variant(
        "Slicing recursion (not optimal)",
        `def last_index_of_target(nums: list[int], target: int) -> int:
    if not nums:
        return -1
    if nums[-1] == target:
        return len(nums) - 1
    return last_index_of_target(nums[:-1], target)`,
        "This works by removing the last item after checking it. It is not optimal because nums[:-1] copies the prefix on every recursive call.",
        "Time O(n^2), Space O(n^2) from copied slices plus recursion stack",
      ),
    ],
    usage: "Pattern: search backward. Learning prompt: why does starting at len(nums) - 1 change which matching index is returned?",
    tags: [...ARRAY_TAGS, "array-recursion", "return-index-or-minus-one", "reverse-index-recursion"],
  },
  {
    name: "All Indices of Target",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return a list of every index where target appears in an array.

Each recursive frame decides whether the current index belongs in the answer, then combines that with the indices found later.

Example:
Input: nums = [5, 1, 5, 2, 5], target = 5
Output: [0, 2, 4]

Example:
Input: nums = [1, 2, 3], target = 9
Output: []

Constraints:
- 0 <= len(nums) <= 1000
- Values may be negative.`,
    code: `def all_indices_of_target(nums: list[int], target: int) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_all_indices_of_target_repeated():
    assert all_indices_of_target([5, 1, 5, 2, 5], 5) == [0, 2, 4]

def test_all_indices_of_target_absent():
    assert all_indices_of_target([1, 2, 3], 9) == []

def test_all_indices_of_target_all():
    assert all_indices_of_target([4, 4, 4], 4) == [0, 1, 2]

def test_all_indices_of_target_empty():
    assert all_indices_of_target([], 1) == []`,
    solution: `def all_indices_of_target(nums: list[int], target: int) -> list[int]:
    def helper(index: int) -> list[int]:
        if index == len(nums):
            return []
        rest = helper(index + 1)
        if nums[index] == target:
            return [index] + rest
        return rest

    return helper(0)`,
    solutionVariants: [
      variant(
        "Collect current plus rest",
        `def all_indices_of_target(nums: list[int], target: int) -> list[int]:
    def helper(index: int) -> list[int]:
        if index == len(nums):
            return []
        rest = helper(index + 1)
        if nums[index] == target:
            return [index] + rest
        return rest

    return helper(0)`,
        "The recursive call returns all matching indices after the current one. A matching current index is prepended to keep the result in left-to-right order.",
      ),
      variant(
        "Slicing recursion with offset (not optimal)",
        `def all_indices_of_target(nums: list[int], target: int) -> list[int]:
    def helper(remaining: list[int], offset: int) -> list[int]:
        if not remaining:
            return []

        rest = helper(remaining[1:], offset + 1)
        if remaining[0] == target:
            return [offset] + rest
        return rest

    return helper(nums, 0)`,
        "The offset preserves original indices after slicing. It is still not optimal because remaining[1:] copies a suffix at every level, and [offset] + rest copies the partial result on matches.",
        "Time O(n^2), Space O(n^2) from copied slices and list concatenation plus recursion stack",
      ),
    ],
    usage: "Pattern: collect current plus rest. Learning prompt: why does prepending the current index preserve sorted index order?",
    tags: [...ARRAY_TAGS, "array-recursion", "collect-current-plus-rest"],
  },
  {
    name: "Reverse Array Recursively",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return a new array with the input values in reverse order.

This practices building a result from recursive calls. Move through the array with an index, then place the current value after the reversed suffix.

Example:
Input: nums = [1, 2, 3]
Output: [3, 2, 1]

Constraints:
- 0 <= len(nums) <= 1000
- Do not call reversed() or use nums[::-1].`,
    code: `def reverse_array(nums: list[int]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_reverse_array_basic():
    assert reverse_array([1, 2, 3]) == [3, 2, 1]

def test_reverse_array_empty():
    assert reverse_array([]) == []

def test_reverse_array_single():
    assert reverse_array([7]) == [7]

def test_reverse_array_mixed_values():
    assert reverse_array([4, -1, 0, 9]) == [9, 0, -1, 4]`,
    solution: `def reverse_array(nums: list[int]) -> list[int]:
    def helper(index: int) -> list[int]:
        if index == len(nums):
            return []
        return helper(index + 1) + [nums[index]]

    return helper(0)`,
    solutionVariants: [
      variant(
        "Build reversed suffix",
        `def reverse_array(nums: list[int]) -> list[int]:
    def helper(index: int) -> list[int]:
        if index == len(nums):
            return []
        return helper(index + 1) + [nums[index]]

    return helper(0)`,
        "The recursive call reverses the suffix after index. Appending nums[index] after that suffix places the current value at the end of the reversed result.",
        "Time O(n^2), Space O(n^2) from repeated list concatenation plus recursion stack",
      ),
      variant(
        "Slicing recursion (not optimal)",
        `def reverse_array(nums: list[int]) -> list[int]:
    if not nums:
        return []

    return [nums[-1]] + reverse_array(nums[:-1])`,
        "This is compact, but it copies in two places: nums[:-1] copies the prefix and [nums[-1]] + ... copies the growing result. A helper that fills an output list avoids that repeated copying.",
        "Time O(n^2), Space O(n^2) from copied slices and list concatenation plus recursion stack",
      ),
    ],
    usage: "Pattern: build result from the recursive suffix. Learning prompt: why does the current value get added after the recursive call returns?",
    tags: [...ARRAY_TAGS, "array-recursion", "build-result", "suffix-recursion"],
  },
  {
    name: "Count Characters",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return how many characters are in a string using recursion.

This starts string recursion. The index marks which character is current, and reaching the string length means there are no characters left.

Example:
Input: text = "code"
Output: 4

Constraints:
- 0 <= len(text) <= 1000
- Spaces and punctuation count as characters.`,
    code: `def count_characters(text: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_characters_basic():
    assert count_characters("code") == 4

def test_count_characters_empty():
    assert count_characters("") == 0

def test_count_characters_single():
    assert count_characters("x") == 1

def test_count_characters_spaces():
    assert count_characters("a b!") == 4`,
    solution: `def count_characters(text: str) -> int:
    def helper(index: int) -> int:
        if index == len(text):
            return 0
        return 1 + helper(index + 1)

    return helper(0)`,
    solutionVariants: [
      variant(
        "Index recursion",
        `def count_characters(text: str) -> int:
    def helper(index: int) -> int:
        if index == len(text):
            return 0
        return 1 + helper(index + 1)

    return helper(0)`,
        "Each valid index contributes one character. The base case returns 0 after the last character.",
      ),
    ],
    usage: "Pattern: index recursion. Learning prompt: what is the base case for an empty suffix?",
    tags: [...STRING_TAGS, "string-recursion", "index-recursion"],
  },
  {
    name: "Count Vowels",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return how many vowels appear in a string.

Each recursive frame decides whether the current character contributes 1, then adds the count from the rest of the string.

Example:
Input: text = "recursion"
Output: 4

Constraints:
- 0 <= len(text) <= 1000
- Count a, e, i, o, u in either lowercase or uppercase.`,
    code: `def count_vowels(text: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_vowels_basic():
    assert count_vowels("recursion") == 4

def test_count_vowels_empty():
    assert count_vowels("") == 0

def test_count_vowels_uppercase():
    assert count_vowels("AEIoU") == 5

def test_count_vowels_none():
    assert count_vowels("rhythm") == 0`,
    solution: `def count_vowels(text: str) -> int:
    vowels = set("aeiouAEIOU")

    def helper(index: int) -> int:
        if index == len(text):
            return 0
        current = 1 if text[index] in vowels else 0
        return current + helper(index + 1)

    return helper(0)`,
    solutionVariants: [
      variant(
        "Conditional count",
        `def count_vowels(text: str) -> int:
    vowels = set("aeiouAEIOU")

    def helper(index: int) -> int:
        if index == len(text):
            return 0
        current = 1 if text[index] in vowels else 0
        return current + helper(index + 1)

    return helper(0)`,
        "The current character contributes one only when it is a vowel. Recursion counts the remaining suffix.",
      ),
    ],
    usage: "Pattern: conditional count. Learning prompt: what should the current frame add for a consonant?",
    tags: [...STRING_TAGS, "string-recursion", "conditional-count"],
  },
  {
    name: "Count Character Occurrences",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return how many times target appears in a string.

This mirrors Count Target Occurrences for arrays, but now each recursive frame inspects one character.

Example:
Input: text = "banana", target = "a"
Output: 3

Constraints:
- 0 <= len(text) <= 1000
- target is a single character.`,
    code: `def count_character_occurrences(text: str, target: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_character_occurrences_basic():
    assert count_character_occurrences("banana", "a") == 3

def test_count_character_occurrences_absent():
    assert count_character_occurrences("banana", "x") == 0

def test_count_character_occurrences_empty():
    assert count_character_occurrences("", "a") == 0

def test_count_character_occurrences_case_sensitive():
    assert count_character_occurrences("AaA", "A") == 2`,
    solution: `def count_character_occurrences(text: str, target: str) -> int:
    def helper(index: int) -> int:
        if index == len(text):
            return 0
        current = 1 if text[index] == target else 0
        return current + helper(index + 1)

    return helper(0)`,
    solutionVariants: [
      variant(
        "Conditional count",
        `def count_character_occurrences(text: str, target: str) -> int:
    def helper(index: int) -> int:
        if index == len(text):
            return 0
        current = 1 if text[index] == target else 0
        return current + helper(index + 1)

    return helper(0)`,
        "Each frame contributes one when the current character matches target, then adds the recursive count from the suffix.",
      ),
    ],
    usage: "Pattern: conditional count. Learning prompt: how is this the same shape as counting target values in an array?",
    tags: [...STRING_TAGS, "string-recursion", "conditional-count"],
  },
  {
    name: "Reverse String",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return a new string with the input characters in reverse order.

This is a build-result recursion problem. Recurse on the suffix first, then append the current character after the reversed suffix.

Example:
Input: text = "code"
Output: "edoc"

Constraints:
- 0 <= len(text) <= 1000
- Return a new string; do not mutate a list in place.`,
    code: `def reverse_string(text: str) -> str:
    raise NotImplementedError`,
    testCode: `def test_reverse_string_basic():
    assert reverse_string("code") == "edoc"

def test_reverse_string_empty():
    assert reverse_string("") == ""

def test_reverse_string_single():
    assert reverse_string("x") == "x"

def test_reverse_string_spaces():
    assert reverse_string("a b") == "b a"`,
    solution: `def reverse_string(text: str) -> str:
    if text == "":
        return ""
    return reverse_string(text[1:]) + text[0]`,
    solutionVariants: [
      variant(
        "Build result",
        `def reverse_string(text: str) -> str:
    if text == "":
        return ""
    return reverse_string(text[1:]) + text[0]`,
        "The recursive call reverses the suffix. Appending the first character at the end builds the reversed string.",
        "Time O(n^2), Space O(n) recursion stack because slicing and concatenation copy strings",
      ),
    ],
    usage: "Pattern: build result. Learning prompt: why does the current character get added after the recursive call?",
    tags: [...STRING_TAGS, "string-recursion", "build-result"],
  },
  {
    name: "Palindrome Check",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return True if a string reads the same forward and backward.

This is two-pointer recursion. Compare the outside characters, then move both pointers inward.

Example:
Input: text = "racecar"
Output: True

Example:
Input: text = "python"
Output: False

Constraints:
- 0 <= len(text) <= 1000
- Compare characters exactly; do not ignore spaces, punctuation, or case.`,
    code: `def is_palindrome(text: str) -> bool:
    raise NotImplementedError`,
    testCode: `def test_is_palindrome_odd():
    assert is_palindrome("racecar") is True

def test_is_palindrome_even():
    assert is_palindrome("abba") is True

def test_is_palindrome_false():
    assert is_palindrome("python") is False

def test_is_palindrome_empty():
    assert is_palindrome("") is True`,
    solution: `def is_palindrome(text: str) -> bool:
    def helper(left: int, right: int) -> bool:
        if left >= right:
            return True
        if text[left] != text[right]:
            return False
        return helper(left + 1, right - 1)

    return helper(0, len(text) - 1)`,
    solutionVariants: [
      variant(
        "Two-pointer recursion",
        `def is_palindrome(text: str) -> bool:
    def helper(left: int, right: int) -> bool:
        if left >= right:
            return True
        if text[left] != text[right]:
            return False
        return helper(left + 1, right - 1)

    return helper(0, len(text) - 1)`,
        "Each call validates a matching outside pair. If the pair matches, recursion checks the smaller inside substring.",
      ),
    ],
    usage: "Pattern: two-pointer recursion. Learning prompt: why is left >= right a successful base case?",
    tags: [...STRING_TAGS, "string-recursion", "two-pointer-recursion"],
  },
  {
    name: "Remove Character",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return a new string with every occurrence of target removed.

This is recursive string building. Each frame decides whether to keep the current character, then combines that decision with the transformed suffix.

Example:
Input: text = "banana", target = "a"
Output: "bnn"

Constraints:
- 0 <= len(text) <= 1000
- target is a single character.`,
    code: `def remove_character(text: str, target: str) -> str:
    raise NotImplementedError`,
    testCode: `def test_remove_character_basic():
    assert remove_character("banana", "a") == "bnn"

def test_remove_character_absent():
    assert remove_character("banana", "x") == "banana"

def test_remove_character_all():
    assert remove_character("aaa", "a") == ""

def test_remove_character_empty():
    assert remove_character("", "a") == ""`,
    solution: `def remove_character(text: str, target: str) -> str:
    if text == "":
        return ""
    rest = remove_character(text[1:], target)
    if text[0] == target:
        return rest
    return text[0] + rest`,
    solutionVariants: [
      variant(
        "Recursive string building",
        `def remove_character(text: str, target: str) -> str:
    if text == "":
        return ""
    rest = remove_character(text[1:], target)
    if text[0] == target:
        return rest
    return text[0] + rest`,
        "The recursive call removes target from the suffix. The current character is prepended only when it should be kept.",
        "Time O(n^2), Space O(n) recursion stack because slicing and concatenation copy strings",
      ),
    ],
    usage: "Pattern: recursive string building. Learning prompt: when should the current frame return only the recursive result?",
    tags: [...STRING_TAGS, "string-recursion", "recursive-string-building"],
  },
  {
    name: "Replace Character",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return a new string where every occurrence of old is replaced with new.

This is recursive transformation. Each frame transforms the current character if needed, then prepends it to the transformed suffix.

Example:
Input: text = "banana", old = "a", new = "o"
Output: "bonono"

Constraints:
- 0 <= len(text) <= 1000
- old and new are single characters.`,
    code: `def replace_character(text: str, old: str, new: str) -> str:
    raise NotImplementedError`,
    testCode: `def test_replace_character_basic():
    assert replace_character("banana", "a", "o") == "bonono"

def test_replace_character_absent():
    assert replace_character("banana", "x", "o") == "banana"

def test_replace_character_all():
    assert replace_character("aaa", "a", "b") == "bbb"

def test_replace_character_empty():
    assert replace_character("", "a", "b") == ""`,
    solution: `def replace_character(text: str, old: str, new: str) -> str:
    if text == "":
        return ""
    current = new if text[0] == old else text[0]
    return current + replace_character(text[1:], old, new)`,
    solutionVariants: [
      variant(
        "Recursive transformation",
        `def replace_character(text: str, old: str, new: str) -> str:
    if text == "":
        return ""
    current = new if text[0] == old else text[0]
    return current + replace_character(text[1:], old, new)`,
        "The current frame transforms one character. The recursive call transforms the remaining suffix.",
        "Time O(n^2), Space O(n) recursion stack because slicing and concatenation copy strings",
      ),
    ],
    usage: "Pattern: recursive transformation. Learning prompt: what does current represent before it is combined with the recursive result?",
    tags: [...STRING_TAGS, "string-recursion", "recursive-transformation"],
  },
  {
    name: "Fibonacci Number (Recursive)",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return the n-th Fibonacci number using direct recursion.

This introduces branching recursion: most calls split into two smaller recursive calls. This version is intentionally not optimized so the call tree is visible.

Example:
Input: n = 6
Output: 8

Constraints:
- 0 <= n <= 20
- fib(0) is 0 and fib(1) is 1.`,
    code: `def fib_recursive(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_fib_recursive_zero():
    assert fib_recursive(0) == 0

def test_fib_recursive_one():
    assert fib_recursive(1) == 1

def test_fib_recursive_six():
    assert fib_recursive(6) == 8

def test_fib_recursive_ten():
    assert fib_recursive(10) == 55`,
    solution: `def fib_recursive(n: int) -> int:
    if n < 2:
        return n
    return fib_recursive(n - 1) + fib_recursive(n - 2)`,
    solutionVariants: [
      variant(
        "Two recursive calls",
        `def fib_recursive(n: int) -> int:
    if n < 2:
        return n
    return fib_recursive(n - 1) + fib_recursive(n - 2)`,
        "Each non-base call branches into the two previous Fibonacci values. This is useful for learning the call tree before memoization.",
        "Time O(2^n), Space O(n) recursion stack",
      ),
    ],
    usage: "Pattern: two recursive calls. Learning prompt: how many calls does fib_recursive(5) create before base cases return?",
    tags: [...BRANCHING_TAGS, "branching-recursion", "two-recursive-calls"],
  },
  {
    name: "Climbing Stairs (Recursive Choices)",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return how many ways there are to climb n stairs when each move can take 1 or 2 steps.

This is choice recursion: from each remaining step count, choose a 1-step move or a 2-step move.

Example:
Input: n = 4
Output: 5

Constraints:
- 0 <= n <= 25
- There is one way to climb 0 remaining steps: do nothing.`,
    code: `def climb_stairs_recursive(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_climb_stairs_recursive_zero():
    assert climb_stairs_recursive(0) == 1

def test_climb_stairs_recursive_one():
    assert climb_stairs_recursive(1) == 1

def test_climb_stairs_recursive_two():
    assert climb_stairs_recursive(2) == 2

def test_climb_stairs_recursive_five():
    assert climb_stairs_recursive(5) == 8`,
    solution: `def climb_stairs_recursive(n: int) -> int:
    if n == 0:
        return 1
    if n < 0:
        return 0
    return climb_stairs_recursive(n - 1) + climb_stairs_recursive(n - 2)`,
    solutionVariants: [
      variant(
        "Take 1 or 2 steps",
        `def climb_stairs_recursive(n: int) -> int:
    if n == 0:
        return 1
    if n < 0:
        return 0
    return climb_stairs_recursive(n - 1) + climb_stairs_recursive(n - 2)`,
        "A complete path contributes 1 when remaining steps reaches 0. Overshooting contributes 0. Otherwise, branch into the two allowed choices.",
        "Time O(2^n), Space O(n) recursion stack",
      ),
    ],
    usage: "Pattern: take 1 or 2 steps. Learning prompt: why does n == 0 return 1 instead of 0?",
    tags: [...BRANCHING_TAGS, "branching-recursion", "choice-recursion"],
  },
  {
    name: "Count Ways to Reach N",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return how many ways there are to reach exactly n using moves of 1, 2, or 3.

This extends Climbing Stairs to multiple choices. Each call branches into every allowed move.

Example:
Input: n = 4
Output: 7

Constraints:
- 0 <= n <= 20
- Reaching exactly 0 remaining distance counts as one valid way.`,
    code: `def count_ways_to_reach_n(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_ways_to_reach_n_zero():
    assert count_ways_to_reach_n(0) == 1

def test_count_ways_to_reach_n_one():
    assert count_ways_to_reach_n(1) == 1

def test_count_ways_to_reach_n_three():
    assert count_ways_to_reach_n(3) == 4

def test_count_ways_to_reach_n_four():
    assert count_ways_to_reach_n(4) == 7`,
    solution: `def count_ways_to_reach_n(n: int) -> int:
    if n == 0:
        return 1
    if n < 0:
        return 0
    return (
        count_ways_to_reach_n(n - 1)
        + count_ways_to_reach_n(n - 2)
        + count_ways_to_reach_n(n - 3)
    )`,
    solutionVariants: [
      variant(
        "Multiple choices",
        `def count_ways_to_reach_n(n: int) -> int:
    if n == 0:
        return 1
    if n < 0:
        return 0
    return (
        count_ways_to_reach_n(n - 1)
        + count_ways_to_reach_n(n - 2)
        + count_ways_to_reach_n(n - 3)
    )`,
        "Every call tries each possible move. Valid branches that land exactly on 0 contribute one way.",
        "Time O(3^n), Space O(n) recursion stack",
      ),
    ],
    usage: "Pattern: multiple choices. Learning prompt: what changes if you add or remove an allowed move?",
    tags: [...BRANCHING_TAGS, "branching-recursion", "multiple-choices"],
  },
  {
    name: "Generate Binary Strings (Recursive Choices)",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return every binary string of length n in lexicographic order.

This is generation by choice recursion. At each position, choose 0 or choose 1, then recurse to fill the next position.

Example:
Input: n = 2
Output: ["00", "01", "10", "11"]

Constraints:
- 0 <= n <= 12
- For n = 0, return [""] because there is one empty string.`,
    code: `def generate_binary_strings_recursive(n: int) -> list[str]:
    raise NotImplementedError`,
    testCode: `def test_generate_binary_strings_recursive_zero():
    assert generate_binary_strings_recursive(0) == [""]

def test_generate_binary_strings_recursive_one():
    assert generate_binary_strings_recursive(1) == ["0", "1"]

def test_generate_binary_strings_recursive_two():
    assert generate_binary_strings_recursive(2) == ["00", "01", "10", "11"]

def test_generate_binary_strings_recursive_count():
    assert len(generate_binary_strings_recursive(4)) == 16`,
    solution: `def generate_binary_strings_recursive(n: int) -> list[str]:
    if n == 0:
        return [""]

    smaller = generate_binary_strings_recursive(n - 1)
    result = []
    for suffix in smaller:
        result.append("0" + suffix)
    for suffix in smaller:
        result.append("1" + suffix)
    return result`,
    solutionVariants: [
      variant(
        "Choose 0 or 1",
        `def generate_binary_strings_recursive(n: int) -> list[str]:
    if n == 0:
        return [""]

    smaller = generate_binary_strings_recursive(n - 1)
    result = []
    for suffix in smaller:
        result.append("0" + suffix)
    for suffix in smaller:
        result.append("1" + suffix)
    return result`,
        "The recursive call generates all suffixes of length n - 1. Prefix every suffix with 0 first, then every suffix with 1, to keep lexicographic order.",
        "Time O(n * 2^n), Space O(n * 2^n) output plus O(n) recursion stack",
      ),
    ],
    usage: "Pattern: choose 0 or 1. Learning prompt: why is the n == 0 result one empty string rather than an empty list?",
    tags: [...BRANCHING_TAGS, "branching-recursion", "generate-choices"],
  },
  {
    name: "Generate Coin Flip Outcomes",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return every possible outcome of flipping n coins.

Each position branches into Heads or Tails. Return outcomes in H-before-T order.

Example:
Input: n = 2
Output: ["HH", "HT", "TH", "TT"]

Constraints:
- 0 <= n <= 12
- For n = 0, return [""] because there is one empty sequence of flips.`,
    code: `def generate_coin_flip_outcomes(n: int) -> list[str]:
    raise NotImplementedError`,
    testCode: `def test_generate_coin_flip_outcomes_zero():
    assert generate_coin_flip_outcomes(0) == [""]

def test_generate_coin_flip_outcomes_one():
    assert generate_coin_flip_outcomes(1) == ["H", "T"]

def test_generate_coin_flip_outcomes_two():
    assert generate_coin_flip_outcomes(2) == ["HH", "HT", "TH", "TT"]

def test_generate_coin_flip_outcomes_count():
    assert len(generate_coin_flip_outcomes(4)) == 16`,
    solution: `def generate_coin_flip_outcomes(n: int) -> list[str]:
    if n == 0:
        return [""]

    smaller = generate_coin_flip_outcomes(n - 1)
    result = []
    for suffix in smaller:
        result.append("H" + suffix)
    for suffix in smaller:
        result.append("T" + suffix)
    return result`,
    solutionVariants: [
      variant(
        "Heads or tails",
        `def generate_coin_flip_outcomes(n: int) -> list[str]:
    if n == 0:
        return [""]

    smaller = generate_coin_flip_outcomes(n - 1)
    result = []
    for suffix in smaller:
        result.append("H" + suffix)
    for suffix in smaller:
        result.append("T" + suffix)
    return result`,
        "The recursive call builds the shorter outcomes. Prefix every suffix with Heads first, then every suffix with Tails, to preserve H-before-T order.",
        "Time O(n * 2^n), Space O(n * 2^n) output plus O(n) recursion stack",
      ),
    ],
    usage: "Pattern: heads or tails. Learning prompt: how is this the same recursion tree as binary strings?",
    tags: [...BRANCHING_TAGS, "branching-recursion", "generate-choices"],
  },
  {
    name: "Count Nodes (Recursive)",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return the total number of nodes in a binary tree.

This is the first binary-tree recursion drill: an empty subtree has size 0, and a real node contributes 1 plus the sizes of its left and right subtrees.

Example:
Input: root = [1, 2, 3, None, None, 4]
Output: 4

Constraints:
- 0 <= number of nodes <= 10,000
- An empty tree returns 0.`,
    code: `def count_nodes_recursive(root) -> int:
    raise NotImplementedError`,
    testCode: `${TREE_TEST_HEADER}def test_count_nodes_recursive_basic():
    assert count_nodes_recursive(make_tree([1, 2, 3, None, None, 4])) == 4

def test_count_nodes_recursive_single():
    assert count_nodes_recursive(make_tree([1])) == 1

def test_count_nodes_recursive_empty():
    assert count_nodes_recursive(make_tree([])) == 0

def test_count_nodes_recursive_full():
    assert count_nodes_recursive(make_tree([1, 2, 3, 4, 5, 6, 7])) == 7`,
    solution: `def count_nodes_recursive(root) -> int:
    if root is None:
        return 0
    return 1 + count_nodes_recursive(root.left) + count_nodes_recursive(root.right)`,
    solutionVariants: [
      variant(
        "Root + left + right",
        `def count_nodes_recursive(root) -> int:
    if root is None:
        return 0
    return 1 + count_nodes_recursive(root.left) + count_nodes_recursive(root.right)`,
        "The base case treats an empty child pointer as zero nodes. Every non-empty node adds itself to the counts returned by both recursive calls.",
        "Time O(n), Space O(h) recursion stack",
      ),
    ],
    usage: "Pattern: root + left + right. Learning prompt: what value should a missing child contribute to the parent?",
    tags: [...BINARY_TREE_TAGS, "binary-tree", "tree-recursion"],
  },
  {
    name: "Sum Tree Values",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return the sum of every value in a binary tree.

The recursive shape matches Count Nodes, but each real node contributes its value instead of the constant 1.

Example:
Input: root = [5, 2, 7]
Output: 14

Constraints:
- 0 <= number of nodes <= 10,000
- Values may be negative
- An empty tree returns 0.`,
    code: `def sum_tree_values(root) -> int:
    raise NotImplementedError`,
    testCode: `${TREE_TEST_HEADER}def test_sum_tree_values_basic():
    assert sum_tree_values(make_tree([5, 2, 7])) == 14

def test_sum_tree_values_single():
    assert sum_tree_values(make_tree([1])) == 1

def test_sum_tree_values_empty():
    assert sum_tree_values(make_tree([])) == 0

def test_sum_tree_values_negatives():
    assert sum_tree_values(make_tree([3, -2, -1])) == 0`,
    solution: `def sum_tree_values(root) -> int:
    if root is None:
        return 0
    return root.val + sum_tree_values(root.left) + sum_tree_values(root.right)`,
    solutionVariants: [
      variant(
        "Root value + subtrees",
        `def sum_tree_values(root) -> int:
    if root is None:
        return 0
    return root.val + sum_tree_values(root.left) + sum_tree_values(root.right)`,
        "Each call asks both subtrees for their sums, then adds the current node's value to combine the complete answer.",
        "Time O(n), Space O(h) recursion stack",
      ),
    ],
    usage: "Pattern: root value + subtrees. Learning prompt: why is 0 the natural return value for an empty subtree?",
    tags: [...BINARY_TREE_TAGS, "binary-tree", "tree-recursion"],
  },
  {
    name: "Find Max in Tree",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return the largest value in a binary tree, or None if the tree is empty.

This drill teaches how to combine optional recursive results. The current node is always a candidate, and each non-empty subtree can produce another candidate.

Example:
Input: root = [4, 9, 2]
Output: 9

Constraints:
- 0 <= number of nodes <= 10,000
- Values may be negative
- An empty tree returns None.`,
    code: `def find_max_in_tree(root):
    raise NotImplementedError`,
    testCode: `${TREE_TEST_HEADER}def test_find_max_in_tree_basic():
    assert find_max_in_tree(make_tree([4, 9, 2])) == 9

def test_find_max_in_tree_single():
    assert find_max_in_tree(make_tree([1])) == 1

def test_find_max_in_tree_negatives():
    assert find_max_in_tree(make_tree([-5, -2, -9])) == -2

def test_find_max_in_tree_empty():
    assert find_max_in_tree(make_tree([])) is None`,
    solution: `def find_max_in_tree(root):
    if root is None:
        return None

    best = root.val
    left = find_max_in_tree(root.left)
    right = find_max_in_tree(root.right)
    if left is not None:
        best = max(best, left)
    if right is not None:
        best = max(best, right)
    return best`,
    solutionVariants: [
      variant(
        "Max of root/left/right",
        `def find_max_in_tree(root):
    if root is None:
        return None

    best = root.val
    left = find_max_in_tree(root.left)
    right = find_max_in_tree(root.right)
    if left is not None:
        best = max(best, left)
    if right is not None:
        best = max(best, right)
    return best`,
        "The empty tree returns None because it has no value to compare. Each real node compares itself with any non-empty subtree maxima.",
        "Time O(n), Space O(h) recursion stack",
      ),
    ],
    usage: "Pattern: max of root/left/right. Learning prompt: why is None safer than 0 for an empty tree with negative values?",
    tags: [...BINARY_TREE_TAGS, "binary-tree", "tree-recursion"],
  },
  {
    name: "Count Leaves (Recursive)",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return the number of leaf nodes in a binary tree.

A leaf is a real node with no left child and no right child. This drill adds a local classification step before recursing into internal nodes.

Example:
Input: root = [1, 2, 3, None, None, 4, 5]
Output: 3

Constraints:
- 0 <= number of nodes <= 10,000
- An empty tree has 0 leaves
- A single node is a leaf.`,
    code: `def count_leaves_recursive(root) -> int:
    raise NotImplementedError`,
    testCode: `${TREE_TEST_HEADER}def test_count_leaves_recursive_basic():
    assert count_leaves_recursive(make_tree([1, 2, 3, None, None, 4, 5])) == 3

def test_count_leaves_recursive_single():
    assert count_leaves_recursive(make_tree([1])) == 1

def test_count_leaves_recursive_empty():
    assert count_leaves_recursive(make_tree([])) == 0

def test_count_leaves_recursive_skewed():
    assert count_leaves_recursive(make_tree([1, 2, None, 3])) == 1`,
    solution: `def count_leaves_recursive(root) -> int:
    if root is None:
        return 0
    if root.left is None and root.right is None:
        return 1
    return count_leaves_recursive(root.left) + count_leaves_recursive(root.right)`,
    solutionVariants: [
      variant(
        "Leaf detection",
        `def count_leaves_recursive(root) -> int:
    if root is None:
        return 0
    if root.left is None and root.right is None:
        return 1
    return count_leaves_recursive(root.left) + count_leaves_recursive(root.right)`,
        "Missing children are not leaves. A real node with no children contributes one leaf; internal nodes combine both subtree counts.",
        "Time O(n), Space O(h) recursion stack",
      ),
    ],
    usage: "Pattern: leaf detection. Learning prompt: why does a missing child return 0 while a childless node returns 1?",
    tags: [...BINARY_TREE_TAGS, "binary-tree", "tree-recursion"],
  },
  {
    name: "Tree Height",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return the height of a binary tree measured in nodes.

An empty tree has height 0. A real node has height 1 plus the larger height of its two subtrees.

Example:
Input: root = [1, 2, 3, 4]
Output: 3

Constraints:
- 0 <= number of nodes <= 10,000
- A single-node tree has height 1.`,
    code: `def tree_height(root) -> int:
    raise NotImplementedError`,
    testCode: `${TREE_TEST_HEADER}def test_tree_height_basic():
    assert tree_height(make_tree([1, 2, 3, 4])) == 3

def test_tree_height_single():
    assert tree_height(make_tree([1])) == 1

def test_tree_height_empty():
    assert tree_height(make_tree([])) == 0

def test_tree_height_balanced():
    assert tree_height(make_tree([1, 2, 3, 4, 5, 6, 7])) == 3`,
    solution: `def tree_height(root) -> int:
    if root is None:
        return 0
    return 1 + max(tree_height(root.left), tree_height(root.right))`,
    solutionVariants: [
      variant(
        "1 + max subtree height",
        `def tree_height(root) -> int:
    if root is None:
        return 0
    return 1 + max(tree_height(root.left), tree_height(root.right))`,
        "The recursive calls compute the height below the current node. The current node adds one level on top of the taller subtree.",
        "Time O(n), Space O(h) recursion stack",
      ),
    ],
    usage: "Pattern: 1 + max subtree height. Learning prompt: what height should a missing child report?",
    tags: [...BINARY_TREE_TAGS, "binary-tree", "tree-recursion"],
  },
  {
    name: "Contains Value in Tree",
    category: "recursion",
    language: "python",
    difficulty: "easy",
    description: `Return True if a binary tree contains target, otherwise return False.

This is recursive search over a general binary tree. Since the tree is not ordered, either subtree could contain the value.

Example:
Input: root = [1, 2, 3, None, None, 4, 5], target = 4
Output: True

Constraints:
- 0 <= number of nodes <= 10,000
- An empty tree contains no values.`,
    code: `def contains_value_in_tree(root, target) -> bool:
    raise NotImplementedError`,
    testCode: `${TREE_TEST_HEADER}def test_contains_value_in_tree_found():
    root = make_tree([1, 2, 3, None, None, 4, 5])
    assert contains_value_in_tree(root, 4) is True

def test_contains_value_in_tree_missing():
    root = make_tree([1, 2, 3, None, None, 4, 5])
    assert contains_value_in_tree(root, 9) is False

def test_contains_value_in_tree_single():
    assert contains_value_in_tree(make_tree([1]), 1) is True

def test_contains_value_in_tree_empty():
    assert contains_value_in_tree(make_tree([]), 1) is False`,
    solution: `def contains_value_in_tree(root, target) -> bool:
    if root is None:
        return False
    if root.val == target:
        return True
    return contains_value_in_tree(root.left, target) or contains_value_in_tree(root.right, target)`,
    solutionVariants: [
      variant(
        "Search recursively",
        `def contains_value_in_tree(root, target) -> bool:
    if root is None:
        return False
    if root.val == target:
        return True
    return contains_value_in_tree(root.left, target) or contains_value_in_tree(root.right, target)`,
        "Check the current node first. If it is not the target, recursively search the left and right subtrees; or short-circuits when a branch succeeds.",
        "Time O(n), Space O(h) recursion stack",
      ),
    ],
    usage: "Pattern: search recursively. Learning prompt: why do we have to search both sides in a non-BST?",
    tags: [...BINARY_TREE_TAGS, "binary-tree", "tree-recursion"],
  },
  {
    name: "Invert Binary Tree (Recursive)",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Invert a binary tree and return its root.

For every node, swap the left and right children, then recursively invert the children below it.

Example:
Input: root = [4, 2, 7, 1, 3, 6, 9]
Output: [4, 7, 2, 9, 6, 3, 1]

Constraints:
- 0 <= number of nodes <= 10,000
- You may mutate the original tree.`,
    code: `def invert_binary_tree_recursive(root):
    raise NotImplementedError`,
    testCode: `${TREE_SERIALIZE_TEST_HEADER}def test_invert_binary_tree_recursive_basic():
    root = make_tree([4, 2, 7, 1, 3, 6, 9])
    inverted = invert_binary_tree_recursive(root)
    assert tree_to_list(inverted) == [4, 7, 2, 9, 6, 3, 1]

def test_invert_binary_tree_recursive_single():
    root = make_tree([1])
    assert tree_to_list(invert_binary_tree_recursive(root)) == [1]

def test_invert_binary_tree_recursive_empty():
    assert invert_binary_tree_recursive(make_tree([])) is None

def test_invert_binary_tree_recursive_sparse():
    root = make_tree([1, 2, None, 3])
    assert tree_to_list(invert_binary_tree_recursive(root)) == [1, None, 2, None, 3]`,
    solution: `def invert_binary_tree_recursive(root):
    if root is None:
        return None

    root.left, root.right = root.right, root.left
    invert_binary_tree_recursive(root.left)
    invert_binary_tree_recursive(root.right)
    return root`,
    solutionVariants: [
      variant(
        "Swap children",
        `def invert_binary_tree_recursive(root):
    if root is None:
        return None

    root.left, root.right = root.right, root.left
    invert_binary_tree_recursive(root.left)
    invert_binary_tree_recursive(root.right)
    return root`,
        "Each node swaps its two child pointers. After the swap, the recursive calls continue down the now-swapped children.",
        "Time O(n), Space O(h) recursion stack",
      ),
    ],
    usage: "Pattern: swap children. Learning prompt: does it matter whether you recurse before or after the swap?",
    tags: [...BINARY_TREE_TAGS, "binary-tree", "tree-recursion"],
  },
  {
    name: "Same Tree (Recursive)",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return True if two binary trees have the same shape and the same values.

This drill compares two recursive structures at the same time. Every pair of nodes must match locally, and both child pairs must match recursively.

Example:
Input: p = [1, 2, 3], q = [1, 2, 3]
Output: True

Constraints:
- 0 <= number of nodes <= 10,000 in each tree
- Values may repeat.`,
    code: `def same_tree_recursive(p, q) -> bool:
    raise NotImplementedError`,
    testCode: `${TREE_TEST_HEADER}def test_same_tree_recursive_same():
    assert same_tree_recursive(make_tree([1, 2, 3]), make_tree([1, 2, 3])) is True

def test_same_tree_recursive_different_values():
    assert same_tree_recursive(make_tree([1, 2, 3]), make_tree([1, 2, 4])) is False

def test_same_tree_recursive_different_shapes():
    assert same_tree_recursive(make_tree([1, 2]), make_tree([1, None, 2])) is False

def test_same_tree_recursive_empty():
    assert same_tree_recursive(make_tree([]), make_tree([])) is True`,
    solution: `def same_tree_recursive(p, q) -> bool:
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    return (
        p.val == q.val
        and same_tree_recursive(p.left, q.left)
        and same_tree_recursive(p.right, q.right)
    )`,
    solutionVariants: [
      variant(
        "Compare two trees",
        `def same_tree_recursive(p, q) -> bool:
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    return (
        p.val == q.val
        and same_tree_recursive(p.left, q.left)
        and same_tree_recursive(p.right, q.right)
    )`,
        "Two empty spots match. One empty spot and one real node do not. Otherwise, values and both matching child pairs must all agree.",
        "Time O(n), Space O(h) recursion stack",
      ),
    ],
    usage: "Pattern: compare two trees. Learning prompt: why are there two different base cases before comparing values?",
    tags: [...BINARY_TREE_TAGS, "binary-tree", "tree-recursion"],
  },
  {
    name: "Generate Subsets",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return every subset of nums.

Each item creates two recursive branches: one branch excludes the item, and one branch includes it. The input values are distinct.

Example:
Input: nums = [1, 2]
Output: [[], [2], [1], [1, 2]]

Constraints:
- 0 <= nums.length <= 12
- Values are distinct
- Any order is accepted.`,
    code: `def generate_subsets(nums: list[int]) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def normalize_subsets(subsets):
    return sorted([tuple(subset) for subset in subsets])

def test_generate_subsets_empty():
    assert generate_subsets([]) == [[]]

def test_generate_subsets_two_items():
    assert normalize_subsets(generate_subsets([1, 2])) == normalize_subsets([[], [1], [2], [1, 2]])

def test_generate_subsets_three_items_count():
    result = generate_subsets([1, 2, 3])
    assert len(result) == 8
    assert normalize_subsets(result) == normalize_subsets([[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]])

def test_generate_subsets_preserves_item_order():
    result = generate_subsets([3, 1])
    assert normalize_subsets(result) == normalize_subsets([[], [3], [1], [3, 1]])`,
    solution: `def generate_subsets(nums: list[int]) -> list[list[int]]:
    result = []

    def dfs(index: int, path: list[int]) -> None:
        if index == len(nums):
            result.append(path.copy())
            return

        dfs(index + 1, path)
        path.append(nums[index])
        dfs(index + 1, path)
        path.pop()

    dfs(0, [])
    return result`,
    solutionVariants: [
      variant(
        "Include / exclude",
        `def generate_subsets(nums: list[int]) -> list[list[int]]:
    result = []

    def dfs(index: int, path: list[int]) -> None:
        if index == len(nums):
            result.append(path.copy())
            return

        dfs(index + 1, path)
        path.append(nums[index])
        dfs(index + 1, path)
        path.pop()

    dfs(0, [])
    return result`,
        "At each index, recurse once without the current item and once with it. The path is copied only when a full decision path reaches the end.",
        "Time O(n * 2^n), Space O(n) recursion stack plus O(n * 2^n) output",
      ),
    ],
    usage: "Pattern: include / exclude. Learning prompt: what does each level of the recursion tree decide?",
    tags: [...BACKTRACKING_TAGS, "backtracking", "include-exclude"],
  },
  {
    name: "Generate Binary Strings of Length N",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return every binary string of length n.

This is the mutable-path version of binary string generation. At each position, choose 0, recurse, undo, then choose 1.

Example:
Input: n = 2
Output: ["00", "01", "10", "11"]

Constraints:
- 0 <= n <= 12
- For n = 0, return [""] because there is one empty string.`,
    code: `def generate_binary_strings_of_length_n(n: int) -> list[str]:
    raise NotImplementedError`,
    testCode: `def test_generate_binary_strings_of_length_n_zero():
    assert generate_binary_strings_of_length_n(0) == [""]

def test_generate_binary_strings_of_length_n_one():
    assert generate_binary_strings_of_length_n(1) == ["0", "1"]

def test_generate_binary_strings_of_length_n_two():
    assert generate_binary_strings_of_length_n(2) == ["00", "01", "10", "11"]

def test_generate_binary_strings_of_length_n_count():
    assert len(generate_binary_strings_of_length_n(4)) == 16`,
    solution: `def generate_binary_strings_of_length_n(n: int) -> list[str]:
    result = []
    path = []

    def dfs() -> None:
        if len(path) == n:
            result.append("".join(path))
            return

        path.append("0")
        dfs()
        path.pop()

        path.append("1")
        dfs()
        path.pop()

    dfs()
    return result`,
    solutionVariants: [
      variant(
        "Choice recursion",
        `def generate_binary_strings_of_length_n(n: int) -> list[str]:
    result = []
    path = []

    def dfs() -> None:
        if len(path) == n:
            result.append("".join(path))
            return

        path.append("0")
        dfs()
        path.pop()

        path.append("1")
        dfs()
        path.pop()

    dfs()
    return result`,
        "The path stores the choices made so far. Each frame appends one choice, explores it recursively, then pops to restore the path before the next choice.",
        "Time O(n * 2^n), Space O(n) recursion stack plus O(n * 2^n) output",
      ),
    ],
    usage: "Pattern: choice recursion. Learning prompt: why do we pop after each recursive call?",
    tags: [...BACKTRACKING_TAGS, "backtracking", "choice-recursion"],
  },
  {
    name: "Generate Permutations",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return every ordering of nums.

At each position, choose one unused item. Mark it used before the recursive call, then unmark it when backtracking.

Example:
Input: nums = [1, 2, 3]
Output contains all 6 permutations.

Constraints:
- 0 <= nums.length <= 8
- Values are distinct
- Any order is accepted.`,
    code: `def generate_permutations(nums: list[int]) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def normalize_permutations(perms):
    return sorted([tuple(perm) for perm in perms])

def test_generate_permutations_empty():
    assert generate_permutations([]) == [[]]

def test_generate_permutations_two_items():
    assert normalize_permutations(generate_permutations([1, 2])) == normalize_permutations([[1, 2], [2, 1]])

def test_generate_permutations_three_items():
    expected = [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
    assert normalize_permutations(generate_permutations([1, 2, 3])) == normalize_permutations(expected)

def test_generate_permutations_count():
    assert len(generate_permutations([1, 2, 3, 4])) == 24`,
    solution: `def generate_permutations(nums: list[int]) -> list[list[int]]:
    result = []
    path = []
    used = [False] * len(nums)

    def dfs() -> None:
        if len(path) == len(nums):
            result.append(path.copy())
            return

        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            dfs()
            path.pop()
            used[i] = False

    dfs()
    return result`,
    solutionVariants: [
      variant(
        "Choose unused item",
        `def generate_permutations(nums: list[int]) -> list[list[int]]:
    result = []
    path = []
    used = [False] * len(nums)

    def dfs() -> None:
        if len(path) == len(nums):
            result.append(path.copy())
            return

        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            dfs()
            path.pop()
            used[i] = False

    dfs()
    return result`,
        "Each recursion level fills the next position. The used array prevents reusing an item, and the pop/unmark pair restores state for the next branch.",
        "Time O(n * n!), Space O(n) recursion stack plus O(n * n!) output",
      ),
    ],
    usage: "Pattern: choose unused item. Learning prompt: what state must be undone after each branch returns?",
    tags: [...BACKTRACKING_TAGS, "backtracking", "permutations"],
  },
  {
    name: "Letter Case Permutation",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return every string formed by toggling the case of each letter in s.

Digits stay unchanged. Letters create two branches: lowercase and uppercase.

Example:
Input: s = "a1b"
Output: ["a1b", "a1B", "A1b", "A1B"]

Constraints:
- 0 <= s.length <= 12
- s contains letters and digits.`,
    code: `def letter_case_permutation(s: str) -> list[str]:
    raise NotImplementedError`,
    testCode: `def test_letter_case_permutation_basic():
    assert sorted(letter_case_permutation("a1b")) == sorted(["a1b", "a1B", "A1b", "A1B"])

def test_letter_case_permutation_digits_only():
    assert letter_case_permutation("123") == ["123"]

def test_letter_case_permutation_empty():
    assert letter_case_permutation("") == [""]

def test_letter_case_permutation_count():
    assert len(letter_case_permutation("ab3c")) == 8`,
    solution: `def letter_case_permutation(s: str) -> list[str]:
    result = []
    path = []

    def dfs(index: int) -> None:
        if index == len(s):
            result.append("".join(path))
            return

        char = s[index]
        if char.isalpha():
            path.append(char.lower())
            dfs(index + 1)
            path.pop()

            path.append(char.upper())
            dfs(index + 1)
            path.pop()
        else:
            path.append(char)
            dfs(index + 1)
            path.pop()

    dfs(0)
    return result`,
    solutionVariants: [
      variant(
        "Branch on letters",
        `def letter_case_permutation(s: str) -> list[str]:
    result = []
    path = []

    def dfs(index: int) -> None:
        if index == len(s):
            result.append("".join(path))
            return

        char = s[index]
        if char.isalpha():
            path.append(char.lower())
            dfs(index + 1)
            path.pop()

            path.append(char.upper())
            dfs(index + 1)
            path.pop()
        else:
            path.append(char)
            dfs(index + 1)
            path.pop()

    dfs(0)
    return result`,
        "Digits have only one path forward. Letters branch into lowercase and uppercase, with path restored after each branch.",
        "Time O(n * 2^l), Space O(n) recursion stack plus O(n * 2^l) output where l is the number of letters",
      ),
    ],
    usage: "Pattern: branch on letters. Learning prompt: why do digits not double the number of outputs?",
    tags: [...BACKTRACKING_TAGS, "backtracking", "case-permutation"],
  },
  {
    name: "Simple Maze Paths",
    category: "recursion",
    language: "python",
    difficulty: "medium",
    description: `Return every path from the top-left corner to the bottom-right corner of a rows by cols grid.

You may only move down or right. Use "D" for down and "R" for right.

Example:
Input: rows = 2, cols = 3
Output: ["DRR", "RDR", "RRD"]

Constraints:
- 1 <= rows, cols <= 8
- Return paths in down-before-right order.`,
    code: `def simple_maze_paths(rows: int, cols: int) -> list[str]:
    raise NotImplementedError`,
    testCode: `def test_simple_maze_paths_single_cell():
    assert simple_maze_paths(1, 1) == [""]

def test_simple_maze_paths_two_by_two():
    assert simple_maze_paths(2, 2) == ["DR", "RD"]

def test_simple_maze_paths_two_by_three():
    assert simple_maze_paths(2, 3) == ["DRR", "RDR", "RRD"]

def test_simple_maze_paths_count():
    assert len(simple_maze_paths(3, 3)) == 6`,
    solution: `def simple_maze_paths(rows: int, cols: int) -> list[str]:
    result = []
    path = []

    def dfs(row: int, col: int) -> None:
        if row == rows - 1 and col == cols - 1:
            result.append("".join(path))
            return

        if row + 1 < rows:
            path.append("D")
            dfs(row + 1, col)
            path.pop()

        if col + 1 < cols:
            path.append("R")
            dfs(row, col + 1)
            path.pop()

    dfs(0, 0)
    return result`,
    solutionVariants: [
      variant(
        "Explore moves",
        `def simple_maze_paths(rows: int, cols: int) -> list[str]:
    result = []
    path = []

    def dfs(row: int, col: int) -> None:
        if row == rows - 1 and col == cols - 1:
            result.append("".join(path))
            return

        if row + 1 < rows:
            path.append("D")
            dfs(row + 1, col)
            path.pop()

        if col + 1 < cols:
            path.append("R")
            dfs(row, col + 1)
            path.pop()

    dfs(0, 0)
    return result`,
        "The recursive state is the current cell plus the path taken so far. Each valid move is tried, explored, then undone before trying the next move.",
        "Time O(p * (rows + cols)), Space O(rows + cols) recursion stack plus output, where p is the number of paths",
      ),
    ],
    usage: "Pattern: explore moves. Learning prompt: which part of the state changes when you move down versus right?",
    tags: [...BACKTRACKING_TAGS, "backtracking", "maze-paths"],
  },
];
