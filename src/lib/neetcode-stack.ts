import type { SeedKata } from "../types/editor";
import { enrichMissingPythonSolutionVariants } from "./python-solution-variants";

const neetcodeStack: SeedKata[] = [
  {
    name: "Valid Parentheses",
    category: "stack",
    language: "python",
    difficulty: "easy",
    description: `Given a string containing only '(', ')', '{', '}', '[', ']', determine if the input string is valid.\n\nA string is valid if:\n- Open brackets are closed by the same type of bracket.\n- Open brackets are closed in the correct order.\n- Every closing bracket has a corresponding open bracket.\n\nExample 1:\nInput: s = "()"\nOutput: True\n\nExample 2:\nInput: s = "()[{}]"\nOutput: True\n\nExample 3:\nInput: s = "(]"\nOutput: False\n\nConstraints:\n- 1 <= s.length <= 10^4\n- s consists only of '()[]{}'.\n\nRef: LeetCode #20 Valid Parentheses`,
    code: `def is_valid(s: str) -> bool:
    raise NotImplementedError`,
    testCode: `def test_valid_parens_simple():
    assert is_valid("()") == True

def test_valid_parens_mixed():
    assert is_valid("()[{}]") == True

def test_valid_parens_invalid():
    assert is_valid("(]") == False

def test_valid_parens_empty():
    assert is_valid("") == True

def test_valid_parens_unclosed():
    assert is_valid("([)") == False`,
    solution: `def is_valid(s: str) -> bool:
    stack = []
    close_to_open = {")": "(", "]": "[", "}": "{"}
    for ch in s:
        if ch in close_to_open:
            if not stack or stack[-1] != close_to_open[ch]:
                return False
            stack.pop()
        else:
            stack.append(ch)
    return len(stack) == 0`,
    usage: null,
    tags: ["stack", "string", "neetcode"],
  },
  {
    name: "Min Stack",
    category: "stack",
    language: "python",
    difficulty: "medium",
    description: `Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement the MinStack class:\n- MinStack() — initializes the stack.\n- push(val) — pushes val onto the stack.\n- pop() — removes the top element.\n- top() — gets the top element.\n- get_min() — retrieves the minimum element.\n\nAll operations must run in O(1) time.\n\nExample:\nms = MinStack()\nms.push(-2)\nms.push(0)\nms.push(-3)\nms.get_min()  # → -3\nms.pop()\nms.top()      # → 0\nms.get_min()  # → -2\n\nRef: LeetCode #155 Min Stack`,
    code: `class MinStack:
    def __init__(self):
        raise NotImplementedError

    def push(self, val: int) -> None:
        raise NotImplementedError

    def pop(self) -> None:
        raise NotImplementedError

    def top(self) -> int:
        raise NotImplementedError

    def get_min(self) -> int:
        raise NotImplementedError`,
    testCode: `def test_min_stack_basic():
    ms = MinStack()
    ms.push(-2)
    ms.push(0)
    ms.push(-3)
    assert ms.get_min() == -3
    ms.pop()
    assert ms.top() == 0
    assert ms.get_min() == -2

def test_min_stack_single():
    ms = MinStack()
    ms.push(5)
    assert ms.top() == 5
    assert ms.get_min() == 5

def test_min_stack_equal_values():
    ms = MinStack()
    ms.push(1)
    ms.push(1)
    assert ms.get_min() == 1
    ms.pop()
    assert ms.get_min() == 1`,
    solution: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        min_val = min(val, self.min_stack[-1] if self.min_stack else val)
        self.min_stack.append(min_val)

    def pop(self) -> None:
        self.stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def get_min(self) -> int:
        return self.min_stack[-1]`,
    usage: null,
    tags: ["stack", "design", "neetcode"],
  },
  {
    name: "Evaluate Reverse Polish Notation",
    category: "stack",
    language: "python",
    difficulty: "medium",
    description: `Evaluate an expression in Reverse Polish Notation (postfix). Valid operators are +, -, *, /. Division truncates toward zero. No division by zero will occur.\n\nExample 1:\nInput: tokens = ["2","1","+","3","*"]\nOutput: 9  ((2+1)*3)\n\nExample 2:\nInput: tokens = ["4","13","5","/","+"]\nOutput: 6  (4+(13/5))\n\nExample 3:\nInput: tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]\nOutput: 22\n\nConstraints:\n- 1 <= tokens.length <= 10^4\n- tokens[i] is an integer or one of +, -, *, /\n\nRef: LeetCode #150 Evaluate Reverse Polish Notation`,
    code: `def eval_rpn(tokens: list[str]) -> int:
    raise NotImplementedError`,
    testCode: `def test_eval_rpn_add_mul():
    assert eval_rpn(["2","1","+","3","*"]) == 9

def test_eval_rpn_div():
    assert eval_rpn(["4","13","5","/","+"]) == 6

def test_eval_rpn_complex():
    assert eval_rpn(["10","6","9","3","+","-11","*","/","*","17","+","5","+"]) == 22

def test_eval_rpn_single():
    assert eval_rpn(["3"]) == 3

def test_eval_rpn_negative_div():
    assert eval_rpn(["3","11","5","+","-"]) == -13`,
    solution: `def eval_rpn(tokens: list[str]) -> int:
    stack = []
    ops = {
        "+": lambda a, b: a + b,
        "-": lambda a, b: a - b,
        "*": lambda a, b: a * b,
        "/": lambda a, b: int(a / b),
    }
    for token in tokens:
        if token in ops:
            b, a = stack.pop(), stack.pop()
            stack.append(ops[token](a, b))
        else:
            stack.append(int(token))
    return stack[0]`,
    usage: null,
    tags: ["stack", "math", "neetcode"],
  },
  {
    name: "Daily Temperatures",
    category: "stack",
    language: "python",
    difficulty: "medium",
    description: `Given a list of daily temperatures, return a list where answer[i] is the number of days until a warmer temperature. If no future warmer day exists, answer[i] = 0.\n\nExample 1:\nInput: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]\n\nExample 2:\nInput: temperatures = [30,40,50,60]\nOutput: [1,1,1,0]\n\nExample 3:\nInput: temperatures = [30,60,90]\nOutput: [1,1,0]\n\nConstraints:\n- 1 <= temperatures.length <= 10^5\n- 30 <= temperatures[i] <= 100\n\nRef: LeetCode #739 Daily Temperatures`,
    code: `def daily_temperatures(temperatures: list[int]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_daily_temps_basic():
    assert daily_temperatures([73,74,75,71,69,72,76,73]) == [1,1,4,2,1,1,0,0]

def test_daily_temps_ascending():
    assert daily_temperatures([30,40,50,60]) == [1,1,1,0]

def test_daily_temps_simple():
    assert daily_temperatures([30,60,90]) == [1,1,0]

def test_daily_temps_descending():
    assert daily_temperatures([90,80,70,60]) == [0,0,0,0]`,
    solution: `def daily_temperatures(temperatures: list[int]) -> list[int]:
    result = [0] * len(temperatures)
    stack = []  # (temp, index)
    for i, t in enumerate(temperatures):
        while stack and t > stack[-1][0]:
            _, j = stack.pop()
            result[j] = i - j
        stack.append((t, i))
    return result`,
    usage: null,
    tags: ["stack", "monotonic-stack", "array", "neetcode"],
  },
  {
    name: "Car Fleet",
    category: "stack",
    language: "python",
    difficulty: "medium",
    description: `N cars are heading to a target destination on a single-lane road. You are given arrays position and speed. A car can never pass another; if it catches up it becomes part of that fleet and moves at the slower speed.\n\nReturn the number of fleets that arrive at the destination.\n\nExample 1:\nInput: target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]\nOutput: 3\n\nExample 2:\nInput: target = 10, position = [3], speed = [3]\nOutput: 1\n\nConstraints:\n- 1 <= target <= 10^6\n- 0 < position[i] < target\n- All positions are unique\n\nRef: LeetCode #853 Car Fleet`,
    code: `def car_fleet(target: int, position: list[int], speed: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_car_fleet_basic():
    assert car_fleet(12, [10,8,0,5,3], [2,4,1,1,3]) == 3

def test_car_fleet_single():
    assert car_fleet(10, [3], [3]) == 1

def test_car_fleet_all_merge():
    assert car_fleet(100, [0,2,4], [4,2,1]) == 1

def test_car_fleet_none_merge():
    assert car_fleet(10, [6,8], [3,2]) == 2`,
    solution: `def car_fleet(target: int, position: list[int], speed: list[int]) -> int:
    pairs = sorted(zip(position, speed), reverse=True)
    stack = []
    for pos, spd in pairs:
        time = (target - pos) / spd
        if not stack or time > stack[-1]:
            stack.append(time)
    return len(stack)`,
    usage: null,
    tags: ["stack", "sorting", "math", "neetcode"],
  },
  {
    name: "Largest Rectangle in Histogram",
    category: "stack",
    language: "python",
    difficulty: "hard",
    description: `Given an array of integers heights representing the histogram's bar heights where each bar has width 1, return the area of the largest rectangle in the histogram.\n\nExample 1:\nInput: heights = [2,1,5,6,2,3]\nOutput: 10  (rectangle spanning bars 2-3 with height 5)\n\nExample 2:\nInput: heights = [2,4]\nOutput: 4\n\nConstraints:\n- 1 <= heights.length <= 10^5\n- 0 <= heights[i] <= 10^4\n\nRef: LeetCode #84 Largest Rectangle in Histogram`,
    code: `def largest_rectangle_area(heights: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_largest_rect_basic():
    assert largest_rectangle_area([2,1,5,6,2,3]) == 10

def test_largest_rect_two():
    assert largest_rectangle_area([2,4]) == 4

def test_largest_rect_uniform():
    assert largest_rectangle_area([3,3,3]) == 9

def test_largest_rect_single():
    assert largest_rectangle_area([5]) == 5

def test_largest_rect_ascending():
    assert largest_rectangle_area([1,2,3,4,5]) == 9`,
    solution: `def largest_rectangle_area(heights: list[int]) -> int:
    stack = []  # (index, height)
    max_area = 0
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            max_area = max(max_area, height * (i - idx))
            start = idx
        stack.append((start, h))
    for idx, height in stack:
        max_area = max(max_area, height * (len(heights) - idx))
    return max_area`,
    usage: null,
    tags: ["stack", "monotonic-stack", "array", "neetcode"],
  },
];

enrichMissingPythonSolutionVariants(neetcodeStack);

export { neetcodeStack };
